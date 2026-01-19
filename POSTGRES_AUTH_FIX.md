# PostgreSQL Authentication Error Fix

## Error Details
```
psycopg2.OperationalError: connection to server on socket "/var/run/postgresql/.s.PGSQL.5432"
failed: FATAL: Peer authentication failed for user "odoo"
```

## Problem
PostgreSQL is configured to use "peer" authentication instead of password authentication for the `odoo` user.

---

## Solution Steps

### Option 1: Fix PostgreSQL Authentication (Recommended)

#### Step 1: Edit PostgreSQL Configuration
```bash
# SSH into your server
ssh root@65.20.72.53

# Edit pg_hba.conf file
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

#### Step 2: Change Authentication Method
Find the line that looks like:
```conf
# OLD (causes the error)
local   all             odoo                                    peer
```

Change it to:
```conf
# NEW (allows password authentication)
local   all             odoo                                    md5
```

Or change this line:
```conf
# OLD
local   all             all                                     peer
```

To:
```conf
# NEW
local   all             all                                     md5
```

#### Step 3: Restart PostgreSQL
```bash
sudo systemctl restart postgresql
# or
sudo service postgresql restart
```

#### Step 4: Restart Odoo
```bash
sudo systemctl restart odoo
# or
sudo service odoo restart
```

---

### Option 2: Create PostgreSQL User with Proper Permissions

```bash
# Switch to postgres user
sudo su - postgres

# Access PostgreSQL
psql

# Create odoo user with password
CREATE USER odoo WITH CREATEDB PASSWORD 'your_secure_password';

# Grant privileges
ALTER USER odoo CREATEDB;
ALTER USER odoo WITH SUPERUSER;

# Exit psql
\q

# Exit postgres user
exit
```

---

### Option 3: Quick Fix - Use Odoo Configuration

Edit your Odoo configuration file:

```bash
sudo nano /etc/odoo/odoo.conf
```

Update these settings:
```ini
[options]
db_host = localhost
db_port = 5432
db_user = odoo
db_password = your_odoo_db_password
db_name = eigermarvel
```

Then restart Odoo:
```bash
sudo systemctl restart odoo
```

---

## Verification Steps

### 1. Test PostgreSQL Connection
```bash
# Test connection with password
psql -U odoo -h localhost -d postgres
# Enter password when prompted
```

### 2. Check Odoo Logs
```bash
sudo tail -f /var/log/odoo/odoo-server.log
```

### 3. Test Database Creation
```bash
# Try creating a test database
sudo su - odoo -s /bin/bash
createdb -U odoo test_db
dropdb -U odoo test_db
exit
```

---

## Common pg_hba.conf Configuration

Here's a recommended pg_hba.conf configuration:

```conf
# PostgreSQL Client Authentication Configuration File
# ===================================================

# TYPE  DATABASE        USER            ADDRESS                 METHOD

# "local" is for Unix domain socket connections only
local   all             postgres                                peer
local   all             odoo                                    md5
local   all             all                                     md5

# IPv4 local connections:
host    all             all             127.0.0.1/32            md5

# IPv6 local connections:
host    all             all             ::1/128                 md5

# Allow replication connections from localhost
local   replication     all                                     peer
host    replication     all             127.0.0.1/32            md5
host    replication     all             ::1/128                 md5
```

---

## If Problem Persists

### Check PostgreSQL Status
```bash
sudo systemctl status postgresql
```

### Check PostgreSQL Version
```bash
psql --version
```

### Find pg_hba.conf Location
```bash
sudo find /etc/postgresql -name pg_hba.conf
# or
sudo -u postgres psql -c "SHOW hba_file;"
```

### Check Odoo User Exists
```bash
sudo -u postgres psql -c "\du"
```

---

## Security Notes

1. **Never use `trust` authentication** in production
2. **Use strong passwords** for database users
3. **Limit connections** to localhost only for security
4. **Backup your database** before making changes:
   ```bash
   sudo su - postgres
   pg_dump eigermarvel > /tmp/eigermarvel_backup_$(date +%Y%m%d).sql
   ```

---

## Module Installation After Fix

Once PostgreSQL is working:

```bash
# Update module list
sudo -u odoo odoo-bin -c /etc/odoo/odoo.conf -d eigermarvel -u uae_recruitment_mgmt --stop-after-init

# Or restart Odoo normally
sudo systemctl restart odoo
```

---

## Quick Command Reference

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Restart services
sudo systemctl restart postgresql
sudo systemctl restart odoo

# View logs
sudo tail -f /var/log/odoo/odoo-server.log
sudo tail -f /var/log/postgresql/postgresql-*.log

# Test database connection
psql -U odoo -h localhost -d eigermarvel
```

---

**Priority:** HIGH - Fix this before deploying UI improvements
**Estimated Time:** 5-10 minutes
**Risk Level:** Low (only affects authentication, not data)
