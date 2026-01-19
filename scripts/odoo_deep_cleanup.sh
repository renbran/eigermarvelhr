#!/usr/bin/env bash
set -euo pipefail

# Odoo Deep Cleanup Script (Odoo 18)
# Purpose: Remove residual/non-installable modules from all addons paths,
# clear caches, refresh Apps list, and reinstall the target module.

# Required params (can be passed via env or edited here):
#   DB_NAME           - Odoo database name (e.g., eigermarvel)
#   ODOO_BASE         - Base path (e.g., /var/odoo/eigermarvel)
#   ODOO_USER         - System user running Odoo (e.g., odoo)
#   MODULE_NAME       - Target module to keep/install (e.g., uae_recruitment_mgmt)
#   REMOVE_PATTERNS   - Space-separated patterns to remove (e.g., "recruitment_uae recruitment_uae_improvements")

: "${DB_NAME:?DB_NAME is required}"
: "${ODOO_BASE:?ODOO_BASE is required}"
: "${ODOO_USER:=odoo}"
: "${MODULE_NAME:=uae_recruitment_mgmt}"
: "${REMOVE_PATTERNS:=recruitment_uae recruitment_uae_improvements}" # add more patterns if needed

CONF_PATH="${ODOO_BASE}/odoo.conf"
LOGS_DIR="${ODOO_BASE}/logs"
VENV_BIN="${ODOO_BASE}/venv/bin"
SRC_ADDONS="${ODOO_BASE}/src/addons"

log() { echo "[cleanup] $*"; }
fail() { echo "[cleanup][error] $*" >&2; exit 1; }

if [[ $EUID -ne 0 ]]; then
  fail "Run as root or with sudo (required for file ops and chown)."
fi

[[ -f "$CONF_PATH" ]] || fail "odoo.conf not found at $CONF_PATH"
[[ -x "$VENV_BIN/python3" ]] || fail "Python venv not found at $VENV_BIN"

# Ensure logs directory exists
log "Ensuring logs directory exists at $LOGS_DIR"
mkdir -p "$LOGS_DIR"
: > "$LOGS_DIR/odoo.log" || true
chown "$ODOO_USER:$ODOO_USER" "$LOGS_DIR" "$LOGS_DIR/odoo.log"

# Resolve Odoo user HOME
ODOO_HOME=$(getent passwd "$ODOO_USER" | cut -d: -f6 || true)
[[ -n "$ODOO_HOME" ]] || ODOO_HOME="/home/$ODOO_USER"
USER_ADDONS_BASE="$ODOO_HOME/.local/share/Odoo"

# Collect addons paths from odoo.conf + defaults
log "Collecting addons paths"
ADDONS_PATH_LINE=$(grep -E '^addons_path\s*=' "$CONF_PATH" | head -n1 || true)
ADDONS_PATHS=()
if [[ -n "$ADDONS_PATH_LINE" ]]; then
  RAW=$(echo "$ADDONS_PATH_LINE" | cut -d'=' -f2 | tr -d '[:space:]')
  IFS=',' read -r -a CONF_ADDONS <<< "$RAW"
  for ap in "${CONF_ADDONS[@]}"; do
    [[ -d "$ap" ]] && ADDONS_PATHS+=("$ap")
  done
fi
# Always include src/addons; include common extra-addons locations
[[ -d "$SRC_ADDONS" ]] && ADDONS_PATHS+=("$SRC_ADDONS")
for candidate in \
  "$ODOO_BASE/extra-addons" \
  "$ODOO_BASE/addons" \
  "/opt/odoo/extra-addons" \
  "/opt/odoo/addons"; do
  [[ -d "$candidate" ]] && ADDONS_PATHS+=("$candidate")
done

log "Addons paths detected: ${ADDONS_PATHS[*]:-none}"
[[ ${#ADDONS_PATHS[@]} -gt 0 ]] || fail "No addons paths found. Check odoo.conf and ODOO_BASE."

# Remove residual modules by patterns across all addons paths
log "Removing residual modules: $REMOVE_PATTERNS"
for ap in "${ADDONS_PATHS[@]}"; do
  for pat in $REMOVE_PATTERNS; do
    shopt -s nullglob
    for dir in "$ap"/$pat*; do
      if [[ -d "$dir" ]]; then
        log "Removing $dir"
        rm -rf "$dir"
      fi
    done
    shopt -u nullglob
  done
done

# Remove residual modules and caches from Odoo user's local addons cache
if [[ -d "$USER_ADDONS_BASE" ]]; then
  log "Cleaning user-level addons cache under $USER_ADDONS_BASE"
  find "$USER_ADDONS_BASE" -maxdepth 3 -type d \( \
    $(printf -- "-name '%s*' -o " $REMOVE_PATTERNS | sed 's/ -o $//') \
    -o -name __pycache__ -o -name '*.egg-info' \) -print -exec rm -rf {} + || true
fi

# Clean __pycache__ across addons
log "Removing __pycache__ across addons paths"
for ap in "${ADDONS_PATHS[@]}"; do
  find "$ap" -type d -name __pycache__ -print -exec rm -rf {} + || true
done

# Refresh Apps list via upgrading base (safe way to rescan manifests)
log "Refreshing Apps list (upgrade base)"
sudo -u "$ODOO_USER" "$VENV_BIN/python3" -m odoo \
  -c "$CONF_PATH" -d "$DB_NAME" --no-http --stop-after-init -u base || fail "Failed to refresh module list"

# Reinstall or upgrade the target module
log "Upgrading target module: $MODULE_NAME"
sudo -u "$ODOO_USER" "$VENV_BIN/python3" -m odoo \
  -c "$CONF_PATH" -d "$DB_NAME" --no-http --stop-after-init -u "$MODULE_NAME" || fail "Failed to upgrade $MODULE_NAME"

log "Cleanup complete. Tail logs for verification: tail -n 200 -f $LOGS_DIR/odoo.log"