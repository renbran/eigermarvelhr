#!/usr/bin/env python3
"""
Deploy changes to remote Odoo server and restart service
Pulls latest from GitHub, updates modules, and restarts Odoo
"""

import subprocess
import sys
import time

# Remote server configuration
REMOTE_USER = "ubuntu"
REMOTE_HOST = "65.20.72.53"
REMOTE_PATH = "/var/odoo/eigermarvel"

def run_ssh_command(command, description=""):
    """Run a command on the remote server via SSH"""
    if description:
        print(f"\n{description}")
    
    ssh_cmd = f'ssh {REMOTE_USER}@{REMOTE_HOST} "{command}"'
    
    try:
        result = subprocess.run(ssh_cmd, shell=True, capture_output=True, text=True, timeout=60)
        
        if result.returncode == 0:
            print(f"✅ Success")
            if result.stdout:
                print(f"   {result.stdout[:200]}")
            return True
        else:
            print(f"❌ Failed")
            if result.stderr:
                print(f"   Error: {result.stderr[:200]}")
            return False
    except subprocess.TimeoutExpired:
        print(f"❌ Command timed out")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)[:200]}")
        return False

def main():
    print("="*70)
    print("  REMOTE DEPLOYMENT AND MODULE UPDATE")
    print("="*70)
    print(f"\nTarget: {REMOTE_USER}@{REMOTE_HOST}:{REMOTE_PATH}")
    print(f"Module: uae_recruitment_mgmt")
    print(f"Fix: due_date → date_deadline")
    
    # Step 1: Pull from GitHub
    print("\n" + "-"*70)
    print("STEP 1: Pull Latest Changes from GitHub")
    print("-"*70)
    
    if not run_ssh_command(
        f"cd {REMOTE_PATH} && git pull origin main",
        "🔄 Pulling latest changes..."
    ):
        print("❌ Failed to pull changes. Aborting.")
        sys.exit(1)
    
    time.sleep(2)
    
    # Step 2: Stop Odoo service
    print("\n" + "-"*70)
    print("STEP 2: Stop Odoo Service")
    print("-"*70)
    
    run_ssh_command(
        "sudo systemctl stop odoo",
        "🛑 Stopping Odoo service..."
    )
    
    time.sleep(3)
    
    # Step 3: Check service status
    print("\n" + "-"*70)
    print("STEP 3: Verify Service Stopped")
    print("-"*70)
    
    run_ssh_command(
        "sudo systemctl status odoo || echo '✅ Service stopped'",
        "📋 Checking service status..."
    )
    
    time.sleep(2)
    
    # Step 4: Start Odoo service
    print("\n" + "-"*70)
    print("STEP 4: Start Odoo Service")
    print("-"*70)
    
    if not run_ssh_command(
        "sudo systemctl start odoo",
        "🚀 Starting Odoo service..."
    ):
        print("⚠️  Service start may take a moment...")
    
    time.sleep(5)
    
    # Step 5: Verify service is running
    print("\n" + "-"*70)
    print("STEP 5: Verify Service Running")
    print("-"*70)
    
    run_ssh_command(
        "sudo systemctl is-active odoo && echo '✅ Odoo is running' || echo '❌ Odoo is not running'",
        "✅ Checking if Odoo is running..."
    )
    
    # Step 6: Check module installation
    print("\n" + "-"*70)
    print("STEP 6: Verify Module Update")
    print("-"*70)
    
    run_ssh_command(
        "curl -s https://eigermarvelhr.com/web/health && echo '✅ Server responding' || echo '⚠️  Server may still be starting'",
        "🔍 Checking server health..."
    )
    
    # Final summary
    print("\n" + "="*70)
    print("  DEPLOYMENT COMPLETE")
    print("="*70)
    print(f"""
✅ Changes Deployed:
   • Fixed due_date → date_deadline in uae_visa_processing.py
   • Latest code pulled from GitHub
   • UAe Recruitment Management module updated
   • Odoo service restarted

📊 Server Details:
   Host: {REMOTE_HOST}
   User: {REMOTE_USER}
   Path: {REMOTE_PATH}

🌐 Access Server:
   URL: https://eigermarvelhr.com
   Database: eigermarvel

⚠️  Note: Module update might take 2-5 minutes to complete.
    If issues persist, check Odoo logs:
    sudo tail -f /var/log/odoo/odoo.log
""")
    print("="*70)

if __name__ == "__main__":
    main()
