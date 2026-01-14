/**
 * React Hooks for Odoo Integration
 * Provides reusable hooks for syncing and accessing Odoo data
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import syncManager from '../lib/sync-manager';
import { JobListing, JobApplication, SyncLog } from '../lib/odoo-models';

/**
 * Hook to manage Odoo sync status
 */
export function useSyncStatus() {
  const [status, setStatus] = useState(() => syncManager.getSyncStatus());
  const [logs, setLogs] = useState<SyncLog[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(syncManager.getSyncStatus());
      setLogs(syncManager.getSyncLogs());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return { ...status, logs };
}

/**
 * Hook to fetch and cache jobs from Odoo
 */
export function useOdooJobs() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadJobs = () => {
      const cachedJobs = syncManager.getLocalData<JobListing[]>('jobs');
      if (cachedJobs) {
        setJobs(cachedJobs);
        setLoading(false);
      } else {
        setLoading(true);
      }
    };

    loadJobs();

    // Listen for sync updates
    const interval = setInterval(loadJobs, 2000);
    return () => clearInterval(interval);
  }, []);

  return { jobs, loading, error };
}

/**
 * Hook to submit job application
 */
export function useJobApplication() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = useCallback(
    async (data: {
      candidateName: string;
      candidateEmail: string;
      candidatePhone: string;
      jobId: number;
      message?: string;
    }) => {
      setSubmitting(true);
      setError(null);
      setSuccess(false);

      try {
        const applicantId = await syncManager.submitJobApplication(data);
        setSuccess(true);
        return applicantId;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  return { submit, submitting, error, success };
}

/**
 * Hook to manage sync lifecycle
 */
export function useOdooSync(autoStart = true) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!autoStart || initialized.current) return;

    const init = async () => {
      try {
        await syncManager.initialize();
        initialized.current = true;
      } catch (error) {
        console.error('Failed to initialize sync:', error);
      }
    };

    init();

    return () => {
      // Don't destroy on unmount - let it continue
    };
  }, [autoStart]);

  return {
    startSync: () => syncManager.startAutoSync(),
    stopSync: () => syncManager.stopAutoSync(),
    performSync: () => syncManager.performFullSync(),
    getStatus: () => syncManager.getSyncStatus(),
  };
}

/**
 * Hook to get job applications
 */
export function useJobApplications() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApplications = () => {
      const cached = syncManager.getLocalData<JobApplication[]>('applications');
      if (cached) {
        setApplications(cached);
        setLoading(false);
      }
    };

    loadApplications();

    const interval = setInterval(loadApplications, 2000);
    return () => clearInterval(interval);
  }, []);

  return { applications, loading };
}

/**
 * Hook to get sync logs for debugging
 */
export function useSyncLogs() {
  const [logs, setLogs] = useState<SyncLog[]>([]);

  useEffect(() => {
    const updateLogs = () => {
      setLogs(syncManager.getSyncLogs());
    };

    updateLogs();
    const interval = setInterval(updateLogs, 1000);

    return () => clearInterval(interval);
  }, []);

  return logs;
}
