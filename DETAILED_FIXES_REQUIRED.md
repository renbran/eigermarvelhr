# UAE Recruitment Module - Detailed Fixes Required

## BATCH CREATE API FIXES

### Issue: @api.model_create_single Deprecation

All models using this deprecated decorator will fail on batch operations.

---

## 1. recruitment_client.py (Line 30-35)

**Current Code:**
```python
@api.model_create_single
def create(self, vals):
    if vals.get('reference', 'New') == 'New':
        vals['reference'] = self.env['ir.sequence'].next_by_code('recruitment.client')
    return super().create(vals)
```

**Fixed Code:**
```python
@api.model
def create(self, vals_list):
    """Handle both single and batch creates properly for Odoo 18"""
    if not isinstance(vals_list, list):
        vals_list = [vals_list]
    
    for vals in vals_list:
        if vals.get('reference', 'New') == 'New':
            vals['reference'] = self.env['ir.sequence'].next_by_code('recruitment.client')
    
    return super().create(vals_list)
```

---

## 2. recruitment_job_order.py (Line 90-95)

**Current Code:**
```python
@api.model_create_single
def create(self, vals):
    if vals.get('reference', 'New') == 'New':
        vals['reference'] = self.env['ir.sequence'].next_by_code('recruitment.job.order')
    return super().create(vals)
```

**Fixed Code:**
```python
@api.model
def create(self, vals_list):
    """Handle both single and batch creates properly for Odoo 18"""
    if not isinstance(vals_list, list):
        vals_list = [vals_list]
    
    for vals in vals_list:
        if vals.get('reference', 'New') == 'New':
            vals['reference'] = self.env['ir.sequence'].next_by_code('recruitment.job.order')
    
    return super().create(vals_list)
```

---

## 3. recruitment_placement.py (Line 45-50)

**Current Code:**
```python
# Check if @api.model_create_single exists, if so apply same fix
```

**Fixed Code:**
```python
@api.model
def create(self, vals_list):
    """Handle both single and batch creates properly for Odoo 18"""
    if not isinstance(vals_list, list):
        vals_list = [vals_list]
    
    for vals in vals_list:
        if vals.get('name', 'New') == 'New':
            vals['name'] = self.env['ir.sequence'].next_by_code('recruitment.placement')
    
    return super().create(vals_list)
```

---

## 4. recruitment_candidate.py (Inherited Model)

**Current Code:**
```python
@api.model_create_single
def create(self, vals):
    if vals.get('candidate_code', 'New') == 'New':
        vals['candidate_code'] = self.env['ir.sequence'].next_by_code('hr.applicant')
    result = super().create(vals)
    if result.attachment_ids:
        result.action_parse_resume()
    return result
```

**Fixed Code:**
```python
@api.model
def create(self, vals_list):
    """Handle both single and batch creates properly for Odoo 18"""
    if not isinstance(vals_list, list):
        vals_list = [vals_list]
    
    for vals in vals_list:
        if vals.get('candidate_code', 'New') == 'New':
            vals['candidate_code'] = self.env['ir.sequence'].next_by_code('hr.applicant')
    
    results = super().create(vals_list)
    
    # Handle resume parsing for each result
    for result in results:
        if result.attachment_ids and hasattr(result, 'action_parse_resume'):
            result.action_parse_resume()
    
    return results
```

---

## 5. uae_visa_processing.py

**Current Code:**
```python
@api.model_create_single
def create(self, vals):
    if vals.get('name', 'New') == 'New':
        vals['name'] = self.env['ir.sequence'].next_by_code('uae.visa.processing')
    # ... more logic
    return super().create(vals)
```

**Fixed Code:**
```python
@api.model
def create(self, vals_list):
    """Handle both single and batch creates properly for Odoo 18"""
    if not isinstance(vals_list, list):
        vals_list = [vals_list]
    
    for vals in vals_list:
        if vals.get('name', 'New') == 'New':
            vals['name'] = self.env['ir.sequence'].next_by_code('uae.visa.processing')
        
        # Set expected completion date if not provided
        if not vals.get('expected_completion') and vals.get('application_date'):
            from datetime import timedelta
            app_date = vals.get('application_date')
            vals['expected_completion'] = app_date + timedelta(days=30)
    
    return super().create(vals_list)
```

