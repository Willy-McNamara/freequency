# Audit of Existing Monitoring and Cleanup Setup

## Commands to Audit What Was Previously Set Up

Run these commands on your EC2 instance to get a complete picture:

### 1. Check All Cron Jobs

```bash
# Check user cron jobs
echo "=== User Cron Jobs ==="
crontab -l

# Check root cron jobs
echo "=== Root Cron Jobs ==="
sudo crontab -l

# Check system-wide cron jobs
echo "=== System Cron Jobs (/etc/crontab) ==="
cat /etc/crontab

# Check cron.d directory
echo "=== Cron.d Files ==="
ls -la /etc/cron.d/ 2>/dev/null

# Check all cron.d files
for file in /etc/cron.d/*; do
    if [ -f "$file" ]; then
        echo "=== $file ==="
        cat "$file"
        echo ""
    fi
done

# Check anacron jobs
echo "=== Anacron Jobs ==="
cat /etc/anacrontab 2>/dev/null || echo "No anacrontab found"
```

### 2. Check Cron Execution Logs

```bash
# Check cron service status
echo "=== Cron Service Status ==="
sudo systemctl status cron --no-pager

# Check cron logs (Ubuntu/Debian)
echo "=== Recent Cron Log Entries ==="
sudo grep CRON /var/log/syslog | tail -50

# Or check auth.log for cron
echo "=== Cron Entries from Auth Log ==="
sudo grep CRON /var/log/auth.log | tail -30

# Check for specific script executions in logs
echo "=== Log Upload Script Executions ==="
sudo grep -i "run-log-upload\|log-upload\|upload-logs" /var/log/syslog | tail -30

echo "=== System Cleanup Script Executions ==="
sudo grep -i "system-cleanup\|cleanup" /var/log/syslog | tail -30
```

### 3. Review Existing Scripts

```bash
cd /home/ubuntu

# Check all scripts
echo "=== All Scripts in /home/ubuntu ==="
ls -lah *.sh 2>/dev/null

# Check permissions
echo "=== Script Permissions ==="
ls -la run-log-upload.sh system-cleanup.sh

# View script contents (you already saw these, but here for reference)
echo "=== run-log-upload.sh ==="
cat run-log-upload.sh

echo ""
echo "=== system-cleanup.sh ==="
cat system-cleanup.sh
```

### 4. Check Log Files for Execution History

```bash
cd /home/ubuntu

# Check log-upload.log for execution history
echo "=== Log Upload Execution History ==="
head -20 log-upload.log
echo "..."
tail -50 log-upload.log

# Check system-cleanup.log
echo ""
echo "=== System Cleanup Execution History ==="
if [ -f system-cleanup.log ]; then
    head -20 system-cleanup.log
    echo "..."
    tail -50 system-cleanup.log
else
    echo "No system-cleanup.log found"
fi

# Count log upload executions
echo ""
echo "=== Log Upload Execution Count ==="
wc -l log-upload.log 2>/dev/null || echo "No log file"

# Check when last successful upload was
echo ""
echo "=== Last Successful Log Upload ==="
grep -i "success\|completed" log-upload.log | tail -5

# Check for errors
echo ""
echo "=== Log Upload Errors ==="
grep -i "error\|fail" log-upload.log | tail -10
```

### 5. Check Script Execution Times and Failures

```bash
# Find all execution timestamps in log-upload.log
echo "=== Log Upload Execution Timeline ==="
grep -E "^\[|Found container|ERROR|successfully" log-upload.log | tail -30

# Check for container not found errors
echo ""
echo "=== Container Not Found Errors ==="
grep -i "container.*not found\|no container" log-upload.log | tail -10

# Check when container stopped being available
echo ""
echo "=== Container Availability Timeline ==="
grep -E "Found container|ERROR.*No container" log-upload.log | tail -20
```

### 6. Check When Services Stopped Working

```bash
# Find last successful log upload date
echo "=== Last Successful Log Upload ==="
grep -i "successfully\|completed" log-upload.log | tail -1

# Find first failure after that
echo ""
echo "=== First Failure After Success ==="
grep -i "error\|fail\|not found" log-upload.log | head -5

# Check when container stopped being found
echo ""
echo "=== Container Detection Timeline ==="
grep "Found container\|ERROR.*container" log-upload.log | tail -20
```

