#!/bin/bash
# Deploy to remote server and restart Odoo

# Remote server details
REMOTE_USER="ubuntu"
REMOTE_HOST="65.20.72.53"
REMOTE_PATH="/var/odoo/eigermarvel"
SSH_KEY="/path/to/ssh/key"  # Update with actual SSH key path if needed

echo "=========================================="
echo "DEPLOYMENT AND MODULE UPDATE"
echo "=========================================="
echo ""

# Step 1: Pull latest changes on remote server
echo "1️⃣  Pulling latest changes from GitHub..."
ssh -i "$SSH_KEY" "${REMOTE_USER}@${REMOTE_HOST}" "cd ${REMOTE_PATH} && git pull origin main"

if [ $? -eq 0 ]; then
    echo "✅ Git pull successful"
else
    echo "❌ Git pull failed"
    exit 1
fi

echo ""

# Step 2: Stop Odoo service
echo "2️⃣  Stopping Odoo service..."
ssh -i "$SSH_KEY" "${REMOTE_USER}@${REMOTE_HOST}" "sudo systemctl stop odoo"

if [ $? -eq 0 ]; then
    echo "✅ Odoo service stopped"
else
    echo "⚠️  Could not stop Odoo service (may already be stopped)"
fi

echo ""

# Step 3: Update and install modules
echo "3️⃣  Updating Odoo modules..."
ssh -i "$SSH_KEY" "${REMOTE_USER}@${REMOTE_HOST}" "cd ${REMOTE_PATH} && python3 manage.py shell -c \"
import odoo
from odoo.api import Environment
from odoo.tools import config

# Update UAe Recruitment Management module
env = Environment(odoo.registry(config['db_name']).cursor(), 1, {})
module = env['ir.module.module'].search([('name', '=', 'uae_recruitment_mgmt')])
if module:
    module.button_upgrade()
    print('✅ UAe Recruitment Management module updated')
\""

echo ""

# Step 4: Start Odoo service
echo "4️⃣  Starting Odoo service..."
ssh -i "$SSH_KEY" "${REMOTE_USER}@${REMOTE_HOST}" "sudo systemctl start odoo"

if [ $? -eq 0 ]; then
    echo "✅ Odoo service started"
else
    echo "❌ Failed to start Odoo service"
    exit 1
fi

echo ""

# Step 5: Verify service is running
echo "5️⃣  Verifying Odoo service..."
ssh -i "$SSH_KEY" "${REMOTE_USER}@${REMOTE_HOST}" "sudo systemctl status odoo"

echo ""
echo "=========================================="
echo "✅ DEPLOYMENT COMPLETE"
echo "=========================================="
echo ""
echo "📝 Changes deployed:"
echo "  - Fixed due_date → date_deadline in visa processing"
echo "  - Updated UAe Recruitment Management module"
echo "  - Odoo service restarted"
echo ""
