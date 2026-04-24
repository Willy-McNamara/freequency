# Deploy Disk Space Monitoring - Quick Setup Guide

## Problem Identified

**No disk space monitoring exists** on the EC2 instance, which is why the November 17, 2025 outage was not caught. This is the second occurrence of the same issue.

## Solution

Automated disk space monitoring with:

- Checks every 15 minutes
- Warning alerts at 80%
- Critical alerts at 85%
- Automatic cleanup at 90%

## Deployment Steps

### Step 1: Copy Scripts to EC2

From your local machine, copy the monitoring scripts to EC2:

```bash
# From your local machine (in the freequency project directory)
scp -i "path/to/your-key.pem" \
  deployment-and-documentation/scripts/disk-space-monitor.sh \
  ubuntu@your-ec2-hostname:/home/ubuntu/

scp -i "path/to/your-key.pem" \
  deployment-and-documentation/scripts/fix-apt-dependencies.sh \
  ubuntu@your-ec2-hostname:/home/ubuntu/
```

### Step 2: Fix Apt Dependencies (If Needed)

SSH into EC2 and fix broken dependencies first:

```bash
ssh -i "path/to/your-key.pem" ubuntu@your-ec2-hostname

# Make script executable
chmod +x /home/ubuntu/fix-apt-dependencies.sh

# Run the fix
/home/ubuntu/fix-apt-dependencies.sh
```

### Step 3: Set Up Monitoring

On the EC2 instance:

```bash
# Make monitoring script executable
chmod +x /home/ubuntu/disk-space-monitor.sh

# Test it first
/home/ubuntu/disk-space-monitor.sh

# Set up cron job (runs every 15 minutes)
(crontab -l 2>/dev/null; echo "*/15 * * * * /home/ubuntu/disk-space-monitor.sh >> /home/ubuntu/disk-monitor.log 2>&1") | crontab -

# Verify cron job was added
crontab -l | grep disk-space-monitor
```

### Step 4: Verify Setup

```bash
# Check that cron job is scheduled
crontab -l

# Wait 15 minutes, then check the log
tail -f /home/ubuntu/disk-monitor.log

# Or run manually to test
/home/ubuntu/disk-space-monitor.sh
```

## What the Script Does

1. **Checks disk usage** every 15 minutes
2. **Logs status** to `/home/ubuntu/disk-monitor.log`
3. **Alerts at thresholds**:

   - 80%: Warning alert
   - 85%: Critical alert
   - 90%: Automatic emergency cleanup

4. **Emergency cleanup** (at 90%) automatically:
   - Cleans journal logs (keeps last 3 days)
   - Cleans Docker system (removes unused images/containers)
   - Cleans apt cache
   - Cleans old application logs (>7 days)

## Monitoring the Monitoring

```bash
# View recent logs
tail -20 /home/ubuntu/disk-monitor.log

# Follow logs in real-time
tail -f /home/ubuntu/disk-monitor.log

# Check when last check ran
grep "Disk Usage Check" /home/ubuntu/disk-monitor.log | tail -5

# Check for alerts
grep "ALERT" /home/ubuntu/disk-monitor.log | tail -10
```

## Manual Cleanup (If Needed)

If you need to manually trigger cleanup:

```bash
# Run the monitor script (it will auto-cleanup if >90%)
/home/ubuntu/disk-space-monitor.sh

# Or manually clean
sudo journalctl --vacuum-time=3d
sudo docker system prune -a -f
sudo apt-get clean && sudo apt-get autoremove -y
```

## Current Status

- **Disk usage**: 74% (4.9G used / 6.8G total)
- **Status**: Below warning threshold but monitoring needed
- **Available space**: 1.9GB

## Next Steps

1. ✅ Deploy monitoring (follow steps above)
2. ⬜ Set up CloudWatch alarms (optional but recommended)
3. ⬜ Consider increasing disk size to 20GB (long-term)
4. ⬜ Set up email/SMS alerts (requires configuration)

## Troubleshooting

### Script doesn't run

```bash
# Check permissions
ls -la /home/ubuntu/disk-space-monitor.sh

# Check cron service
sudo systemctl status cron

# Check cron logs
sudo tail -f /var/log/cron
```

### No logs generated

```bash
# Check if cron job exists
crontab -l

# Check cron service
sudo systemctl status cron

# Run script manually to test
/home/ubuntu/disk-space-monitor.sh
```

### Cleanup not working

```bash
# Run cleanup manually with verbose output
sudo journalctl --vacuum-time=3d
sudo docker system prune -a -f --volumes
sudo apt-get clean && sudo apt-get autoremove -y
df -h /
```

---

**Important**: This monitoring will prevent future outages by catching disk space issues before they become critical!