---

## DUPLICATE FIELD LABEL FIXES

### Issue: Multiple fields with same label confuse UI/API

---

## recruitment_client.py - Lines with duplicate labels

**Current Code:**
```python
job_order_count = fields.Integer('Job Orders', compute='_compute_counts')
job_order_ids = fields.One2many('recruitment.job.order', 'client_id', 'Job Orders')

placement_count = fields.Integer('Placements', compute='_compute_counts')
placement_ids = fields.One2many('recruitment.placement', 'client_id', 'Placements')
```

**Fixed Code:**
```python
job_order_count = fields.Integer('Total Job Orders', compute='_compute_counts')
# Keep job_order_ids label as is - it's a One2many so different context
job_order_ids = fields.One2many('recruitment.job.order', 'client_id', 'Job Orders')

placement_count = fields.Integer('Total Placements', compute='_compute_counts')
# Keep placement_ids label as is
placement_ids = fields.One2many('recruitment.placement', 'client_id', 'Placements')
```

---

## recruitment_job_order.py - Duplicate label fix

**Current Code:**
```python
applicant_count = fields.Integer('Applicants', compute='_compute_applicant_count')
applicant_ids = fields.One2many('hr.applicant', 'job_id', 'Applicants')
```

**Fixed Code:**
```python
applicant_count = fields.Integer('Total Applicants', compute='_compute_applicant_count')
applicant_ids = fields.One2many('hr.applicant', 'job_id', 'Applicants')
```

---

## recruitment_placement.py - Fix duplicate currency fields

**Current Code:**
```python
salary_currency = fields.Many2one('res.currency', 'Currency', default=lambda self: self.env.ref('base.AED'))
currency_id = fields.Many2one('res.currency', related='salary_currency')
```

**Fixed Code:**
```python
# REMOVE salary_currency entirely - it's redundant
# Just keep currency_id as primary:
currency_id = fields.Many2one('res.currency', 'Currency', default=lambda self: self.env.ref('base.AED'))

# Update all field definitions to use currency_id:
gross_salary = fields.Monetary('Gross Salary', currency_field='currency_id', required=True)
# ... all other currency fields already use currency_id
```

---

## ACCESS RULES - ADD TO security/ir.model.access.csv

**Add These Lines:**

```csv
access_uae_visa_stage_user,Visa Stage User,model_uae_visa_stage,base.group_user,1,0,0,0
access_uae_visa_stage_manager,Visa Stage Manager,model_uae_visa_stage,group_recruitment_manager,1,1,1,0
access_client_onboarding_wizard,Client Onboarding Wizard,model_recruitment_client_onboarding_wizard,group_recruitment_manager,1,1,1,1
access_bulk_import_wizard_user,Bulk Import Wizard User,model_bulk_candidate_import,group_recruitment_manager,1,1,1,1
access_interview_scheduler_wizard,Interview Scheduler Wizard,model_interview_scheduler,group_recruitment_manager,1,1,1,1
access_offer_generator_wizard,Offer Generator Wizard,model_offer_generator,group_recruitment_manager,1,1,1,1
```

---

## IMPLEMENT MISSING COMPUTE METHODS

### recruitment_placement.py

**Missing Methods to Implement:**

```python
@api.depends('gross_salary', 'commission_percentage')
def _compute_base_amount(self):
    """Calculate base amount before commission"""
    for record in self:
        # Base amount is gross salary
        record.base_amount = record.gross_salary or 0.0

@api.depends('gross_salary', 'commission_percentage')
def _compute_commission(self):
    """Calculate commission amount"""
    for record in self:
        if record.gross_salary and record.commission_percentage:
            record.commission_amount = (record.gross_salary * record.commission_percentage) / 100
        else:
            record.commission_amount = 0.0

@api.depends('base_amount', 'commission_amount')
def _compute_final_amount(self):
    """Calculate final amount (base + commission)"""
    for record in self:
        record.final_amount = (record.base_amount or 0.0) + (record.commission_amount or 0.0)

@api.depends('joining_date', 'confirmation_period_days')
def _compute_confirmation_date(self):
    """Calculate confirmation date"""
    from datetime import timedelta
    for record in self:
        if record.joining_date and record.confirmation_period_days:
            record.confirmation_date = record.joining_date + timedelta(days=record.confirmation_period_days)
        else:
            record.confirmation_date = None
```

