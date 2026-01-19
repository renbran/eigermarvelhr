/**
 * Detailed CRM View Investigation Script
 * Specifically searches for issues that cause:
 * "t-elif and t-else directives must be preceded by a t-if or t-elif directive"
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
    console.log(`Authenticated as UID: ${uid}\n`);
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
 * Detailed XML analysis for t-if/t-elif/t-else chains
 */
function analyzeXmlForConditionalIssues(xml) {
  const issues = [];

  // Simple regex-based analysis to find potential issues
  // Look for t-elif or t-else that don't follow t-if or t-elif on same parent

  // Pattern 1: t-elif right at start (no t-if before)
  if (/^[^<]*<[^>]*\s+t-elif/.test(xml)) {
    issues.push('t-elif appears before any t-if');
  }

  // Pattern 2: t-else without any t-if in the template
  if (xml.includes('t-else') && !xml.includes('t-if')) {
    issues.push('t-else without any t-if in template');
  }

  // Pattern 3: Look for patterns where closing tag is followed by t-elif/t-else on different element
  // This catches: </div><span t-elif="...">
  const brokenChainPattern = /<\/(\w+)>\s*<(\w+)[^>]*\s+t-(elif|else)/g;
  let match;
  while ((match = brokenChainPattern.exec(xml)) !== null) {
    if (match[1] !== match[2]) {
      issues.push(`Broken chain: </${match[1]}> followed by <${match[2]} t-${match[3]}>`);
    }
  }

  // Pattern 4: t-elif or t-else on element that's not a sibling of t-if
  // Look for nested structures that break the chain

  return issues;
}

/**
 * Get CRM lead kanban views
 */
async function getCrmLeadViews() {
  console.log('=== Searching CRM Lead Views ===\n');

  // Get all views for crm.lead model
  const crmLeadViews = await rpcCall('ir.ui.view', 'search_read', [], {
    domain: [['model', '=', 'crm.lead']],
    fields: ['id', 'name', 'type', 'arch_db', 'inherit_id', 'active', 'priority', 'key', 'mode'],
    order: 'priority, id'
  });

  console.log(`Found ${crmLeadViews.length} CRM Lead views\n`);

  // Filter for kanban views
  const kanbanViews = crmLeadViews.filter(v => v.type === 'kanban');
  console.log(`Of which ${kanbanViews.length} are Kanban views\n`);

  // Print all kanban views with detailed analysis
  for (const view of kanbanViews) {
    console.log('=' .repeat(80));
    console.log(`View ID: ${view.id}`);
    console.log(`Name: ${view.name}`);
    console.log(`Key: ${view.key || 'N/A'}`);
    console.log(`Mode: ${view.mode}`);
    console.log(`Inherit: ${view.inherit_id ? `${view.inherit_id[1]} (ID: ${view.inherit_id[0]})` : 'Base view'}`);
    console.log(`Active: ${view.active}`);
    console.log(`Priority: ${view.priority}`);

    const arch = view.arch_db || '';
    const hasIf = arch.includes('t-if');
    const hasElif = arch.includes('t-elif');
    const hasElse = arch.includes('t-else');

    console.log(`\nConditionals: t-if=${hasIf}, t-elif=${hasElif}, t-else=${hasElse}`);

    const issues = analyzeXmlForConditionalIssues(arch);
    if (issues.length > 0) {
      console.log('\n*** POTENTIAL ISSUES ***');
      issues.forEach(i => console.log(`  - ${i}`));
    }

    // Show full XML for views with conditionals
    if (hasElif || hasElse) {
      console.log('\n--- Full XML ---');
      console.log(arch);
    }
    console.log('\n');
  }

  return { crmLeadViews, kanbanViews };
}

/**
 * Get inherited views that modify CRM kanban
 */
