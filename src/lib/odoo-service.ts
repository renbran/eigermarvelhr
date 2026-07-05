/**
 * Odoo Service - Handles all communication with Odoo v18 instance
 * Connects to eigermarvelhr instance via direct RPC
 */

import OdooConnection, { type OdooConnectionConfig } from './odoo-connection';
import {
  ODOO_MODELS,
  ODOO_FIELDS,
  OdooEmployee,
  OdooJob,
  OdooJobApplicant,
  OdooDepartment,
  OdooCompany,
  OdooRpcResponse,
  OdooRpcError,
  SyncLog,
} from './odoo-models';

class OdooService {
  private connection: OdooConnection | null = null;
  private syncLogs: SyncLog[] = [];
  private isSyncing = false;
  private connectionAttempts = 0;
  private initError: string | null = null;

  /**
   * Initialize Odoo connection
   */
  async initConnection(): Promise<boolean> {
    try {
      // Check for required environment variables
      const missing: string[] = [];
      const url = import.meta.env.VITE_ODOO_URL;
      if (!url) missing.push('VITE_ODOO_URL');
      const database = import.meta.env.VITE_ODOO_DATABASE;
      if (!database) missing.push('VITE_ODOO_DATABASE');
      const username = import.meta.env.VITE_ODOO_USERNAME;
      if (!username) missing.push('VITE_ODOO_USERNAME');
      const password = import.meta.env.VITE_ODOO_PASSWORD;
      if (!password) missing.push('VITE_ODOO_PASSWORD');

      if (missing.length > 0) {
        this.initError = `[OdooService] Missing required env vars: ${missing.join(', ')}. Refusing to start with insecure default credentials.`;
        return false;
      }

      const ODOO_CONFIG: OdooConnectionConfig = {
        url,
        database,
        username,
        password,
        version: 'v18',
      };

      console.log(`[OdooService] Initializing connection to ${ODOO_CONFIG.database}...`);

      this.connection = new OdooConnection(ODOO_CONFIG);
      const authenticated = await this.connection.authenticate();

      if (authenticated) {
        console.log('[OdooService] ✓ Connection established and authenticated');
        this.connectionAttempts = 0;
        this.initError = null; // Clear any previous init error on success
        return true;
      }

      throw new Error('Authentication failed');
    } catch (error) {
      console.error('[OdooService] Failed to initialize connection:', error);
      this.connectionAttempts++;
      this.initError = `[OdooService] Failed to initialize Odoo connection: ${error instanceof Error ? error.message : String(error)}`;

      // Retry logic with exponential backoff
      if (this.connectionAttempts < 3) {
        const waitTime = Math.pow(2, this.connectionAttempts) * 1000;
        console.log(`[OdooService] Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.initConnection();
      }

      return false;
    }
  }

  /**
   * Ensure connection is active
   */
  private async ensureConnection(): Promise<void> {
    if (this.initError) {
      throw new Error(this.initError);
    }
    if (!this.connection?.isAuthenticated()) {
      await this.initConnection();
      if (!this.connection?.isAuthenticated()) {
        throw new Error('Failed to establish Odoo connection');
      }
    }
  }

  /**
   * Fetch jobs from Odoo
   */
  async fetchJobs(filters: Record<string, unknown> = {}): Promise<OdooJob[]> {
    try {
      await this.ensureConnection();

      const domain = Object.keys(filters).length > 0
        ? filters
        : [['active', '=', true]];

      const jobs = await this.connection!.rpcCall<OdooJob[]>(
        ODOO_MODELS.JOB,
        'search_read',
        [],
        {
          domain,
          fields: ODOO_FIELDS.JOB,
          limit: 100,
        },
      );

      console.log(`[OdooService] Fetched ${jobs.length} jobs from Odoo`);
      this.logSync('Job', 0, 'read', 'success');
      return jobs;
    } catch (error) {
      this.logSync('Job', 0, 'read', 'failed', String(error));
      console.error('[OdooService] Failed to fetch jobs:', error);
      throw error;
    }
  }

  /**
   * Fetch job applicants
   */
  async fetchJobApplicants(filters: Record<string, unknown> = {}): Promise<OdooJobApplicant[]> {
    try {
      await this.ensureConnection();

      const domain = Object.keys(filters).length > 0
        ? filters
        : [['active', '=', true]];

      const applicants = await this.connection!.rpcCall<OdooJobApplicant[]>(
        ODOO_MODELS.JOB_APPLICANT,
        'search_read',
        [],
        {
          domain,
          fields: ODOO_FIELDS.JOB_APPLICANT,
          limit: 500,
        },
      );

      console.log(`[OdooService] Fetched ${applicants.length} job applicants from Odoo`);
      this.logSync('JobApplicant', 0, 'read', 'success');
      return applicants;
    } catch (error) {
      this.logSync('JobApplicant', 0, 'read', 'failed', String(error));
      console.error('[OdooService] Failed to fetch applicants:', error);
      throw error;
    }
  }

  /**
   * Fetch employees
   */
  async fetchEmployees(filters: Record<string, unknown> = {}): Promise<OdooEmployee[]> {
    try {
      await this.ensureConnection();

      const domain = Object.keys(filters).length > 0
        ? filters
        : [['active', '=', true]];

      const employees = await this.connection!.rpcCall<OdooEmployee[]>(
        ODOO_MODELS.EMPLOYEE,
        'search_read',
        [],
        {
          domain,
          fields: ODOO_FIELDS.EMPLOYEE,
          limit: 500,
        },
      );

      console.log(`[OdooService] Fetched ${employees.length} employees from Odoo`);
      this.logSync('Employee', 0, 'read', 'success');
      return employees;
    } catch (error) {
      this.logSync('Employee', 0, 'read', 'failed', String(error));
      console.error('[OdooService] Failed to fetch employees:', error);
      throw error;
    }
  }

  /**
   * Fetch departments
   */
  async fetchDepartments(): Promise<OdooDepartment[]> {
    try {
      await this.ensureConnection();

      const departments = await this.connection!.rpcCall<OdooDepartment[]>(
        ODOO_MODELS.DEPARTMENT,
        'search_read',
        [],
        {
          domain: [['active', '=', true]],
          fields: ODOO_FIELDS.DEPARTMENT,
        },
      );

      console.log(`[OdooService] Fetched ${departments.length} departments from Odoo`);
      this.logSync('Department', 0, 'read', 'success');
      return departments;
    } catch (error) {
      this.logSync('Department', 0, 'read', 'failed', String(error));
      console.error('[OdooService] Failed to fetch departments:', error);
      throw error;
    }
  }

  /**
   * Fetch company info
   */
  async fetchCompany(): Promise<OdooCompany | null> {
    try {
      await this.ensureConnection();

      const companies = await this.connection!.rpcCall<OdooCompany[]>(
        ODOO_MODELS.COMPANY,
        'search_read',
        [],
        {
          domain: [],
          fields: ODOO_FIELDS.COMPANY,
          limit: 1,
        },
      );

      const company = companies.length > 0 ? companies[0] : null;
      console.log(`[OdooService] Fetched company info: ${company?.name || 'N/A'}`);
      this.logSync('Company', 0, 'read', 'success');
      return company;
    } catch (error) {
      this.logSync('Company', 0, 'read', 'failed', String(error));
      console.error('[OdooService] Failed to fetch company:', error);
      throw error;
    }
  }

  /**
   * Create job applicant in Odoo
   */
  async createJobApplicant(data: {
    name: string;
    email_from: string;
    phone: string;
    job_id: number;
    description?: string;
  }): Promise<number> {
    try {
      await this.ensureConnection();

      const applicantId = await this.connection!.rpcCall<number>(
        ODOO_MODELS.JOB_APPLICANT,
        'create',
        [data],
      );

      console.log(`[OdooService] Created job applicant with ID: ${applicantId}`);
      this.logSync('JobApplicant', applicantId, 'create', 'success');
      return applicantId;
    } catch (error) {
      this.logSync('JobApplicant', 0, 'create', 'failed', String(error));
      console.error('[OdooService] Failed to create applicant:', error);
      throw error;
    }
  }

  /**
   * Create CRM lead from contact form submission
   */
  async createCrmLead(data: {
    contact_name: string;
    email_from: string;
    phone?: string;
    name: string;      // subject / opportunity title
    description: string;
  }): Promise<number> {
    try {
      await this.ensureConnection();

      const leadId = await this.connection!.rpcCall<number>(
        ODOO_MODELS.CRM_LEAD,
        'create',
        [data],
      );

      console.log(`[OdooService] Created CRM lead with ID: ${leadId}`);
      this.logSync('CrmLead', leadId, 'create', 'success');
      return leadId;
    } catch (error) {
      this.logSync('CrmLead', 0, 'create', 'failed', String(error));
      console.error('[OdooService] Failed to create CRM lead:', error);
      throw error;
    }
  }

  /**
   * Update job applicant in Odoo
   */
  async updateJobApplicant(
    applicantId: number,
    data: Partial<OdooJobApplicant>,
  ): Promise<boolean> {
    try {
      await this.ensureConnection();

      await this.connection!.rpcCall<boolean>(
        ODOO_MODELS.JOB_APPLICANT,
        'write',
        [[applicantId], data],
      );

      console.log(`[OdooService] Updated job applicant ID: ${applicantId}`);
      this.logSync('JobApplicant', applicantId, 'update', 'success');
      return true;
    } catch (error) {
      this.logSync('JobApplicant', applicantId, 'update', 'failed', String(error));
      console.error('[OdooService] Failed to update applicant:', error);
      throw error;
    }
  }

  /**
   * Sync data from Odoo to website
   */
  async syncFromOdoo(): Promise<{
    jobs: OdooJob[];
    applicants: OdooJobApplicant[];
    departments: OdooDepartment[];
    company: OdooCompany | null;
  }> {
    if (this.isSyncing) {
      console.warn('[OdooService] Sync already in progress');
      return {
        jobs: [],
        applicants: [],
        departments: [],
        company: null,
      };
    }

    this.isSyncing = true;

    try {
      console.log('[OdooService] Starting full sync from Odoo...');

      const [jobs, applicants, departments, company] = await Promise.all([
        this.fetchJobs(),
        this.fetchJobApplicants(),
        this.fetchDepartments(),
        this.fetchCompany(),
      ]);

      console.log('[OdooService] ✓ Sync completed successfully');
      console.log(
        `[OdooService] Synced: ${jobs.length} jobs, ${applicants.length} applicants, ${departments.length} departments`
      );

      return {
        jobs,
        applicants,
        departments,
        company,
      };
    } catch (error) {
      console.error('[OdooService] Sync failed:', error);
      this.logSync('SYNC', 0, 'read', 'failed', String(error));
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Log sync operations for audit trail
   */
  private logSync(
    modelName: string,
    odooId: number,
    action: 'create' | 'update' | 'delete' | 'read',
    status: 'pending' | 'success' | 'failed',
    error?: string,
  ): void {
    const log: SyncLog = {
      id: `${modelName}-${odooId}-${Date.now()}`,
      modelName,
      odooId,
      action: action as 'create' | 'update' | 'delete',
      status,
      error,
      timestamp: new Date().toISOString(),
      lastSyncTime: new Date().toISOString(),
    };

    this.syncLogs.push(log);

    // Keep only last 1000 logs
    if (this.syncLogs.length > 1000) {
      this.syncLogs = this.syncLogs.slice(-1000);
    }

    console.log(`[OdooService] [${status.toUpperCase()}] ${modelName}:${odooId} - ${action}`, {
      error: error || 'N/A',
    });
  }

  /**
   * Get sync logs
   */
  getSyncLogs(): SyncLog[] {
    return this.syncLogs;
  }

  /**
   * Clear sync logs
   */
  clearSyncLogs(): void {
    this.syncLogs = [];
    console.log('[OdooService] Sync logs cleared');
  }

  /**
   * Get sync status
   */
  isSyncInProgress(): boolean {
    return this.isSyncing;
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.connection?.isAuthenticated() ?? false;
  }

  /**
   * Disconnect from Odoo
   */
  disconnect(): void {
    if (this.connection) {
      this.connection.disconnect();
      this.connection = null;
    }
    console.log('[OdooService] Disconnected from Odoo');
  }
}

// Export a singleton instance
export default new OdooService();