### 7. Comprehensive Audit Script

Save this as `audit-monitoring.sh` and run it:

```bash
#!/bin/bash
echo "================================================"
echo "COMPREHENSIVE MONITORING AUDIT"
echo "================================================"
echo ""

echo "1. USER CRON JOBS"
echo "----------------------------------------"
crontab -l 2>/dev/null || echo "No user cron jobs"
echo ""

echo "2. ROOT CRON JOBS"
echo "----------------------------------------"
sudo crontab -l 2>/dev/null || echo "No root cron jobs"
echo ""

echo "3. SYSTEM CRON JOBS"
echo "----------------------------------------"
cat /etc/crontab 2>/dev/null || echo "No system crontab"
echo ""

echo "4. CRON.D FILES"
echo "----------------------------------------"
ls -la /etc/cron.d/ 2>/dev/null
for file in /etc/cron.d/*; do
    if [ -f "$file" ] && [ ! -z "$(cat "$file" 2>/dev/null)" ]; then
        echo "--- $file ---"
        cat "$file"
        echo ""
    fi
done

echo "5. CRON SERVICE STATUS"
echo "----------------------------------------"
sudo systemctl status cron --no-pager | head -10
echo ""

echo "6. RECENT CRON EXECUTIONS (last 50)"
echo "----------------------------------------"
sudo grep CRON /var/log/syslog 2>/dev/null | tail -50 || echo "No cron logs found"
echo ""

echo "7. EXISTING SCRIPTS"
echo "----------------------------------------"
cd /home/ubuntu
ls -lah *.sh 2>/dev/null || echo "No .sh files found"
echo ""

echo "8. LOG UPLOAD EXECUTIONS (last 20)"
echo "----------------------------------------"
if [ -f log-upload.log ]; then
    tail -20 log-upload.log
else
    echo "No log-upload.log found"
fi
echo ""

echo "9. SYSTEM CLEANUP EXECUTIONS (last 20)"
echo "----------------------------------------"
if [ -f system-cleanup.log ]; then
    tail -20 system-cleanup.log
else
    echo "No system-cleanup.log found"
fi
echo ""

echo "10. LOG UPLOAD ERRORS"
echo "----------------------------------------"
if [ -f log-upload.log ]; then
    grep -i "error\|fail" log-upload.log | tail -10 || echo "No errors found"
else
    echo "No log-upload.log found"
fi
echo ""

echo "11. CONTAINER DETECTION HISTORY"
echo "----------------------------------------"
if [ -f log-upload.log ]; then
    grep -E "Found container|ERROR.*container" log-upload.log | tail -20
else
    echo "No log-upload.log found"
fi
echo ""

echo "12. SCRIPT EXECUTION TIMELINE"
echo "----------------------------------------"
if [ -f log-upload.log ]; then
    echo "First entry:"
    head -1 log-upload.log
    echo "Last entry:"
    tail -1 log-upload.log
    echo ""
    echo "Total entries: $(wc -l < log-upload.log)"
    echo "Successful uploads: $(grep -ic "successfully\|completed" log-upload.log)"
    echo "Failed uploads: $(grep -ic "error\|fail" log-upload.log)"
fi
echo ""

echo "================================================"
echo "AUDIT COMPLETE"
echo "================================================"
```

Make it executable and run:

```bash
chmod +x audit-monitoring.sh
./audit-monitoring.sh > audit-report.txt
cat audit-report.txt
```

### 8. Quick Summary Commands

```bash
# One-liner to see all cron jobs
echo "=== ALL CRON JOBS ===" && (crontab -l 2>/dev/null; sudo crontab -l 2>/dev/null; cat /etc/crontab 2>/dev/null)

# See when cron last ran something
sudo grep CRON /var/log/syslog | tail -5

# See log upload execution summary
echo "Log upload executions: $(wc -l < /home/ubuntu/log-upload.log)"
echo "Last success: $(grep -i success /home/ubuntu/log-upload.log | tail -1 | cut -d']' -f1)"
echo "First error: $(grep -i error /home/ubuntu/log-upload.log | head -1 | cut -d']' -f1)"
```





