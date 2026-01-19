# Recruitment Module Structure - Comprehensive Analysis

**Location:** `odoo_modules/uae_recruitment_mgmt/`  
**Module Name:** UAE Recruitment Management  
**Version:** 18.0.1.0.1  
**Status:** Dedicated custom recruitment module (extends HR module)

---

## 📋 Module Overview

This is a **dedicated recruitment module** (not just using HR module components). It's a comprehensive recruitment management system built on Odoo 18 that extends the base HR module with advanced features including:

- Client management (recruitment agencies & hiring companies)
- Job order/requisition management
- Candidate management with AI resume parsing
- Placement tracking and management
- UAE visa processing workflow
- Dashboard & analytics
- Website integration
- Portal access (client & candidate)

**Module Type:** Application (installable, standalone)

---

## 🏗️ Module Architecture

### Directory Structure
```
uae_recruitment_mgmt/
├── controllers/              # API controllers for website sync
├── data/                     # Static data (sequences, email templates, automation)
├── models/                   # Core ORM models (7 models)
├── security/                 # Access control groups and rules
├── static/                   # Assets (JS, CSS)
├── views/                    # UI views (XML)
├── wizards/                  # Action wizards
├── __init__.py
└── __manifest__.py
```

---

## 🗂️ Core Models (7 Total)

### 1. **recruitment.client** - Client Management
**Model Class:** `RecruitmentClient`  
**Inheritance:** `mail.thread`, `mail.activity.mixin`  
**Purpose:** Manages recruitment clients (agencies, companies)

**Key Fields:**
- **Identification:**
  - `name` (Char) - Client Name [Required]
  - `reference` (Char) - Client Reference [Auto-generated]
  - `partner_id` (Many2one → res.partner) - Partner Link [Required]
  - `active` (Boolean) - Active Status

- **Registration & Compliance:**
  - `trade_license_number` (Char) - Trade License [Required]
  - `trade_license_expiry` (Date) - License Expiry
  - `entity_type` (Selection) - Type: mainland, freezone, deira, jafza, other [Default: mainland]
  - `ded_verified` (Boolean) - DED Verification Status [Readonly]
  - `ded_verification_date` (Datetime) - Verification Date [Readonly]
  - `ded_verification_result` (Text) - Verification Result [Readonly]

- **Contact Information:**
  - `contact_person` (Char) - Contact Person
  - `phone` (Char) - Phone Number
  - `email` (Char) - Email [Required]
  - `website` (Char) - Website URL

- **Location:**
  - `address` (Text) - Full Address
  - `city` (Char) - City
  - `emirate` (Selection) - Emirate: Abu Dhabi, Dubai, Sharjah, etc.

- **Service Agreement:**
  - `service_type` (Selection) - Type: contingency (20-25%), retainer (monthly), hybrid
  - `contingency_percentage` (Float) - Commission % [Default: 20.0]
  - `retainer_amount` (Monetary) - Monthly Retainer Fee
  - `retainer_includes` (Integer) - Positions Included [Default: 0]

- **Financial:**
  - `currency_id` (Many2one → res.currency) - Currency [Default: AED]
  - `total_revenue` (Monetary, Computed)
  - `outstanding_amount` (Monetary, Computed)

- **Relationships:**
  - `job_order_ids` (One2many → recruitment.job.order)
  - `placement_ids` (One2many → recruitment.placement)
  - `job_order_count` (Integer, Computed)
  - `placement_count` (Integer, Computed)

- **Portal Access:**
  - `portal_enabled` (Boolean) - Enable Portal [Default: False]
  - `portal_user_id` (Many2one → res.users) - Portal User [Readonly]

- **Status:**
  - `state` (Selection) - Draft → Pending Verification → Verified → Active → Suspended → Terminated

- **Other:**
  - `internal_notes` (Text)
  - `terms_and_conditions` (Html)

---

### 2. **recruitment.job.order** - Job Requisitions/Openings
**Model Class:** `RecruitmentJobOrder`  
**Inheritance:** `mail.thread`, `mail.activity.mixin`  
**Purpose:** Manages job orders/requisitions

