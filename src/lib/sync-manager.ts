/**
 * Sync Manager - Coordinates bidirectional sync between Website and Odoo
 * Handles data mapping and conflict resolution
 */

import odooService from './odoo-service';
import {
  JobListing,
  CandidateProfile,
  JobApplication,
  OdooJob,
  OdooJobApplicant,
  OdooEmployee,
} from './odoo-models';

interface SyncConfig {
  autoSync: boolean;
  syncInterval: number; // milliseconds
  conflictResolution: 'odoo_wins' | 'website_wins' | 'manual';
}

interface SyncStatus {
  lastSyncTime: string | null;
  isActive: boolean;
  lastError: string | null;
  itemsSynced: number;
}

class SyncManager {
  private config: SyncConfig = {
    autoSync: true,
    syncInterval: 5 * 60 * 1000, // 5 minutes
    conflictResolution: 'odoo_wins',
  };

  private syncStatus: SyncStatus = {
    lastSyncTime: null,
    isActive: false,
    lastError: null,
    itemsSynced: 0,
  };

  private syncTimer: NodeJS.Timeout | null = null;

  /**
   * Initialize sync manager
   */
  async initialize(): Promise<void> {
    try {
      console.log('Initializing Sync Manager...');
      const connected = await odooService.initConnection();

      if (!connected) {
        throw new Error('Failed to connect to Odoo');
      }

      if (this.config.autoSync) {
        this.startAutoSync();
      }

      console.log('Sync Manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Sync Manager:', error);
      this.syncStatus.lastError = String(error);
    }
  }

