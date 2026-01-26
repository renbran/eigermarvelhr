# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request


class WebsiteEigerMarvel(http.Controller):
    @http.route('/workforce360', type='http', auth='public', website=True)
    def workforce360(self, **kwargs):
        html = request.env['ir.ui.view']._render_template('website_eiger_marvel.workforce360')
        resp = request.make_response(html)
        # Ensure CSP allows embedding common providers and our Netlify domain for any nested frames
        resp.headers['Content-Security-Policy'] = (
            "frame-src 'self' https://eigermarvel.netlify.app data: blob:; "
            "frame-ancestors 'self'"
        )
        return resp
# -*- coding: utf-8 -*-

from odoo import http
from odoo.http import request


class EigerMarvelWebsite(http.Controller):

    @http.route(['/'], type='http', auth="public", website=True)
    def index(self, **kwargs):
        """Home page with hero section, services, and job listings"""
        # Get latest published jobs
        jobs = request.env['hr.job'].sudo().search([
            ('website_published', '=', True)
        ], limit=6, order='create_date desc')
        
        return request.render('website_eiger_marvel.index', {
            'jobs': jobs,
        })

    @http.route(['/jobs'], type='http', auth="public", website=True)
    def jobs_page(self, **kwargs):
        """Jobs listing page"""
        jobs = request.env['hr.job'].sudo().search([
            ('website_published', '=', True)
        ], order='create_date desc')
        
        return request.render('website_eiger_marvel.jobs_page', {
            'jobs': jobs,
        })

    @http.route(['/employers'], type='http', auth="public", website=True)
    def employers_page(self, **kwargs):
        """For Employers page"""
        return request.render('website_eiger_marvel.employers_page')

    @http.route(['/contact'], type='http', auth="public", website=True)
    def contact_page(self, **kwargs):
        """Contact page"""
        return request.render('website_eiger_marvel.contact_page')

    @http.route(['/contact/submit'], type='http', auth="public", website=True, methods=['POST'], csrf=True)
    def contact_submit(self, **post):
        """Handle contact form submission"""
        # Create a lead in CRM
        request.env['crm.lead'].sudo().create({
            'name': f"Contact from {post.get('name')}",
            'contact_name': post.get('name'),
            'email_from': post.get('email'),
            'phone': post.get('phone'),
            'description': post.get('message'),
            'type': 'opportunity',
        })
        
        return request.redirect('/contact?submitted=1')
