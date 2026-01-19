/**
 * Odoo Connection Test Utility
 * Tests and verifies connection to eigermarvelhr database
 */

import OdooService from './odoo-service';

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  details: {
    connected: boolean;
    jobsCount?: number;
    applicantsCount?: number;
    departmentsCount?: number;
    companyName?: string;
    timestamp: string;
    duration: number;
  };
}

/**
 * Test Odoo connection and fetch basic data
 */
export async function testOdooConnection(): Promise<ConnectionTestResult> {
  const startTime = Date.now();
  
  try {
    console.log('🔍 Testing Odoo Connection...\n');
    
    // Test 1: Initialize connection
    console.log('Test 1: Initializing connection to eigermarvelhr...');
    const connected = await OdooService.initConnection();
    
    if (!connected) {
      return {
        success: false,
        message: 'Failed to connect to Odoo instance',
        details: {
          connected: false,
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
        },
      };
    }
    console.log('✓ Connection established\n');
    
    // Test 2: Fetch jobs
    console.log('Test 2: Fetching jobs from hr.job model...');
    const jobs = await OdooService.fetchJobs();
    console.log(`✓ Retrieved ${jobs.length} jobs\n`);
    
    // Test 3: Fetch applicants
    console.log('Test 3: Fetching job applicants from hr.applicant model...');
    const applicants = await OdooService.fetchJobApplicants();
    console.log(`✓ Retrieved ${applicants.length} applicants\n`);
    
    // Test 4: Fetch departments
    console.log('Test 4: Fetching departments from hr.department model...');
    const departments = await OdooService.fetchDepartments();
    console.log(`✓ Retrieved ${departments.length} departments\n`);
    
    // Test 5: Fetch company
    console.log('Test 5: Fetching company info from res.company model...');
    const company = await OdooService.fetchCompany();
    console.log(`✓ Retrieved company: ${company?.name || 'N/A'}\n`);
    
    const duration = Date.now() - startTime;
    
    console.log('✅ All tests passed!\n');
    console.log('Summary:');
    console.log(`  Database: eigermarvel`);
    console.log(`  Jobs: ${jobs.length}`);
    console.log(`  Applicants: ${applicants.length}`);
    console.log(`  Departments: ${departments.length}`);
    console.log(`  Company: ${company?.name || 'N/A'}`);
    console.log(`  Duration: ${duration}ms\n`);
    
    return {
      success: true,
      message: 'Successfully connected and synced data from Odoo',
      details: {
        connected: true,
        jobsCount: jobs.length,
        applicantsCount: applicants.length,
        departmentsCount: departments.length,
        companyName: company?.name,
        timestamp: new Date().toISOString(),
        duration,
      },
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error('❌ Test failed:', errorMessage);
    
    return {
      success: false,
      message: `Connection test failed: ${errorMessage}`,
      details: {
        connected: false,
        timestamp: new Date().toISOString(),
        duration,
      },
    };
  }
}

/**
 * Get sync status
 */
export function getSyncStatus() {
  return {
    isSyncing: OdooService.isSyncInProgress(),
    isConnected: OdooService.isConnected(),
    syncLogs: OdooService.getSyncLogs(),
  };
}

/**
 * Perform full sync
 */
export async function performFullSync() {
  console.log('🔄 Starting full Odoo sync...\n');
  
  try {
    const result = await OdooService.syncFromOdoo();
    
    console.log('✅ Sync completed successfully!\n');
    console.log('Synced:');
    console.log(`  - ${result.jobs.length} jobs`);
    console.log(`  - ${result.applicants.length} applicants`);
    console.log(`  - ${result.departments.length} departments`);
    console.log(`  - Company: ${result.company?.name || 'N/A'}\n`);
    
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Sync failed:', errorMessage);
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export default {
  testOdooConnection,
  getSyncStatus,
  performFullSync,
};