  /**
   * Start automatic sync
   */
  startAutoSync(): void {
    if (this.syncTimer) {
      console.warn('Auto sync already running');
      return;
    }

    console.log(`Starting auto sync (interval: ${this.config.syncInterval}ms)`);

    this.syncTimer = setInterval(() => {
      this.performFullSync().catch((error) => {
        console.error('Auto sync failed:', error);
      });
    }, this.config.syncInterval);

    // Perform initial sync
    this.performFullSync().catch((error) => {
      console.error('Initial sync failed:', error);
    });
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
      console.log('Auto sync stopped');
    }
  }

  /**
   * Perform full sync
   */
  async performFullSync(): Promise<void> {
    if (this.syncStatus.isActive) {
      console.warn('Sync already in progress');
      return;
    }

    this.syncStatus.isActive = true;
    let itemsSynced = 0;

    try {
      console.log('Starting full sync...');

      const data = await odooService.syncFromOdoo();

      // Map Odoo jobs to website format
      const jobs = this.mapOdooJobsToWebsite(data.jobs);
      itemsSynced += jobs.length;

      // Map Odoo applicants to website format
      const applications = this.mapOdooApplicantsToWebsite(data.applicants);
      itemsSynced += applications.length;

      // Store synced data in localStorage for now
      // In production, this would be stored in a database
      this.storeLocalData('jobs', jobs);
      this.storeLocalData('applications', applications);

      if (data.company) {
        this.storeLocalData('company', data.company);
      }

      this.syncStatus.lastSyncTime = new Date().toISOString();
      this.syncStatus.itemsSynced = itemsSynced;
      this.syncStatus.lastError = null;

      console.log(`Sync completed: ${itemsSynced} items synced`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.syncStatus.lastError = errorMessage;
      console.error('Sync failed:', error);
      throw error;
    } finally {
      this.syncStatus.isActive = false;
    }
  }

  /**
   * Sync job application to Odoo
   */
  async submitJobApplication(application: {
    candidateName: string;
    candidateEmail: string;
    candidatePhone: string;
    jobId: number;
    message?: string;
  }): Promise<number> {
    try {
      const applicantId = await odooService.createJobApplicant({
        name: application.candidateName,
        email_from: application.candidateEmail,
        phone: application.candidatePhone,
        job_id: application.jobId,
        description: application.message,
      });

      console.log(`Job application submitted: ${applicantId}`);
      return applicantId;
    } catch (error) {
      console.error('Failed to submit job application:', error);
      throw error;
    }
  }

  /**
   * Map Odoo jobs to website format
   */
  private mapOdooJobsToWebsite(odooJobs: OdooJob[]): JobListing[] {
    return odooJobs.map((job) => ({
      odooId: job.id,
      title: job.name,
      department: job.department_id ? job.department_id[1] : 'General',
      description: job.description || '',
      requirements: job.description ? job.description.split('\n') : [],
      position: job.expected_employees || 0,
      filled: job.no_of_hired_employee || 0,
      active: job.active,
      companyId: job.company_id ? job.company_id[0] : 0,
      createdAt: job.create_date || new Date().toISOString(),
      updatedAt: job.write_date || new Date().toISOString(),
    }));
  }

  /**
   * Map Odoo applicants to website format
   */
  private mapOdooApplicantsToWebsite(odooApplicants: OdooJobApplicant[]): JobApplication[] {
    const stageMap: Record<string, JobApplication['status']> = {
      'Stages/New': 'submitted',
      'Stages/First Interview': 'interview',
      'Stages/Second Interview': 'interview',
      'Stages/Final Interview': 'interview',
      'Stages/Offer': 'offered',
      'Stages/Refused': 'rejected',
      'Stages/Hired': 'hired',
    };

    return odooApplicants.map((applicant) => ({
      odooId: applicant.id,
      candidateId: applicant.partner_id ? applicant.partner_id[0] : 0,
      jobId: applicant.job_id ? applicant.job_id[0] : 0,
      status: stageMap[applicant.stage_id ? applicant.stage_id[1] : ''] || 'submitted',
      appliedDate: applicant.create_date || new Date().toISOString(),
      updatedDate: applicant.write_date || new Date().toISOString(),
      notes: applicant.description,
    }));
  }

  /**
   * Store data in localStorage (temporary solution)
   */
  private storeLocalData(key: string, data: unknown): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(`odoo_${key}`, JSON.stringify(data));
      }
    } catch (error) {
      console.error(`Failed to store ${key} in localStorage:`, error);
    }
  }

  /**
   * Retrieve data from localStorage
   */
  getLocalData<T>(key: string): T | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const data = localStorage.getItem(`odoo_${key}`);
        return data ? JSON.parse(data) : null;
      }
    } catch (error) {
      console.error(`Failed to retrieve ${key} from localStorage:`, error);
    }
    return null;
  }

  /**
   * Get current sync status
   */
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Update sync configuration
   */
  updateConfig(config: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...config };

    // Restart auto sync if interval changed
    if (this.syncTimer) {
      this.stopAutoSync();
      if (this.config.autoSync) {
        this.startAutoSync();
      }
    }
  }

  /**
   * Get sync logs
   */
  getSyncLogs() {
    return odooService.getSyncLogs();
  }

  /**
   * Initialize sync (alias for initialize)
   */
  async initializeSync(): Promise<void> {
    return this.initialize();
  }

  /**
   * Sync Odoo data (alias for performFullSync)
   */
  async syncOdooData(): Promise<void> {
    return this.performFullSync();
  }

  /**
   * Manually sync from Odoo to website
   */
  async syncFromOdoo(): Promise<any> {
    try {
      const data = await odooService.syncFromOdoo();
      const jobs = this.mapOdooJobsToWebsite(data.jobs);
      const applications = this.mapOdooApplicantsToWebsite(data.applicants);
      
      this.storeLocalData('jobs', jobs);
      this.storeLocalData('applications', applications);
      
      return { jobs, applications };
    } catch (error) {
      console.error('Failed to sync from Odoo:', error);
      throw error;
    }
  }

  /**
   * Manually sync to Odoo from website
   */
  async syncToOdoo(data: any): Promise<any> {
    try {
      // Create applicants in Odoo
      if (data.applications && Array.isArray(data.applications)) {
        for (const app of data.applications) {
          await odooService.createJobApplicant({
            name: app.candidateName,
            email: app.email,
            phone: app.phone,
            job_id: app.jobId,
            description: app.coverLetter,
          });
        }
      }
      return { success: true, itemsSynced: data.applications?.length || 0 };
    } catch (error) {
      console.error('Failed to sync to Odoo:', error);
      throw error;
    }
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        ['jobs', 'applications', 'company', 'employees', 'departments'].forEach((key) => {
          localStorage.removeItem(`odoo_${key}`);
        });
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  /**
   * Destroy sync manager
   */
  destroy(): void {
    this.stopAutoSync();
    this.clearCache();
    console.log('Sync Manager destroyed');
  }
}

export default new SyncManager();
