# Production Recovery Guide (in case of docker failover ahead of docker-compose fix)

**Last Updated**: August 24, 2024
**Purpose**: Quick recovery procedures for production issues
**Scope**: Docker containers, EC2 instances, application failures

## 🚨 **Container Zombie State Recovery**

### **Symptoms**

- Container shows "Up" status but application is unresponsive
- `curl localhost:3000/health` returns "Connection refused"
- `docker exec container ps aux` fails with "Container is not running"
- Port binding exists but nothing is listening

### **Immediate Recovery Steps**

```bash
# 1. SSH into your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# 2. Check container status
sudo docker ps -a

# 3. Force stop the zombie container
sudo docker stop freequency-app-1
sudo docker rm freequency-app-1

# 4. Navigate to deployment directory
cd /home/ubuntu/freequency

# 5. Restart all services
sudo docker-compose down
sudo docker-compose up -d

# 6. Wait for startup and verify
sleep 30
curl http://localhost:3000/health
sudo docker-compose logs --tail=20 app
```

### **Verification Commands**

```bash
# Check if containers are actually running
sudo docker ps

# Test application health
curl -f http://localhost:3000/health

# Check container processes
sudo docker exec freequency-app-1 ps aux

# Monitor container logs
sudo docker-compose logs -f app
```

## 🛡️ **Prevention & Protection Plan**

### **Phase 1: Immediate Improvements (This Week)**

#### **1. Enhanced Docker Compose Configuration**

```yaml
# Update your docker-compose.yml with these improvements
services:
  app:
    image: your-ecr-image:latest
    restart: unless-stopped # Auto-restart on failure
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: "1.0"
        reservations:
          memory: 512M
          cpus: "0.5"
    environment:
      - NODE_ENV=production
      - MAX_OLD_SPACE_SIZE=1024
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

#### **2. Application-Level Health Monitoring**

```bash
# Add to your entrypoint script
#!/bin/bash
set -e

# Start the application
npm start &

# Store the PID
APP_PID=$!

# Health check loop
while true; do
  if ! kill -0 $APP_PID 2>/dev/null; then
    echo "Application process died, exiting container"
    exit 1
  fi

  if ! curl -f http://localhost:3000/health >/dev/null 2>&1; then
    echo "Health check failed, restarting application"
    kill $APP_PID
    wait $APP_PID
    npm start &
    APP_PID=$!
  fi

  sleep 30
done
```

### **Phase 2: Infrastructure Improvements (Next 2 Weeks)**

#### **1. Load Balancer with Health Checks**

```yaml
# AWS Application Load Balancer configuration
HealthCheck:
  Target: HTTP:3000/health
  Interval: 30
  Timeout: 5
  HealthyThreshold: 2
  UnhealthyThreshold: 3
  SuccessCodes: "200"
```

#### **2. Auto-scaling Group**

```yaml
# Auto-scaling configuration
AutoScalingGroup:
  MinSize: 2
  MaxSize: 5
  DesiredCapacity: 2
  HealthCheckType: ELB
  HealthCheckGracePeriod: 300
  TargetTrackingPolicy:
    - CPU: 70%
    - Memory: 80%
```

#### **3. CloudWatch Alarms**

```yaml
# Set up these alarms
Alarms:
  - HighCPU: CPU > 80% for 5 minutes
  - HighMemory: Memory > 85% for 5 minutes
  - HealthCheckFailures: Failed health checks > 3
  - ResponseTime: P95 > 2 seconds
```

### **Phase 3: Advanced Protection (Next Month)**

#### **1. Circuit Breaker Pattern**

```javascript
// Implement in your application
class CircuitBreaker {
  constructor(failureThreshold = 5, resetTimeout = 60000) {
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeout;
    this.failures = 0;
    this.lastFailureTime = null;
    this.state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN
  }

  async call(operation) {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = "HALF_OPEN";
      } else {
        throw new Error("Circuit breaker is OPEN");
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
}
```

#### **2. Graceful Degradation**

```javascript
// Implement graceful degradation
app.use((req, res, next) => {
  if (process.memoryUsage().heapUsed > 500 * 1024 * 1024) {
    // 500MB
    return res.status(503).json({
      message: "Service temporarily unavailable due to high load",
      retryAfter: 30,
    });
  }
  next();
});
```

## 📊 **Monitoring & Alerting Setup**

### **Essential Metrics to Monitor**

1. **Container Health**: Process status, memory usage, CPU usage
2. **Application Health**: Response times, error rates, throughput
3. **Infrastructure Health**: EC2 metrics, disk space, network
4. **Business Metrics**: User sessions, API calls, database performance

### **Alerting Rules**

```yaml
Alerts:
  - name: "Container Zombie State"
    condition: "health_check_failed > 3"
    action: "restart_container"

  - name: "High Memory Usage"
    condition: "memory_usage > 85%"
    action: "scale_up_instance"

  - name: "High Error Rate"
    condition: "error_rate > 5%"
    action: "investigate_application"
```

## 🚀 **Automated Recovery Scripts**

### **Auto-Recovery Script**

```bash
#!/bin/bash
# /home/ubuntu/auto-recovery.sh

# Check container health
check_container_health() {
  if ! curl -f http://localhost:3000/health >/dev/null 2>&1; then
    echo "$(date): Health check failed, restarting container"

    cd /home/ubuntu/freequency
    sudo docker-compose restart app

    # Wait and verify
    sleep 30
    if curl -f http://localhost:3000/health >/dev/null 2>&1; then
      echo "$(date): Recovery successful"
    else
      echo "$(date): Recovery failed, escalating"
      # Send alert to your team
      curl -X POST "your-webhook-url" -d "Container recovery failed"
    fi
  fi
}

# Run health check every 5 minutes
while true; do
  check_container_health
  sleep 300
done
```

### **Setup Auto-Recovery**

```bash
# Make script executable
chmod +x /home/ubuntu/auto-recovery.sh

# Add to systemd for auto-start
sudo tee /etc/systemd/system/auto-recovery.service << EOF
[Unit]
Description=Auto-recovery service for Freequency
After=docker.service

[Service]
Type=simple
User=ubuntu
ExecStart=/home/ubuntu/auto-recovery.sh
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
sudo systemctl enable auto-recovery
sudo systemctl start auto-recovery
```

## 📋 **Recovery Checklist**

### **Before Making Changes**

- [ ] Document current state
- [ ] Take backup/snapshot
- [ ] Notify team if needed
- [ ] Have rollback plan ready

### **During Recovery**

- [ ] Follow recovery steps exactly
- [ ] Monitor logs and metrics
- [ ] Verify each step success
- [ ] Test functionality after recovery

### **After Recovery**

- [ ] Document what happened
- [ ] Implement prevention measures
- [ ] Update monitoring/alerting
- [ ] Schedule post-mortem review

## 🎯 **Next Steps Priority**

1. **This Week**: Update docker-compose.yml with health checks and restart policies
2. **Next Week**: Implement auto-recovery script and monitoring
3. **Next Month**: Add load balancer and auto-scaling
4. **Ongoing**: Monitor, improve, and iterate

---

**Remember**: The goal is to make your system self-healing so manual intervention becomes rare!
