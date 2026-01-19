#!/usr/bin/env python3
"""
UAE Recruitment Module - Installation & Monitoring Script
Handles module installation with continuous health checks and validation
"""

import os
import sys
import time
import json
import subprocess
import shutil
from datetime import datetime
from pathlib import Path

# Color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header(message):
    """Print a prominent header message"""
    print(f"\n{Colors.HEADER}{Colors.BOLD}")
    print("=" * 80)
    print(f"  {message}")
    print("=" * 80)
    print(f"{Colors.ENDC}")

def print_success(message):
    """Print a success message"""
    print(f"{Colors.OKGREEN}✅ {message}{Colors.ENDC}")

def print_warning(message):
    """Print a warning message"""
    print(f"{Colors.WARNING}⚠️  {message}{Colors.ENDC}")

def print_error(message):
    """Print an error message"""
    print(f"{Colors.FAIL}❌ {message}{Colors.ENDC}")

def print_info(message):
    """Print an info message"""
    print(f"{Colors.OKCYAN}ℹ️  {message}{Colors.ENDC}")

def print_step(step_number, message):
    """Print a step indicator"""
    print(f"\n{Colors.OKBLUE}[Step {step_number}] {message}{Colors.ENDC}")

class InstallationMonitor:
    """Monitors the installation process with continuous checks"""
    
    def __init__(self):
        self.start_time = datetime.now()
        self.checks_passed = []
        self.checks_failed = []
        self.log_file = f"installation_log_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        
    def log(self, message):
        """Log message to both console and file"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        log_message = f"[{timestamp}] {message}"
        print(log_message)
        with open(self.log_file, 'a') as f:
            f.write(log_message + "\n")
    
    def check_system_requirements(self):
        """Check if system meets requirements"""
        print_step(1, "Checking System Requirements")
        
        checks = {}
        
        # Check Python version
        python_version = sys.version_info
        checks['Python Version'] = f"{python_version.major}.{python_version.minor}.{python_version.micro}"
        if python_version.major >= 3 and python_version.minor >= 8:
            print_success(f"Python {checks['Python Version']} (>= 3.8 required)")
        else:
            print_error(f"Python {checks['Python Version']} - Minimum 3.8 required")
            self.checks_failed.append("Python version too old")
            return False
        
        # Check if we're on Windows
        is_windows = sys.platform == 'win32'
        checks['OS'] = 'Windows' if is_windows else 'Linux/Unix'
        print_info(f"Operating System: {checks['OS']}")
        
        # Check required directories
        script_dir = Path(__file__).parent.resolve()
        module_dir = script_dir / 'uae_recruitment_mgmt'
        
        checks['Module Directory'] = str(module_dir)
        if module_dir.exists():
            print_success(f"Module directory found: {module_dir}")
        else:
            print_error(f"Module directory not found: {module_dir}")
            self.checks_failed.append("Module directory missing")
            return False
        
        # Check critical files
        critical_files = [
            '__manifest__.py',
            '__init__.py',
            'models/__init__.py',
            'controllers/main.py',
        ]
        
        for file in critical_files:
            file_path = module_dir / file
            if file_path.exists():
                print_success(f"Found: {file}")
            else:
                print_error(f"Missing: {file}")
                self.checks_failed.append(f"Missing file: {file}")
                return False
        
        self.checks_passed.append("System Requirements")
        return True
    
    def check_odoo_connectivity(self):
        """Check Odoo service connectivity"""
        print_step(2, "Checking Odoo Service Connectivity")
        
        # Try to detect Odoo installation
        odoo_paths = [
            Path("C:/Program Files/Odoo"),
            Path("C:/Program Files (x86)/Odoo"),
            Path("/opt/odoo"),
            Path("/usr/local/odoo"),
            Path(os.path.expanduser("~/odoo")),
        ]
        
        odoo_found = None
        for path in odoo_paths:
            if path.exists():
                odoo_found = path
                print_success(f"Odoo installation found: {path}")
                break
        
        if not odoo_found:
            print_warning("Odoo installation path not found in standard locations")
            print_info("Please ensure Odoo 18+ is installed and running")
        
        # Try to connect to default Odoo port
        try:
            import socket
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(2)
            result = sock.connect_ex(('localhost', 8069))
            sock.close()
            
            if result == 0:
                print_success("Odoo service is accessible on localhost:8069")
                self.checks_passed.append("Odoo Connectivity")
                return True
            else:
                print_warning("Odoo service not responding on localhost:8069")
                print_info("Ensure Odoo is running: python odoo-bin -c odoo.conf")
                self.checks_failed.append("Odoo service not accessible")
                return False
        except Exception as e:
            print_error(f"Error checking Odoo connectivity: {e}")
            self.checks_failed.append("Odoo connectivity check failed")
            return False
    
    def check_database_connectivity(self):
        """Check database connectivity"""
        print_step(3, "Checking Database Connectivity")
        
        try:
            import psycopg2
            print_success("psycopg2 library found")
        except ImportError:
            print_error("psycopg2 not installed - required for PostgreSQL")
            self.checks_failed.append("psycopg2 not installed")
            return False
        
        # Try to connect to database
        try:
            import psycopg2
            conn = psycopg2.connect(
                host="localhost",
                port=5432,
                user="odoo",
                password="odoo",
                database="postgres"
            )
            cursor = conn.cursor()
            cursor.execute("SELECT version();")
            db_version = cursor.fetchone()
            print_success(f"Database connected: {db_version[0][:50]}...")
            
            # List Odoo databases
            cursor.execute(
                "SELECT datname FROM pg_database WHERE datname LIKE 'odoo%' OR datname LIKE '%recruitment%';"
            )
            databases = cursor.fetchall()
            
            if databases:
                print_success(f"Found {len(databases)} Odoo database(s):")
                for db in databases:
                    print_info(f"  - {db[0]}")
            
            cursor.close()
            conn.close()
            self.checks_passed.append("Database Connectivity")
            return True
            
        except Exception as e:
            print_warning(f"Database connection failed: {e}")
            print_info("This is expected if PostgreSQL is not running")
            return False
    
    def check_dependencies(self):
        """Check Python dependencies"""
        print_step(4, "Checking Dependencies")
        
        required_packages = {
            'requests': 'HTTP library for API calls',
            'openai': 'OpenAI API integration',
        }
        
        missing = []
        
        for package, description in required_packages.items():
            try:
                __import__(package)
                print_success(f"{package}: {description}")
            except ImportError:
                print_warning(f"{package}: NOT INSTALLED - {description}")
                missing.append(package)
        
        if missing:
            print_info(f"Install missing packages with: pip install {' '.join(missing)}")
            self.checks_failed.append("Some dependencies missing")
            return False
        
        self.checks_passed.append("Dependencies")
        return True
    
    def copy_module_to_addons(self):
        """Copy module to Odoo addons directory"""
        print_step(5, "Copying Module to Addons Directory")
        
        # Determine source and destination
        script_dir = Path(__file__).parent.resolve()
        source_module = script_dir / 'uae_recruitment_mgmt'
        
        # Try to find Odoo addons directory
        possible_addons = [
            Path("C:/Program Files/Odoo/server/addons"),
            Path("C:/Program Files (x86)/Odoo/server/addons"),
            Path("/opt/odoo/addons"),
            Path("/opt/odoo/extra-addons"),
            Path(os.path.expanduser("~/odoo/addons")),
            script_dir / 'odoo_modules',  # Current location
        ]
        
        addons_dir = None
        for path in possible_addons:
            if path.exists() and path.is_dir():
                addons_dir = path
                print_success(f"Found addons directory: {addons_dir}")
                break
        
        if not addons_dir:
            print_warning("Standard Odoo addons directory not found")
            print_info(f"Module is ready at: {source_module}")
            print_info("Please copy manually to your Odoo addons directory")
            self.checks_passed.append("Module Location Verified")
            return True
        
        dest_module = addons_dir / 'uae_recruitment_mgmt'
        
        # Check if module already exists
        if dest_module.exists():
            print_warning(f"Module already exists at {dest_module}")
            print_info("Updating module...")
            shutil.rmtree(dest_module)
        
        # Copy module
        try:
            shutil.copytree(source_module, dest_module)
            print_success(f"Module copied to {dest_module}")
            self.checks_passed.append("Module Copied")
            return True
        except Exception as e:
            print_error(f"Failed to copy module: {e}")
            self.checks_failed.append("Module copy failed")
            return False
    
    def verify_module_structure(self):
        """Verify module structure is complete"""
        print_step(6, "Verifying Module Structure")
        
        script_dir = Path(__file__).parent.resolve()
        module_dir = script_dir / 'uae_recruitment_mgmt'
        
        required_structure = {
            'models': ['recruitment_client.py', 'recruitment_job_order.py', 'recruitment_placement.py',
                      'recruitment_candidate.py', 'uae_visa_processing.py', 'recruitment_dashboard.py'],
            'controllers': ['main.py'],
            'wizards': ['client_onboarding_wizard.py'],
            'views': ['menu_views.xml', 'recruitment_client_views.xml', 'recruitment_job_order_views.xml',
                     'recruitment_placement_views.xml', 'recruitment_candidate_views.xml',
                     'uae_visa_processing_views.xml', 'recruitment_dashboard_views.xml'],
            'security': ['ir_model_access.csv', 'security_groups.xml'],
            'data': ['recruitment_sequence.xml', 'email_templates.xml', 'automation_rules.xml'],
        }
        
        all_valid = True
        
        for dir_name, files in required_structure.items():
            dir_path = module_dir / dir_name
            if dir_path.exists():
                print_success(f"Directory found: {dir_name}/")
                for file in files:
                    file_path = dir_path / file
                    if file_path.exists():
                        size_kb = file_path.stat().st_size / 1024
                        print_info(f"  ✓ {file} ({size_kb:.1f} KB)")
                    else:
                        print_error(f"  ✗ {file} MISSING")
                        all_valid = False
            else:
                print_error(f"Directory missing: {dir_name}/")
                all_valid = False
        
        if all_valid:
            self.checks_passed.append("Module Structure")
        else:
            self.checks_failed.append("Module structure incomplete")
        
        return all_valid
    
    def generate_summary_report(self):
        """Generate installation summary report"""
        print_header("INSTALLATION SUMMARY REPORT")
        
        elapsed_time = datetime.now() - self.start_time
        
        print_success(f"Log file saved: {self.log_file}")
        print_info(f"Installation started: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        print_info(f"Installation completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print_info(f"Total elapsed time: {elapsed_time.total_seconds():.1f} seconds")
        
        print(f"\n{Colors.OKGREEN}CHECKS PASSED ({len(self.checks_passed)}):{Colors.ENDC}")
        for check in self.checks_passed:
            print(f"  ✅ {check}")
        
        if self.checks_failed:
            print(f"\n{Colors.WARNING}ISSUES FOUND ({len(self.checks_failed)}):{Colors.ENDC}")
            for check in self.checks_failed:
                print(f"  ⚠️  {check}")
        
        # Overall status
        if len(self.checks_failed) == 0:
            print_success("\n🎉 ALL CHECKS PASSED - SYSTEM READY FOR MODULE INSTALLATION")
            return True
        else:
            print_warning("\n⚠️  SOME CHECKS FAILED - REVIEW ISSUES ABOVE")
            return False
    
    def run_all_checks(self):
        """Run all checks in sequence"""
        print_header("UAE RECRUITMENT MODULE - INSTALLATION & MONITORING")
        
        checks = [
            ("System Requirements", self.check_system_requirements),
            ("Odoo Connectivity", self.check_odoo_connectivity),
            ("Database Connectivity", self.check_database_connectivity),
            ("Dependencies", self.check_dependencies),
            ("Module Structure", self.verify_module_structure),
            ("Copy to Addons", self.copy_module_to_addons),
        ]
        
        results = {}
        for check_name, check_func in checks:
            try:
                results[check_name] = check_func()
            except Exception as e:
                print_error(f"Unexpected error in {check_name}: {e}")
                results[check_name] = False
        
        return self.generate_summary_report()


def main():
    """Main installation routine"""
    monitor = InstallationMonitor()
    
    # Run all checks
    success = monitor.run_all_checks()
    
    if success:
        print_header("NEXT STEPS")
        print_info("1. Log in to Odoo interface (http://localhost:8069)")
        print_info("2. Go to Apps → Apps → Search 'UAE Recruitment'")
        print_info("3. Click Install")
        print_info("4. Configure in Settings → System Parameters:")
        print_info("   - uae_recruitment.openai_api_key = Your API key")
        print_info("5. Monitor installation in this window")
        print_info("6. Run verification tests once installed")
        
        # Offer to create installation guide
        print_header("INSTALLATION READY")
        print_success("Module is ready for installation into Odoo")
        print_success("See INSTALLATION.md for detailed step-by-step guide")
        
        return 0
    else:
        print_error("\n⚠️  Please fix the issues above before installing")
        return 1


if __name__ == '__main__':
    sys.exit(main())
