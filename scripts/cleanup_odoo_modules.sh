#!/usr/bin/env bash
set -euo pipefail

REMOTE_USER=${REMOTE_USER:-root}
REMOTE_HOST=${REMOTE_HOST:-65.20.72.53}
REMOTE_PORT=${REMOTE_PORT:-22}
REMOTE_ADDONS_PATH=${REMOTE_ADDONS_PATH:-"/var/odoo/eigermarvel/src/addons"}
ODOO_CONF=${ODOO_CONF:-"/var/odoo/eigermarvel/odoo.conf"}
VENV_PYTHON=${VENV_PYTHON:-"/var/odoo/eigermarvel/venv/bin/python3"}
ODOO_BIN=${ODOO_BIN:-"/var/odoo/eigermarvel/src/odoo-bin"}
DB_NAME=${DB_NAME:-"eigermarvel"}

# Modules to remove (adjust if needed)
REMOVE_MODULES=(
  recruitment_uae
  recruitment_uae_improvements
  recruitment_uae_improvements.bak
  recruitment_uae_odoo18
  hr_recruitment_scholarix
  recruitment_twitter
)

info() { echo -e "\033[1;34m[INFO]\033[0m $*"; }
success() { echo -e "\033[1;32m[SUCCESS]\033[0m $*"; }
warn() { echo -e "\033[1;33m[WARN]\033[0m $*"; }
error() { echo -e "\033[1;31m[ERROR]\033[0m $*"; }

SSH="ssh -p \"$REMOTE_PORT\" \"$REMOTE_USER@$REMOTE_HOST\""

info "Listing current recruitment-related modules in addons:"
$SSH "ls -1 '$REMOTE_ADDONS_PATH' | grep -E 'recruitment|hr_recruitment' || true"

info "Removing old custom modules..."
for mod in "${REMOVE_MODULES[@]}"; do
  $SSH "if [ -d '$REMOTE_ADDONS_PATH/$mod' ]; then echo Removing $mod; rm -rf '$REMOTE_ADDONS_PATH/$mod'; fi"
done

info "Fixing ownership..."
$SSH "chown -R odoo:odoo '$REMOTE_ADDONS_PATH'"

info "Refreshing Apps List via Odoo shell (update_list)..."
$SSH bash -lc "cd /var/odoo/eigermarvel && sudo -u odoo '$VENV_PYTHON' '$ODOO_BIN' -c '$ODOO_CONF' -d '$DB_NAME' --no-http --stop-after-init --shell <<'PY'
from odoo import api, SUPERUSER_ID
try:
    env = api.Environment(cr, SUPERUSER_ID, {})
    env['ir.module.module'].sudo().update_list()
    print('Apps list refreshed')
except Exception as e:
    print('Error refreshing apps list:', e)
PY"

success "Cleanup complete. Now update Apps view in UI or reload."