**Key Fields:**
- **Basic Information:**
  - `name` (Char) - Job Title [Required]
  - `reference` (Char) - Reference [Auto-generated]
  - `client_id` (Many2one → recruitment.client) - Hiring Client [Required]
  - `description` (Html) - Job Description [Required]

- **Job Details:**
  - `job_level` (Selection) - Entry Level, Junior, Mid-Level, Senior, Lead, Manager, Director, C-Level [Default: mid]
  - `department_id` (Many2one → hr.department)
  - `skills_ids` (Many2many → hr.skill) - Required Skills
  - `experience_years_min` (Integer) - Minimum Experience [Default: 0]
  - `experience_years_max` (Integer) - Maximum Experience [Default: 10]
  - `languages` (Char) - Languages Required
  - `certifications` (Char) - Certifications Required
  - `education_level` (Selection) - High School, Diploma, Bachelor, Master, PhD [Default: Bachelor]

- **Position Tracking:**
  - `positions_required` (Integer) - Positions Required [Default: 1, Required]
  - `positions_filled` (Integer, Computed)
  - `positions_remaining` (Integer, Computed)

- **Compensation:**
  - `salary_min` (Monetary) - Minimum Salary
  - `salary_max` (Monetary) - Maximum Salary
  - `currency_id` (Many2one → res.currency) - Currency [Default: AED]
  - `benefits` (Text) - Benefits & Allowances

- **Timeline:**
  - `created_date` (Date) - Created Date [Default: Today]
  - `requested_completion_date` (Date) - Requested Completion
  - `closing_date` (Date) - Job Closing Date
  - `actual_closing_date` (Date)
  - `days_to_fill` (Integer, Computed)

- **Work Details:**
  - `location` (Char) - Work Location [Required]
  - `work_type` (Selection) - On-Site, Remote, Hybrid [Default: On-Site]

- **Candidate Management:**
  - `applicant_ids` (One2many → hr.applicant)
  - `applicant_count` (Integer, Computed)

- **AI Matching:**
  - `ai_matching_enabled` (Boolean) - Enable AI Matching [Default: True]
  - `ai_match_threshold` (Float) - AI Match Threshold % [Default: 70.0]

- **Company & Visa:**
  - `company_id` (Many2one → res.company) - Company
  - `visa_sponsorship` (Boolean) - Visa Sponsorship Available [Default: True]
  - `visa_type` (Selection) - Employment, Investor, Golden, No Sponsorship [Default: Employment]

- **Website Integration:**
  - `website_published` (Boolean) - Published on Website [Default: False]
  - `website_id` (Char) - Website ID [Readonly]
  - `sync_status` (Selection) - Not Synced, Synced, Out of Sync, Error [Default: Not Synced]
  - `last_sync_date` (Datetime) - Last Sync Date [Readonly]

- **Status:**
  - `state` (Selection) - Draft → Posted → Active → On Hold → Filled → Closed → Cancelled

- **Other:**
  - `internal_notes` (Text)
  - `source` (Char) - Job Source/Portal

---

### 3. **hr.applicant** (Inherited) - Candidate Management
**Model Class:** `HrApplicantInherit`  
**Inheritance:** Extends Odoo's `hr.applicant` model  
**Purpose:** Enhanced candidate management with UAE-specific features

**Extended Fields (Custom):**
- **Identification:**
  - `candidate_code` (Char) - Candidate ID [Auto-generated, Readonly]
  - `nationality_id` (Many2one → res.country) - Nationality

- **UAE Specific Information:**
  - `visa_status` (Selection) - Visit Visa, Employment Visa, Own Visa, Cancelled Visa, Outside UAE [Default: Outside UAE]
  - `emirates_id` (Char) - Emirates ID
  - `passport_number` (Char) - Passport Number
  - `passport_expiry` (Date) - Passport Expiry Date