async function getInheritedCrmKanbanViews() {
  console.log('\n=== Searching for Views Inheriting CRM Kanban ===\n');

  // First find the base CRM lead kanban view IDs
  const baseCrmKanbanIds = await rpcCall('ir.ui.view', 'search', [], {
    domain: [
      ['model', '=', 'crm.lead'],
      ['type', '=', 'kanban'],
      ['inherit_id', '=', false]
    ]
  });

  console.log(`Base CRM Kanban view IDs: ${baseCrmKanbanIds.join(', ')}`);

  if (baseCrmKanbanIds.length > 0) {
    // Get all views that inherit these
    const inheritedViews = await rpcCall('ir.ui.view', 'search_read', [], {
      domain: [['inherit_id', 'in', baseCrmKanbanIds]],
      fields: ['id', 'name', 'type', 'arch_db', 'inherit_id', 'active', 'priority', 'key', 'mode'],
      order: 'priority, id'
    });

    console.log(`\nFound ${inheritedViews.length} views inheriting CRM kanban\n`);

    for (const view of inheritedViews) {
      console.log('=' .repeat(80));
      console.log(`View ID: ${view.id}`);
      console.log(`Name: ${view.name}`);
      console.log(`Inherit: ${view.inherit_id[1]} (ID: ${view.inherit_id[0]})`);
      console.log(`Active: ${view.active}`);

      const arch = view.arch_db || '';
      const hasIf = arch.includes('t-if');
      const hasElif = arch.includes('t-elif');
      const hasElse = arch.includes('t-else');

      console.log(`Conditionals: t-if=${hasIf}, t-elif=${hasElif}, t-else=${hasElse}`);

      const issues = analyzeXmlForConditionalIssues(arch);
      if (issues.length > 0) {
        console.log('\n*** POTENTIAL ISSUES ***');
        issues.forEach(i => console.log(`  - ${i}`));
      }

      console.log('\n--- Full XML ---');
      console.log(arch);
      console.log('\n');
    }

    return inheritedViews;
  }

  return [];
}

/**
 * Check for QWeb templates that might affect kanban
 */
async function getQwebTemplates() {
  console.log('\n=== Searching QWeb Templates ===\n');

  // Search for QWeb templates with t-elif or t-else
  const qwebViews = await rpcCall('ir.ui.view', 'search_read', [], {
    domain: [
      ['type', '=', 'qweb'],
      '|',
      ['arch_db', 'ilike', 't-elif'],
      ['arch_db', 'ilike', 't-else']
    ],
    fields: ['id', 'name', 'key', 'arch_db', 'inherit_id', 'active'],
    order: 'id'
  });

  console.log(`Found ${qwebViews.length} QWeb templates with t-elif or t-else\n`);

  // Analyze each
  const problematic = [];
  for (const view of qwebViews) {
    const arch = view.arch_db || '';
    const hasIf = arch.includes('t-if');
    const hasElif = arch.includes('t-elif');
    const hasElse = arch.includes('t-else');

    // If has t-elif or t-else but no t-if, definitely problematic
    if ((hasElif || hasElse) && !hasIf) {
      console.log('*** PROBLEMATIC QWEB TEMPLATE ***');
      console.log(`View ID: ${view.id}`);
      console.log(`Name: ${view.name}`);
      console.log(`Key: ${view.key || 'N/A'}`);
      console.log(`Inherit: ${view.inherit_id ? view.inherit_id[1] : 'Base'}`);
      console.log(`Active: ${view.active}`);
      console.log(`Has t-if: ${hasIf}, Has t-elif: ${hasElif}, Has t-else: ${hasElse}`);
      console.log('\n--- Full XML ---');
      console.log(arch);
      console.log('\n');
      problematic.push(view);
    }
  }

  return { qwebViews, problematic };
}

/**
 * Search for all views with potentially broken conditionals
 */
