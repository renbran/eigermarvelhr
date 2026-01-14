/**
 * Expanded Odoo Models & Integrations
 * Includes CRM, Payroll, Time Off, Documents, and other modules
 */

// ============================================
// CRM MODULE
// ============================================
export interface OdooCrmLead {
  id: number;
  name: string;
  email_from: string;
  phone: string;
  company_id: [number, string];
  user_id: [number, string];
  stage_id: [number, string];
  probability: number;
  expected_revenue: number;
  source_id: [number, string] | false;
  active: boolean;
  create_date: string;
  write_date: string;
}

export interface OdooCrmOpportunity {
  id: number;
  name: string;
  partner_id: [number, string];
  user_id: [number, string];
  stage_id: [number, string];
  probability: number;
  expected_revenue: number;
  date_closed: string | false;
  active: boolean;
  company_id: [number, string];
}

// ============================================
// PAYROLL MODULE
// ============================================
export interface OdooSalaryStructure {
  id: number;
  name: string;
  company_id: [number, string];
  employee_id: [number, string] | false;
  payroll_period_id: [number, string] | false;
  amount: number;
  active: boolean;
}

export interface OdooPayslip {
  id: number;
  employee_id: [number, string];
  name: string;
  date_from: string;
  date_to: string;
  basic_salary: number;
  gross_salary: number;
  net_salary: number;
  state: string; // draft, verify, done, cancel
  company_id: [number, string];
  create_date: string;
}

export interface OdooSalary {
  id: number;
  employee_id: [number, string];
  payslip_id: [number, string];
  salary_rule_id: [number, string];
  amount: number;
  quantity: number;
  description: string;
}

// ============================================
// TIME OFF & ATTENDANCE
// ============================================
export interface OdooTimeOffRequest {
  id: number;
  employee_id: [number, string];
  leave_type_id: [number, string];
  date_from: string;
  date_to: string;
  duration_display: string;
  number_of_days: number;
  state: string; // draft, confirm, refuse, validate1, validate, cancel
  user_id: [number, string];
  department_id: [number, string];
  company_id: [number, string];
  request_date_from: string;
  request_date_to: string;
}

export interface OdooLeaveType {
  id: number;
  name: string;
  company_id: [number, string];
  color_name: string;
  max_leaves: number;
  leaves_taken: number;
  leaves_remaining: number;
  active: boolean;
}

export interface OdooAttendance {
  id: number;
  employee_id: [number, string];
  check_in: string;
  check_out: string | false;
  working_hours: number;
  overtime_hours: number;
  attendance_date: string;
}

// ============================================
// DOCUMENTS MODULE
// ============================================
export interface OdooDocument {
  id: number;
  name: string;
  company_id: [number, string];
  document_type_id: [number, string];
  owner_id: [number, string];
  file_size: number;
  file_extension: string;
  attachment_id: [number, string] | false;
  create_date: string;
  write_date: string;
  access_level: string; // internal, partner_editable, partner_readable
}

// ============================================
// SKILLS & CERTIFICATIONS
// ============================================
export interface OdooEmployeeSkill {
  id: number;
  employee_id: [number, string];
  skill_id: [number, string];
  skill_level_id: [number, string];
  proficiency: number; // 1-5
  description: string;
}

export interface OdooSkill {
  id: number;
  name: string;
  category_id: [number, string];
  company_id: [number, string];
  active: boolean;
}

export interface OdooCertification {
  id: number;
  name: string;
  employee_id: [number, string];
  issue_date: string;
  expiry_date: string | false;
  issuing_organization: string;
  credential_id: string;
  credential_url: string;
}

// ============================================
// PROJECTS & TASKS
// ============================================
export interface OdooProject {
  id: number;
  name: string;
  company_id: [number, string];
  user_id: [number, string];
  partner_id: [number, string] | false;
  date_start: string | false;
  date_end: string | false;
  active: boolean;
  state: string; // template, draft, open, closed, cancel
}

export interface OdooTask {
  id: number;
  name: string;
  project_id: [number, string];
  user_ids: Array<[number, string]>;
  stage_id: [number, string];
  date_deadline: string | false;
  progress: number; // 0-100
  kanban_state: string; // normal, blocked, done
  company_id: [number, string];
}