- **Financial:**
  - `current_salary` (Monetary) - Current Salary
  - `expected_salary` (Monetary) - Expected Salary
  - `currency_id` (Many2one → res.currency) - Currency [Default: AED]
  - `notice_period` (Integer) - Notice Period (Days) [Default: 30]

- **Job Application:**
  - `job_order_ids` (Many2many → recruitment.job.order) - Applied Job Orders
  - `submission_date` (Date) - Submission Date
  - `placement_id` (Many2one → recruitment.placement) - Placement [Readonly]
  - `submitted_to_client` (Boolean, Computed)

- **Offer Management:**
  - `client_feedback` (Text) - Client Feedback
  - `offer_status` (Selection) - Not Offered, Offered, Offer Accepted, Offer Rejected [Default: Not Offered]

- **AI Resume Analysis:**
  - `ai_parsed_skills` (Many2many → hr.skill) - AI Extracted Skills
  - `ai_match_score` (Float, Computed & Stored) - AI Match Score
  - `resume_summary` (Text) - AI Resume Summary [Readonly]

- **Qualifications:**
  - `education_level` (Selection) - High School, Diploma, Bachelor, Master, PhD [Default: Bachelor]
  - `years_of_experience` (Float) - Years of Experience

- **Compliance:**
  - `requires_noc` (Boolean) - Requires NOC
  - `noc_obtained` (Boolean) - NOC Obtained
  - `noc_expiry` (Date) - NOC Expiry Date
  - `can_join_immediately` (Boolean) - Can Join Immediately [Default: False]

- **Additional Information:**
  - `linkedin_profile` (Char) - LinkedIn Profile
  - `availability_date` (Date) - Available From
  - `internal_notes` (Text) - Interview Notes
  - `created_date` (Date) - Created Date [Default: Today, Readonly]

**Special Methods:**
- `action_parse_resume()` - AI-powered resume parsing using configurable LLM provider
- Auto-generates `candidate_code` on creation
- Resume parsing on attach (single creates only to avoid performance issues)

---

### 4. **recruitment.placement** - Placement Tracking
**Model Class:** `RecruitmentPlacement`  
**Inheritance:** `mail.thread`, `mail.activity.mixin`  
**Purpose:** Tracks successful placements and hiring

**Key Fields:**
- **References:**
  - `name` (Char) - Placement Reference [Auto-generated]
  - `applicant_id` (Many2one → hr.applicant) - Candidate [Required]
  - `client_id` (Many2one → recruitment.client) - Client [Required]
  - `job_order_id` (Many2one → recruitment.job.order) - Job Order [Required]
  - `employee_id` (Many2one → hr.employee) - Employee [Readonly, set when hired]

- **Timeline:**
  - `placement_date` (Date) - Placement Date [Default: Today, Required]
  - `joining_date` (Date) - Joining Date
  - `confirmation_period_days` (Integer) - Confirmation Period Days [Default: 90]
  - `confirmation_date` (Date, Computed)
  - `contract_end_date` (Date)

- **Compensation:**
  - `gross_salary` (Monetary) - Gross Salary [Required]
  - `currency_id` (Many2one → res.currency) - Currency [Default: AED]
  - `benefits` (Text) - Benefits Package

- **Commission & Fees:**
  - `commission_percentage` (Float) - Commission % [Default: 20.0]
  - `base_amount` (Monetary, Computed)
  - `commission_amount` (Monetary, Computed)
  - `final_amount` (Monetary, Computed)

- **Visa Processing:**
  - `visa_processing_id` (Many2one → uae.visa.processing)
  - `visa_status` (Selection) - Not Started, In Progress, Completed, Rejected [Default: Not Started]

- **Status:**
  - `state` (Selection) - Draft → Confirmed → Completed → Cancelled/Terminated

- **Website Sync:**
  - `sync_status` (Selection) - Not Synced, Synced, Error [Default: Not Synced, Readonly]

- **Other:**
  - `internal_notes` (Text)

---

### 5. **uae.visa.processing** - Visa Processing Tracker
**Model Class:** `UAEVisaProcessing`  
**Inheritance:** `mail.thread`, `mail.activity.mixin`  
**Purpose:** Complete UAE visa processing workflow

