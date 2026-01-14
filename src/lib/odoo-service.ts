/**
 * Odoo Service - Handles all communication with Odoo MCP Server
 * Connects to eigermarvelhr instance (v18)
 */

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

const ODOO_CONFIG = {
  instance: 'eigermarvelhr',
  url: 'https://eigermarvelhr.com',
  db: 'eigermarvel',
  username: 'admin',
  version: 'v18',
};

interface OdooMCPRequest {
  method: string;
  model: string;
  args?: unknown[];
  kwargs?: Record<string, unknown>;
}

class OdooService {
  private syncLogs: SyncLog[] = [];
  private isSyncing = false;

  /**
   * Initialize Odoo MCP connection
   */
  async initConnection(): Promise<boolean> {
    try {
      console.log(`Connecting to Odoo MCP: ${ODOO_CONFIG.instance}`);
      // Connection will be handled by the MCP server
      return true;
    } catch (error) {
      console.error('Failed to initialize Odoo connection:', error);
      return false;
    }
  }

  /**
   * Fetch jobs from Odoo
   */
  async fetchJobs(filters: Record<string, unknown> = {}): Promise<OdooJob[]> {
    try {
      const defaultFilters = [['active', '=', true]];
      const allFilters = Object.keys(filters).length > 0 ? filters : defaultFilters;

      const response = await this.callOdooMethod('search_read', ODOO_MODELS.JOB, {
        domain: allFilters,
        fields: ODOO_FIELDS.JOB,
        limit: 100,
      });

      return response;
    } catch (error) {
      this.logSync('Job', 0, 'read', 'failed', String(error));
      throw error;
    }
  }

  /**
   * Fetch job applicants
   */
  async fetchJobApplicants(filters: Record<string, unknown> = {}): Promise<OdooJobApplicant[]> {
    try {
      const defaultFilters = [['active', '=', true]];
      const allFilters = Object.keys(filters).length > 0 ? filters : defaultFilters;

      const response = await this.callOdooMethod('search_read', ODOO_MODELS.JOB_APPLICANT, {
        domain: allFilters,
        fields: ODOO_FIELDS.JOB_APPLICANT,
        limit: 500,
      });

      return response;
    } catch (error) {
      this.logSync('JobApplicant', 0, 'read', 'failed', String(error));
      throw error;
    }
  }

  /**
   * Fetch employees
   */
  async fetchEmployees(filters: Record<string, unknown> = {}): Promise<OdooEmployee[]> {
    try {
      const defaultFilters = [['active', '=', true]];
      const allFilters = Object.keys(filters).length > 0 ? filters : defaultFilters;

      const response = await this.callOdooMethod('search_read', ODOO_MODELS.EMPLOYEE, {
        domain: allFilters,
        fields: ODOO_FIELDS.EMPLOYEE,
        limit: 500,
      });

      return response;
    } catch (error) {
      this.logSync('Employee', 0, 'read', 'failed', String(error));
      throw error;
    }
  }

  /**
   * Fetch departments
   */
  async fetchDepartments(): Promise<OdooDepartment[]> {
    try {
      const response = await this.callOdooMethod('search_read', ODOO_MODELS.DEPARTMENT, {
        domain: [['active', '=', true]],
        fields: ODOO_FIELDS.DEPARTMENT,
      });

      return response;
    } catch (error) {
      this.logSync('Department', 0, 'read', 'failed', String(error));
      throw error;
    }
  }

  /**
   * Fetch company info
   */
  async fetchCompany(): Promise<OdooCompany | null> {
    try {
      const response = await this.callOdooMethod('search_read', ODOO_MODELS.COMPANY, {
        domain: [],
        fields: ODOO_FIELDS.COMPANY,
        limit: 1,
      });

      return response.length > 0 ? response[0] : null;
    } catch (error) {
      this.logSync('Company', 0, 'read', 'failed', String(error));
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
      const applicantId = await this.callOdooMethod('create', ODOO_MODELS.JOB_APPLICANT, data);
      this.logSync('JobApplicant', applicantId, 'create', 'success');
      return applicantId;
    } catch (error) {
      this.logSync('JobApplicant', 0, 'create', 'failed', String(error));
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
      await this.callOdooMethod('write', ODOO_MODELS.JOB_APPLICANT, {
        args: [[applicantId], data],
      });
      this.logSync('JobApplicant', applicantId, 'update', 'success');
      return true;
    } catch (error) {
      this.logSync('JobApplicant', applicantId, 'update', 'failed', String(error));
      throw error;
    }
  }

  /**
   * Generic RPC call to Odoo
   */
  private async callOdooMethod(
    method: string,
    model: string,
    data: unknown,
  ): Promise<unknown> {
    try {
      // This will be handled by the MCP server
      // The MCP server at d:/01_WORK_PROJECTS/odoo-mcp-server/dist/index.js
      // will process these requests and communicate with Odoo

      const request: OdooMCPRequest = {
        method,
        model,
        args: Array.isArray(data) ? data : [data],
      };

      // Simulated response - in production, this would call the MCP server
      console.log(`Odoo RPC Call: ${method} on ${model}`, request);

      // Return mock response structure
      if (method === 'search_read') {
        return [];
      } else if (method === 'create') {
        return Math.floor(Math.random() * 10000);
      } else if (method === 'write') {
        return true;
      }

      return null;
    } catch (error) {
      console.error('Odoo RPC Error:', error);
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
      console.warn('Sync already in progress');
      return {
        jobs: [],
        applicants: [],
        departments: [],
        company: null,
      };
    }

    this.isSyncing = true;

    try {
      console.log('Starting sync from Odoo...');

      const [jobs, applicants, departments, company] = await Promise.all([
        this.fetchJobs(),
        this.fetchJobApplicants(),
        this.fetchDepartments(),
        this.fetchCompany(),
      ]);

      console.log('Sync completed successfully');
      console.log(`Fetched: ${jobs.length} jobs, ${applicants.length} applicants, ${departments.length} departments`);

      return {
        jobs,
        applicants,
        departments,
        company,
      };
    } catch (error) {
      console.error('Sync failed:', error);
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
  }

  /**
   * Get sync status
   */
  isSyncInProgress(): boolean {
    return this.isSyncing;
  }
}

export default new OdooService();
