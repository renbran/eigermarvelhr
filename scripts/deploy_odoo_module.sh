#!/usr/bin/env bash
set -euo pipefail

REMOTE_USER=${REMOTE_USER:-root}
REMOTE_HOST=${REMOTE_HOST:-65.20.72.53}
REMOTE_PORT=${REMOTE_PORT:-22}
LOCAL_MODULE_PATH=${LOCAL_MODULE_PATH:-"$(pwd)/odoo_modules/uae_recruitment_mgmt"}
REMOTE_ADDONS_PATH=${REMOTE_ADDONS_PATH:-"/var/odoo/eigermarvel/src/addons"}
REMOTE_TMP_PATH=${REMOTE_TMP_PATH:-"/var/odoo/eigermarvel/tmp"}
ODOO_CONF=${ODOO_CONF:-"/var/odoo/eigermarvel/odoo.conf"}
VENV_PYTHON=${VENV_PYTHON:-"/var/odoo/eigermarvel/venv/bin/python3"}
ODOO_BIN=${ODOO_BIN:-"/var/odoo/eigermarvel/src/odoo-bin"}
MODULE_NAME=${MODULE_NAME:-"uae_recruitment_mgmt"}

info() { echo -e "\033[1;34m[INFO]\033[0m $*"; }
success() { echo -e "\033[1;32m[SUCCESS]\033[0m $*"; }
warn() { echo -e "\033[1;33m[WARN]\033[0m $*"; }
error() { echo -e "\033[1;31m[ERROR]\033[0m $*"; }

info "Starting Odoo module deployment..."

if [ ! -d "$LOCAL_MODULE_PATH" ]; then
  error "Local module path not found: $LOCAL_MODULE_PATH"; exit 1
fi

info "Ensuring remote directories exist..."
ssh -p "$REMOTE_PORT" "$REMOTE_USER@$REMOTE_HOST" "mkdir -p '$REMOTE_TMP_PATH' '$REMOTE_ADDONS_PATH'"

info "Copying module to remote tmp directory..."
scp -P "$REMOTE_PORT" -r "$LOCAL_MODULE_PATH" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_TMP_PATH/"

info "Installing module into addons path..."
ssh -p "$REMOTE_PORT" "$REMOTE_USER@$REMOTE_HOST" bash -s <<EOF
set -e
MODULE_DIR="$REMOTE_TMP_PATH/$MODULE_NAME"
ADDONS_DIR="$REMOTE_ADDONS_PATH"
if [ -d "\$ADDONS_DIR/\$MODULE_NAME" ]; then
  rm -rf "\$ADDONS_DIR/\$MODULE_NAME"
fi
mv "\$MODULE_DIR" "\$ADDONS_DIR/"
chown -R odoo:odoo "\$ADDONS_DIR/\$MODULE_NAME"
EOF

info "Installing Python dependencies..."
ssh -p "$REMOTE_PORT" "$REMOTE_USER@$REMOTE_HOST" "sudo -u odoo '$VENV_PYTHON' -m pip install --upgrade pip"
ssh -p "$REMOTE_PORT" "$REMOTE_USER@$REMOTE_HOST" "sudo -u odoo '$VENV_PYTHON' -m pip install requests openai psycopg2-binary"

info "Updating module in Odoo (non-HTTP mode)..."
ssh -p "$REMOTE_PORT" "$REMOTE_USER@$REMOTE_HOST" "cd /var/odoo/eigermarvel && sudo -u odoo '$VENV_PYTHON' '$ODOO_BIN' -c '$ODOO_CONF' --no-http --stop-after-init -u '$MODULE_NAME'"

info "Fetching last 100 log lines..."
ssh -p "$REMOTE_PORT" "$REMOTE_USER@$REMOTE_HOST" "tail -n 100 /var/odoo/eigermarvel/logs/odoo.log"

success "Deployment complete."