**Key Fields:**
- **References:**
  - `name` (Char) - Reference [Auto-generated, Readonly]
  - `applicant_id` (Many2one → hr.applicant) - Candidate [Required]
  - `client_id` (Many2one → recruitment.client) - Client [Required]
  - `placement_id` (Many2one → recruitment.placement)

- **Visa Details:**
  - `visa_type` (Selection) - Employment, Investor, Golden, Sponsor Transfer [Default: Employment, Required]

- **Processing Status:**
  - `state` (Selection) - Draft → Documents → Submission → Approval → Medical → Emirates ID → Completed → Rejected → Cancelled
  - `stage_id` (Many2one → uae.visa.stage)

- **Document Checklist:**
  - `passport_copy` (Boolean)
  - `passport_photo` (Boolean)
  - `educational_certificates` (Boolean)
  - `experience_certificates` (Boolean)
  - `medical_fitness` (Boolean)
  - `police_clearance` (Boolean)
  - `noc_letter` (Boolean)
  - `employment_contract` (Boolean)
  - `documents_complete` (Boolean, Computed)

- **Timeline:**
  - `application_date` (Date) - Application Date [Default: Today, Required]
  - `expected_completion` (Date)
  - `actual_completion` (Date)
  - `processing_days` (Integer, Computed)

- **Immigration Details:**
  - `pro_company` (Char) - PRO Company Name
  - `pro_contact_name` (Char) - PRO Contact Person
  - `pro_contact_phone` (Char) - PRO Phone
  - `pro_email` (Char) - PRO Email
  - `tracking_number` (Char) - Immigration Tracking Number
  - `reference_number` (Char) - Reference Number

- **Medical Examination:**
  - `medical_exam_date` (Date) - Medical Exam Date
  - `medical_exam_location` (Char) - Medical Center
  - `medical_exam_passed` (Boolean) - Exam Passed
  - `medical_exam_notes` (Text)

- **Emirates ID:**
  - `emirates_id_collection_date` (Date) - Collection Date
  - `emirates_id_number` (Char) - Emirates ID Number
  - `emirates_id_expiry` (Date) - Expiry Date

- **Costs:**
  - `visa_cost` (Monetary)
  - `medical_cost` (Monetary)
  - `emirates_id_cost` (Monetary)
  - `other_costs` (Monetary)
  - `total_cost` (Monetary, Computed)
  - `currency_id` (Many2one → res.currency) - Currency [Default: AED]

- **Flags:**
  - `is_urgent` (Boolean) - Urgent Processing [Default: False]
  - `is_priority` (Boolean) - Priority Case [Default: False]

- **Other:**
  - `notes` (Text) - Notes & Comments
  - `rejection_reason` (Text) - Rejection Reason

---

### 6. **recruitment.dashboard** - Analytics Dashboard
**Model Class:** `RecruitmentDashboard`  
**Purpose:** Virtual model for dashboard statistics (non-database)

**Statistics Methods:**
- `get_dashboard_stats()` - Returns:
  - Active job orders count
  - Total candidates count
  - Interviews scheduled today
  - Placements this month
  - Total revenue
  - Visa processing stats (in progress vs completed)
  - Client stats (total vs active)

**Dashboard Queries:**
- Recent placements (with limit)
- Top clients by revenue
- Jobs by status
- Candidate funnel
- Visa tracking
- Revenue metrics

---

### 7. **llm_provider.py** - AI Integration
**Purpose:** Configurable LLM provider for AI resume parsing

**Features:**
- Support for multiple LLM providers (OpenAI, etc.)
- Resume parsing integration
- Skill extraction
- Match scoring

---

## 📊 Model Relationships

