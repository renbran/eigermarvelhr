#!/usr/bin/env python3
"""
Odoo View Fixer
Updates corrupted views in the Odoo database to fix t-if/t-elif/t-else issues
"""

import xmlrpc.client
from typing import Dict, Any

# Connection details
URL = "https://eigermarvelhr.com"
DB = "eigermarvel"
USERNAME = "admin"
PASSWORD = "8586583"

# Fixed view architectures for uae_recruitment_mgmt module
FIXED_VIEWS = {
    "uae_recruitment_mgmt.view_hr_applicant_kanban": '''<kanban default_group_by="ai_match_score_category" records_per_row="4">
    <field name="id"/>
    <field name="partner_name"/>
    <field name="ai_match_score"/>
    <field name="candidate_code"/>
    <field name="email_from"/>
    <field name="stage_id"/>
    <templates>
        <t t-name="card">
            <div class="oe_kanban_card">
                <div class="oe_kanban_content">
                    <h4><strong><t t-if="record.partner_name" t-esc="record.partner_name.value"/></strong></h4>
                    <div class="text-muted small">
                        <div><t t-if="record.candidate_code.value" t-esc="record.candidate_code.value"/><t t-else="">-</t></div>
                        <div t-if="record.ai_match_score">
                            <span t-if="record.ai_match_score.value >= 75" class="badge badge-success"><t t-esc="record.ai_match_score.value"/>%</span>
                            <span t-elif="record.ai_match_score.value >= 50" class="badge badge-warning"><t t-esc="record.ai_match_score.value"/>%</span>
                            <span t-else="" class="badge badge-danger"><t t-esc="record.ai_match_score.value"/>%</span>
                        </div>
                    </div>
                </div>
                <div class="oe_kanban_footer">
                    <a type="edit" role="button" class="btn btn-primary btn-sm">View</a>
                </div>
            </div>
        </t>
    </templates>
</kanban>''',

    "uae_recruitment_mgmt.view_recruitment_client_kanban": '''<kanban default_group_by="state" records_per_row="3">
    <field name="id"/>
    <field name="name"/>
    <field name="state"/>
    <field name="reference"/>
    <field name="entity_type"/>
    <field name="ded_verified"/>
    <field name="placement_count"/>
    <field name="total_revenue"/>
    <templates>
        <t t-name="card">
            <div class="oe_kanban_card">
                <div class="oe_kanban_content">
                    <h4><strong><t t-if="record.name" t-esc="record.name.value"/></strong></h4>
                    <div class="text-muted small">
                        <div><t t-if="record.reference.value" t-esc="record.reference.value"/><t t-else="">-</t></div>
                        <div><t t-if="record.placement_count.value" t-esc="record.placement_count.value"/><t t-else="">0</t> placements</div>
                    </div>
                </div>
                <div class="oe_kanban_footer">
                    <a type="edit" role="button" class="btn btn-primary btn-sm">Edit</a>
                </div>
            </div>
        </t>
    </templates>
</kanban>''',

    "uae_recruitment_mgmt.view_recruitment_job_order_kanban": '''<kanban default_group_by="state" records_per_row="3">
    <field name="id"/>
    <field name="name"/>
    <field name="state"/>
    <field name="client_id"/>
    <field name="job_level"/>
    <field name="applicant_count"/>
    <field name="positions_remaining"/>
    <templates>
        <t t-name="card">
            <div class="oe_kanban_card">
                <div class="oe_kanban_content">
                    <h4><strong><t t-if="record.name" t-esc="record.name.value"/></strong></h4>
                    <div class="text-muted small">
                        <div><t t-if="record.job_level.value" t-esc="record.job_level.value"/><t t-else="">-</t></div>
                        <div><t t-if="record.applicant_count.value" t-esc="record.applicant_count.value"/><t t-else="">0</t> applicants</div>
                    </div>
                </div>
                <div class="oe_kanban_footer">
                    <a type="edit" role="button" class="btn btn-primary btn-sm">Edit</a>
                </div>
            </div>
        </t>
    </templates>
</kanban>''',

    "uae_recruitment_mgmt.view_recruitment_placement_kanban": '''<kanban default_group_by="state" records_per_row="3">
    <field name="id"/>
    <field name="name"/>
    <field name="applicant_id"/>
    <field name="state"/>
    <field name="gross_salary"/>
    <field name="commission_amount"/>
    <templates>
        <t t-name="card">
            <div class="oe_kanban_card">
                <div class="oe_kanban_content">
                    <h4><strong><t t-if="record.applicant_id.value" t-esc="record.applicant_id.value"/><t t-else="">-</t></strong></h4>
                    <div class="text-muted small">
                        <div><t t-if="record.name.value" t-esc="record.name.value"/><t t-else="">-</t></div>
                        <t t-if="record.gross_salary"><div>Salary: <t t-esc="record.gross_salary.value"/></div></t>
                        <t t-if="record.commission_amount"><div>Commission: <span class="badge badge-success"><t t-esc="record.commission_amount.value"/></span></div></t>
                    </div>
                </div>
                <div class="oe_kanban_footer">
                    <a type="edit" role="button" class="btn btn-primary btn-sm">Edit</a>
                </div>
            </div>
        </t>
    </templates>
</kanban>''',

    "uae_recruitment_mgmt.view_uae_visa_processing_kanban": '''<kanban default_group_by="state" records_per_row="4">
    <field name="id"/>
    <field name="name"/>
    <field name="applicant_id"/>
    <field name="state"/>
    <field name="visa_type"/>
    <field name="application_date"/>
    <templates>
        <t t-name="card">
            <div class="oe_kanban_card">
                <div class="oe_kanban_content">
                    <h4><strong><t t-if="record.applicant_id.value" t-esc="record.applicant_id.value"/><t t-else="">-</t></strong></h4>
                    <div class="text-muted small">
                        <div><t t-if="record.name.value" t-esc="record.name.value"/><t t-else="">-</t></div>
                        <t t-if="record.visa_type"><div>Type: <t t-esc="record.visa_type.value"/></div></t>
                        <t t-if="record.application_date"><div>Applied: <t t-esc="record.application_date.value"/></div></t>
                    </div>
                </div>
                <div class="oe_kanban_footer">
                    <a type="edit" role="button" class="btn btn-primary btn-sm">View</a>
                </div>
            </div>
        </t>
    </templates>
</kanban>'''
}


