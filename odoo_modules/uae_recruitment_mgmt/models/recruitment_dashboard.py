# -*- coding: utf-8 -*-
from odoo import api, fields, models, _
from odoo.tools import float_round


class RecruitmentDashboard(models.Model):
    """Virtual model for dashboard statistics"""
    _name = 'recruitment.dashboard'
    _description = 'Recruitment Dashboard'
    _auto = False

    @api.model
    def get_dashboard_stats(self):
        """Get all dashboard statistics"""
        
        # Active job orders
        active_jobs = self.env['recruitment.job.order'].search_count([
            ('state', 'in', ['active', 'posted'])
        ])
        
        # Total candidates
        total_candidates = self.env['hr.applicant'].search_count([])
        
        # Interviews today
        today = fields.Date.today()
        interviews_today = self.env['calendar.event'].search_count([
            ('start_date', '=', today),
            ('description', 'like', 'interview')
        ])
        
        # Placements this month
        from datetime import datetime, timedelta
        today = datetime.now().date()
        month_start = today.replace(day=1)
        placements_month = self.env['recruitment.placement'].search_count([
            ('placement_date', '>=', month_start),
            ('placement_date', '<=', today)
        ])
        
        # Revenue stats
        placements = self.env['recruitment.placement'].search([
            ('state', '!=', 'cancelled')
        ])
        total_revenue = sum(p.final_amount for p in placements)
        
        # Visa stats
        visa_in_progress = self.env['uae.visa.processing'].search_count([
            ('state', 'not in', ['completed', 'rejected', 'cancelled'])
        ])
        
        visa_completed = self.env['uae.visa.processing'].search_count([
            ('state', '=', 'completed')
        ])
        
        # Client stats
        total_clients = self.env['recruitment.client'].search_count([
            ('state', '!=', 'terminated')
        ])
        
        active_clients = self.env['recruitment.client'].search_count([
            ('state', 'in', ['active', 'verified'])
        ])
        
        return {
            'active_jobs': active_jobs,
            'total_candidates': total_candidates,
            'interviews_today': interviews_today,
            'placements_month': placements_month,
            'total_revenue': total_revenue,
            'visa_in_progress': visa_in_progress,
            'visa_completed': visa_completed,
            'total_clients': total_clients,
            'active_clients': active_clients,
        }

    @api.model
    def get_recent_placements(self, limit=5):
        """Get recent placements"""
        placements = self.env['recruitment.placement'].search(
            [],
            limit=limit,
            order='placement_date desc'
        )
        
        return [{
            'id': p.id,
            'candidate': p.applicant_id.partner_name,
            'job': p.job_order_id.name,
            'client': p.client_id.name,
            'date': str(p.placement_date),
            'salary': p.gross_salary,
        } for p in placements]

    @api.model
    def get_top_clients(self, limit=5):
        """Get top clients by placements"""
        clients = self.env['recruitment.client'].search([], limit=limit)
        
        client_data = []
        for client in clients:
            placement_count = len(client.placement_ids)
            revenue = sum(p.final_amount for p in client.placement_ids)
            
            client_data.append({
                'id': client.id,
                'name': client.name,
                'placements': placement_count,
                'revenue': revenue,
            })
        
        # Sort by placements
        client_data.sort(key=lambda x: x['placements'], reverse=True)
        return client_data[:limit]

    @api.model
    def get_job_order_stats(self):
        """Get job order statistics"""
        job_orders = self.env['recruitment.job.order'].search([])
        
        total = len(job_orders)
        active = len(job_orders.filtered(lambda x: x.state == 'active'))
        posted = len(job_orders.filtered(lambda x: x.state == 'posted'))
        filled = len(job_orders.filtered(lambda x: x.state == 'filled'))
        closed = len(job_orders.filtered(lambda x: x.state == 'closed'))
        
        avg_time_to_fill = 0
        filled_jobs = job_orders.filtered(lambda x: x.days_to_fill)
        if filled_jobs:
            avg_time_to_fill = sum(j.days_to_fill for j in filled_jobs) / len(filled_jobs)
        
        return {
            'total': total,
            'active': active,
            'posted': posted,
            'filled': filled,
            'closed': closed,
            'avg_time_to_fill': round(avg_time_to_fill, 1),
        }

    @api.model
    def get_candidate_stats(self):
        """Get candidate statistics"""
        applicants = self.env['hr.applicant'].search([])
        
        total = len(applicants)
        
        # Get stage counts
        stages = {}
        for applicant in applicants:
            stage_name = applicant.stage_id.name or 'Unqualified'
            stages[stage_name] = stages.get(stage_name, 0) + 1
        
        # AI matching stats
        high_match = len(applicants.filtered(lambda x: x.ai_match_score >= 80))
        medium_match = len(applicants.filtered(lambda x: 50 <= x.ai_match_score < 80))
        low_match = len(applicants.filtered(lambda x: x.ai_match_score < 50))
        
        return {
            'total': total,
            'stages': stages,
            'high_match': high_match,
            'medium_match': medium_match,
            'low_match': low_match,
        }

    @api.model
    def get_revenue_stats(self):
        """Get revenue statistics"""
        placements = self.env['recruitment.placement'].search([])
        
        total_revenue = sum(p.final_amount for p in placements)
        total_commission = sum(p.commission_amount for p in placements)
        total_placements = len(placements)
        
        avg_commission = (total_commission / total_placements) if total_placements > 0 else 0
        
        return {
            'total_revenue': total_revenue,
            'total_commission': total_commission,
            'total_placements': total_placements,
            'avg_commission': round(avg_commission, 2),
        }
