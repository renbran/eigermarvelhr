/**
 * Odoo Models & Field Mappings for Eiger Marvel HR Platform
 * Syncs with eigermarvelhr Odoo instance (v18)
 */

// HR Module Models
export interface OdooEmployee {
  id: number;
  name: string;
  email: string;
  phone: string;
  department_id: [number, string];
  job_title: string;
  user_id: [number, string];
  active: boolean;
  company_id: [number, string];
  resource_id: [number, string];
}

export interface OdooJob {
  id: number;
  name: string;
  department_id: [number, string];
  user_id: [number, string];
  description: string;
  expected_employees: number;
  no_of_hired_employee: number;
  company_id: [number, string];
  no_of_recruitment: number;
  active: boolean;
  create_date: string;
  write_date: string;
}

export interface OdooJobApplicant {
  id: number;
  name: string;
  email_from: string;
  phone: string;
  job_id: [number, string];
  partner_id: [number, string];
  stage_id: [number, string];
  user_id: [number, string];
  company_id: [number, string];
  active: boolean;
  create_date: string;
  write_date: string;
  source: string;
  description: string;
}

export interface OdooDepartment {
  id: number;
  name: string;
  company_id: [number, string];
  parent_id: [number, string] | false;
  complete_name: string;
  manager_id: [number, string] | false;
  active: boolean;
}

export interface OdooCompany {
  id: number;
  name: string;
  street: string;
  city: string;
  state_id: [number, string] | false;
  country_id: [number, string];
  zip: string;
  phone: string;
  email: string;
  website: string;
  logo: string;
  currency_id: [number, string];
}

// Website-to-Odoo Mappings
export interface CandidateProfile {
  odooId: number;
  name: string;
  email: string;
  phone: string;
  jobApplied?: number[]; // Array of OdooJobApplicant IDs
  department?: string;
  skills: string[];
  experience: string;
  qualification: string;
  resume?: string;
  profilePhoto?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobListing {
  odooId: number;
  title: string;
  department: string;
  description: string;
  requirements: string[];
  salary?: string;
  position: number;
  filled: number;
  active: boolean;
  companyId: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  odooId: number;
  candidateId: number;
  jobId: number;
  status: 'draft' | 'submitted' | 'screening' | 'interview' | 'offered' | 'rejected' | 'hired';
  appliedDate: string;
  updatedDate: string;
  notes?: string;
}

// Sync Status Tracking
export interface SyncLog {
  id: string;
  modelName: string;
  odooId: number;
  action: 'create' | 'update' | 'delete';
  status: 'pending' | 'success' | 'failed';
  error?: string;
  timestamp: string;
  lastSyncTime: string;
}

// Odoo RPC Response Types
export interface OdooRpcResponse<T> {
  jsonrpc: string;
  id: number;
  result: T;
}

export interface OdooRpcError {
  jsonrpc: string;
  id: number;
  error: {
    code: number;
    message: string;
    data: {
      name: string;
      debug: string;
      arguments: string[];
      exception_type: string;
    };
  };
}

// Sync Configuration
export const ODOO_MODELS = {
  EMPLOYEE: 'hr.employee',
  JOB: 'hr.job',
  JOB_APPLICANT: 'hr.applicant',
  DEPARTMENT: 'hr.department',
  COMPANY: 'res.company',
} as const;

export const ODOO_FIELDS = {
  EMPLOYEE: [
    'id',
    'name',
    'email',
    'phone',
    'department_id',
    'job_title',
    'user_id',
    'active',
    'company_id',
    'resource_id',
  ],
  JOB: [
    'id',
    'name',
    'department_id',
    'user_id',
    'description',
    'expected_employees',
    'no_of_hired_employee',
    'company_id',
    'no_of_recruitment',
    'active',
    'create_date',
    'write_date',
  ],
  JOB_APPLICANT: [
    'id',
    'name',
    'email_from',
    'phone',
    'job_id',
    'partner_id',
    'stage_id',
    'user_id',
    'company_id',
    'active',
    'create_date',
    'write_date',
    'source',
    'description',
  ],
  DEPARTMENT: [
    'id',
    'name',
    'company_id',
    'parent_id',
    'complete_name',
    'manager_id',
    'active',
  ],
  COMPANY: [
    'id',
    'name',
    'street',
    'city',
    'state_id',
    'country_id',
    'zip',
    'phone',
    'email',
    'website',
    'logo',
    'currency_id',
  ],
} as const;