def connect_odoo():
    """Connect to Odoo"""
    print(f"Connecting to {URL}...")

    common = xmlrpc.client.ServerProxy(f'{URL}/xmlrpc/2/common')
    uid = common.authenticate(DB, USERNAME, PASSWORD, {})

    if not uid:
        raise Exception("Authentication failed!")

    print(f"Authenticated as UID: {uid}")

    models = xmlrpc.client.ServerProxy(f'{URL}/xmlrpc/2/object')
    return uid, models


def update_view(uid, models, xml_id: str, new_arch: str) -> bool:
    """Update a view's architecture in the database"""
    print(f"\n{'='*60}")
    print(f"Updating view: {xml_id}")
    print(f"{'='*60}")

    # Find the view by xml_id
    views = models.execute_kw(
        DB, uid, PASSWORD,
        'ir.ui.view', 'search_read',
        [[('xml_id', '=', xml_id)]],
        {'fields': ['id', 'name', 'model', 'arch_db']}
    )

    if not views:
        print(f"WARNING: View with xml_id '{xml_id}' not found!")
        return False

    view = views[0]
    print(f"Found view: {view['name']} (ID: {view['id']})")
    print(f"Model: {view['model']}")

    # Update the view
    try:
        result = models.execute_kw(
            DB, uid, PASSWORD,
            'ir.ui.view', 'write',
            [[view['id']], {'arch_db': new_arch}]
        )

        if result:
            print(f"SUCCESS: View updated!")
            return True
        else:
            print(f"FAILED: Could not update view")
            return False

    except Exception as e:
        print(f"ERROR: {e}")
        return False


def clear_assets_cache(uid, models):
    """Clear the web assets cache to force regeneration"""
    print(f"\n{'='*60}")
    print("Clearing asset bundles cache...")
    print(f"{'='*60}")

    try:
        # Clear ir.asset records cache
        result = models.execute_kw(
            DB, uid, PASSWORD,
            'ir.qweb', 'clear_caches',
            []
        )
        print("QWeb cache cleared")
    except Exception as e:
        print(f"Note: Could not clear QWeb cache (may not be available via RPC): {e}")

    try:
        # Try to clear attachments with specific patterns
        attachments = models.execute_kw(
            DB, uid, PASSWORD,
            'ir.attachment', 'search',
            [[('name', 'ilike', 'web.assets')]],
            {'limit': 100}
        )

        if attachments:
            models.execute_kw(
                DB, uid, PASSWORD,
                'ir.attachment', 'unlink',
                [attachments]
            )
            print(f"Deleted {len(attachments)} asset bundle attachments")
        else:
            print("No asset bundle attachments found to delete")

    except Exception as e:
        print(f"Note: Could not clear asset bundles: {e}")


def main():
    """Main entry point"""
    print("\n" + "#"*60)
    print("# ODOO VIEW FIXER")
    print("# Fixing t-if/t-elif/t-else template issues")
    print("#"*60 + "\n")

    try:
        uid, models = connect_odoo()
    except Exception as e:
        print(f"Connection failed: {e}")
        return

    success_count = 0
    fail_count = 0

    for xml_id, new_arch in FIXED_VIEWS.items():
        if update_view(uid, models, xml_id, new_arch):
            success_count += 1
        else:
            fail_count += 1

    # Clear caches
    clear_assets_cache(uid, models)

    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"Views updated successfully: {success_count}")
    print(f"Views failed to update: {fail_count}")

    if success_count > 0:
        print("\n" + "="*60)
        print("NEXT STEPS")
        print("="*60)
        print("1. Clear your browser cache (Ctrl+Shift+Delete)")
        print("2. Go to Odoo Settings > Technical > Regenerate Assets Bundles")
        print("3. Refresh the CRM page")
        print("4. If the issue persists, restart the Odoo server")


if __name__ == '__main__':
    main()
