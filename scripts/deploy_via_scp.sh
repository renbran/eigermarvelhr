#!/bin/bash
# Deploy fixed recruitment module files to remote server via SCP

# Remote server details
REMOTE_USER="root"
REMOTE_HOST="65.20.72.53"
REMOTE_PORT="22"
REMOTE_PATH="/opt/odoo/eigermarvel"  # Adjust if different

# Local source path
LOCAL_BASE="odoo_modules/uae_recruitment_mgmt"

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Deploying Fixed Recruitment Module Files${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo "Remote Server: $REMOTE_USER@$REMOTE_HOST:$REMOTE_PORT"
echo "Destination: $REMOTE_PATH"
echo ""

# Files to copy
files=(
    "odoo_modules/uae_recruitment_mgmt/data/email_templates.xml"
    "odoo_modules/uae_recruitment_mgmt/models/recruitment_dashboard.py"
    "odoo_modules/uae_recruitment_mgmt/models/recruitment_job_order.py"
    "odoo_modules/uae_recruitment_mgmt/views/menu_views.xml"
    "odoo_modules/uae_recruitment_mgmt/views/recruitment_dashboard_views.xml"
)

echo -e "${YELLOW}Files to copy:${NC}"
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓${NC} $file"
    else
        echo -e "  ${RED}✗${NC} $file (NOT FOUND)"
    fi
done
echo ""

# Confirm before proceeding
read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

echo ""
echo -e "${YELLOW}Starting SCP transfer...${NC}"
echo ""

success_count=0
fail_count=0

# Copy each file
for file in "${files[@]}"; do
    echo -ne "Copying $file ... "
    
    # Extract the relative path from the source
    relative_path="${file#odoo_modules/}"
    dest_path="$REMOTE_PATH/odoo_modules/$relative_path"
    
    # Get the directory path
    dest_dir=$(dirname "$dest_path")
    
    # Copy the file
    if scp -P "$REMOTE_PORT" "$file" "$REMOTE_USER@$REMOTE_HOST:$dest_path" 2>/dev/null; then
        echo -e "${GREEN}✓${NC}"
        ((success_count++))
    else
        echo -e "${RED}✗${NC}"
        ((fail_count++))
    fi
done

echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "Transfer Summary:"
echo -e "  ${GREEN}Successful: $success_count${NC}"
echo -e "  ${RED}Failed: $fail_count${NC}"
echo -e "${YELLOW}========================================${NC}"

if [ $fail_count -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ All files deployed successfully!${NC}"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. SSH into the server:"
    echo "   ssh -p 22 root@65.20.72.53"
    echo ""
    echo "2. Restart Odoo service:"
    echo "   systemctl restart odoo18"
    echo "   or"
    echo "   systemctl restart odoo"
    echo ""
    echo "3. Upgrade the module in Odoo:"
    echo "   Go to Apps > Search 'uae_recruitment_mgmt' > Upgrade"
    echo ""
    exit 0
else
    echo ""
    echo -e "${RED}✗ Some files failed to transfer${NC}"
    echo "Please check the SSH connection and try again"
    exit 1
fi
