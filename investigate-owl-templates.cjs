/**
 * OWL Template Investigation Script
 * Specifically searches for OWL/JavaScript templates that might cause:
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
 * Search for web assets
 */
async function searchWebAssets() {
  console.log('=== Searching ir.asset for Custom Assets ===\n');

  try {
    const assets = await rpcCall('ir.asset', 'search_read', [], {
      domain: [],
      fields: ['id', 'name', 'bundle', 'path', 'directive', 'active', 'sequence'],
      order: 'bundle, sequence'
    });

    console.log(`Total assets: ${assets.length}\n`);

    // Group by bundle
    const byBundle = {};
    for (const asset of assets) {
      const bundle = asset.bundle || 'Unknown';
      if (!byBundle[bundle]) byBundle[bundle] = [];
      byBundle[bundle].push(asset);
    }

    // Look for custom/non-standard bundles
    console.log('Asset Bundles:');
    for (const [bundle, bundleAssets] of Object.entries(byBundle)) {
      console.log(`\n  ${bundle}: ${bundleAssets.length} assets`);

      // Look for kanban-related assets
      const kanbanAssets = bundleAssets.filter(a =>
        a.path?.toLowerCase().includes('kanban') ||
        a.name?.toLowerCase().includes('kanban')
      );

      if (kanbanAssets.length > 0) {
        console.log('    Kanban-related:');
        for (const a of kanbanAssets) {
          console.log(`      - ${a.name}: ${a.path}`);
        }
      }
    }

    return assets;
  } catch (e) {
    console.log('Could not search ir.asset:', e.message);
    return [];
  }
}

/**
 * Search for custom modules and their views
 */
async function searchCustomModuleViews() {
  console.log('\n\n=== Searching Custom Module Views ===\n');

  // Get custom modules
  const customModules = await rpcCall('ir.module.module', 'search_read', [], {
    domain: [
      ['state', '=', 'installed'],
      '!', ['author', 'ilike', 'odoo']
    ],
    fields: ['id', 'name', 'shortdesc', 'author']
  });

  console.log(`Custom modules installed: ${customModules.length}\n`);

  for (const mod of customModules) {
    console.log(`\nModule: ${mod.name} (${mod.shortdesc})`);
    console.log(`  Author: ${mod.author || 'Unknown'}`);

    // Get views from this module
    const moduleViews = await rpcCall('ir.model.data', 'search_read', [], {
      domain: [
        ['module', '=', mod.name],
        ['model', '=', 'ir.ui.view']
      ],
      fields: ['name', 'res_id']
    });

    if (moduleViews.length > 0) {
      console.log(`  Views: ${moduleViews.length}`);

      // Get details for first few views
      const viewIds = moduleViews.slice(0, 20).map(v => v.res_id);
      const viewDetails = await rpcCall('ir.ui.view', 'search_read', [], {
        domain: [['id', 'in', viewIds]],
        fields: ['id', 'name', 'type', 'model', 'arch_db', 'active', 'inherit_id']
      });

      // Check for problematic views
      for (const view of viewDetails) {
        const arch = view.arch_db || '';
        const hasIf = arch.includes('t-if');
        const hasElif = arch.includes('t-elif');
        const hasElse = arch.includes('t-else');

        // Only print if it has conditionals
        if (hasElif || hasElse) {
          console.log(`\n    View: ${view.name} (ID: ${view.id})`);
          console.log(`      Type: ${view.type}`);
          console.log(`      Model: ${view.model || 'N/A'}`);
          console.log(`      Inherit: ${view.inherit_id ? view.inherit_id[1] : 'Base'}`);
          console.log(`      Conditionals: t-if=${hasIf}, t-elif=${hasElif}, t-else=${hasElse}`);

          // If no t-if but has t-elif/t-else, this is problematic
          if (!hasIf && (hasElif || hasElse)) {
            console.log('      *** POTENTIALLY PROBLEMATIC: No t-if but has t-elif/t-else ***');
            console.log(`      Arch:\n${arch}`);
          }
        }
      }
    }
  }
}

/**
 * Search for QWeb templates related to kanban
 */
async function searchKanbanQwebTemplates() {
  console.log('\n\n=== Searching QWeb Templates for Kanban ===\n');

  // Search for QWeb templates that might contain kanban-related templates
  const qwebViews = await rpcCall('ir.ui.view', 'search_read', [], {
    domain: [
      ['type', '=', 'qweb'],
      '|', '|', '|',
      ['key', 'ilike', 'kanban'],
      ['name', 'ilike', 'kanban'],
      ['arch_db', 'ilike', 'kanban'],
      ['arch_db', 'ilike', 'KanbanRecord']
    ],
    fields: ['id', 'name', 'key', 'arch_db', 'inherit_id', 'active'],
    limit: 100
  });

  console.log(`Found ${qwebViews.length} QWeb templates related to kanban\n`);

  for (const view of qwebViews) {
    const arch = view.arch_db || '';
    const hasIf = arch.includes('t-if');
    const hasElif = arch.includes('t-elif');
    const hasElse = arch.includes('t-else');

    console.log(`\nTemplate: ${view.name} (ID: ${view.id})`);
    console.log(`  Key: ${view.key || 'N/A'}`);
    console.log(`  Inherit: ${view.inherit_id ? view.inherit_id[1] : 'Base'}`);
    console.log(`  Active: ${view.active}`);
    console.log(`  Conditionals: t-if=${hasIf}, t-elif=${hasElif}, t-else=${hasElse}`);

    if ((hasElif || hasElse) && !hasIf) {
      console.log('  *** PROBLEMATIC: No t-if but has t-elif/t-else ***');
      console.log(`  Arch:\n${arch}`);
    }
  }
}

/**
 * Search for data records that define templates
 */
