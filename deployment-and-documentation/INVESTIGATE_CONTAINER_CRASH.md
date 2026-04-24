# Investigating Container Crash - November 20, 2025

## Commands to Determine Why Container Stopped

Run these commands on your EC2 instance to investigate the outage:

### 1. Check Previous Container Exit Status

```bash
# Check if there's a record of the previous container
sudo docker ps -a --filter "name=freequency-app" --format "table {{.Names}}\t{{.Status}}\t{{.CreatedAt}}"

# Get detailed information about any stopped containers
sudo docker inspect $(sudo docker ps -aq --filter "name=freequency-app" | head -1) 2>/dev/null | grep -A 10 "State"

# Check container exit code (if container still exists in stopped state)
sudo docker ps -a | grep freequency-app
```

### 2. Check Docker Events (Recent History)

```bash
# Check recent Docker events (last 100 events)
sudo docker events --since 24h --until now | tail -100

# Or check system logs for Docker-related events
sudo journalctl -u docker.service --since "3 weeks ago" --until "1 hour ago" | tail -100
```

### 3. Check System Logs Around Container Stop Time

```bash
# Check system logs for any errors around the time it stopped (3 weeks ago)
sudo journalctl --since "3 weeks ago" --until "1 hour ago" | grep -i "docker\|container\|freequency" | tail -50

# Check for out-of-memory (OOM) kills
sudo dmesg | grep -i "oom\|killed\|memory" | tail -20

# Check systemd logs for docker
sudo journalctl -u docker --since "3 weeks ago" --until "1 hour ago" | tail -50
```

### 4. Check Application Logs Before Crash

```bash
cd /home/ubuntu/freequency

# Check if there are any old log files
ls -lah logs/

# Check application logs from before the crash (if they exist)
sudo docker logs $(sudo docker ps -aq --filter "name=freequency-app" | head -1) --since "4 weeks ago" 2>/dev/null || echo "Container logs no longer available"

# Check if there are any crash dumps or error logs
find logs/ -name "*.log" -type f -mtime +21 -exec tail -50 {} \;
```

### 5. Check Disk Space History

```bash
# Check when disk space might have been an issue
# Look at journal logs size history
sudo journalctl --list-boots | tail -10

# Check if there were disk space warnings
sudo grep -r "no space\|disk full\|ENOSPC" /var/log/ 2>/dev/null | tail -20

# Check system logs for disk space issues
sudo journalctl | grep -i "no space\|disk\|full" | tail -30
```

### 6. Check Container Resource Limits and Usage

```bash
# Check current container resource usage
sudo docker stats --no-stream freequency-app-1

# Check if container has memory limits
sudo docker inspect freequency-app-1 | grep -A 5 "Memory"

# Check system memory usage history
free -h
```

### 7. Check for Automatic Restart Attempts

```bash
# Check docker-compose restart history
sudo journalctl | grep -i "freequency\|docker-compose" | tail -50

# Check if there were restart attempts that failed
sudo docker inspect freequency-app-1 | grep -i "restart"
```

### 8. Check for Image Pull or Update Issues

```bash
# Check when the image was last pulled
sudo docker inspect 212179740567.dkr.ecr.us-east-2.amazonaws.com/freequency-dev:latest | grep -i "created"

# Check if there were any image pull failures
sudo journalctl | grep -i "ecr\|pull\|image" | tail -30
```

### 9. Comprehensive Investigation Script

Save this as `investigate-crash.sh` and run it:

```bash
#!/bin/bash
echo "=== Container Crash Investigation ==="
echo ""
echo "1. Container Status History:"
sudo docker ps -a --filter "name=freequency-app" --format "table {{.Names}}\t{{.Status}}\t{{.CreatedAt}}\t{{.Size}}"
echo ""

echo "2. Recent Docker Events:"
sudo docker events --since 72h --until now | grep freequency | tail -20
echo ""

echo "3. System Memory Check:"
free -h
echo ""

echo "4. Disk Space Check:"
df -h /
echo ""

echo "5. OOM Killer Check:"
sudo dmesg | grep -i "oom\|killed" | tail -10
echo ""

echo "6. Docker Service Status:"
sudo systemctl status docker --no-pager -l | tail -10
echo ""

echo "7. Container Restart Policy:"
sudo docker inspect freequency-app-1 2>/dev/null | grep -A 3 "RestartPolicy" || echo "Container not found"
echo ""

echo "8. Application Log Files:"
ls -lah /home/ubuntu/freequency/logs/ 2>/dev/null || echo "No logs directory found"
echo ""

echo "9. System Logs (Docker-related, last 100 lines):"
sudo journalctl -u docker --since "4 weeks ago" | tail -30
```

Make it executable and run:

```bash
chmod +x investigate-crash.sh
./investigate-crash.sh
```

## What to Look For

Based on the previous incident (disk space), look for:

1. **Exit Code 137**: OOM (Out of Memory) kill
2. **Exit Code 125**: Container start failure
3. **"no space left on device"**: Disk space exhaustion
4. **"connection refused"**: Container crashed before fully starting
5. **Restart policy issues**: Container stopped and didn't restart
6. **Image pull failures**: Couldn't pull updated image
7. **Health check failures**: Container marked unhealthy and stopped

## Next Steps After Investigation

Once you identify the cause:

1. Document it in an incident report
2. Implement fixes to prevent recurrence
3. Set up monitoring/alerts for the identified issue
4. Update the outage remediation guide with specific solutions

