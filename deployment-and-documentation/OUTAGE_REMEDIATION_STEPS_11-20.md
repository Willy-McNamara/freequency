# Outage Remediation Steps - November 20

**Date:** November 20, 2025
**Branch:** v3-fix-outtage-11-20
**Based on:** Previous incident INC-2025-0926-001 (Disk Space Exhaustion)

## 🚨 Immediate Steps

### Step 1: SSH into EC2 Instance

```bash
# SSH into your EC2 instance (replace with your actual key and IP)
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### Step 2: Diagnose the Issue

Run these diagnostic commands to identify the problem:

```bash
# Check disk space usage
df -h /

# Check Docker disk usage
sudo docker system df

# Check container status
sudo docker ps -a

# Check container logs for errors
sudo docker-compose logs --tail=50 app

# Check system journal logs size
sudo journalctl --disk-usage

# Check if application is responding
curl -f http://localhost:3000/health || echo "Application is down"
```

### Step 3: Check Container Name (Important!)

The previous incident was caused by container name mismatch. Check the actual container name:

```bash
# Find all containers matching freequency-app
sudo docker ps -a --format "table {{.Names}}" | grep "freequency-app"

# Or list all containers
sudo docker ps -a
```

## 🔧 Remediation Steps

### If Disk Space is the Issue (>85% usage)

#### A. Clean System Journal Logs

```bash
# Check current journal size
sudo journalctl --disk-usage

# Clean journal logs (keeps last 3 days, frees up space)
sudo journalctl --vacuum-time=3d

# Alternative: Clean to a specific size (e.g., keep only 100MB)
sudo journalctl --vacuum-size=100M

# Verify space freed
df -h /
```

#### B. Clean Docker Resources

```bash
# Check Docker disk usage first
sudo docker system df

# Remove stopped containers
sudo docker container prune -f

# Remove unused images (keeps currently used images)
sudo docker image prune -a -f

# Remove unused volumes (CAREFUL: only if not needed)
# sudo docker volume prune -f

# Aggressive cleanup (removes all unused data)
sudo docker system prune -a -f --volumes

# Verify space freed
df -h /
sudo docker system df
```

#### C. Clean System Package Cache

```bash
# Clean apt package cache
sudo apt-get clean

# Remove unused packages
sudo apt-get autoremove -y

# Verify space freed
df -h /
```

#### D. Upload and Clean Application Logs

```bash
# Navigate to deployment directory
cd /home/ubuntu/freequency

# Find container name dynamically
CONTAINER_NAME=$(sudo docker ps --format "table {{.Names}}" | grep "freequency-app" | head -1)

if [ ! -z "$CONTAINER_NAME" ]; then
    echo "Found container: $CONTAINER_NAME"

    # Upload logs to S3 (inside container)
    sudo docker exec $CONTAINER_NAME /bin/sh -lc "/bin/sh /app/api/scripts/upload-logs-to-s3.sh" || {
        echo "Warning: Log upload failed, but continuing..."
    }
else
    echo "No running container found, skipping log upload"
fi

# Clean up old local log files (keep last 7 days)
find /home/ubuntu/freequency -name "*.log" -mtime +7 -delete 2>/dev/null || true
```

### If Container is Crashed or Not Running

#### A. Restart Services

```bash
# Navigate to deployment directory
cd /home/ubuntu/freequency

# Stop and remove existing containers
sudo docker-compose down

# Clean up any orphaned containers
sudo docker stop $(sudo docker ps -q --filter 'name=freequency-app') 2>/dev/null || true
sudo docker rm $(sudo docker ps -aq --filter 'name=freequency-app') 2>/dev/null || true

# Pull latest image
sudo docker pull your-ecr-repository:latest

# Start services
sudo docker-compose up -d

# Wait for startup
sleep 30

# Check status
sudo docker-compose ps
```

#### B. Verify Application Health

```bash
# Check container is running
sudo docker ps

# Test health endpoint
curl -f http://localhost:3000/health

# Check application logs
sudo docker-compose logs --tail=50 app

# Check container resource usage
sudo docker stats --no-stream
```

### If Container is in Zombie State (Shows Up but Unresponsive)

```bash
# Force stop and remove
sudo docker stop freequency-app-1
sudo docker rm freequency-app-1

# Or if using dynamic names
CONTAINER_NAME=$(sudo docker ps -a --format "table {{.Names}}" | grep "freequency-app" | head -1)
if [ ! -z "$CONTAINER_NAME" ]; then
    sudo docker stop $CONTAINER_NAME
    sudo docker rm $CONTAINER_NAME
fi

# Restart services
cd /home/ubuntu/freequency
sudo docker-compose down
sudo docker-compose up -d

# Verify recovery
sleep 30
curl -f http://localhost:3000/health
```

## ✅ Verification Checklist

After remediation, verify everything is working:

- [ ] Disk space is below 80% (`df -h /`)
- [ ] Docker containers are running (`sudo docker ps`)
- [ ] Application health check passes (`curl -f http://localhost:3000/health`)
- [ ] Application logs show no critical errors (`sudo docker-compose logs --tail=50 app`)
- [ ] System is responsive and stable

## 📊 Quick Health Check Script

Save this as `health-check.sh` on your EC2 instance:

```bash
#!/bin/bash
echo "=== System Health Check ==="
echo ""
echo "Disk Space:"
df -h / | grep -E 'Filesystem|/$'
echo ""
echo "Docker Disk Usage:"
sudo docker system df
echo ""
echo "Container Status:"
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "Application Health:"
curl -f http://localhost:3000/health && echo "✅ Healthy" || echo "❌ Unhealthy"
echo ""
echo "Journal Log Size:"
sudo journalctl --disk-usage
```

Make it executable:

```bash
chmod +x health-check.sh
./health-check.sh
```

## 🔍 Troubleshooting Specific Issues

### Issue: "no space left on device"

**Solution:** Follow Steps 3.A through 3.D above to free disk space.

### Issue: Container keeps crashing on startup

**Solution:**

```bash
# Check container logs for specific errors
sudo docker-compose logs app

# Check if it's a disk space issue
df -h /

# Check if it's a memory issue
free -h

# Check if it's a port conflict
sudo netstat -tulpn | grep 3000
```

### Issue: Container name mismatch

**Solution:** Use dynamic container detection:

```bash
CONTAINER_NAME=$(sudo docker ps --format "table {{.Names}}" | grep "freequency-app" | head -1)
echo "Using container: $CONTAINER_NAME"
```

### Issue: Application responds but returns errors

**Solution:**

```bash
# Check application logs
sudo docker-compose logs --tail=100 app

# Check database connectivity (if applicable)
sudo docker exec freequency-app-1 curl -f http://localhost:3000/health

# Check environment variables
sudo docker-compose config
```

## 📝 Post-Remediation Actions

After fixing the immediate issue:

1. **Document the incident** in a new incident report
2. **Review monitoring** - ensure disk space alerts are working
3. **Verify log cleanup** - check cron jobs are running
4. **Test recovery procedures** - ensure they work for next time

## 🔗 Related Documentation

- Previous Incident Report: `INCIDENT_REPORT_2025-0926-001.md`
- Production Recovery Guide: `load-testing/PRODUCTION_RECOVERY_GUIDE.md`
- Log Upload Setup: `deployment-and-documentation/log-upload-setup.md`

---

**Note:** Always document what you find and what actions you take for future reference and incident reports.