```
recruitment.client (1)
  ├── (1:N) → recruitment.job.order
  ├── (1:N) → recruitment.placement
  └── (1:N) → uae.visa.processing

recruitment.job.order (1)
  ├── (1:N) → hr.applicant (via job_id foreign key)
  └── (M:N) → hr.skill

hr.applicant (Inherited from Odoo HR)
  ├── (M:N) → recruitment.job.order
  ├── (1:N) → recruitment.placement
  ├── (1:N) → uae.visa.processing
  └── (M:N) → hr.skill (AI extracted)

recruitment.placement (1)
  ├── → hr.applicant
  ├── → recruitment.client
  ├── → recruitment.job.order
  └── → uae.visa.processing

uae.visa.processing (1)
  ├── → hr.applicant
  ├── → recruitment.client
  └── → recruitment.placement
```

---

## 🔄 Dependencies

**Odoo Modules Required:**
- `base` - Base functionality
- `mail` - Email & messaging
- `hr_recruitment` - Base HR recruitment
- `hr` - Human Resources
- `contacts` - Partner management
- `web` - Web interface
- `portal` - Self-service portals
- `digest` - Email digests

**External Python Packages:**
- `requests` - HTTP library
- `openai` - OpenAI API

---

## 📁 Data Files

**Sequences:**
- `hr.applicant` - Candidate code generation
- `recruitment.job.order` - Job order reference
- `recruitment.placement` - Placement reference
- `uae.visa.processing` - Visa reference

**Email Templates:**
- Job notification emails
- Candidate notification emails
- Placement confirmation
- Visa updates

**Automation Rules:**
- Automatic email notifications
- Status updates

**Scheduled Actions:**
- Visa reminder emails
- Job expiry checks
- Document collection reminders

---

## 🔐 Security

**Security Groups:**
- Recruitment Manager
- Recruitment Officer
- Client Portal Access
- Candidate Portal Access

**Access Rules (ir.model.access.csv):**
- Row-level access control for each model
- Portal user restrictions

---

## 🌐 Website Integration

**Features:**
- Real-time job sync to React website
- Applicant submission from website
- Placement updates to website
- API endpoints for website communication

**Sync Fields:**
- Job orders → Website jobs
- Applicants → Website applicants
- Placements → Website success stories

**Models with Website Sync:**
- `recruitment.job.order` - sync_status, website_published, website_id
- `recruitment.placement` - sync_status

---

## 📱 Portal Features

**Client Portal:**
- View own job orders
- Track candidates
- View placements
- Access analytics

**Candidate Portal:**
- View job opportunities
- Apply for positions
- Track application status
- View offer status
- Update profile

---

## 🎯 Key Features Summary

| Feature | Model | Implementation |
|---------|-------|-----------------|
| **Client Management** | recruitment.client | Full CRM-like functionality |
| **Job Management** | recruitment.job.order | Creation, tracking, website sync |
| **Candidate Management** | hr.applicant (extended) | Enhanced with UAE fields, AI parsing |
| **Placement Tracking** | recruitment.placement | Commission calculation, status tracking |
| **Visa Processing** | uae.visa.processing | Complete workflow with document tracking |
| **AI Resume Parsing** | hr.applicant | LLM-based skill extraction & matching |
| **Dashboard/Analytics** | recruitment.dashboard | Virtual model with KPI aggregation |
| **Website Integration** | Both Job & Placement | Real-time sync capability |
| **Portal Access** | recruitment.client | Client self-service portal |

---

## 📝 Notes

1. **Dedicated Module**: This is NOT using standard HR module only - it's a complete custom recruitment management system that extends HR.

2. **Odoo 18 Compliant**: Uses modern Odoo 18 API conventions (batch creates, etc.)

3. **AI-Powered**: Resume parsing with configurable LLM providers for skill extraction and candidate matching

4. **UAE-Centric**: Built specifically for UAE recruitment workflows including visa processing

5. **Website-Integrated**: Full sync with React-based website for job posting and applicant collection

6. **Multi-Currency**: All financial fields support multiple currencies (default AED)

7. **Compliance**: DED verification, NOC tracking, document management for regulatory compliance

---

## 📦 Installation

The module is installable and marked as an application. Dependencies are automatically installed.

```
Module Name: uae_recruitment_mgmt
Category: Human Resources/Recruitment
Status: Application (Main module, not extension only)
```
