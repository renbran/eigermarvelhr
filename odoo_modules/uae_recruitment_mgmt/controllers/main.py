# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request, Response
import json


class RecruitmentAPI(http.Controller):
    """API endpoints for website sync and third-party integrations"""

    @http.route('/api/recruitment/jobs', auth='public', methods=['GET'], csrf=False)
    def get_jobs(self, limit=50, offset=0, **kwargs):
        """Get all active job orders"""
        try:
            jobs = request.env['recruitment.job.order'].search(
                [('state', 'in', ['active', 'posted'])],
                limit=int(limit),
                offset=int(offset)
            )
            
            job_list = []
            for job in jobs:
                job_list.append({
                    'id': job.id,
                    'reference': job.reference,
                    'title': job.name,
                    'description': job.description,
                    'location': job.location,
                    'job_level': job.job_level,
                    'work_type': job.work_type,
                    'salary_min': job.salary_min or 0,
                    'salary_max': job.salary_max or 0,
                    'currency': job.currency_id.name,
                    'experience_min': job.experience_years_min,
                    'experience_max': job.experience_years_max,
                    'skills': [s.name for s in job.skills_ids],
                    'visa_sponsorship': job.visa_sponsorship,
                    'visa_type': job.visa_type,
                    'client': job.client_id.name,
                    'positions_required': job.positions_required,
                    'positions_filled': job.positions_filled,
                    'positions_remaining': job.positions_remaining,
                    'created_date': str(job.created_date),
                    'closing_date': str(job.closing_date) if job.closing_date else None,
                })
            
            return Response(
                json.dumps({
                    'success': True,
                    'data': job_list,
                    'count': len(job_list)
                }),
                content_type='application/json'
            )
        except Exception as e:
            return Response(
                json.dumps({
                    'success': False,
                    'error': str(e)
                }),
                status=500,
                content_type='application/json'
            )

    @http.route('/api/recruitment/jobs/<int:job_id>', auth='public', methods=['GET'], csrf=False)
    def get_job(self, job_id, **kwargs):
        """Get specific job order"""
        try:
            job = request.env['recruitment.job.order'].search([
                ('id', '=', job_id),
                ('state', 'in', ['active', 'posted'])
            ])
            
            if not job:
                return Response(
                    json.dumps({'success': False, 'error': 'Job not found'}),
                    status=404,
                    content_type='application/json'
                )
            
            job = job[0]
            
            return Response(
                json.dumps({
                    'success': True,
                    'data': {
                        'id': job.id,
                        'reference': job.reference,
                        'title': job.name,
                        'description': job.description,
                        'location': job.location,
                        'job_level': job.job_level,
                        'work_type': job.work_type,
                        'salary_min': job.salary_min or 0,
                        'salary_max': job.salary_max or 0,
                        'currency': job.currency_id.name,
                        'experience_min': job.experience_years_min,
                        'experience_max': job.experience_years_max,
                        'skills': [s.name for s in job.skills_ids],
                        'benefits': job.benefits,
                        'visa_sponsorship': job.visa_sponsorship,
                        'visa_type': job.visa_type,
                        'client': job.client_id.name,
                        'positions_required': job.positions_required,
                        'positions_filled': job.positions_filled,
                        'positions_remaining': job.positions_remaining,
                        'applicants': len(job.applicant_ids),
                    }
                }),
                content_type='application/json'
            )
        except Exception as e:
            return Response(
                json.dumps({'success': False, 'error': str(e)}),
                status=500,
                content_type='application/json'
            )

    @http.route('/api/recruitment/applicants', auth='public', methods=['POST'], csrf=False, website=True)
    def create_applicant(self, **kwargs):
        """Create new applicant from website - public for job applications"""
        try:
            data = request.httprequest.get_json()
            
            # Create partner if needed (use sudo for public access)
            partner = request.env['res.partner'].sudo().search([
                ('email', '=', data.get('email'))
            ], limit=1)
            
            if not partner:
                partner = request.env['res.partner'].sudo().create({
                    'name': data.get('name'),
                    'email': data.get('email'),
                    'phone': data.get('phone'),
                    'type': 'contact',
                })
            
            # Create applicant (use sudo for public access)
            applicant = request.env['hr.applicant'].sudo().create({
                'partner_name': data.get('name'),
                'email_from': data.get('email'),
                'partner_phone': data.get('phone'),
                'partner_id': partner.id,
                'job_id': int(data.get('job_id')),
                'resume_summary': data.get('cover_letter', ''),
                'years_of_experience': float(data.get('experience', 0)),
                'expected_salary': float(data.get('expected_salary', 0)),
            })
            
            return Response(
                json.dumps({
                    'success': True,
                    'message': 'Applicant created successfully',
                    'applicant_id': applicant.id,
                    'reference': applicant.candidate_code
                }),
                content_type='application/json'
            )
        except Exception as e:
            return Response(
                json.dumps({'success': False, 'error': str(e)}),
                status=400,
                content_type='application/json'
            )

    @http.route('/api/recruitment/dashboard', auth='public', methods=['GET'], csrf=False)
    def get_dashboard_data(self, **kwargs):
        """Get dashboard statistics"""
        try:
            dashboard = request.env['recruitment.dashboard']
            stats = dashboard.get_dashboard_stats()
            job_stats = dashboard.get_job_order_stats()
            candidate_stats = dashboard.get_candidate_stats()
            revenue_stats = dashboard.get_revenue_stats()
            
            return Response(
                json.dumps({
                    'success': True,
                    'data': {
                        'stats': stats,
                        'jobs': job_stats,
                        'candidates': candidate_stats,
                        'revenue': revenue_stats,
                    }
                }),
                content_type='application/json'
            )
        except Exception as e:
            return Response(
                json.dumps({'success': False, 'error': str(e)}),
                status=500,
                content_type='application/json'
            )

    @http.route('/api/recruitment/placements', auth='user', methods=['GET'], csrf=False)
    def get_placements(self, client_id=None, **kwargs):
        """Get placements - requires authentication"""
        try:
            domain = [('state', '!=', 'cancelled')]
            
            if client_id:
                domain.append(('client_id', '=', int(client_id)))
            
            placements = request.env['recruitment.placement'].search(domain)
            
            placement_list = []
            for placement in placements:
                placement_list.append({
                    'id': placement.id,
                    'reference': placement.name,
                    'candidate': placement.applicant_id.partner_name,
                    'job': placement.job_order_id.name,
                    'client': placement.client_id.name,
                    'salary': placement.gross_salary or 0,
                    'currency': placement.currency_id.name,
                    'placement_date': str(placement.placement_date),
                    'joining_date': str(placement.joining_date) if placement.joining_date else None,
                    'status': placement.state,
                    'visa_status': placement.visa_status,
                })
            
            return Response(
                json.dumps({
                    'success': True,
                    'data': placement_list,
                    'count': len(placement_list)
                }),
                content_type='application/json'
            )
        except Exception as e:
            return Response(
                json.dumps({'success': False, 'error': str(e)}),
                status=500,
                content_type='application/json'
            )