async function searchTemplateData() {
  console.log('\n\n=== Searching ir.model.data for Template Definitions ===\n');

  // Search for data records that might define templates
  const templateData = await rpcCall('ir.model.data', 'search_read', [], {
    domain: [
      ['model', '=', 'ir.ui.view'],
      '|',
      ['name', 'ilike', 'kanban'],
      ['name', 'ilike', 'template']
    ],
    fields: ['name', 'module', 'res_id', 'model'],
    limit: 200
  });

  console.log(`Found ${templateData.length} template-related data records\n`);

  // Group by module
  const byModule = {};
  for (const data of templateData) {
    if (!byModule[data.module]) byModule[data.module] = [];
    byModule[data.module].push(data);
  }

  // Print grouped
  for (const [module, records] of Object.entries(byModule)) {
    console.log(`\n${module}:`);
    for (const rec of records.slice(0, 10)) {
      console.log(`  - ${rec.name} (View ID: ${rec.res_id})`);
    }
    if (records.length > 10) {
      console.log(`  ... and ${records.length - 10} more`);
    }
  }
}

/**
 * Check for broken inheritance chains in views
 */
async function checkInheritanceChains() {
  console.log('\n\n=== Checking View Inheritance Chains ===\n');

  // Get all views that inherit other views
  const inheritedViews = await rpcCall('ir.ui.view', 'search_read', [], {
    domain: [
      ['inherit_id', '!=', false],
      '|',
      ['arch_db', 'ilike', 't-elif'],
      ['arch_db', 'ilike', 't-else']
    ],
    fields: ['id', 'name', 'model', 'type', 'arch_db', 'inherit_id', 'active', 'priority'],
    order: 'model, priority'
  });

  console.log(`Found ${inheritedViews.length} inherited views with t-elif or t-else\n`);

  // Analyze each view
  for (const view of inheritedViews) {
    const arch = view.arch_db || '';
    const hasIf = arch.includes('t-if');
    const hasElif = arch.includes('t-elif');
    const hasElse = arch.includes('t-else');

    // For inherited views, having t-elif/t-else without t-if in the same arch
    // might be valid IF they're extending an existing conditional
    // But if the xpath/position doesn't properly connect them, it could fail

    // Check for patterns that might cause issues
    const xpathPattern = /<xpath[^>]*>/g;
    const xpathMatches = arch.match(xpathPattern) || [];

    // If there are multiple xpaths and some have t-elif without establishing context
    if (xpathMatches.length > 0 && (hasElif || hasElse) && !hasIf) {
      console.log(`\n*** POTENTIAL ISSUE ***`);
      console.log(`View ID: ${view.id}`);
      console.log(`Name: ${view.name}`);
      console.log(`Model: ${view.model}`);
      console.log(`Type: ${view.type}`);
      console.log(`Inherit: ${view.inherit_id[1]} (ID: ${view.inherit_id[0]})`);
      console.log(`Active: ${view.active}`);
      console.log(`XPath count: ${xpathMatches.length}`);
      console.log(`Has t-elif: ${hasElif}, Has t-else: ${hasElse}, Has t-if: ${hasIf}`);
      console.log(`\nArch:\n${arch}`);
      console.log('\n' + '='.repeat(80));
    }
  }
}

/**
 * Search UAE recruitment module views specifically
 */
async function searchUaeRecruitmentViews() {
  console.log('\n\n=== Searching UAE Recruitment Module Views ===\n');

  // Get all views from uae_recruitment_mgmt module
  const moduleData = await rpcCall('ir.model.data', 'search_read', [], {
    domain: [
      ['module', '=', 'uae_recruitment_mgmt'],
      ['model', '=', 'ir.ui.view']
    ],
    fields: ['name', 'res_id']
  });

  console.log(`Found ${moduleData.length} views in uae_recruitment_mgmt module\n`);

  if (moduleData.length > 0) {
    const viewIds = moduleData.map(v => v.res_id);
    const views = await rpcCall('ir.ui.view', 'search_read', [], {
      domain: [['id', 'in', viewIds]],
      fields: ['id', 'name', 'type', 'model', 'arch_db', 'active', 'inherit_id', 'key']
    });

    for (const view of views) {
      const arch = view.arch_db || '';
      const hasIf = arch.includes('t-if');
      const hasElif = arch.includes('t-elif');
      const hasElse = arch.includes('t-else');

      console.log(`\nView: ${view.name} (ID: ${view.id})`);
      console.log(`  Type: ${view.type}`);
      console.log(`  Model: ${view.model || 'N/A'}`);
      console.log(`  Key: ${view.key || 'N/A'}`);
      console.log(`  Inherit: ${view.inherit_id ? view.inherit_id[1] : 'Base'}`);
      console.log(`  Active: ${view.active}`);

      if (hasElif || hasElse) {
        console.log(`  Conditionals: t-if=${hasIf}, t-elif=${hasElif}, t-else=${hasElse}`);

        if (!hasIf && (hasElif || hasElse)) {
          console.log('  *** PROBLEMATIC: No t-if but has t-elif/t-else ***');
          console.log(`\n  Arch:\n${arch}`);
        }
      }
    }
  }
}

/**
 * Main investigation function
 */
async function investigate() {
  try {
    await authenticate();

    // Search web assets
    await searchWebAssets();

    // Search UAE recruitment views
    await searchUaeRecruitmentViews();

    // Search custom module views
    await searchCustomModuleViews();

    // Search kanban QWeb templates
    await searchKanbanQwebTemplates();

    // Search template data
    await searchTemplateData();

    // Check inheritance chains
    await checkInheritanceChains();

    console.log('\n\n=== INVESTIGATION COMPLETE ===\n');

  } catch (error) {
    console.error('Investigation failed:', error);
    process.exit(1);
  }
}

investigate();