---

### uae_visa_processing.py

**Missing Methods to Implement:**

```python
@api.depends(
    'passport_copy', 'passport_photo', 'educational_certificates',
    'experience_certificates', 'medical_fitness', 'police_clearance',
    'noc_letter', 'employment_contract'
)
def _compute_documents_complete(self):
    """Check if all required documents are collected"""
    for record in self:
        required_docs = [
            record.passport_copy,
            record.passport_photo,
            record.educational_certificates,
            record.experience_certificates,
            record.medical_fitness,
            record.police_clearance,
            record.noc_letter,
            record.employment_contract,
        ]
        record.documents_complete = all(required_docs)

@api.depends('application_date', 'actual_completion')
def _compute_processing_days(self):
    """Calculate days taken to complete visa processing"""
    for record in self:
        if record.application_date and record.actual_completion:
            delta = record.actual_completion - record.application_date
            record.processing_days = delta.days
        else:
            record.processing_days = 0

@api.depends('visa_cost', 'medical_cost', 'emirates_id_cost', 'other_costs')
def _compute_total_cost(self):
    """Calculate total visa processing cost"""
    for record in self:
        record.total_cost = (
            (record.visa_cost or 0.0) +
            (record.medical_cost or 0.0) +
            (record.emirates_id_cost or 0.0) +
            (record.other_costs or 0.0)
        )
```

---

### recruitment_job_order.py - Fix positions_filled

**Current Implementation Issues:**
```python
@api.depends('applicant_ids')
def _compute_positions_filled(self):
    for record in self:
        # This approach fails - stage names are user-editable
        record.positions_filled = len(record.applicant_ids.filtered(
            lambda x: x.stage_id.name in ['Hired', 'Approved']
        ))
```

**Fixed Implementation:**
```python
@api.depends('applicant_ids.stage_id')
def _compute_positions_filled(self):
    """Calculate filled positions based on hired applicants"""
    for record in self:
        # Use domain for clarity instead of lambda
        hired = record.applicant_ids.search([
            ('job_id', '=', record.id),
            ('stage_id.sequence', '>', 4)  # Assuming final stages have higher sequence
        ])
        record.positions_filled = len(hired)

@api.depends('applicant_ids.stage_id')
def _compute_positions_remaining(self):
    """Calculate remaining positions needed"""
    for record in self:
        record.positions_remaining = max(0, record.positions_required - record.positions_filled)
```

---

## ERROR HANDLING IMPROVEMENTS

### recruitment_job_order.py - action_sync_to_website

**Current Code Issues:**
```python
def action_sync_to_website(self):
    for record in self:
        try:
            # ... code ...
            import requests  # Bad: import inside method
            response = requests.put(...)  # No timeout specified
            response.json()  # May fail silently
        except Exception as e:
            # Too broad exception handling
```