// ============================================
// ACCOUNTING MODULE
// ============================================
export interface OdooInvoice {
  id: number;
  name: string;
  partner_id: [number, string];
  invoice_date: string;
  due_date: string;
  state: string; // draft, posted, cancel, reversed
  amount_total: number;
  amount_untaxed: number;
  amount_tax: number;
  company_id: [number, string];
  user_id: [number, string];
  invoice_lines: Array<[number, string]>;
}

export interface OdooJournalEntry {
  id: number;
  name: string;
  date: string;
  journal_id: [number, string];
  company_id: [number, string];
  line_ids: Array<[number, string]>;
  state: string; // draft, posted, cancel
}

// ============================================
// PERFORMANCE & REVIEWS
// ============================================
export interface OdooPerformanceReview {
  id: number;
  employee_id: [number, string];
  reviewer_id: [number, string];
  review_date: string;
  rating: number; // 1-5
  summary: string;
  strengths: string;
  areas_for_improvement: string;
  goals: string;
  state: string; // draft, submitted, approved, completed
}

export interface OdooGoal {
  id: number;
  name: string;
  employee_id: [number, string];
  start_date: string;
  end_date: string;
  progress: number;
  status: string; // todo, in_progress, completed, cancelled
  description: string;
}

// ============================================
// ORGANIZATION STRUCTURE
// ============================================
export interface OdooPosition {
  id: number;
  name: string;
  department_id: [number, string];
  job_id: [number, string];
  company_id: [number, string];
  employee_id: [number, string] | false;
  active: boolean;
}

export interface OdooJobTitle {
  id: number;
  name: string;
  company_id: [number, string];
  active: boolean;
}

// ============================================
// CONFIGURATION & SETTINGS
// ============================================
export const EXPANDED_ODOO_MODELS = {
  // Existing
  EMPLOYEE: 'hr.employee',
  JOB: 'hr.job',
  JOB_APPLICANT: 'hr.applicant',
  DEPARTMENT: 'hr.department',
  COMPANY: 'res.company',

  // CRM
  CRM_LEAD: 'crm.lead',
  CRM_OPPORTUNITY: 'crm.opportunity',

  // Payroll
  SALARY_STRUCTURE: 'hr.salary.structure',
  PAYSLIP: 'hr.payslip',
  SALARY_RULE: 'hr.salary.rule',

  // Time Off
  TIME_OFF_REQUEST: 'hr.leave',
  LEAVE_TYPE: 'hr.leave.type',
  ATTENDANCE: 'hr.attendance',

  // Documents
  DOCUMENT: 'documents.document',

  // Skills
  EMPLOYEE_SKILL: 'hr.employee.skill',
  SKILL: 'hr.skill',
  CERTIFICATION: 'hr.certificate',

  // Projects
  PROJECT: 'project.project',
  TASK: 'project.task',

  // Accounting
  INVOICE: 'account.move',
  JOURNAL_ENTRY: 'account.move.line',

  // Performance
  PERFORMANCE_REVIEW: 'hr.appraisal',
  GOAL: 'hr.goal',

  // Organization
  POSITION: 'hr.position',
  JOB_TITLE: 'hr.job.title',
} as const;

export const EXPANDED_ODOO_FIELDS = {
  CRM_LEAD: [
    'id',
    'name',
    'email_from',
    'phone',
    'company_id',
    'user_id',
    'stage_id',
    'probability',
    'expected_revenue',
    'source_id',
    'active',
  ],
  PAYSLIP: [
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
  TIME_OFF: ['id', 'employee_id', 'leave_type_id', 'date_from', 'date_to', 'state', 'number_of_days'],
  ATTENDANCE: ['id', 'employee_id', 'check_in', 'check_out', 'working_hours', 'attendance_date'],
  PERFORMANCE_REVIEW: [
    'id',
    'employee_id',
    'reviewer_id',
    'review_date',
    'rating',
    'summary',
    'state',
  ],
  PROJECT: ['id', 'name', 'company_id', 'user_id', 'date_start', 'date_end', 'state'],
  TASK: ['id', 'name', 'project_id', 'user_ids', 'stage_id', 'date_deadline', 'progress'],
} as const;
