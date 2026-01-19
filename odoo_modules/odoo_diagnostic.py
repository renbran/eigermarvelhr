#!/usr/bin/env python3
"""
Odoo Environment Diagnostic Tool
Comprehensive system analysis and troubleshooting
"""

import os
import sys
import json
import subprocess
from pathlib import Path
from datetime import datetime

class OdooDiagnostics:
    """Diagnose Odoo environment and module readiness"""
    
    def __init__(self):
        self.report = {
            'timestamp': datetime.now().isoformat(),
            'diagnostics': {},
            'recommendations': [],
        }
    
    def add_diagnostic(self, category, name, status, details=""):
        """Add a diagnostic result"""
        if category not in self.report['diagnostics']:
            self.report['diagnostics'][category] = []
        
        self.report['diagnostics'][category].append({
            'name': name,
            'status': status,
            'details': details,
        })
    
    def check_python_environment(self):
        """Check Python setup"""
        print("\n" + "="*80)
        print("PYTHON ENVIRONMENT")
        print("="*80)
        
        # Python version
        version = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
        print(f"Python Version: {version}")
        self.add_diagnostic('Python', 'Version', '✅' if sys.version_info >= (3, 8) else '❌', version)
        
        # Executable
        print(f"Python Executable: {sys.executable}")
        
        # Installed packages
        print("\nKey Python Packages:")
        packages = ['odoo', 'psycopg2', 'requests', 'openai', 'pillow', 'werkzeug']
        
        for package in packages:
            try:
                __import__(package)
                print(f"  ✅ {package}")
                self.add_diagnostic('Python Packages', package, '✅', 'Installed')
            except ImportError:
                print(f"  ❌ {package}")
                self.add_diagnostic('Python Packages', package, '❌', 'Not installed')
    
    def check_odoo_installation(self):
        """Check Odoo installation"""
        print("\n" + "="*80)
        print("ODOO INSTALLATION")
        print("="*80)
        
        odoo_paths = [
            Path("C:/Program Files/Odoo"),
            Path("C:/Program Files (x86)/Odoo"),
            Path("/opt/odoo"),
            Path(os.path.expanduser("~/odoo")),
        ]
        
        odoo_found = None
        for path in odoo_paths:
            if path.exists():
                odoo_found = path
                print(f"✅ Odoo Installation: {path}")
                self.add_diagnostic('Odoo', 'Installation Path', '✅', str(path))
                
                # Check addons
                addons_paths = [
                    path / 'server' / 'addons',
                    path / 'addons',
                    path / 'extra-addons',
                ]
                
                for addons_path in addons_paths:
                    if addons_path.exists():
                        addon_count = len(list(addons_path.glob('*/')) - 1)
                        print(f"  - Addons dir: {addons_path} ({addon_count} modules)")
                        self.add_diagnostic('Odoo', f'Addons: {addons_path.name}', '✅', f'{addon_count} modules')
                break
        
        if not odoo_found:
            print("❌ Odoo Installation: Not found")
            self.add_diagnostic('Odoo', 'Installation', '❌', 'Not found in standard locations')
            print("\nTry installing: pip install odoo")
    
    def check_database_setup(self):
        """Check database configuration"""
        print("\n" + "="*80)
        print("DATABASE SETUP")
        print("="*80)
        
        # Check PostgreSQL
        try:
            import psycopg2
            print("✅ psycopg2: Installed")
            self.add_diagnostic('Database', 'PostgreSQL Driver', '✅', 'psycopg2 installed')
            
            # Try connection
            try:
                conn = psycopg2.connect(
                    host="localhost",
                    port=5432,
                    user="postgres",
                    password="postgres",
                    database="postgres",
                    connect_timeout=3,
                )
                cursor = conn.cursor()
                cursor.execute("SELECT version();")
                version = cursor.fetchone()[0].split()[1]
                cursor.close()
                conn.close()
                
                print(f"✅ PostgreSQL Connected: localhost:5432 (v{version})")
                self.add_diagnostic('Database', 'PostgreSQL Connection', '✅', f'v{version}')
                
                # Check Odoo database
                try:
                    conn = psycopg2.connect(
                        host="localhost",
                        port=5432,
                        user="odoo",
                        password="odoo",
                        database="odoo",
                        connect_timeout=3,
                    )
                    cursor = conn.cursor()
                    
                    # List tables from our module
                    cursor.execute("""
                        SELECT COUNT(*) FROM information_schema.tables 
                        WHERE table_schema = 'public' AND table_name LIKE 'recruitment%'
                    """)
                    count = cursor.fetchone()[0]
                    
                    print(f"✅ Odoo Database: Connected ({count} recruitment tables)")
                    self.add_diagnostic('Database', 'Odoo Database', '✅', f'{count} module tables')
                    
                    cursor.close()
                    conn.close()
                except psycopg2.OperationalError as e:
                    print(f"⚠️  Odoo Database: Not found or not accessible")
                    self.add_diagnostic('Database', 'Odoo Database', '⚠️', str(e)[:50])
                    
            except psycopg2.OperationalError as e:
                print(f"⚠️  PostgreSQL: Connection failed")
                print(f"     {e}")
                self.add_diagnostic('Database', 'PostgreSQL Connection', '⚠️', 'Connection refused')
        
        except ImportError:
            print("❌ psycopg2: Not installed")
            self.add_diagnostic('Database', 'PostgreSQL Driver', '❌', 'psycopg2 not installed')
    
    def check_module_structure(self):
        """Check module structure"""
        print("\n" + "="*80)
        print("MODULE STRUCTURE")
        print("="*80)
        
        module_path = Path("D:/01_WORK_PROJECTS/EM WEBSITE/eiger-marvel-hr-plat/odoo_modules/uae_recruitment_mgmt")
        
        if not module_path.exists():
            print(f"❌ Module not found: {module_path}")
            self.add_diagnostic('Module', 'Location', '❌', 'Not found')
            return
        
        print(f"✅ Module found: {module_path}")
        self.add_diagnostic('Module', 'Location', '✅', str(module_path))
        
        # Check structure
        dirs = ['models', 'controllers', 'views', 'security', 'data', 'wizards']
        for dir_name in dirs:
            dir_path = module_path / dir_name
            if dir_path.exists():
                file_count = len(list(dir_path.glob('*')))
                print(f"  ✅ {dir_name}/: {file_count} files")
                self.add_diagnostic('Module Structure', dir_name, '✅', f'{file_count} files')
            else:
                print(f"  ❌ {dir_name}/: Missing")
                self.add_diagnostic('Module Structure', dir_name, '❌', 'Missing')
        
        # Check manifest
        manifest = module_path / '__manifest__.py'
        if manifest.exists():
            print(f"  ✅ __manifest__.py: {manifest.stat().st_size} bytes")
            self.add_diagnostic('Module', 'Manifest', '✅', 'Present')
    
    def check_file_permissions(self):
        """Check file permissions"""
        print("\n" + "="*80)
        print("FILE PERMISSIONS")
        print("="*80)
        
        module_path = Path("D:/01_WORK_PROJECTS/EM WEBSITE/eiger-marvel-hr-plat/odoo_modules/uae_recruitment_mgmt")
        
        if not module_path.exists():
            print("Module path not found")
            return
        
        # Check if we can read/write
        manifest = module_path / '__manifest__.py'
        try:
            with open(manifest, 'r') as f:
                f.read(10)
            print(f"✅ Read permissions: OK")
            self.add_diagnostic('Permissions', 'Read', '✅', 'Module readable')
        except PermissionError:
            print(f"❌ Read permissions: Denied")
            self.add_diagnostic('Permissions', 'Read', '❌', 'Permission denied')
        
        # Check write
        try:
            test_file = module_path / '.write_test'
            with open(test_file, 'w') as f:
                f.write('test')
            test_file.unlink()
            print(f"✅ Write permissions: OK")
            self.add_diagnostic('Permissions', 'Write', '✅', 'Module writable')
        except PermissionError:
            print(f"❌ Write permissions: Denied")
            self.add_diagnostic('Permissions', 'Write', '❌', 'Permission denied')
    
    def check_service_ports(self):
        """Check required service ports"""
        print("\n" + "="*80)
        print("SERVICE PORTS")
        print("="*80)
        
        import socket
        
        services = {
            'PostgreSQL': ('localhost', 5432),
            'Odoo': ('localhost', 8069),
        }
        
        for service_name, (host, port) in services.items():
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(2)
                result = sock.connect_ex((host, port))
                sock.close()
                
                if result == 0:
                    print(f"✅ {service_name}: {host}:{port} (accessible)")
                    self.add_diagnostic('Ports', service_name, '✅', f'{host}:{port}')
                else:
                    print(f"⚠️  {service_name}: {host}:{port} (not accessible)")
                    self.add_diagnostic('Ports', service_name, '⚠️', f'Port not responding')
            except Exception as e:
                print(f"❌ {service_name}: Error checking port {port}")
                self.add_diagnostic('Ports', service_name, '❌', str(e)[:50])
    
    def check_dependencies(self):
        """Check external dependencies"""
        print("\n" + "="*80)
        print("EXTERNAL DEPENDENCIES")
        print("="*80)
        
        # Check internet connectivity
        try:
            import urllib.request
            urllib.request.urlopen('https://api.openai.com/v1/models', timeout=3)
            print("✅ Internet: Connected")
            self.add_diagnostic('Connectivity', 'Internet', '✅', 'OpenAI API reachable')
        except Exception as e:
            print("⚠️  Internet: Limited connectivity")
            self.add_diagnostic('Connectivity', 'Internet', '⚠️', 'Some APIs may be unreachable')
    
    def generate_report(self):
        """Generate HTML and JSON report"""
        print("\n" + "="*80)
        print("GENERATING DIAGNOSTIC REPORT")
        print("="*80)
        
        # Save JSON report
        report_file = f"diagnostic_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w') as f:
            json.dump(self.report, f, indent=2)
        
        print(f"✅ Report saved: {report_file}")
        
        # Generate recommendations
        print("\nRECOMMENDATIONS:")
        
        if any(d['status'] == '❌' for cat in self.report['diagnostics'].values() for d in cat):
            print("⚠️  Some critical components are missing or not working:")
            
            for category, diagnostics in self.report['diagnostics'].items():
                for diag in diagnostics:
                    if diag['status'] == '❌':
                        if 'PostgreSQL' in diag['name']:
                            print("  1. Start PostgreSQL: net start PostgreSQL-14")
                        elif 'Odoo' in diag['name']:
                            print("  2. Start Odoo: python odoo-bin -c odoo.conf")
                        elif 'psycopg2' in diag['name']:
                            print("  3. Install psycopg2: pip install psycopg2-binary")
        
        if any(d['status'] == '⚠️' for cat in self.report['diagnostics'].values() for d in cat):
            print("ℹ️  Some services are not responding (this is expected before installation)")
        
        print("\nNext steps:")
        print("  1. Review this diagnostic report")
        print("  2. Start PostgreSQL and Odoo services")
        print("  3. Run: python realtime_monitor.py")
        print("  4. Follow: DATABASE_BACKEND_SETUP.md")
    
    def run_full_diagnostic(self):
        """Run complete diagnostic"""
        print("\n" + "🔍 ODOO ENVIRONMENT DIAGNOSTIC TOOL")
        print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        
        self.check_python_environment()
        self.check_odoo_installation()
        self.check_database_setup()
        self.check_module_structure()
        self.check_file_permissions()
        self.check_service_ports()
        self.check_dependencies()
        self.generate_report()
        
        print("\n" + "="*80)
        print("DIAGNOSTIC COMPLETE")
        print("="*80 + "\n")


def main():
    """Main diagnostic routine"""
    diagnostics = OdooDiagnostics()
    diagnostics.run_full_diagnostic()


if __name__ == '__main__':
    main()