**Fixed Code:**
```python
def action_sync_to_website(self):
    """Sync job order to website with comprehensive error handling"""
    import requests
    from requests.exceptions import Timeout, ConnectionError, HTTPError
    
    for record in self:
        try:
            # Get configuration
            website_url = self.env['ir.config_parameter'].sudo().get_param(
                'website.url', 
                ''
            ).strip()
            api_key = self.env['ir.config_parameter'].sudo().get_param(
                'website.api_key',
                ''
            ).strip()
            
            if not website_url or not api_key:
                raise ValidationError(
                    _('Website API not configured. Please set website.url and website.api_key '
                      'in System Parameters.')
                )
            
            # Validate URL format
            if not website_url.startswith(('http://', 'https://')):
                website_url = 'https://' + website_url
            
            # Prepare job data
            job_data = {
                'title': record.name,
                'description': record.description or '',
                'location': record.location,
                'salary_min': float(record.salary_min or 0),
                'salary_max': float(record.salary_max or 0),
                'job_level': record.job_level,
                'skills': [skill.name for skill in record.skills_ids],
                'experience_years': f"{record.experience_years_min}-{record.experience_years_max}",
                'visa_sponsorship': record.visa_sponsorship,
                'work_type': record.work_type,
                'company': record.client_id.name,
                'external_id': record.id,
                'status': 'active' if record.state == 'active' else 'draft'
            }
            
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
                'User-Agent': 'Odoo-Eiger-Marvel/18.0'
            }
            
            # Determine if creating or updating
            endpoint = f'{website_url}/api/jobs/{record.website_id}' if record.website_id else f'{website_url}/api/jobs'
            method = 'PUT' if record.website_id else 'POST'
            
            try:
                if method == 'PUT':
                    response = requests.put(
                        endpoint,
                        json=job_data,
                        headers=headers,
                        timeout=15
                    )
                else:
                    response = requests.post(
                        endpoint,
                        json=job_data,
                        headers=headers,
                        timeout=15
                    )
                
                # Check for HTTP errors
                response.raise_for_status()
                
                # Parse response
                response_data = response.json()
                
                if method == 'POST' and 'id' in response_data:
                    record.website_id = str(response_data['id'])
                
                # Update sync status
                record.write({
                    'website_published': True,
                    'sync_status': 'synced',
                    'last_sync_date': fields.Datetime.now()
                })
                
                record.message_post(body=_('✓ Job order synced to website'))
                
            except Timeout:
                raise UserError(
                    _('Website API request timed out. Please check website connectivity and try again.')
                )
            except ConnectionError:
                raise UserError(
                    _('Failed to connect to website API. Please check website URL and try again.')
                )
            except HTTPError as e:
                error_msg = _('Website API error: HTTP %s') % e.response.status_code
                if e.response.status_code == 401:
                    error_msg = _('Website API authentication failed. Please check API key.')
                elif e.response.status_code == 404:
                    error_msg = _('Website API endpoint not found.')
                raise UserError(error_msg)
                
        except (ValidationError, UserError):
            # Re-raise our known errors
            record.write({
                'sync_status': 'error',
                'last_sync_date': fields.Datetime.now()
            })
            record.message_post(
                body=_('✗ Website sync failed: %s') % str(e),
                subtype='mail.mt_comment'
            )
            # Re-raise to show user
            raise
            
        except ValueError as e:
            # JSON parsing error
            record.write({
                'sync_status': 'error',
                'last_sync_date': fields.Datetime.now()
            })
            record.message_post(
                body=_('✗ Invalid response from website API'),
                subtype='mail.mt_comment'
            )
            raise UserError(_('Website API returned invalid data'))
            
        except Exception as e:
            # Catch-all for unexpected errors
            record.write({
                'sync_status': 'error',
                'last_sync_date': fields.Datetime.now()
            })
            record.message_post(
                body=_('✗ Unexpected error during sync: %s') % str(e),
                subtype='mail.mt_comment'
            )
            _logger.exception('Job sync error:')
            raise UserError(_('Unexpected error syncing to website. Check logs.'))
```

---

## SUMMARY OF CHANGES

### Files to Modify:
1. **models/recruitment_client.py** - Fix batch create, duplicate labels
2. **models/recruitment_job_order.py** - Fix batch create, duplicate label, error handling
3. **models/recruitment_placement.py** - Fix batch create, duplicate label, implement compute methods
4. **models/recruitment_candidate.py** - Fix batch create
5. **models/uae_visa_processing.py** - Fix batch create, implement compute methods
6. **security/ir.model.access.csv** - Add missing access rules

### Testing Required:
```
- [ ] Create records individually (single create)
- [ ] Create records in batch
- [ ] Verify field labels in forms
- [ ] Test website sync with error cases
- [ ] Verify all compute fields calculate correctly
- [ ] Check access rules work correctly
- [ ] Test all workflows end-to-end
```

---

*Prepared for Production Deployment*  
*Apply fixes in order: Critical → Important → Nice-to-Have*
