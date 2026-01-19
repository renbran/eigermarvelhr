/**
 * Odoo View Investigation Script
 * Searches for corrupted or malformed XML views/templates
 * Specifically looking for t-elif/t-else without proper t-if
 */

const https = require('https');
const http = require('http');

// Connection details
const ODOO_CONFIG = {
  url: 'https://eigermarvelhr.com',
  database: 'eigermarvel',
  username: 'admin',
  password: '8586583'
};

let sessionCookies = '';
let uid = null;

/**
 * Make HTTP request to Odoo
 */
function makeRequest(endpoint, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(ODOO_CONFIG.url + endpoint);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookies
      }
    };

    const req = lib.request(options, (res) => {
      // Capture cookies
      if (res.headers['set-cookie']) {
        sessionCookies = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data.substring(0, 500)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

/**
 * Authenticate with Odoo
 */
async function authenticate() {
  console.log('Authenticating with Odoo...');

  const response = await makeRequest('/web/session/authenticate', {
    jsonrpc: '2.0',
    method: 'call',
    params: {
      db: ODOO_CONFIG.database,
      login: ODOO_CONFIG.username,
      password: ODOO_CONFIG.password
    },
    id: 1
  });

  if (response.error) {
    throw new Error(`Authentication failed: ${JSON.stringify(response.error)}`);
  }

  if (response.result && response.result.uid) {
    uid = response.result.uid;
    console.log(`Authenticated as UID: ${uid}`);
    return true;
  }

  throw new Error('Invalid authentication response');
}

/**
 * Make RPC call
 */
async function rpcCall(model, method, args = [], kwargs = {}) {
  const response = await makeRequest('/web/dataset/call_kw', {
    jsonrpc: '2.0',
    method: 'call',
    params: {
      model,
      method,
      args,
      kwargs
    },
    id: Math.floor(Math.random() * 10000)
  });

  if (response.error) {
    throw new Error(`RPC Error: ${JSON.stringify(response.error)}`);
  }

  return response.result;
}

/**
 * Search for views with potential template issues
 */
async function searchProblematicViews() {
  console.log('\n=== Searching for Problematic Views ===\n');

  // Search for views related to CRM
  console.log('1. Searching CRM-related views...');
  const crmViews = await rpcCall('ir.ui.view', 'search_read', [], {
    domain: [['model', 'ilike', 'crm']],
    fields: ['id', 'name', 'model', 'type', 'arch_db', 'inherit_id', 'active', 'priority'],
    limit: 200
  });
  console.log(`Found ${crmViews.length} CRM-related views`);

  // Search for Kanban views
  console.log('\n2. Searching Kanban views...');
  const kanbanViews = await rpcCall('ir.ui.view', 'search_read', [], {
    domain: [['type', '=', 'kanban']],
    fields: ['id', 'name', 'model', 'type', 'arch_db', 'inherit_id', 'active', 'priority'],
    limit: 200
  });
  console.log(`Found ${kanbanViews.length} Kanban views`);

  // Search for views with t-elif in arch
  console.log('\n3. Searching views containing t-elif...');
  const elifViews = await rpcCall('ir.ui.view', 'search_read', [], {
    domain: [['arch_db', 'ilike', 't-elif']],
    fields: ['id', 'name', 'model', 'type', 'arch_db', 'inherit_id', 'active', 'priority'],
    limit: 200
  });
  console.log(`Found ${elifViews.length} views with t-elif`);

  // Search for views with t-else in arch
  console.log('\n4. Searching views containing t-else...');
  const elseViews = await rpcCall('ir.ui.view', 'search_read', [], {
    domain: [['arch_db', 'ilike', 't-else']],
    fields: ['id', 'name', 'model', 'type', 'arch_db', 'inherit_id', 'active', 'priority'],
    limit: 200
  });
  console.log(`Found ${elseViews.length} views with t-else`);

  // Search specifically for KanbanRecord template issues
  console.log('\n5. Searching for KanbanRecord-related views...');
  const kanbanRecordViews = await rpcCall('ir.ui.view', 'search_read', [], {
    domain: [['arch_db', 'ilike', 'KanbanRecord']],
    fields: ['id', 'name', 'model', 'type', 'arch_db', 'inherit_id', 'active', 'priority'],
    limit: 200
  });
  console.log(`Found ${kanbanRecordViews.length} KanbanRecord-related views`);

  return {
    crmViews,
    kanbanViews,
    elifViews,
    elseViews,
    kanbanRecordViews
  };
}

/**
 * Analyze view XML for template issues
 */
function analyzeViewXml(view) {
  const issues = [];
  const arch = view.arch_db || '';

  // Check for t-elif without t-if
  const elifMatches = arch.match(/t-elif/g);
  const ifMatches = arch.match(/t-if/g);

  if (elifMatches && (!ifMatches || elifMatches.length > ifMatches.length)) {
    issues.push('Potential t-elif without proper t-if');
  }

  // Check for t-else without t-if
  const elseMatches = arch.match(/t-else/g);
  if (elseMatches && !ifMatches) {
    issues.push('t-else found without any t-if');
  }

  // Look for broken XML patterns
  if (arch.includes('t-elif') || arch.includes('t-else')) {
    // Check if t-elif/t-else immediately follows a closing tag other than the t-if element
    const brokenPattern = /<\/[^>]+>\s*<[^>]*\s+t-(elif|else)/g;
    if (brokenPattern.test(arch)) {
      issues.push('Possible broken t-if/t-elif/t-else chain');
    }
  }

  return issues;
}

/**
 * Search for custom modules
 */
async function searchCustomModules() {
  console.log('\n=== Searching for Custom Modules ===\n');

  // Search all installed modules
  console.log('1. Getting all installed modules...');
  const installedModules = await rpcCall('ir.module.module', 'search_read', [], {
    domain: [['state', '=', 'installed']],
    fields: ['id', 'name', 'shortdesc', 'author', 'state', 'application', 'installed_version'],
    order: 'name'
  });
  console.log(`Found ${installedModules.length} installed modules`);

  // Search for UAE-related modules
  console.log('\n2. Searching for UAE/recruitment-related modules...');
  const uaeModules = await rpcCall('ir.module.module', 'search_read', [], {
    domain: ['|', '|', '|',
      ['name', 'ilike', 'uae'],
      ['name', 'ilike', 'recruitment'],
      ['shortdesc', 'ilike', 'uae'],
      ['shortdesc', 'ilike', 'recruitment']
    ],
    fields: ['id', 'name', 'shortdesc', 'author', 'state', 'application', 'installed_version']
  });
  console.log(`Found ${uaeModules.length} UAE/recruitment-related modules`);

  // Search for custom/third-party modules (non-Odoo author)
  console.log('\n3. Searching for custom/third-party modules...');
  const customModules = await rpcCall('ir.module.module', 'search_read', [], {
    domain: [
      ['state', '=', 'installed'],
      '!', ['author', 'ilike', 'odoo']
    ],
    fields: ['id', 'name', 'shortdesc', 'author', 'state', 'application', 'installed_version']
  });
  console.log(`Found ${customModules.length} custom/third-party modules`);

  return {
    installedModules,
    uaeModules,
    customModules
  };
}

/**
 * Get views that inherit CRM views
 */
async function getCrmInheritedViews() {
  console.log('\n=== Searching for Views Inheriting CRM Views ===\n');

  // First, get IDs of CRM base views
  const crmBaseViews = await rpcCall('ir.ui.view', 'search', [], {
    domain: [['model', 'ilike', 'crm.lead'], ['inherit_id', '=', false]]
  });
  console.log(`Found ${crmBaseViews.length} CRM base view IDs`);

  if (crmBaseViews.length > 0) {
    // Get views that inherit these CRM views
    const inheritedViews = await rpcCall('ir.ui.view', 'search_read', [], {
      domain: [['inherit_id', 'in', crmBaseViews]],
      fields: ['id', 'name', 'model', 'type', 'arch_db', 'inherit_id', 'active', 'priority']
    });
    console.log(`Found ${inheritedViews.length} views inheriting CRM base views`);
    return inheritedViews;
  }

  return [];
}

/**
 * Check for views related to crm.crm_menu_root action
 */
async function checkCrmMenuViews() {
  console.log('\n=== Checking CRM Menu Action Views ===\n');

  // Search for ir.actions.act_window related to CRM menu
  const crmActions = await rpcCall('ir.actions.act_window', 'search_read', [], {
    domain: [['res_model', 'ilike', 'crm']],
    fields: ['id', 'name', 'res_model', 'view_mode', 'view_id', 'view_ids', 'domain', 'context']
  });
  console.log(`Found ${crmActions.length} CRM window actions`);

  return crmActions;
}

/**
 * Main investigation function
 */
async function investigate() {
  try {
    // Authenticate
    await authenticate();

    // Search for problematic views
    const viewResults = await searchProblematicViews();

    // Analyze views for issues
    console.log('\n=== Analyzing Views for Template Issues ===\n');

    const allViews = [
      ...viewResults.crmViews,
      ...viewResults.kanbanViews,
      ...viewResults.elifViews,
      ...viewResults.elseViews,
      ...viewResults.kanbanRecordViews
    ];

    // Remove duplicates
    const uniqueViews = [...new Map(allViews.map(v => [v.id, v])).values()];
    console.log(`Analyzing ${uniqueViews.length} unique views...`);

    const problematicViews = [];
    for (const view of uniqueViews) {
      const issues = analyzeViewXml(view);
      if (issues.length > 0) {
        problematicViews.push({
          ...view,
          issues
        });
      }
    }

    if (problematicViews.length > 0) {
      console.log('\n*** POTENTIALLY PROBLEMATIC VIEWS FOUND ***\n');
      for (const view of problematicViews) {
        console.log(`View ID: ${view.id}`);
        console.log(`  Name: ${view.name}`);
        console.log(`  Model: ${view.model}`);
        console.log(`  Type: ${view.type}`);
        console.log(`  Active: ${view.active}`);
        console.log(`  Inherit ID: ${view.inherit_id ? view.inherit_id[1] : 'None'}`);
        console.log(`  Issues: ${view.issues.join(', ')}`);
        console.log(`  Arch Preview: ${(view.arch_db || '').substring(0, 300)}...`);
        console.log('---');
      }
    } else {
      console.log('No obvious template issues found in view analysis.');
    }

    // Get CRM inherited views
    const crmInheritedViews = await getCrmInheritedViews();

    // Check CRM menu actions
    const crmActions = await checkCrmMenuViews();

    // Search for custom modules
    const moduleResults = await searchCustomModules();

    // Print detailed results
    console.log('\n\n========================================');
    console.log('=== INVESTIGATION SUMMARY ===');
    console.log('========================================\n');

    // Print CRM views with t-elif or t-else
    console.log('\n--- CRM Views with t-elif or t-else ---');
    const crmConditionalViews = viewResults.crmViews.filter(v =>
      (v.arch_db || '').includes('t-elif') || (v.arch_db || '').includes('t-else')
    );
    if (crmConditionalViews.length > 0) {
      for (const v of crmConditionalViews) {
        console.log(`\nView: ${v.name} (ID: ${v.id})`);
        console.log(`  Model: ${v.model}`);
        console.log(`  Type: ${v.type}`);
        console.log(`  Inherit: ${v.inherit_id ? v.inherit_id[1] : 'Base view'}`);
        // Check for proper t-if structure
        const arch = v.arch_db || '';
        const hasIf = arch.includes('t-if');
        const hasElif = arch.includes('t-elif');
        const hasElse = arch.includes('t-else');
        console.log(`  Has t-if: ${hasIf}, Has t-elif: ${hasElif}, Has t-else: ${hasElse}`);
        if ((hasElif || hasElse) && !hasIf) {
          console.log('  *** ISSUE: t-elif/t-else without t-if! ***');
        }
      }
    } else {
      console.log('None found.');
    }

    // Print Kanban views with potential issues
    console.log('\n--- Kanban Views with t-elif or t-else ---');
    const kanbanConditionalViews = viewResults.kanbanViews.filter(v =>
      (v.arch_db || '').includes('t-elif') || (v.arch_db || '').includes('t-else')
    );
    if (kanbanConditionalViews.length > 0) {
      for (const v of kanbanConditionalViews) {
        console.log(`\nView: ${v.name} (ID: ${v.id})`);
        console.log(`  Model: ${v.model}`);
        console.log(`  Inherit: ${v.inherit_id ? v.inherit_id[1] : 'Base view'}`);
        const arch = v.arch_db || '';
        const hasIf = arch.includes('t-if');
        const hasElif = arch.includes('t-elif');
        const hasElse = arch.includes('t-else');
        console.log(`  Has t-if: ${hasIf}, Has t-elif: ${hasElif}, Has t-else: ${hasElse}`);
      }
    } else {
      console.log('None found.');
    }

    // Print custom modules
    console.log('\n--- Custom/Third-Party Modules Installed ---');
    if (moduleResults.customModules.length > 0) {
      for (const m of moduleResults.customModules) {
        console.log(`  - ${m.name}: ${m.shortdesc} (by ${m.author || 'Unknown'})`);
      }
    } else {
      console.log('None found.');
    }

    // Print UAE/recruitment modules
    console.log('\n--- UAE/Recruitment Related Modules ---');
    if (moduleResults.uaeModules.length > 0) {
      for (const m of moduleResults.uaeModules) {
        console.log(`  - ${m.name}: ${m.shortdesc} (State: ${m.state})`);
      }
    } else {
      console.log('None found.');
    }

    // Print all views with arch containing t-elif or t-else for detailed inspection
    console.log('\n\n--- All Views with t-elif for Detailed Inspection ---');
    for (const v of viewResults.elifViews) {
      console.log(`\n=== View: ${v.name} (ID: ${v.id}) ===`);
      console.log(`Model: ${v.model}`);
      console.log(`Type: ${v.type}`);
      console.log(`Active: ${v.active}`);
      console.log(`Inherit: ${v.inherit_id ? v.inherit_id[1] : 'Base view'}`);
      console.log(`\nArchitecture XML:\n${v.arch_db}`);
      console.log('\n' + '-'.repeat(80));
    }

    // Specifically look for views that modify KanbanRecord
    console.log('\n\n--- Searching for Views Modifying web.KanbanRecord ---');
    const webKanbanViews = await rpcCall('ir.ui.view', 'search_read', [], {
      domain: ['|', ['name', 'ilike', 'kanbanrecord'], ['arch_db', 'ilike', 'web.KanbanRecord']],
      fields: ['id', 'name', 'model', 'type', 'arch_db', 'inherit_id', 'active', 'priority', 'key']
    });

    if (webKanbanViews.length > 0) {
      for (const v of webKanbanViews) {
        console.log(`\nView: ${v.name} (ID: ${v.id})`);
        console.log(`  Key: ${v.key || 'N/A'}`);
        console.log(`  Model: ${v.model}`);
        console.log(`  Type: ${v.type}`);
        console.log(`  Inherit: ${v.inherit_id ? v.inherit_id[1] : 'Base view'}`);
        console.log(`  Active: ${v.active}`);
        console.log(`  Arch:\n${v.arch_db}`);
      }
    } else {
      console.log('No web.KanbanRecord views found.');
    }

    // Search ir.asset for JS/XML assets that might contain template
    console.log('\n\n--- Searching ir.asset for KanbanRecord assets ---');
    try {
      const assets = await rpcCall('ir.asset', 'search_read', [], {
        domain: [['path', 'ilike', 'kanban']],
        fields: ['id', 'name', 'path', 'bundle', 'active'],
        limit: 50
      });
      if (assets.length > 0) {
        for (const a of assets) {
          console.log(`  Asset: ${a.name} - ${a.path} (Bundle: ${a.bundle})`);
        }
      } else {
        console.log('No kanban-related assets found.');
      }
    } catch (e) {
      console.log('Could not search ir.asset:', e.message);
    }

    // Search for QWeb templates
    console.log('\n\n--- Searching ir.ui.view for QWeb Templates ---');
    const qwebViews = await rpcCall('ir.ui.view', 'search_read', [], {
      domain: [['type', '=', 'qweb'], ['arch_db', 'ilike', 'kanban']],
      fields: ['id', 'name', 'key', 'arch_db', 'inherit_id', 'active']
    });

    if (qwebViews.length > 0) {
      console.log(`Found ${qwebViews.length} QWeb templates related to kanban`);
      for (const v of qwebViews) {
        console.log(`\nQWeb Template: ${v.name} (ID: ${v.id})`);
        console.log(`  Key: ${v.key || 'N/A'}`);
        console.log(`  Inherit: ${v.inherit_id ? v.inherit_id[1] : 'Base template'}`);
        console.log(`  Active: ${v.active}`);

        // Check for t-elif/t-else issues
        const arch = v.arch_db || '';
        if (arch.includes('t-elif') || arch.includes('t-else')) {
          const hasIf = arch.includes('t-if');
          console.log(`  *** Contains t-elif/t-else, has t-if: ${hasIf} ***`);
          console.log(`  Arch:\n${arch}`);
        }
      }
    } else {
      console.log('No QWeb kanban templates found.');
    }

    console.log('\n\n========================================');
    console.log('=== INVESTIGATION COMPLETE ===');
    console.log('========================================');

  } catch (error) {
    console.error('Investigation failed:', error);
    process.exit(1);
  }
}

// Run investigation
investigate();
