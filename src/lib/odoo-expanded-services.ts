/**
 * Expanded Odoo Services
 * Additional services for CRM, Payroll, Time Off, Projects, and more
 */

import {
  OdooCrmLead,
  OdooPayslip,
  OdooTimeOffRequest,
  OdooLeaveType,
  OdooAttendance,
  OdooPerformanceReview,
  OdooProject,
  OdooTask,
  EXPANDED_ODOO_MODELS,
} from './odoo-expanded-models';

// ============================================
// CRM SERVICE
// ============================================
class CrmService {
  async fetchLeads(filters: Record<string, unknown> = {}): Promise<OdooCrmLead[]> {
    try {
      const response = await this.callOdooMethod('search_read', EXPANDED_ODOO_MODELS.CRM_LEAD, {
        domain: filters,
        fields: ['id', 'name', 'email_from', 'phone', 'user_id', 'stage_id', 'probability'],
        limit: 100,
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch CRM leads:', error);
      return [];
    }
  }

  async createLead(data: {
    name: string;
    email_from: string;
    phone?: string;
    source_id?: number;
  }): Promise<number> {
    try {
      const leadId = await this.callOdooMethod('create', EXPANDED_ODOO_MODELS.CRM_LEAD, data);
      return leadId;
    } catch (error) {
      console.error('Failed to create CRM lead:', error);
      throw error;
    }
  }

  private async callOdooMethod(method: string, model: string, data: unknown): Promise<any> {
    // This will be handled by MCP server
    console.log(`CRM RPC: ${method} on ${model}`, data);
    return [];
  }
}

// ============================================
// PAYROLL SERVICE
// ============================================
class PayrollService {
  async fetchPayslips(employeeId?: number): Promise<OdooPayslip[]> {
    try {
      const filters = employeeId ? [['employee_id', '=', employeeId]] : [];

      const response = await this.callOdooMethod('search_read', EXPANDED_ODOO_MODELS.PAYSLIP, {
        domain: filters,
        fields: [
          'id',
          'employee_id',
          'name',
          'date_from',
          'date_to',
          'basic_salary',
          'gross_salary',
          'net_salary',
          'state',
        ],
        limit: 100,
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch payslips:', error);
      return [];
    }
  }

  async fetchSalaryStructures(employeeId?: number): Promise<any[]> {
    try {
      const filters = employeeId ? [['employee_id', '=', employeeId]] : [];

      const response = await this.callOdooMethod('search_read', EXPANDED_ODOO_MODELS.SALARY_STRUCTURE, {
        domain: filters,
        fields: ['id', 'name', 'amount', 'company_id'],
        limit: 50,
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch salary structures:', error);
      return [];
    }
  }

  async generatePayslip(employeeId: number, startDate: string, endDate: string): Promise<number> {
    try {
      const payslipId = await this.callOdooMethod('create', EXPANDED_ODOO_MODELS.PAYSLIP, {
        employee_id: employeeId,
        date_from: startDate,
        date_to: endDate,
      });
      return payslipId;
    } catch (error) {
      console.error('Failed to generate payslip:', error);
      throw error;
    }
  }

  private async callOdooMethod(method: string, model: string, data: unknown): Promise<any> {
    console.log(`Payroll RPC: ${method} on ${model}`, data);
    return [];
  }
}

// ============================================
// TIME OFF SERVICE
// ============================================
class TimeOffService {
  async fetchLeaveRequests(employeeId?: number): Promise<OdooTimeOffRequest[]> {
    try {
      const filters = employeeId ? [['employee_id', '=', employeeId]] : [];

      const response = await this.callOdooMethod('search_read', EXPANDED_ODOO_MODELS.TIME_OFF_REQUEST, {
        domain: filters,
        fields: [
          'id',
          'employee_id',
          'leave_type_id',
          'date_from',
          'date_to',
          'number_of_days',
          'state',
        ],
        limit: 100,
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch leave requests:', error);
      return [];
    }
  }

  async fetchLeaveTypes(): Promise<OdooLeaveType[]> {
    try {
      const response = await this.callOdooMethod('search_read', EXPANDED_ODOO_MODELS.LEAVE_TYPE, {
        domain: [['active', '=', true]],
        fields: ['id', 'name', 'max_leaves', 'leaves_taken', 'leaves_remaining'],
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch leave types:', error);
      return [];
    }
  }

  async fetchAttendance(employeeId?: number): Promise<OdooAttendance[]> {
    try {
      const filters = employeeId ? [['employee_id', '=', employeeId]] : [];

      const response = await this.callOdooMethod('search_read', EXPANDED_ODOO_MODELS.ATTENDANCE, {
        domain: filters,
        fields: ['id', 'employee_id', 'check_in', 'check_out', 'working_hours', 'attendance_date'],
        limit: 50,
        order: 'check_in desc',
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      return [];
    }
  }

  async requestLeave(data: {
    employee_id: number;
    leave_type_id: number;
    date_from: string;
    date_to: string;
  }): Promise<number> {
    try {
      const requestId = await this.callOdooMethod('create', EXPANDED_ODOO_MODELS.TIME_OFF_REQUEST, data);
      return requestId;
    } catch (error) {
      console.error('Failed to request leave:', error);
      throw error;
    }
  }

  private async callOdooMethod(method: string, model: string, data: unknown): Promise<any> {
    console.log(`TimeOff RPC: ${method} on ${model}`, data);
    return [];
  }
}

// ============================================
// PERFORMANCE & REVIEW SERVICE
// ============================================
class PerformanceService {
  async fetchPerformanceReviews(employeeId?: number): Promise<OdooPerformanceReview[]> {
    try {
      const filters = employeeId ? [['employee_id', '=', employeeId]] : [];

      const response = await this.callOdooMethod('search_read', EXPANDED_ODOO_MODELS.PERFORMANCE_REVIEW, {
        domain: filters,
        fields: ['id', 'employee_id', 'reviewer_id', 'review_date', 'rating', 'summary', 'state'],
        limit: 50,
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch performance reviews:', error);
      return [];
    }
  }

  async fetchGoals(employeeId?: number): Promise<any[]> {
    try {
      const filters = employeeId ? [['employee_id', '=', employeeId]] : [];

      const response = await this.callOdooMethod('search_read', EXPANDED_ODOO_MODELS.GOAL, {
        domain: filters,
        fields: ['id', 'name', 'start_date', 'end_date', 'progress', 'status'],
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch goals:', error);
      return [];
    }
  }

  async submitReview(data: {
    employee_id: number;
    reviewer_id: number;
    rating: number;
    summary: string;
  }): Promise<number> {
    try {
      const reviewId = await this.callOdooMethod('create', EXPANDED_ODOO_MODELS.PERFORMANCE_REVIEW, data);
      return reviewId;
    } catch (error) {
      console.error('Failed to submit review:', error);
      throw error;
    }
  }

  private async callOdooMethod(method: string, model: string, data: unknown): Promise<any> {
    console.log(`Performance RPC: ${method} on ${model}`, data);
    return [];
  }
}

// ============================================
// PROJECTS SERVICE
// ============================================
class ProjectsService {
  async fetchProjects(): Promise<OdooProject[]> {
    try {
      const response = await this.callOdooMethod('search_read', EXPANDED_ODOO_MODELS.PROJECT, {
        domain: [['state', '!=', 'cancel']],
        fields: ['id', 'name', 'user_id', 'date_start', 'date_end', 'state'],
        limit: 50,
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      return [];
    }
  }

  async fetchTasks(projectId?: number, userId?: number): Promise<OdooTask[]> {
    try {
      const filters: Array<[string, string, number]> = [];
      if (projectId) filters.push(['project_id', '=', projectId]);
      if (userId) filters.push(['user_ids', 'in', userId]);

      const response = await this.callOdooMethod('search_read', EXPANDED_ODOO_MODELS.TASK, {
        domain: filters.length > 0 ? filters : [],
        fields: ['id', 'name', 'project_id', 'user_ids', 'stage_id', 'date_deadline', 'progress'],
        limit: 100,
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      return [];
    }
  }

  private async callOdooMethod(method: string, model: string, data: unknown): Promise<any> {
    console.log(`Projects RPC: ${method} on ${model}`, data);
    return [];
  }
}

// Export services
export const crmService = new CrmService();
export const payrollService = new PayrollService();
export const timeOffService = new TimeOffService();
export const performanceService = new PerformanceService();
export const projectsService = new ProjectsService();
