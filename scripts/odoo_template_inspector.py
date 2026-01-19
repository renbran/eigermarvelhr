#!/usr/bin/env python3
"""
Odoo Template Inspector
Connects to Odoo backend and inspects views for corrupted templates
Specifically looking for t-if/t-elif/t-else directive issues
"""

import xmlrpc.client
import xml.etree.ElementTree as ET
from typing import Optional, List, Dict, Any
import re
import sys

class OdooTemplateInspector:
    """Connect to Odoo and inspect templates for issues"""

    def __init__(self, url: str, db: str, username: str, password: str):
        self.url = url.rstrip('/')
        self.db = db
        self.username = username
        self.password = password
        self.uid = None
        self.common = None
        self.models = None

    def connect(self) -> bool:
        """Establish connection to Odoo"""
        try:
            print(f"\n{'='*60}")
            print(f"Connecting to Odoo: {self.url}")
            print(f"Database: {self.db}")
            print(f"User: {self.username}")
            print(f"{'='*60}\n")

            # Connect to common endpoint
            self.common = xmlrpc.client.ServerProxy(f'{self.url}/xmlrpc/2/common')

            # Get version info
            version = self.common.version()
            print(f"Odoo Version: {version.get('server_version', 'Unknown')}")
            print(f"Server Serie: {version.get('server_serie', 'Unknown')}")

            # Authenticate
            self.uid = self.common.authenticate(self.db, self.username, self.password, {})

            if not self.uid:
                print("ERROR: Authentication failed!")
                return False

            print(f"Authenticated successfully! UID: {self.uid}")

            # Connect to models endpoint
            self.models = xmlrpc.client.ServerProxy(f'{self.url}/xmlrpc/2/object')

            return True

        except Exception as e:
            print(f"ERROR: Connection failed - {e}")
            return False

    def execute(self, model: str, method: str, *args, **kwargs) -> Any:
        """Execute a method on an Odoo model"""
        return self.models.execute_kw(
            self.db, self.uid, self.password,
            model, method, list(args), kwargs
        )

    def search_read(self, model: str, domain: List = None, fields: List = None, limit: int = None) -> List[Dict]:
        """Search and read records from a model"""
        domain = domain or []
        fields = fields or []
        kwargs = {}
        if limit:
            kwargs['limit'] = limit
        if fields:
            kwargs['fields'] = fields
        return self.execute(model, 'search_read', domain, **kwargs)

    def check_template_syntax(self, arch: str, view_name: str) -> List[str]:
        """Check template for t-if/t-elif/t-else issues"""
        issues = []

        if not arch:
            return issues

        try:
            # Parse XML
            root = ET.fromstring(f"<root>{arch}</root>")

            # Find all elements
            all_elements = list(root.iter())

            for i, elem in enumerate(all_elements):
                attrs = elem.attrib

                # Check for t-elif without preceding t-if
                if 't-elif' in attrs:
                    # Get previous sibling
                    parent = None
                    for potential_parent in root.iter():
                        if elem in list(potential_parent):
                            parent = potential_parent
                            break

                    if parent is not None:
                        siblings = list(parent)
                        elem_index = siblings.index(elem)

                        if elem_index == 0:
                            issues.append(f"t-elif without preceding t-if in {view_name}")
                        else:
                            prev_sibling = siblings[elem_index - 1]
                            if 't-if' not in prev_sibling.attrib and 't-elif' not in prev_sibling.attrib:
                                issues.append(f"t-elif not preceded by t-if or t-elif in {view_name}")

                # Check for t-else without preceding t-if/t-elif
                if 't-else' in attrs:
                    parent = None
                    for potential_parent in root.iter():
                        if elem in list(potential_parent):
                            parent = potential_parent
                            break

                    if parent is not None:
                        siblings = list(parent)
                        elem_index = siblings.index(elem)

                        if elem_index == 0:
                            issues.append(f"t-else without preceding t-if in {view_name}")
                        else:
                            prev_sibling = siblings[elem_index - 1]
                            if 't-if' not in prev_sibling.attrib and 't-elif' not in prev_sibling.attrib:
                                issues.append(f"t-else not preceded by t-if or t-elif in {view_name}")

        except ET.ParseError as e:
            issues.append(f"XML Parse Error in {view_name}: {e}")
        except Exception as e:
            issues.append(f"Error checking {view_name}: {e}")

        return issues

    def inspect_crm_views(self) -> List[Dict]:
        """Inspect CRM-related views for template issues"""
        print("\n" + "="*60)
        print("INSPECTING CRM VIEWS")
        print("="*60 + "\n")

        # Search for CRM views, especially kanban
        domain = [
            '|', '|', '|',
            ('model', 'ilike', 'crm'),
            ('name', 'ilike', 'crm'),
            ('xml_id', 'ilike', 'crm'),
            ('inherit_id.model', 'ilike', 'crm')
        ]

        views = self.search_read(
            'ir.ui.view',
            domain,
            ['name', 'model', 'type', 'arch_db', 'xml_id', 'inherit_id', 'active']
        )

        print(f"Found {len(views)} CRM-related views\n")

        problematic_views = []

        for view in views:
            arch = view.get('arch_db', '')
            if not arch:
                continue

            issues = self.check_template_syntax(arch, view.get('name', 'Unknown'))

            # Also check for raw t-elif/t-else patterns that might cause issues
            if 't-elif' in arch or 't-else' in arch:
                # Check with regex for suspicious patterns
                # Look for t-elif/t-else not immediately after t-if/t-elif
                suspicious = re.findall(r'>\s*<[^>]+t-el(?:if|se)[^>]*>', arch)
                if suspicious:
                    view['suspicious_patterns'] = suspicious

            if issues:
                view['template_issues'] = issues
                problematic_views.append(view)
                print(f"ISSUE FOUND in view: {view.get('name')}")
                print(f"  Model: {view.get('model')}")
                print(f"  Type: {view.get('type')}")
                print(f"  XML ID: {view.get('xml_id')}")
                for issue in issues:
                    print(f"  - {issue}")
                print()

        return problematic_views

    def inspect_kanban_views(self) -> List[Dict]:
        """Specifically inspect Kanban views which commonly have t-if issues"""
        print("\n" + "="*60)
        print("INSPECTING ALL KANBAN VIEWS")
        print("="*60 + "\n")

        views = self.search_read(
            'ir.ui.view',
            [('type', '=', 'kanban')],
            ['name', 'model', 'type', 'arch_db', 'xml_id', 'inherit_id', 'active']
        )

        print(f"Found {len(views)} Kanban views\n")

        problematic_views = []

        for view in views:
            arch = view.get('arch_db', '')
            if not arch:
                continue

            issues = self.check_template_syntax(arch, view.get('name', 'Unknown'))

            if issues:
                view['template_issues'] = issues
                problematic_views.append(view)
                print(f"ISSUE FOUND: {view.get('name')}")
                print(f"  Model: {view.get('model')}")
                print(f"  XML ID: {view.get('xml_id')}")
                for issue in issues:
                    print(f"  - {issue}")
                print()

        if not problematic_views:
            print("No obvious template issues found in Kanban views.")
            print("The issue might be in inherited views or QWeb templates.")

        return problematic_views

    def inspect_inherited_views(self, model: str = 'crm.lead') -> List[Dict]:
        """Check inherited views for a specific model"""
        print(f"\n{'='*60}")
        print(f"INSPECTING INHERITED VIEWS FOR: {model}")
        print("="*60 + "\n")

        # Get base views
        base_views = self.search_read(
            'ir.ui.view',
            [('model', '=', model), ('inherit_id', '=', False)],
            ['name', 'type', 'xml_id']
        )

        print(f"Base views: {len(base_views)}")
        for v in base_views:
            print(f"  - {v.get('name')} ({v.get('type')}) [{v.get('xml_id')}]")

        # Get inherited views
        inherited_views = self.search_read(
            'ir.ui.view',
            [('model', '=', model), ('inherit_id', '!=', False)],
            ['name', 'type', 'arch_db', 'xml_id', 'inherit_id', 'active']
        )

        print(f"\nInherited views: {len(inherited_views)}")

        problematic = []
        for view in inherited_views:
            arch = view.get('arch_db', '')
            print(f"\n  - {view.get('name')}")
            print(f"    Inherits: {view.get('inherit_id')}")
            print(f"    XML ID: {view.get('xml_id')}")
            print(f"    Active: {view.get('active')}")

            issues = self.check_template_syntax(arch, view.get('name', 'Unknown'))
            if issues:
                view['template_issues'] = issues
                problematic.append(view)
                print(f"    ISSUES:")
                for issue in issues:
                    print(f"      - {issue}")

            # Check for xpath that might break t-if chains
            if 'xpath' in arch.lower():
                xpath_matches = re.findall(r'<xpath[^>]*expr=["\']([^"\']+)["\'][^>]*>', arch)
                if xpath_matches:
                    print(f"    XPath expressions: {xpath_matches}")

        return problematic

    def inspect_qweb_templates(self) -> List[Dict]:
        """Inspect QWeb templates"""
        print("\n" + "="*60)
        print("INSPECTING QWEB TEMPLATES")
        print("="*60 + "\n")

        templates = self.search_read(
            'ir.ui.view',
            [('type', '=', 'qweb')],
            ['name', 'arch_db', 'xml_id', 'key', 'active'],
            limit=100
        )

        print(f"Found {len(templates)} QWeb templates\n")

        problematic = []
        for tmpl in templates:
            arch = tmpl.get('arch_db', '')
            issues = self.check_template_syntax(arch, tmpl.get('name', 'Unknown'))

            if issues:
                tmpl['template_issues'] = issues
                problematic.append(tmpl)
                print(f"ISSUE: {tmpl.get('name')}")
                print(f"  XML ID: {tmpl.get('xml_id')}")
                for issue in issues:
                    print(f"  - {issue}")
                print()

        return problematic

    def list_custom_modules(self) -> List[Dict]:
        """List custom/third-party modules that might cause issues"""
        print("\n" + "="*60)
        print("LISTING CUSTOM MODULES")
        print("="*60 + "\n")

        modules = self.search_read(
            'ir.module.module',
            [('state', '=', 'installed'), ('author', 'not ilike', 'Odoo')],
            ['name', 'shortdesc', 'author', 'state', 'latest_version']
        )

        print(f"Found {len(modules)} custom/third-party modules:\n")
        for mod in modules:
            print(f"  - {mod.get('name')}: {mod.get('shortdesc')}")
            print(f"    Author: {mod.get('author')}")
            print(f"    Version: {mod.get('latest_version')}")
            print()

        return modules

    def inspect_uae_recruitment_module(self) -> Dict:
        """Check the UAE Recruitment module specifically"""
        print("\n" + "="*60)
        print("INSPECTING UAE RECRUITMENT MODULE")
        print("="*60 + "\n")

        # Check if module is installed
        modules = self.search_read(
            'ir.module.module',
            [('name', 'ilike', 'uae_recruitment')],
            ['name', 'shortdesc', 'state', 'latest_version']
        )

        if modules:
            mod = modules[0]
            print(f"Module: {mod.get('name')}")
            print(f"Description: {mod.get('shortdesc')}")
            print(f"State: {mod.get('state')}")
            print(f"Version: {mod.get('latest_version')}")
        else:
            print("UAE Recruitment module not found in database.")
            print("It may not be installed yet.")

        # Check views from this module
        views = self.search_read(
            'ir.ui.view',
            [('xml_id', 'ilike', 'uae_recruitment')],
            ['name', 'model', 'type', 'arch_db', 'xml_id', 'active']
        )

        print(f"\nViews from UAE Recruitment: {len(views)}")

        problematic = []
        for view in views:
            print(f"\n  - {view.get('name')}")
            print(f"    Model: {view.get('model')}")
            print(f"    Type: {view.get('type')}")

            arch = view.get('arch_db', '')
            issues = self.check_template_syntax(arch, view.get('name', 'Unknown'))
            if issues:
                view['template_issues'] = issues
                problematic.append(view)
                print(f"    ISSUES:")
                for issue in issues:
                    print(f"      - {issue}")

        return {
            'module': modules[0] if modules else None,
            'views': views,
            'problematic_views': problematic
        }

    def find_t_directive_issues(self) -> List[Dict]:
        """Search all views for t-if/t-elif/t-else directive issues"""
        print("\n" + "="*60)
        print("SEARCHING ALL VIEWS FOR T-DIRECTIVE ISSUES")
        print("="*60 + "\n")

        # Get all views with t-elif or t-else
        views = self.search_read(
            'ir.ui.view',
            ['|', ('arch_db', 'ilike', 't-elif'), ('arch_db', 'ilike', 't-else')],
            ['name', 'model', 'type', 'arch_db', 'xml_id', 'inherit_id', 'active']
        )

        print(f"Found {len(views)} views with t-elif or t-else directives\n")

        all_issues = []

        for view in views:
            arch = view.get('arch_db', '')
            issues = self.check_template_syntax(arch, view.get('name', 'Unknown'))

            if issues:
                view['template_issues'] = issues
                all_issues.append(view)
                print(f"PROBLEM VIEW: {view.get('name')}")
                print(f"  Model: {view.get('model')}")
                print(f"  Type: {view.get('type')}")
                print(f"  XML ID: {view.get('xml_id')}")
                print(f"  Inherits: {view.get('inherit_id')}")
                print(f"  Active: {view.get('active')}")
                print("  Issues:")
                for issue in issues:
                    print(f"    - {issue}")
                print()

        if not all_issues:
            print("No obvious t-directive issues found in database views.")
            print("\nThe issue might be:")
            print("  1. In JavaScript/OWL templates (web assets)")
            print("  2. In a QWeb template that's compiled at runtime")
            print("  3. In a third-party module's static assets")

        return all_issues

    def get_web_assets(self) -> List[Dict]:
        """Get web asset bundles that might contain corrupted templates"""
        print("\n" + "="*60)
        print("CHECKING WEB ASSET BUNDLES")
        print("="*60 + "\n")

        # Check ir.asset records
        try:
            assets = self.search_read(
                'ir.asset',
                [('bundle', 'ilike', 'web')],
                ['name', 'bundle', 'path', 'directive', 'active'],
                limit=50
            )

            print(f"Found {len(assets)} web assets\n")

            crm_assets = [a for a in assets if 'crm' in str(a.get('path', '')).lower()]
            if crm_assets:
                print("CRM-related assets:")
                for asset in crm_assets:
                    print(f"  - {asset.get('name')}")
                    print(f"    Path: {asset.get('path')}")
                    print(f"    Bundle: {asset.get('bundle')}")
                    print()

            return assets
        except Exception as e:
            print(f"Could not query ir.asset: {e}")
            return []

    def run_full_inspection(self):
        """Run complete inspection"""
        if not self.connect():
            return

        print("\n" + "#"*60)
        print("# FULL TEMPLATE INSPECTION REPORT")
        print("#"*60)

        # Run all inspections
        self.list_custom_modules()
        self.inspect_uae_recruitment_module()
        crm_issues = self.inspect_crm_views()
        kanban_issues = self.inspect_kanban_views()
        inherited_issues = self.inspect_inherited_views('crm.lead')
        t_directive_issues = self.find_t_directive_issues()
        self.get_web_assets()

        # Summary
        print("\n" + "="*60)
        print("INSPECTION SUMMARY")
        print("="*60)

        total_issues = len(crm_issues) + len(kanban_issues) + len(inherited_issues) + len(t_directive_issues)

        if total_issues > 0:
            print(f"\nTotal problematic views found: {total_issues}")
            print("\nTo fix these issues, you need to:")
            print("1. Identify the specific view causing the error")
            print("2. Edit the view XML to ensure t-elif/t-else follow t-if")
            print("3. Update the module or use Odoo Studio to fix the view")
        else:
            print("\nNo obvious database view issues found.")
            print("\nThe error 't-elif and t-else directives must be preceded by")
            print("a t-if or t-elif directive' is likely coming from:")
            print("")
            print("1. A JavaScript/OWL component template in web assets")
            print("2. A QWeb template compiled at runtime from JS")
            print("3. A cached/minified asset bundle that needs regeneration")
            print("")
            print("RECOMMENDED ACTIONS:")
            print("1. Clear browser cache and Odoo assets cache")
            print("2. Regenerate assets: Settings > Technical > Regenerate Assets Bundles")
            print("3. Check browser console for the specific template name")
            print("4. Look for custom OWL components in installed modules")


def main():
    """Main entry point"""
    # Connection details
    URL = "https://eigermarvelhr.com"
    DB = "eigermarvel"
    USERNAME = "admin"
    PASSWORD = "8586583"

    inspector = OdooTemplateInspector(URL, DB, USERNAME, PASSWORD)
    inspector.run_full_inspection()


if __name__ == '__main__':
    main()
