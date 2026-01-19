#!/usr/bin/env python3
"""
Odoo View Fixer - Fix kanban views by model name
Updates corrupted views in the Odoo database to fix t-if/t-elif/t-else issues
"""

import xmlrpc.client
from typing import Dict, Any

# Connection details
URL = "https://eigermarvelhr.com"
DB = "eigermarvel"
USERNAME = "admin"
PASSWORD = "8586583"

# Fixed view architectures mapped by model name
FIXED_VIEWS_BY_MODEL = {
    "hr.applicant": '''<kanban default_group_by="stage_id" records_per_row="4">
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
                    <h4><strong><field name="partner_name"/></strong></h4>
                    <div class="text-muted small">
                        <div><field name="candidate_code"/></div>
                        <div>
                            <t t-if="record.ai_match_score.raw_value &gt;= 75">
                                <span class="badge badge-success"><field name="ai_match_score"/>%</span>
                            </t>
                            <t t-elif="record.ai_match_score.raw_value &gt;= 50">
                                <span class="badge badge-warning"><field name="ai_match_score"/>%</span>
                            </t>
                            <t t-else="">
                                <span class="badge badge-danger"><field name="ai_match_score"/>%</span>
                            </t>
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

    "recruitment.client": '''<kanban default_group_by="state" records_per_row="3">
    <field name="id"/>
    <field name="name"/>
    <field name="state"/>
    <field name="contact_person"/>
    <field name="job_order_count"/>
    <templates>
        <t t-name="card">
            <div class="oe_kanban_card">
                <div class="oe_kanban_content">
                    <h4><strong><field name="name"/></strong></h4>
                    <div class="text-muted small">
                        <div>Contact: <field name="contact_person"/></div>
                        <div>Jobs: <field name="job_order_count"/></div>
                        <div>
                            <t t-if="record.state.raw_value == 'active'">
                                <span class="badge badge-success">Active</span>
                            </t>
                            <t t-elif="record.state.raw_value == 'inactive'">
                                <span class="badge badge-secondary">Inactive</span>
                            </t>
                            <t t-else="">
                                <span class="badge badge-warning">Unknown</span>
                            </t>
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

    "recruitment.job.order": '''<kanban default_group_by="state" records_per_row="3">
    <field name="id"/>
    <field name="name"/>
    <field name="state"/>
    <field name="client_id"/>
    <field name="positions_required"/>
    <templates>
        <t t-name="card">
            <div class="oe_kanban_card">
                <div class="oe_kanban_content">
                    <h4><strong><field name="name"/></strong></h4>
                    <div class="text-muted small">
                        <div>Client: <field name="client_id"/></div>
                        <div>Positions: <field name="positions_required"/></div>
                        <div>
                            <t t-if="record.state.raw_value == 'draft'">
                                <span class="badge badge-secondary">Draft</span>
                            </t>
                            <t t-elif="record.state.raw_value == 'open'">
                                <span class="badge badge-primary">Open</span>
                            </t>
                            <t t-elif="record.state.raw_value == 'in_progress'">
                                <span class="badge badge-info">In Progress</span>
                            </t>
                            <t t-elif="record.state.raw_value == 'filled'">
                                <span class="badge badge-success">Filled</span>
                            </t>
                            <t t-else="">
                                <span class="badge badge-warning">Unknown</span>
                            </t>
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

    "recruitment.placement": '''<kanban default_group_by="state" records_per_row="3">
    <field name="id"/>
    <field name="name"/>
    <field name="state"/>
    <field name="applicant_id"/>
    <field name="job_order_id"/>
    <templates>
        <t t-name="card">
            <div class="oe_kanban_card">
                <div class="oe_kanban_content">
                    <h4><strong><field name="name"/></strong></h4>
                    <div class="text-muted small">
                        <div>Candidate: <field name="applicant_id"/></div>
                        <div>Job: <field name="job_order_id"/></div>
                        <div>
                            <t t-if="record.state.raw_value == 'draft'">
                                <span class="badge badge-secondary">Draft</span>
                            </t>
                            <t t-elif="record.state.raw_value == 'confirmed'">
                                <span class="badge badge-primary">Confirmed</span>
                            </t>
                            <t t-elif="record.state.raw_value == 'deployed'">
                                <span class="badge badge-success">Deployed</span>
                            </t>
                            <t t-else="">
                                <span class="badge badge-warning">Unknown</span>
                            </t>
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

    "uae.visa.processing": '''<kanban default_group_by="state" records_per_row="4">
    <field name="id"/>
    <field name="name"/>
    <field name="state"/>
    <field name="applicant_id"/>
    <field name="visa_type"/>
    <templates>
        <t t-name="card">
            <div class="oe_kanban_card">
                <div class="oe_kanban_content">
                    <h4><strong><field name="name"/></strong></h4>
                    <div class="text-muted small">
                        <div>Applicant: <field name="applicant_id"/></div>
                        <div>Type: <field name="visa_type"/></div>
                        <div>
                            <t t-if="record.state.raw_value == 'draft'">
                                <span class="badge badge-secondary">Draft</span>
                            </t>
                            <t t-elif="record.state.raw_value == 'submitted'">
                                <span class="badge badge-primary">Submitted</span>
                            </t>
                            <t t-elif="record.state.raw_value == 'approved'">
                                <span class="badge badge-success">Approved</span>
                            </t>
                            <t t-elif="record.state.raw_value == 'rejected'">
                                <span class="badge badge-danger">Rejected</span>
                            </t>
                            <t t-else="">
                                <span class="badge badge-warning">Unknown</span>
                            </t>
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
}


def connect_odoo():
    """Connect to Odoo and return common and models objects"""
    print(f"Connecting to {URL}...")
    common = xmlrpc.client.ServerProxy(f'{URL}/xmlrpc/2/common')
    uid = common.authenticate(DB, USERNAME, PASSWORD, {})
    
    if not uid:
        raise Exception("Authentication failed!")
    
    print(f"Authenticated as UID: {uid}\n")
    models = xmlrpc.client.ServerProxy(f'{URL}/xmlrpc/2/object')
    return common, models, uid


def find_and_update_kanban_views(models, uid):
    """Find and update kanban views for each model"""
    success_count = 0
    fail_count = 0
    
    for model_name, fixed_arch in FIXED_VIEWS_BY_MODEL.items():
        print("=" * 60)
        print(f"Updating kanban view for model: {model_name}")
        print("=" * 60)
        
        try:
            # Search for kanban views for this model
            view_ids = models.execute_kw(
                DB, uid, PASSWORD,
                'ir.ui.view', 'search',
                [[
                    ('model', '=', model_name),
                    ('type', '=', 'kanban')
                ]]
            )
            
            if not view_ids:
                print(f"No kanban view found for model: {model_name}")
                fail_count += 1
                continue
            
            print(f"Found {len(view_ids)} kanban view(s) for {model_name}")
            
            # Update each view
            for view_id in view_ids:
                try:
                    # Get view details
                    view = models.execute_kw(
                        DB, uid, PASSWORD,
                        'ir.ui.view', 'read',
                        [view_id], {'fields': ['name', 'xml_id']}
                    )[0]
                    
                    print(f"  - Updating view: {view['name']} (ID: {view_id})")
                    
                    # Update the view
                    result = models.execute_kw(
                        DB, uid, PASSWORD,
                        'ir.ui.view', 'write',
                        [[view_id], {'arch': fixed_arch}]
                    )
                    
                    if result:
                        print(f"  ✓ Successfully updated view ID: {view_id}")
                        success_count += 1
                    else:
                        print(f"  ✗ Failed to update view ID: {view_id}")
                        fail_count += 1
                        
                except Exception as e:
                    print(f"  ERROR updating view {view_id}: {e}")
                    fail_count += 1
                    
        except Exception as e:
            print(f"ERROR processing model {model_name}: {e}")
            fail_count += 1
    
    return success_count, fail_count


def clear_cache(models, uid):
    """Clear Odoo cache"""
    print("\n" + "=" * 60)
    print("Clearing cache...")
    print("=" * 60)
    
    try:
        # Clear assets
        models.execute_kw(
            DB, uid, PASSWORD,
            'ir.attachment', 'search_unlink',
            [[['name', 'ilike', 'assets_%']]]
        )
        print("✓ Cleared assets cache")
    except Exception as e:
        print(f"Note: Could not clear assets cache: {e}")


def main():
    print("\n" + "#" * 60)
    print("# ODOO KANBAN VIEW FIXER")
    print("# Fixing t-if/t-elif/t-else template issues")
    print("#" * 60 + "\n")
    
    try:
        # Connect to Odoo
        common, models, uid = connect_odoo()
        
        # Find and update views
        success_count, fail_count = find_and_update_kanban_views(models, uid)
        
        # Clear cache
        clear_cache(models, uid)
        
        # Print summary
        print("\n" + "=" * 60)
        print("SUMMARY")
        print("=" * 60)
        print(f"Views updated successfully: {success_count}")
        print(f"Views failed to update: {fail_count}")
        
        if success_count > 0:
            print("\n" + "=" * 60)
            print("NEXT STEPS")
            print("=" * 60)
            print("1. Clear your browser cache (Ctrl+Shift+Delete)")
            print("2. Go to Odoo Settings > Technical > Regenerate Assets Bundles")
            print("3. Refresh the affected pages")
            print("4. If the issue persists, restart the Odoo server")
            print("\nOr restart Odoo server with:")
            print("  ssh -i \"C:\\Users\\branm\\.ssh\\id_rsa\" root@65.20.72.53 \"systemctl restart odona-eigermarvel.service\"")
        
    except Exception as e:
        print(f"\n✗ FATAL ERROR: {e}")
        return 1
    
    return 0 if fail_count == 0 else 1


if __name__ == '__main__':
    exit(main())
