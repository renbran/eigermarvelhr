#!/bin/bash
# Website Module Deployment - Production Safety Script
# Created: $(date)
# Purpose: Monitor, backup, and rollback capabilities

set -e

ODOO_DIR="/var/odoo/eigermarvel"
BACKUP_DIR="$ODOO_DIR/backups"
LOG_FILE="$ODOO_DIR/logs/website_deployment_$(date +%Y%m%d_%H%M%S).log"
LATEST_BACKUP="$BACKUP_DIR/eigermarvel_pre_website_20260121_074535.sql.gz"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}" | tee -a "$LOG_FILE"
}

# Function to check Odoo status
check_odoo_status() {
    log "Checking Odoo server status..."
    if pgrep -f "odoo-bin.*3000" > /dev/null; then
        PID=$(pgrep -f "odoo-bin.*3000" | head -1)
        success "Odoo is running (PID: $PID)"
        return 0
    else
        error "Odoo is not running!"
        return 1
    fi
}

# Function to check for errors in log
check_errors() {
    log "Checking for errors in Odoo log (last 100 lines)..."
    ERROR_COUNT=$(tail -100 $ODOO_DIR/logs/odoo-server.log | grep -i "ERROR\|CRITICAL\|traceback" | wc -l)
    
    if [ $ERROR_COUNT -gt 0 ]; then
        error "Found $ERROR_COUNT errors in recent logs"
        tail -100 $ODOO_DIR/logs/odoo-server.log | grep -i "ERROR\|CRITICAL" -A 3
        return 1
    else
        success "No errors found in recent logs"
        return 0
    fi
}

# Function to test website access
test_website() {
    log "Testing website accessibility..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ || echo "000")
    
    if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "303" ]; then
        success "Website is accessible (HTTP $HTTP_CODE)"
        return 0
    else
        error "Website returned HTTP $HTTP_CODE"
        return 1
    fi
}

# Function to rollback
rollback() {
    error "Initiating ROLLBACK procedure..."
    
    # Stop Odoo
    log "Stopping Odoo server..."
    pkill -f "odoo-bin.*3000" || true
    sleep 3
    
    # Restore database
    log "Restoring database from backup: $LATEST_BACKUP"
    if [ -f "$LATEST_BACKUP" ]; then
        dropdb -U postgres eigermarvel --if-exists
        createdb -U postgres eigermarvel -O odoo
        gunzip -c "$LATEST_BACKUP" | psql -U postgres eigermarvel
        success "Database restored from backup"
    else
        error "Backup file not found: $LATEST_BACKUP"
        exit 1
    fi
    
    # Remove website module
    log "Removing website module..."
    rm -rf $ODOO_DIR/extra-addons/website_eiger_marvel
    success "Website module removed"
    
    # Restart Odoo
    log "Restarting Odoo server..."
    cd $ODOO_DIR
    sudo -u odoo nohup $ODOO_DIR/venv/bin/python3 src/odoo-bin \
        --config odoo.conf \
        --http-interface=127.0.0.1 \
        --http-port 3000 \
        --gevent-port 3001 \
        --logfile logs/odoo-server.log > /dev/null 2>&1 &
    
    sleep 10
    
    if check_odoo_status; then
        success "ROLLBACK COMPLETED SUCCESSFULLY"
    else
        error "Failed to restart Odoo after rollback!"
        exit 1
    fi
}

# Function to install module safely
install_module() {
    log "Starting safe module installation..."
    
    # Check if backup exists
    if [ ! -f "$LATEST_BACKUP" ]; then
        error "No backup found! Creating backup first..."
        sudo -u postgres pg_dump eigermarvel | gzip > "$LATEST_BACKUP"
        success "Backup created: $LATEST_BACKUP"
    fi
    
    # Stop Odoo
    log "Stopping Odoo for module update..."
    CURRENT_PID=$(pgrep -f "odoo-bin.*3000" | head -1)
    kill $CURRENT_PID 2>/dev/null || true
    sleep 3
    
    # Install/Update module
    log "Installing website_eiger_marvel module..."
    cd $ODOO_DIR
    sudo -u odoo $ODOO_DIR/venv/bin/python3 src/odoo-bin \
        -c odoo.conf \
        -d eigermarvel \
        -i website_eiger_marvel \
        --stop-after-init \
        --logfile="$LOG_FILE" 2>&1
    
    INSTALL_STATUS=$?
    
    if [ $INSTALL_STATUS -ne 0 ]; then
        error "Module installation failed with exit code $INSTALL_STATUS"
        cat "$LOG_FILE"
        read -p "Rollback? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rollback
        fi
        exit 1
    fi
    
    success "Module installation completed"
    
    # Restart Odoo
    log "Restarting Odoo server..."
    sudo -u odoo nohup $ODOO_DIR/venv/bin/python3 src/odoo-bin \
        --config odoo.conf \
        --http-interface=127.0.0.1 \
        --http-port 3000 \
        --gevent-port 3001 \
        --logfile logs/odoo-server.log > /dev/null 2>&1 &
    
    sleep 10
    
    # Verify installation
    if check_odoo_status && test_website; then
        success "Module deployed successfully!"
        log "Checking for errors..."
        if ! check_errors; then
            warning "Errors detected after deployment"
            read -p "Rollback? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                rollback
            fi
        fi
    else
        error "Deployment verification failed!"
        read -p "Rollback? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rollback
        fi
    fi
}

# Function to monitor logs in real-time
monitor_logs() {
    log "Starting log monitor (Ctrl+C to stop)..."
    tail -f $ODOO_DIR/logs/odoo-server.log | grep --color -E "ERROR|CRITICAL|WARNING|website_eiger_marvel|$"
}

# Main menu
case "${1:-}" in
    install)
        install_module
        ;;
    rollback)
        rollback
        ;;
    check)
        check_odoo_status
        check_errors
        test_website
        ;;
    monitor)
        monitor_logs
        ;;
    backup)
        BACKUP_FILE="$BACKUP_DIR/manual_backup_$(date +%Y%m%d_%H%M%S).sql.gz"
        log "Creating manual backup..."
        sudo -u postgres pg_dump eigermarvel | gzip > "$BACKUP_FILE"
        success "Backup created: $BACKUP_FILE"
        ls -lh "$BACKUP_FILE"
        ;;
    *)
        echo "Eiger Marvel Website Module - Production Safety Manager"
        echo ""
        echo "Usage: $0 {install|rollback|check|monitor|backup}"
        echo ""
        echo "Commands:"
        echo "  install   - Safely install/update website module with automatic rollback on failure"
        echo "  rollback  - Restore database and remove website module"
        echo "  check     - Check Odoo status, errors, and website accessibility"
        echo "  monitor   - Real-time log monitoring (filtered for errors)"
        echo "  backup    - Create manual database backup"
        echo ""
        echo "Current Status:"
        check_odoo_status || true
        echo ""
        echo "Latest Backup: $LATEST_BACKUP"
        [ -f "$LATEST_BACKUP" ] && ls -lh "$LATEST_BACKUP"
        ;;
esac
