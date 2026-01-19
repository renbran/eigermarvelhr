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
  retryOnFailure: boolean;
  maxRetries: number;
}

interface SyncStatus {
  lastSyncTime: string | null;
  isActive: boolean;
  lastError: string | null;
  itemsSynced: number;
  successCount: number;
  failureCount: number;
}

interface SyncEvent {
  type: 'init' | 'progress' | 'complete' | 'error';
  message: string;
  progress?: number;
  data?: unknown;
}

type SyncEventListener = (event: SyncEvent) => void;

class SyncManager {
  private config: SyncConfig = {
    autoSync: true,
    syncInterval: 5 * 60 * 1000, // 5 minutes
    conflictResolution: 'odoo_wins',
    retryOnFailure: true,
    maxRetries: 3,
  };

  private syncStatus: SyncStatus = {
    lastSyncTime: null,
    isActive: false,
    lastError: null,
    itemsSynced: 0,
    successCount: 0,
    failureCount: 0,
  };

  private syncTimer: NodeJS.Timeout | null = null;
  private eventListeners: Set<SyncEventListener> = new Set();

  /**
   * Add event listener for sync events
   */
  addEventListener(listener: SyncEventListener): void {
    this.eventListeners.add(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener: SyncEventListener): void {
    this.eventListeners.delete(listener);
  }

  /**
   * Emit sync event
   */
  private emitEvent(event: SyncEvent): void {
    console.log(`[SyncManager] Event: ${event.type} - ${event.message}`);
    this.eventListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('[SyncManager] Error in event listener:', error);
      }
    });
  }

  /**
   * Initialize sync manager
   */
  async initialize(): Promise<void> {
    try {
      console.log('[SyncManager] Initializing...');
      this.emitEvent({
        type: 'init',
        message: 'Connecting to Odoo database: eigermarvel',
      });

      const connected = await odooService.initConnection();

      if (!connected) {
        throw new Error('Failed to connect to Odoo instance at https://eigermarvelhr.com');
      }

      this.emitEvent({
        type: 'progress',
        message: 'Connected to Odoo successfully',
      });

      if (this.config.autoSync) {
        this.startAutoSync();
      }

      this.syncStatus.successCount++;
      console.log('[SyncManager] ✓ Initialized successfully');
      this.emitEvent({
        type: 'complete',
        message: 'Sync Manager initialized and ready',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[SyncManager] ✗ Initialization failed:', error);
      this.syncStatus.lastError = errorMessage;
      this.syncStatus.failureCount++;
      this.emitEvent({
        type: 'error',
        message: `Initialization failed: ${errorMessage}`,
      });
      throw error;
    }
  }

  /**
   * Start automatic sync
   */
  startAutoSync(): void {
    if (this.syncTimer) {
      console.warn('[SyncManager] Auto sync already running');
      return;
    }

    console.log(`[SyncManager] Starting auto sync (interval: ${this.config.syncInterval}ms)`);
    this.emitEvent({
      type: 'progress',
      message: `Auto-sync enabled (${this.config.syncInterval / 1000}s interval)`,
    });

    this.syncTimer = setInterval(() => {
      this.performFullSync().catch((error) => {
        console.error('[SyncManager] Auto sync failed:', error);
      });
    }, this.config.syncInterval);

    // Perform initial sync immediately
    this.performFullSync().catch((error) => {
      console.error('[SyncManager] Initial sync failed:', error);
    });
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
      console.log('[SyncManager] Auto sync stopped');
      this.emitEvent({
        type: 'progress',
        message: 'Auto-sync disabled',
      });
    }
  }

  /**
   * Perform full sync
   */
  async performFullSync(): Promise<void> {
    if (this.syncStatus.isActive) {
      console.warn('[SyncManager] Sync already in progress');
      return;
    }

    this.syncStatus.isActive = true;
    let itemsSynced = 0;
    let retryCount = 0;

    try {
      console.log('[SyncManager] Starting full sync...');
      this.emitEvent({
        type: 'progress',
        message: 'Fetching data from Odoo...',
        progress: 10,
      });

      const data = await odooService.syncFromOdoo();

      // Map Odoo jobs to website format
      this.emitEvent({
        type: 'progress',
        message: `Mapping ${data.jobs.length} jobs to website format...`,
        progress: 30,
      });
      const jobs = this.mapOdooJobsToWebsite(data.jobs);
      itemsSynced += jobs.length;

      // Map Odoo applicants to website format
      this.emitEvent({
        type: 'progress',
        message: `Mapping ${data.applicants.length} applicants to website format...`,
        progress: 50,
      });
      const applications = this.mapOdooApplicantsToWebsite(data.applicants);
      itemsSynced += applications.length;

      // Store synced data in localStorage
      this.emitEvent({
        type: 'progress',
        message: 'Storing synced data...',
        progress: 70,
      });
      this.storeLocalData('jobs', jobs);
      this.storeLocalData('applications', applications);

      if (data.company) {
        this.storeLocalData('company', data.company);
      }

      this.syncStatus.lastSyncTime = new Date().toISOString();
      this.syncStatus.itemsSynced = itemsSynced;
      this.syncStatus.lastError = null;
      this.syncStatus.successCount++;

      console.log(
        `[SyncManager] ✓ Sync completed: ${itemsSynced} items (Jobs: ${jobs.length}, Apps: ${applications.length})`
      );

      this.emitEvent({
        type: 'complete',
        message: `Sync completed: ${itemsSynced} items synced`,
        progress: 100,
        data: { jobs, applications, company: data.company },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.syncStatus.lastError = errorMessage;
      this.syncStatus.failureCount++;

      console.error('[SyncManager] ✗ Sync failed:', error);

      // Retry logic
      if (this.config.retryOnFailure && retryCount < this.config.maxRetries) {
        retryCount++;
        const waitTime = Math.pow(2, retryCount) * 1000;
        console.log(`[SyncManager] Retrying in ${waitTime}ms (attempt ${retryCount}/${this.config.maxRetries})...`);

        this.emitEvent({
          type: 'error',
          message: `Sync failed, retrying in ${waitTime}ms...`,
        });

        await new Promise((resolve) => setTimeout(resolve, waitTime));
        await this.performFullSync();
      } else {
        this.emitEvent({
          type: 'error',
          message: `Sync failed: ${errorMessage}`,
        });
        throw error;
      }
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
