#!/bin/bash
# Setup script for disk space monitoring
# Run this on your EC2 instance to set up automated monitoring

set -e

SCRIPT_DIR="/home/ubuntu"
MONITOR_SCRIPT="$SCRIPT_DIR/disk-space-monitor.sh"
CRON_LOG="$SCRIPT_DIR/disk-monitor.log"

echo "Setting up disk space monitoring..."

# 1. Copy the monitor script to EC2
echo "1. Installing disk space monitor script..."
if [ ! -f "$MONITOR_SCRIPT" ]; then
    echo "Error: disk-space-monitor.sh not found in current directory"
    echo "Please copy disk-space-monitor.sh to $SCRIPT_DIR first"
    exit 1
fi

# Make script executable
chmod +x "$MONITOR_SCRIPT"

# 2. Test the script
echo "2. Testing disk space monitor script..."
"$MONITOR_SCRIPT" || echo "Warning: Script test had warnings (this is OK)"

# 3. Set up cron job (every 15 minutes)
echo "3. Setting up cron job..."
CRON_JOB="*/15 * * * * $MONITOR_SCRIPT >> $CRON_LOG 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "disk-space-monitor.sh"; then
    echo "   Cron job already exists. Updating..."
    crontab -l 2>/dev/null | grep -v "disk-space-monitor.sh" | crontab -
fi

# Add new cron job
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo "4. Verifying cron job..."
crontab -l | grep "disk-space-monitor"

echo ""
echo "✅ Disk space monitoring set up successfully!"
echo ""
echo "Configuration:"
echo "  - Script: $MONITOR_SCRIPT"
echo "  - Log file: $CRON_LOG"
echo "  - Check frequency: Every 15 minutes"
echo "  - Warning threshold: 80%"
echo "  - Critical threshold: 85%"
echo "  - Auto-cleanup threshold: 90%"
echo ""
echo "View logs with: tail -f $CRON_LOG"
echo "View cron jobs with: crontab -l"


