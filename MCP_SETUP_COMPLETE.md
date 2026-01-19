# Odoo MCP Server Setup - COMPLETE 

## Configuration Summary

### MCP Server Details
- **Location**: D:\01_WORK_PROJECTS\odoo-mcp-server
- **Status**: Built and configured
- **Dist**: D:\01_WORK_PROJECTS\odoo-mcp-server\dist\index.js

### Odoo Instance (Eiger Marvel HR)
- **URL**: https://eigermarvelhr.com
- **Database**: eigermarvel
- **Username**: admin
- **Password**: 8586583

### Server Paths
- Custom Apps: /var/odoo/eigermarvel/extra-addons/new-apps.git-691aab1cc3a84/
- Source: /var/odoo/eigermarvel/src
- Config: /var/odoo/eigermarvel/odoo.conf
- Python: /var/odoo/eigermarvel/venv/bin/python3

## Claude Desktop Integration 

The MCP server has been registered in Claude Desktop as:
- Server Name: **odoo-eiger-marvel-hr**
- You need to restart Claude Desktop to activate it

## Available MCP Tools (Once Active)

1. **odoo_search** - Search records in any model
2. **odoo_read** - Read specific record details
3. **odoo_create** - Create new records
4. **odoo_update** - Update existing records
5. **odoo_delete** - Delete records
6. **odoo_execute** - Execute any Odoo method
7. **odoo_get_model_fields** - Get model structure
8. **odoo_get_view** - Retrieve view definitions

## Next Steps

### 1. Restart Claude Desktop
Close and reopen Claude Desktop to load the MCP server

### 2. Verify Connection
In Claude, try:
"Use the odoo-eiger-marvel-hr MCP to search for recruitment models"

### 3. Fix Remaining Issues

#### A. Wizard Views (Currently Disabled)
File: wizards/wizard_views.xml
Issues to fix:
- client_name  company_name
- contact_email  email  
- action_onboard_client  action_create_client

#### B. LLM Provider Actions (Commented Out in Views)
File: models/llm_provider.py
Need to add these methods:
\\\python
def action_view_usage_logs(self):
    return {
        'type': 'ir.actions.act_window',
        'name': 'Usage Logs',
        'res_model': 'llm.usage.log',
        'view_mode': 'list,form',
        'domain': [('provider_id', '=', self.id)],
        'context': {'default_provider_id': self.id}
    }

def action_view_errors(self):
    return {
        'type': 'ir.actions.act_window',
        'name': 'Error Logs',
        'res_model': 'llm.error.log',
        'view_mode': 'list,form',
        'domain': [('provider_id', '=', self.id)],
        'context': {'default_provider_id': self.id}
    }
\\\

## Using MCP for Development

### Get Model Structure
"Show me the fields of the recruitment.placement model"

### Review Code
"Check the recruitment_candidate.py model for any issues"

### Create Records
"Create a test client in the recruitment.client model"

### Debug Issues
"Search for all placements with state=draft"

## Benefits

 No more manual SSH commands
 Direct Odoo database access from Claude
 Code review and suggestions
 Automated testing and validation
 Bug detection and fixing
 Performance optimization suggestions

---
Setup completed: 2026-01-19 01:40:53
