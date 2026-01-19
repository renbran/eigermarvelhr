#!/usr/bin/env node

/**
 * Quick Test Script - Verify Odoo Connection & Sync Setup
 * Usage: npx ts-node test-odoo-connection.ts
 */

import OdooConnection from './src/lib/odoo-connection';
import odooService from './src/lib/odoo-service';

const testConfig = {
  url: process.env.VITE_ODOO_URL || 'https://eigermarvelhr.com',
  database: process.env.VITE_ODOO_DATABASE || 'eigermarvel',
  username: process.env.VITE_ODOO_USERNAME || 'admin',
  password: process.env.VITE_ODOO_PASSWORD || 'admin',
  version: 'v18',
};

async function runTests() {
  console.log('\n' + '='.repeat(70));
  console.log('        ODOO DATABASE CONNECTION & SYNC VERIFICATION TEST');
  console.log('='.repeat(70) + '\n');

  console.log('📋 Configuration:');
  console.log(`   URL:      ${testConfig.url}`);
  console.log(`   Database: ${testConfig.database}`);
  console.log(`   Version:  ${testConfig.version}`);
  console.log(`   User:     ${testConfig.username}\n`);

  try {
    // Test 1: Direct Connection
    console.log('Test 1: Direct RPC Connection');
    console.log('-'.repeat(70));

    const connection = new OdooConnection(testConfig);
    const isConnected = await connection.authenticate();

    if (!isConnected) {
      throw new Error('Failed to authenticate with Odoo');
    }

    console.log('✓ Connected and authenticated\n');

    // Test 2: OdooService Connection
    console.log('Test 2: OdooService Layer');
    console.log('-'.repeat(70));

    const serviceConnected = await odooService.initConnection();

    if (!serviceConnected) {
      throw new Error('OdooService failed to initialize');
    }

    console.log('✓ OdooService initialized\n');

    // Test 3: Fetch Models
    console.log('Test 3: Fetching Data from Odoo Models');
    console.log('-'.repeat(70));

    const [jobs, applicants, departments, employees, company] = await Promise.all([
      odooService.fetchJobs(),
      odooService.fetchJobApplicants(),
      odooService.fetchDepartments(),
      odooService.fetchEmployees(),
      odooService.fetchCompany(),
    ]);

    console.log(`✓ Jobs (hr.job):              ${jobs.length} records`);
    console.log(`✓ Job Applicants (hr.applicant): ${applicants.length} records`);
    console.log(`✓ Departments (hr.department):   ${departments.length} records`);
    console.log(`✓ Employees (hr.employee):       ${employees.length} records`);
    console.log(`✓ Company (res.company):         ${company ? '✓ Found' : '✗ Not found'}\n`);

    // Test 4: Data Sample
    if (jobs.length > 0) {
      console.log('Test 4: Sample Job Record');
      console.log('-'.repeat(70));
      const job = jobs[0];
      console.log(`   ID:          ${job.id}`);
      console.log(`   Title:       ${job.name}`);
      console.log(`   Department:  ${job.department_id ? job.department_id[1] : 'N/A'}`);
      console.log(`   Positions:   ${job.expected_employees || 0}`);
      console.log(`   Status:      ${job.active ? 'Active' : 'Inactive'}\n`);
    }

    // Test 5: Sync Logs
    console.log('Test 5: Sync Audit Trail');
    console.log('-'.repeat(70));

    const logs = odooService.getSyncLogs();
    console.log(`✓ Total sync operations: ${logs.length}`);

    if (logs.length > 0) {
      console.log('\n   Recent Operations:');
      logs.slice(-5).forEach((log, idx) => {
        console.log(`   ${idx + 1}. [${log.status.toUpperCase()}] ${log.modelName}:${log.odooId} - ${log.action}`);
      });
    }
    console.log('\n');

    // Summary
    console.log('='.repeat(70));
    console.log('✅ ALL TESTS PASSED');
    console.log('='.repeat(70));
    console.log('\n✨ Your Odoo database connection is working correctly!');
    console.log('\nNext steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Open your browser and check the OdooSyncStatus component');
    console.log('3. Jobs and applicants should sync automatically every 5 minutes');
    console.log('4. Check src/components/OdooSyncStatus.tsx for the dashboard\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST FAILED\n');

    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${errorMessage}\n`);

    console.log('Troubleshooting Tips:');
    console.log('1. Verify .env variables:');
    console.log(`   - VITE_ODOO_URL=${testConfig.url}`);
    console.log(`   - VITE_ODOO_DATABASE=${testConfig.database}`);
    console.log(`   - VITE_ODOO_USERNAME=${testConfig.username}`);
    console.log('\n2. Check if Odoo instance is accessible:');
    console.log(`   curl -I ${testConfig.url}`);
    console.log('\n3. Verify admin credentials in Odoo:');
    console.log(`   Login to ${testConfig.url}/web`);
    console.log('\n4. Check network/firewall settings');
    console.log('\n');

    process.exit(1);
  }
}

// Run tests if this is the main script
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}