async function findBrokenConditionals() {
  console.log('\n=== Deep Search for Broken Conditionals ===\n');

  // Get ALL views with t-elif
  const elifViews = await rpcCall('ir.ui.view', 'search_read', [], {
    domain: [['arch_db', 'ilike', 't-elif']],
    fields: ['id', 'name', 'model', 'type', 'arch_db', 'inherit_id', 'active', 'key'],
    order: 'model, id'
  });

  console.log(`Total views with t-elif: ${elifViews.length}\n`);

  const broken = [];

  for (const view of elifViews) {
    const arch = view.arch_db || '';

    // Check if any t-elif doesn't have a proper t-if before it
    // This is a simplified check - we look for t-elif that appears to break the chain

    // Pattern: Check if t-elif appears as first conditional in an xpath or data block
    const xpathElifPattern = /<xpath[^>]*>[\s\S]*?<[^>]+\s+t-elif/;
    const dataElifPattern = /<data[^>]*>\s*<[^>]+\s+t-elif/;

    if (xpathElifPattern.test(arch) || dataElifPattern.test(arch)) {
      // Might be extending an existing t-if from inherited view - check more carefully
      const hasLocalIf = arch.includes('t-if=');

      if (!hasLocalIf) {
        broken.push({
          ...view,
          reason: 't-elif in xpath/data without local t-if'
        });
      }
    }

    // Another pattern: Check for broken sibling structure
    const issues = analyzeXmlForConditionalIssues(arch);
    if (issues.length > 0 && !broken.find(b => b.id === view.id)) {
      broken.push({
        ...view,
        reason: issues.join('; ')
      });
    }
  }

  if (broken.length > 0) {
    console.log('\n*** VIEWS WITH POTENTIALLY BROKEN CONDITIONALS ***\n');
    for (const view of broken) {
      console.log('=' .repeat(80));
      console.log(`View ID: ${view.id}`);
      console.log(`Name: ${view.name}`);
      console.log(`Model: ${view.model}`);
      console.log(`Type: ${view.type}`);
      console.log(`Key: ${view.key || 'N/A'}`);
      console.log(`Inherit: ${view.inherit_id ? view.inherit_id[1] : 'Base'}`);
      console.log(`Active: ${view.active}`);
      console.log(`Reason: ${view.reason}`);
      console.log('\n--- Full XML ---');
      console.log(view.arch_db);
      console.log('\n');
    }
  }

  return broken;
}

/**
 * Get info about the CRM menu and its action
 */
async function getCrmMenuInfo() {
  console.log('\n=== CRM Menu Information ===\n');

  // Search for the CRM menu
  const menus = await rpcCall('ir.ui.menu', 'search_read', [], {
    domain: [['name', 'ilike', 'CRM']],
    fields: ['id', 'name', 'action', 'parent_id', 'web_icon']
  });

  console.log(`Found ${menus.length} CRM-related menus:`);
  for (const menu of menus) {
    console.log(`  - ${menu.name} (ID: ${menu.id})`);
    if (menu.action) {
      console.log(`    Action: ${menu.action}`);
    }
  }

  // Get the main CRM action
  const crmActions = await rpcCall('ir.actions.act_window', 'search_read', [], {
    domain: [['res_model', '=', 'crm.lead']],
    fields: ['id', 'name', 'res_model', 'view_mode', 'view_ids', 'view_id', 'context', 'domain']
  });

  console.log(`\nCRM Lead Actions: ${crmActions.length}`);
  for (const action of crmActions) {
    console.log(`\n  Action: ${action.name} (ID: ${action.id})`);
    console.log(`    View Mode: ${action.view_mode}`);
    console.log(`    View ID: ${action.view_id ? action.view_id[1] : 'Auto'}`);
    console.log(`    View IDs: ${action.view_ids ? action.view_ids.join(', ') : 'None'}`);
  }

  return { menus, crmActions };
}

/**
 * Main investigation function
 */
async function investigate() {
  try {
    await authenticate();

    // Get CRM menu info
    await getCrmMenuInfo();

    // Get CRM lead views
    const { kanbanViews } = await getCrmLeadViews();

    // Get inherited CRM kanban views
    const inheritedViews = await getInheritedCrmKanbanViews();

    // Get QWeb templates
    const { problematic: problematicQweb } = await getQwebTemplates();

    // Deep search for broken conditionals
    const brokenViews = await findBrokenConditionals();

    // Summary
    console.log('\n' + '=' .repeat(80));
    console.log('=== INVESTIGATION SUMMARY ===');
    console.log('=' .repeat(80));

    console.log(`\nCRM Lead Kanban Views: ${kanbanViews.length}`);
    console.log(`Inherited CRM Kanban Views: ${inheritedViews.length}`);
    console.log(`Problematic QWeb Templates: ${problematicQweb.length}`);
    console.log(`Views with potentially broken conditionals: ${brokenViews.length}`);

    if (brokenViews.length > 0) {
      console.log('\n\n*** RECOMMENDED ACTIONS ***');
      console.log('The following views may need to be fixed or deactivated:');
      for (const view of brokenViews) {
        console.log(`\n  - View ID ${view.id}: ${view.name}`);
        console.log(`    Model: ${view.model}`);
        console.log(`    Type: ${view.type}`);
        console.log(`    Issue: ${view.reason}`);
        console.log(`    Fix: Check the t-elif/t-else structure in this view`);
      }
    }

    console.log('\n\n=== INVESTIGATION COMPLETE ===\n');

  } catch (error) {
    console.error('Investigation failed:', error);
    process.exit(1);
  }
}

investigate();
