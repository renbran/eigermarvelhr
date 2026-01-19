#!/usr/bin/env python3
"""
Real-time Installation Monitor
Continuously monitors Odoo module installation and database changes
"""

import time
import subprocess
import json
import os
from pathlib import Path
from datetime import datetime

class RealtimeMonitor:
    """Monitors installation in real-time with health checks"""
    
    def __init__(self, log_file="installation_monitor.log"):
        self.log_file = log_file
        self.start_time = datetime.now()
        self.metrics = {
            'checks_passed': 0,
            'checks_failed': 0,
            'warnings': 0,
            'database_tables_created': 0,
            'views_loaded': 0,
            'models_registered': 0,
        }
    
    def log_event(self, level, message):
        """Log event with timestamp"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]
        log_entry = f"[{timestamp}] [{level:8}] {message}"
        
        # Color codes
        colors = {
            'INFO': '\033[94m',
            'SUCCESS': '\033[92m',
            'WARNING': '\033[93m',
            'ERROR': '\033[91m',
            'DEBUG': '\033[96m',
        }
        
        color = colors.get(level, '\033[0m')
        reset = '\033[0m'
        
        print(f"{color}{log_entry}{reset}")
        
        with open(self.log_file, 'a') as f:
            f.write(log_entry + "\n")
    
    def check_postgres_status(self):
        """Check PostgreSQL service status"""
        self.log_event('INFO', "Checking PostgreSQL status...")
        
        try:
            # Try to connect to PostgreSQL
            import psycopg2
            try:
                conn = psycopg2.connect(
                    host="localhost",
                    port=5432,
                    user="odoo",
                    password="odoo",
                    database="postgres"
                )
                cursor = conn.cursor()
                cursor.execute("SELECT version();")
                version = cursor.fetchone()[0].split()[1]
                cursor.close()
                conn.close()
                
                self.log_event('SUCCESS', f"PostgreSQL is running (version {version})")
                self.metrics['checks_passed'] += 1
                return True
            except Exception as e:
                self.log_event('WARNING', f"PostgreSQL connection failed: {e}")
                self.metrics['checks_failed'] += 1
                return False
        except ImportError:
            self.log_event('ERROR', "psycopg2 not installed")
            self.metrics['checks_failed'] += 1
            return False
    
    def check_odoo_service(self):
        """Check if Odoo service is running"""
        self.log_event('INFO', "Checking Odoo service status...")
        
        try:
            import socket
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(3)
            result = sock.connect_ex(('localhost', 8069))
            sock.close()
            
            if result == 0:
                self.log_event('SUCCESS', "Odoo service is running on :8069")
                self.metrics['checks_passed'] += 1
                return True
            else:
                self.log_event('WARNING', "Odoo service not responding on :8069")
                self.log_event('INFO', "Start Odoo: python odoo-bin -c odoo.conf -d odoo")
                self.metrics['checks_failed'] += 1
                return False
        except Exception as e:
            self.log_event('ERROR', f"Service check failed: {e}")
            self.metrics['checks_failed'] += 1
            return False
    
    def check_module_installation(self):
        """Check if module is installed in Odoo"""
        self.log_event('INFO', "Checking module installation status...")
        
        # This would require OdooRPC or XML-RPC connection
        # For now, we'll check the module directory
        module_path = Path("D:/01_WORK_PROJECTS/EM WEBSITE/eiger-marvel-hr-plat/odoo_modules/uae_recruitment_mgmt")
        
        if module_path.exists():
            manifest_path = module_path / '__manifest__.py'
            if manifest_path.exists():
                self.log_event('SUCCESS', f"Module found at {module_path}")
                self.metrics['checks_passed'] += 1
                return True
        
        self.log_event('WARNING', f"Module not found at expected location")
        self.metrics['checks_failed'] += 1
        return False
    
    def check_database_tables(self):
        """Check if module tables are created in database"""
        self.log_event('INFO', "Checking database tables...")
        
        try:
            import psycopg2
            conn = psycopg2.connect(
                host="localhost",
                port=5432,
                user="odoo",
                password="odoo",
                database="odoo"  # Main Odoo database
            )
            cursor = conn.cursor()
            
            # Tables expected from our module
            expected_tables = [
                'recruitment_client',
                'recruitment_job_order',
                'recruitment_placement',
                'uae_visa_processing',
                'recruitment_dashboard',
            ]
            
            cursor.execute("""
                SELECT table_name FROM information_schema.tables 
                WHERE table_schema = 'public'
            """)
            
            existing_tables = [row[0] for row in cursor.fetchall()]
            
            found_tables = []
            missing_tables = []
            
            for table in expected_tables:
                if table in existing_tables:
                    found_tables.append(table)
                    self.log_event('SUCCESS', f"Table exists: {table}")
                    self.metrics['database_tables_created'] += 1
                else:
                    missing_tables.append(table)
                    self.log_event('DEBUG', f"Table not yet created: {table}")
            
            cursor.close()
            conn.close()
            
            if missing_tables:
                self.log_event('WARNING', f"Missing {len(missing_tables)} tables (will be created on install)")
            
            self.metrics['checks_passed'] += 1
            return len(found_tables) > 0
            
        except Exception as e:
            self.log_event('WARNING', f"Could not check database tables: {e}")
            self.metrics['checks_failed'] += 1
            return False
    
    def monitor_odoo_logs(self, lines=20):
        """Monitor recent Odoo logs"""
        self.log_event('INFO', "Checking Odoo logs for errors...")
        
        log_paths = [
            Path("C:/Program Files/Odoo/server/odoo.log"),
            Path(os.path.expanduser("~/.odoo/odoo.log")),
            Path("/var/log/odoo/odoo.log"),
        ]
        
        for log_path in log_paths:
            if log_path.exists():
                try:
                    with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
                        all_lines = f.readlines()
                        recent_lines = all_lines[-lines:]
                    
                    self.log_event('INFO', f"Recent log entries from {log_path}:")
                    
                    for line in recent_lines:
                        line = line.rstrip()
                        if 'ERROR' in line:
                            self.log_event('ERROR', f"  {line}")
                        elif 'WARNING' in line:
                            self.log_event('WARNING', f"  {line}")
                        elif 'CRITICAL' in line:
                            self.log_event('ERROR', f"  {line}")
                    
                    return True
                except Exception as e:
                    self.log_event('WARNING', f"Could not read logs: {e}")
                    return False
        
        self.log_event('INFO', "No Odoo log file found (this is OK for first-time setup)")
        return True
    
    def generate_health_report(self):
        """Generate system health report"""
        self.log_event('INFO', "\n" + "="*80)
        self.log_event('INFO', "SYSTEM HEALTH REPORT")
        self.log_event('INFO', "="*80)
        
        elapsed = (datetime.now() - self.start_time).total_seconds()
        
        self.log_event('INFO', f"Monitoring duration: {elapsed:.1f} seconds")
        self.log_event('INFO', f"Checks passed: {self.metrics['checks_passed']}")
        self.log_event('INFO', f"Checks failed: {self.metrics['checks_failed']}")
        self.log_event('INFO', f"Warnings: {self.metrics['warnings']}")
        
        if self.metrics['database_tables_created'] > 0:
            self.log_event('SUCCESS', f"Database tables created: {self.metrics['database_tables_created']}")
        
        self.log_event('INFO', f"Log file: {self.log_file}")
        self.log_event('INFO', "="*80 + "\n")
    
    def run_continuous_monitoring(self, duration_seconds=300, interval_seconds=10):
        """Run continuous monitoring for specified duration"""
        self.log_event('INFO', f"Starting continuous monitoring for {duration_seconds}s...")
        self.log_event('INFO', f"Health checks every {interval_seconds}s\n")
        
        start_time = time.time()
        check_count = 0
        
        while time.time() - start_time < duration_seconds:
            check_count += 1
            
            self.log_event('DEBUG', f"\n--- Health Check #{check_count} ---")
            
            # Run all checks
            postgres_ok = self.check_postgres_status()
            odoo_ok = self.check_odoo_service()
            module_ok = self.check_module_installation()
            tables_ok = self.check_database_tables()
            logs_ok = self.monitor_odoo_logs(lines=5)
            
            # Summary for this iteration
            all_ok = postgres_ok and odoo_ok and module_ok
            status = "🟢 HEALTHY" if all_ok else "🟡 NEEDS ATTENTION"
            self.log_event('INFO', f"Overall Status: {status}\n")
            
            # Wait before next check
            if time.time() - start_time < duration_seconds:
                wait_time = min(interval_seconds, duration_seconds - (time.time() - start_time))
                self.log_event('DEBUG', f"Next check in {wait_time:.0f}s...\n")
                time.sleep(wait_time)
        
        self.generate_health_report()


def main():
    """Main monitoring routine"""
    monitor = RealtimeMonitor()
    
    # Run continuous monitoring for 5 minutes with 10-second intervals
    print("\n" + "="*80)
    print("  ODOO MODULE INSTALLATION MONITOR - Starting")
    print("="*80 + "\n")
    
    monitor.run_continuous_monitoring(duration_seconds=300, interval_seconds=10)
    
    print("\n✅ Monitoring complete. Check 'installation_monitor.log' for details.\n")


if __name__ == '__main__':
    main()
