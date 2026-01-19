/**
 * Search for JavaScript/XML templates that might cause OWL errors
 * The error about KanbanRecord suggests it's in the JS/OWL assets
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
 * Get all ir.attachment files related to JS/XML
 */
async function searchJsAttachments() {
  console.log('=== Searching ir.attachment for JS/XML Files ===\n');

  try {
    // Search for custom JS/XML attachments
    const attachments = await rpcCall('ir.attachment', 'search_read', [], {
      domain: [
        '|', '|', '|',
        ['name', 'ilike', '.js'],
        ['name', 'ilike', '.xml'],
        ['mimetype', 'ilike', 'javascript'],
        ['mimetype', 'ilike', 'xml']
      ],
      fields: ['id', 'name', 'res_model', 'res_id', 'type', 'mimetype', 'url', 'datas'],
      limit: 100
    });

    console.log(`Found ${attachments.length} JS/XML attachments\n`);

    // Filter for potentially custom ones
    for (const att of attachments) {
      console.log(`  - ${att.name}`);
      console.log(`    Type: ${att.type}, MIME: ${att.mimetype}`);
      if (att.res_model) console.log(`    Model: ${att.res_model}, ID: ${att.res_id}`);
      if (att.url) console.log(`    URL: ${att.url}`);
    }

    return attachments;
  } catch (e) {
    console.log('Could not search attachments:', e.message);
    return [];
  }
}

/**
 * Search for views that might be using custom JS classes
 */
async function searchCustomJsClasses() {
  console.log('\n\n=== Searching Views with Custom JS Classes ===\n');

  // Search for kanban views with js_class attribute
  const jsClassViews = await rpcCall('ir.ui.view', 'search_read', [], {
    domain: [['arch_db', 'ilike', 'js_class']],
    fields: ['id', 'name', 'model', 'type', 'arch_db', 'inherit_id', 'active'],
    order: 'model'
  });

  console.log(`Found ${jsClassViews.length} views with js_class\n`);

  for (const view of jsClassViews) {
    // Extract js_class value
    const match = view.arch_db.match(/js_class="([^"]+)"/);
    const jsClass = match ? match[1] : 'unknown';

    console.log(`\nView: ${view.name} (ID: ${view.id})`);
    console.log(`  Model: ${view.model}`);
    console.log(`  Type: ${view.type}`);
    console.log(`  js_class: ${jsClass}`);
    console.log(`  Active: ${view.active}`);
    console.log(`  Inherit: ${view.inherit_id ? view.inherit_id[1] : 'Base'}`);
  }

  return jsClassViews;
}

/**
 * Get details about recruitment-related modules
 */
async function getRecruitmentModuleInfo() {
  console.log('\n\n=== Recruitment Module Details ===\n');

  // Get recruitment_uae module
  const modules = await rpcCall('ir.module.module', 'search_read', [], {
    domain: [
      '|', '|',
      ['name', 'ilike', 'recruitment'],
      ['name', 'ilike', 'uae'],
      ['name', 'ilike', 'crm']
    ],
    fields: ['id', 'name', 'shortdesc', 'author', 'state', 'installed_version', 'latest_version']
  });

  console.log('Recruitment/UAE/CRM-related modules:');
  for (const mod of modules) {
    if (mod.state === 'installed') {
      console.log(`\n  ${mod.name}`);
      console.log(`    Description: ${mod.shortdesc}`);
      console.log(`    Author: ${mod.author || 'Unknown'}`);
      console.log(`    Version: ${mod.installed_version}`);
    }
  }

  return modules;
}

/**
 * Check for any data related to CRM menu
 */
async function checkCrmMenuData() {
  console.log('\n\n=== CRM Menu Data Check ===\n');

  // Get the CRM root menu
  const menuData = await rpcCall('ir.model.data', 'search_read', [], {
    domain: [
      ['name', '=', 'crm_menu_root'],
      ['model', '=', 'ir.ui.menu']
    ],
    fields: ['name', 'module', 'res_id']
  });

  console.log('CRM menu root data:', menuData);

  if (menuData.length > 0) {
    const menuId = menuData[0].res_id;

    // Get the menu details
    const menu = await rpcCall('ir.ui.menu', 'search_read', [], {
      domain: [['id', '=', menuId]],
      fields: ['id', 'name', 'action', 'parent_id', 'web_icon', 'groups_id']
    });

    console.log('\nMenu details:', menu);

    if (menu.length > 0 && menu[0].action) {
      // Parse action reference
      const actionRef = menu[0].action;
      const match = actionRef.match(/(\d+)/);
      if (match) {
        const actionId = parseInt(match[1]);

        // Get the action
        const action = await rpcCall('ir.actions.act_window', 'search_read', [], {
          domain: [['id', '=', actionId]],
          fields: ['id', 'name', 'res_model', 'view_mode', 'view_id', 'view_ids', 'context', 'domain']
        });

        console.log('\nAction details:', action);
      }
    }
  }
}

/**
 * Search for any customizations to web.KanbanRecord
 */