class RecruitmentPortal(http.Controller):
    """Portal routes for clients and candidates"""

    @http.route('/recruitment/job/<int:job_id>', auth='public', website=True)
    def job_detail(self, job_id, **kwargs):
        """Job detail page for portal"""
        job = request.env['recruitment.job.order'].search([
            ('id', '=', job_id),
            ('website_published', '=', True)
        ])
        
        if not job:
            return request.render('website.404')
        
        return request.render('uae_recruitment_mgmt.job_detail_portal', {
            'job': job[0],
        })

    @http.route('/recruitment/apply/<int:job_id>', auth='user', website=True, methods=['POST'])
    def apply_job(self, job_id, **kwargs):
        """Apply for a job"""
        try:
            job = request.env['recruitment.job.order'].search([
                ('id', '=', job_id)
            ])
            
            if not job:
                return request.redirect('/recruitment')
            
            # Create applicant
            applicant = request.env['hr.applicant'].create({
                'partner_name': request.env.user.name,
                'email_from': request.env.user.email,
                'partner_phone': request.env.user.partner_id.phone,
                'job_id': job_id,
                'resume_summary': kwargs.get('cover_letter', ''),
            })
            
            return request.render('uae_recruitment_mgmt.application_success', {
                'applicant': applicant,
            })
        except Exception as e:
            return request.render('uae_recruitment_mgmt.application_error', {
                'error': str(e),
            })
