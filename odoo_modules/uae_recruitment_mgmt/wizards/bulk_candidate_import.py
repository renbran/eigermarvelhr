# -*- coding: utf-8 -*-
from odoo import api, fields, models, _
from odoo.exceptions import ValidationError
import base64
import csv
import io


class BulkCandidateImport(models.TransientModel):
    _name = 'bulk.candidate.import'
    _description = 'Bulk Candidate Import Wizard'

    import_file = fields.Binary('CSV File', required=True, help="Upload a CSV file with candidate data")
    file_name = fields.Char('File Name')
    import_type = fields.Selection([
        ('general_pool', 'General Talent Pool'),
        ('specific_job', 'For Specific Job Order')
    ], default='general_pool', required=True)
    job_order_id = fields.Many2one('recruitment.job.order', string='Job Order')

    @api.model
    def create(self, vals_list):
        """Override create to support batch creation"""
        if isinstance(vals_list, dict):
            vals_list = [vals_list]
        return super(BulkCandidateImport, self).create(vals_list)

    def action_import_candidates(self):
        """Import candidates from CSV file"""
        self.ensure_one()

        if not self.import_file:
            raise ValidationError(_('Please upload a CSV file'))

        # Decode the file
        file_data = base64.b64decode(self.import_file)
        csv_data = io.StringIO(file_data.decode('utf-8'))
        csv_reader = csv.DictReader(csv_data)

        candidates_created = 0
        errors = []

        # Batch create candidates
        candidate_vals_list = []

        for row_num, row in enumerate(csv_reader, start=2):
            try:
                # Prepare candidate values
                candidate_vals = {
                    'partner_name': row.get('name', '').strip(),
                    'email_from': row.get('email', '').strip(),
                    'partner_phone': row.get('phone', '').strip(),
                    'availability': row.get('availability', 'immediate'),
                    'expected_salary': float(row.get('expected_salary', 0) or 0),
                    'years_of_experience': int(row.get('experience_years', 0) or 0),
                    'education_level': row.get('education_level', 'bachelor'),
                }

                # Add job order if specific job import
                if self.import_type == 'specific_job' and self.job_order_id:
                    candidate_vals['job_order_ids'] = [(4, self.job_order_id.id)]

                candidate_vals_list.append(candidate_vals)

            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")

        # Batch create all candidates
        if candidate_vals_list:
            try:
                created_candidates = self.env['hr.applicant'].create(candidate_vals_list)
                candidates_created = len(created_candidates)
            except Exception as e:
                raise ValidationError(_(f"Error creating candidates: {str(e)}"))

        # Show result message
        message = f"Successfully imported {candidates_created} candidates."
        if errors:
            message += f"\n\nErrors encountered:\n" + "\n".join(errors[:10])
            if len(errors) > 10:
                message += f"\n... and {len(errors) - 10} more errors"

        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('Import Complete'),
                'message': message,
                'type': 'success' if not errors else 'warning',
                'sticky': False,
            }
        }