async function searchKanbanRecordCustomizations() {
  console.log('\n\n=== Searching for KanbanRecord Customizations ===\n');

  // Search in ir.model.data for anything related to KanbanRecord
  const kanbanData = await rpcCall('ir.model.data', 'search_read', [], {
    domain: [
      '|', '|',
      ['name', 'ilike', 'kanban_record'],
      ['name', 'ilike', 'KanbanRecord'],
      ['name', 'ilike', 'kanbanrecord']
    ],
    fields: ['name', 'module', 'model', 'res_id']
  });

  console.log(`Found ${kanbanData.length} KanbanRecord-related data records`);
  for (const data of kanbanData) {
    console.log(`  - ${data.module}.${data.name} (${data.model}: ${data.res_id})`);
  }

  // Search ir.asset for kanban-related assets
  try {
    const assets = await rpcCall('ir.asset', 'search_read', [], {
      domain: [
        '|', '|',
        ['path', 'ilike', 'kanban'],
        ['name', 'ilike', 'kanban'],
        ['bundle', 'ilike', 'kanban']
      ],
      fields: ['id', 'name', 'bundle', 'path', 'directive', 'active']
    });

    console.log(`\nFound ${assets.length} kanban-related assets`);
    for (const asset of assets) {
      console.log(`\n  Asset: ${asset.name} (ID: ${asset.id})`);
      console.log(`    Bundle: ${asset.bundle}`);
      console.log(`    Path: ${asset.path}`);
      console.log(`    Directive: ${asset.directive}`);
      console.log(`    Active: ${asset.active}`);
    }
  } catch (e) {
    console.log('Could not search ir.asset:', e.message);
  }
}

/**
 * Look for views that inherit base web templates
 */
async function searchWebInheritedViews() {
  console.log('\n\n=== Searching for Views Inheriting web Module Templates ===\n');

  // Search for views with inherit_id that reference web.* views
  const webViews = await rpcCall('ir.ui.view', 'search_read', [], {
    domain: [
      ['inherit_id', '!=', false],
      '|', '|',
      ['inherit_id.name', 'ilike', 'web.'],
      ['inherit_id.key', 'ilike', 'web.'],
      ['key', 'ilike', 'web.']
    ],
    fields: ['id', 'name', 'model', 'type', 'arch_db', 'inherit_id', 'active', 'key'],
    limit: 50
  });

  console.log(`Found ${webViews.length} views inheriting web module templates\n`);

  for (const view of webViews) {
    console.log(`\nView: ${view.name} (ID: ${view.id})`);
    console.log(`  Key: ${view.key || 'N/A'}`);
    console.log(`  Type: ${view.type}`);
    console.log(`  Inherit: ${view.inherit_id ? view.inherit_id[1] : 'N/A'}`);
    console.log(`  Active: ${view.active}`);

    // Check for t-elif/t-else issues
    const arch = view.arch_db || '';
    const hasIf = arch.includes('t-if');
    const hasElif = arch.includes('t-elif');
    const hasElse = arch.includes('t-else');

    if (hasElif || hasElse) {
      console.log(`  Conditionals: t-if=${hasIf}, t-elif=${hasElif}, t-else=${hasElse}`);
      if (!hasIf) {
        console.log('  *** PROBLEMATIC: has t-elif/t-else but no t-if ***');
        console.log(`  Arch:\n${arch}`);
      }
    }
  }
}

/**
 * Search all QWeb templates for broken conditional chains
 */
async function searchAllQwebForBrokenChains() {
  console.log('\n\n=== Deep Search: QWeb Templates with Broken Conditional Chains ===\n');

  // Get ALL QWeb templates with t-elif or t-else
  const qwebViews = await rpcCall('ir.ui.view', 'search_read', [], {
    domain: [
      ['type', '=', 'qweb'],
      '|',
      ['arch_db', 'ilike', 't-elif'],
      ['arch_db', 'ilike', 't-else']
    ],
    fields: ['id', 'name', 'key', 'arch_db', 'inherit_id', 'active'],
    limit: 500
  });

  console.log(`Found ${qwebViews.length} QWeb templates with conditionals\n`);

  // Analyze each for potential issues
  let problemCount = 0;
  for (const view of qwebViews) {
    const arch = view.arch_db || '';
    const hasIf = arch.includes('t-if');
    const hasElif = arch.includes('t-elif');
    const hasElse = arch.includes('t-else');

    // Key check: if view has t-elif/t-else but NO t-if, it's likely broken
    // UNLESS it's inheriting and extending an existing conditional
    if ((hasElif || hasElse) && !hasIf && !view.inherit_id) {
      problemCount++;
      console.log(`\n*** PROBLEMATIC BASE TEMPLATE ***`);
      console.log(`View: ${view.name} (ID: ${view.id})`);
      console.log(`Key: ${view.key || 'N/A'}`);
      console.log(`Active: ${view.active}`);
      console.log(`Has t-elif: ${hasElif}, Has t-else: ${hasElse}, Has t-if: ${hasIf}`);
      console.log(`\nArch:\n${arch}`);
      console.log('\n' + '='.repeat(80));
    }
  }

  console.log(`\n\nTotal potentially problematic templates: ${problemCount}`);
}

/**
 * Main investigation function
 */
async function investigate() {
  try {
    await authenticate();

    // Get recruitment module info
    await getRecruitmentModuleInfo();

    // Check CRM menu data
    await checkCrmMenuData();

    // Search for KanbanRecord customizations
    await searchKanbanRecordCustomizations();

    // Search JS attachments
    await searchJsAttachments();

    // Search views with custom JS classes
    await searchCustomJsClasses();

    // Search web inherited views
    await searchWebInheritedViews();

    // Deep search for broken QWeb templates
    await searchAllQwebForBrokenChains();

    console.log('\n\n=== INVESTIGATION COMPLETE ===\n');

  } catch (error) {
    console.error('Investigation failed:', error);
    process.exit(1);
  }
}

investigate();
