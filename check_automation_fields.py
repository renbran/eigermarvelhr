import sys
sys.path.insert(0, '/var/odoo/eigermarvel/src')
import odoo
odoo.tools.config.parse_config(['-c', '/var/odoo/eigermarvel/odoo.conf'])

# Initialize registry
registry = odoo.modules.registry.Registry.new('eigermarvel')

# Get environment with cursor
with registry.cursor() as cr:
    from odoo import api, SUPERUSER_ID
    env = api.Environment(cr, SUPERUSER_ID, {})
    
    print('Available fields in base.automation:')
    fields = env['base.automation']._fields
    for field in sorted(fields.keys()):
        if any(keyword in field for keyword in ['code', 'action', 'state', 'server']):
            print(f"  - {field}: {type(fields[field]).__name__}")

