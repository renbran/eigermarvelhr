/**
 * Expanded React Hooks for All Odoo Integrations
 * Provides hooks for CRM, Payroll, Time Off, Performance, and Projects
 */

import { useEffect, useState, useCallback } from 'react';
import {
  crmService,
  payrollService,
  timeOffService,
  performanceService,
  projectsService,
} from '../lib/odoo-expanded-services';
import {
  OdooCrmLead,
  OdooPayslip,
  OdooTimeOffRequest,
  OdooLeaveType,
  OdooAttendance,
  OdooPerformanceReview,
  OdooProject,
  OdooTask,
} from '../lib/odoo-expanded-models';

// ============================================
// CRM HOOKS
// ============================================

export function useCrmLeads(filters?: Record<string, unknown>) {
  const [leads, setLeads] = useState<OdooCrmLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLeads = async () => {
      try {
        setLoading(true);
        const data = await crmService.fetchLeads(filters);
        setLeads(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    loadLeads();
  }, [filters]);

  return { leads, loading, error };
}

export function useCreateCrmLead() {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (data: {
      name: string;
      email_from: string;
      phone?: string;
      source_id?: number;
    }) => {
      setCreating(true);
      try {
        const leadId = await crmService.createLead(data);
        setError(null);
        return leadId;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(errorMsg);
        throw err;
      } finally {
        setCreating(false);
      }
    },
    [],
  );

  return { create, creating, error };
}

// ============================================
// PAYROLL HOOKS
// ============================================

export function usePayslips(employeeId?: number) {
  const [payslips, setPayslips] = useState<OdooPayslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPayslips = async () => {
      try {
        setLoading(true);
        const data = await payrollService.fetchPayslips(employeeId);
        setPayslips(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    loadPayslips();
  }, [employeeId]);

  return { payslips, loading, error };
}

export function useSalaryStructures(employeeId?: number) {
  const [structures, setStructures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStructures = async () => {
      try {
        setLoading(true);
        const data = await payrollService.fetchSalaryStructures(employeeId);
        setStructures(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    loadStructures();
  }, [employeeId]);

  return { structures, loading, error };
}

export function useGeneratePayslip() {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (employeeId: number, startDate: string, endDate: string) => {
      setGenerating(true);
      try {
        const payslipId = await payrollService.generatePayslip(employeeId, startDate, endDate);
        setError(null);
        return payslipId;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(errorMsg);
        throw err;
      } finally {
        setGenerating(false);
      }
    },
    [],
  );

  return { generate, generating, error };
}

// ============================================
// TIME OFF HOOKS
// ============================================

export function useLeaveRequests(employeeId?: number) {
  const [requests, setRequests] = useState<OdooTimeOffRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true);
        const data = await timeOffService.fetchLeaveRequests(employeeId);
        setRequests(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [employeeId]);

  return { requests, loading, error };
}

export function useLeaveTypes() {
  const [types, setTypes] = useState<OdooLeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTypes = async () => {
      try {
        setLoading(true);
        const data = await timeOffService.fetchLeaveTypes();
        setTypes(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    loadTypes();
  }, []);

  return { types, loading, error };
}

export function useAttendance(employeeId?: number) {
  const [records, setRecords] = useState<OdooAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecords = async () => {
      try {
        setLoading(true);
        const data = await timeOffService.fetchAttendance(employeeId);
        setRecords(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, [employeeId]);

  return { records, loading, error };
}

export function useRequestLeave() {
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(
    async (data: {
      employee_id: number;
      leave_type_id: number;
      date_from: string;
      date_to: string;
    }) => {
      setRequesting(true);
      try {
        const requestId = await timeOffService.requestLeave(data);
        setError(null);
        return requestId;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(errorMsg);
        throw err;
      } finally {
        setRequesting(false);
      }
    },
    [],
  );

  return { request, requesting, error };
}

// ============================================
// PERFORMANCE HOOKS
// ============================================

export function usePerformanceReviews(employeeId?: number) {
  const [reviews, setReviews] = useState<OdooPerformanceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        const data = await performanceService.fetchPerformanceReviews(employeeId);
        setReviews(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [employeeId]);

  return { reviews, loading, error };
}

export function useEmployeeGoals(employeeId?: number) {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGoals = async () => {
      try {
        setLoading(true);
        const data = await performanceService.fetchGoals(employeeId);
        setGoals(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    loadGoals();
  }, [employeeId]);

  return { goals, loading, error };
}

export function useSubmitReview() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (data: {
      employee_id: number;
      reviewer_id: number;
      rating: number;
      summary: string;
    }) => {
      setSubmitting(true);
      try {
        const reviewId = await performanceService.submitReview(data);
        setError(null);
        return reviewId;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(errorMsg);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  return { submit, submitting, error };
}

// ============================================
// PROJECTS HOOKS
// ============================================

export function useProjects() {
  const [projects, setProjects] = useState<OdooProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const data = await projectsService.fetchProjects();
        setProjects(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  return { projects, loading, error };
}

export function useTasks(projectId?: number, userId?: number) {
  const [tasks, setTasks] = useState<OdooTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const data = await projectsService.fetchTasks(projectId, userId);
        setTasks(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [projectId, userId]);

  return { tasks, loading, error };
}
