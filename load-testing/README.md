# Freequency Load Testing Suite

This directory contains comprehensive load testing tools to evaluate your application's performance, identify bottlenecks, and test failure scenarios.

## Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up authentication:**

   ```bash
   # Get JWT token from your browser dev tools
   export JWT_TOKEN="your_jwt_token_here"
   ```

3. **Run load tests:**

   ```bash
   # Baseline load test (with file output)
   npm run test:artillery:output

   # Stress test to find breaking point (with file output)
   npm run test:stress:output

   # K6 load test
   npm run test:k6
   ```

4. **Analyze results:**

   ```bash
   npm run analyze
   ```

## How the Tests Work

### 1. **Baseline Load Test** (`artillery-config.yml`)

**Purpose**: Establish normal performance under gradually increasing load

**Test Flow**:

- **Warm-up (1 min)**: 1 user per second - gentle start
- **Ramp-up (5 min)**: 1 → 10 users per second - test scaling
- **Sustained (10 min)**: 10 users per second - test stability
- **Peak (5 min)**: 10 → 25 users per second - test maximum normal capacity
- **Cool-down (2 min)**: 25 → 1 users per second - test graceful scaling down

**What It Tests**:

- Response times under normal load
- Throughput capacity
- Error rates during scaling
- System stability over time

**Expected Results**:

- All endpoints should respond within 2 seconds
- Error rate should stay below 1%
- System should handle 25 concurrent users smoothly

**Duration**: ~23 minutes total

### 2. **Stress Test** (`stress-test.yml`)

**Purpose**: Find the breaking point and test failure modes

**Test Flow**:

- **Baseline (2 min)**: 5 users per second - establish normal performance
- **Stress Ramp-up (10 min)**: 5 → 50 users per second - find first limits
- **Peak Stress (5 min)**: 50 → 100 users per second - push beyond normal capacity
- **Beyond Breaking Point (5 min)**: 100 → 200 users per second - test failure scenarios
- **Recovery Test (5 min)**: 200 → 5 users per second - test system recovery

**What It Tests**:

- Maximum capacity before failure
- Failure modes (rate limiting, timeouts, crashes)
- System recovery after high load
- Resource exhaustion points

**Expected Results**:

- System will start failing around 50-100 users
- You'll see 429 (rate limiting), 500 (server errors), 502/503 (unavailable)
- Response times will degrade significantly
- System should recover when load decreases

**Duration**: ~9 minutes total (optimized from 27 minutes)

## 🎯 **Test Results & Findings**

### **Baseline Test Results** ✅ **COMPLETED**

- **Grade**: A+ (Excellent)
- **Performance**: Handled 25 concurrent users perfectly
- **Response Times**: < 200ms average
- **Error Rate**: 0%
- **Capacity**: Production-ready for current traffic

### **Stress Test Results** ✅ **COMPLETED**

- **Grade**: C+ (Concerning)
- **Breaking Point**: 100-120 concurrent users
- **Failure Mode**: Container zombie state, complete system crash
- **Recovery**: Required manual SSH intervention
- **Critical Issue**: No automatic recovery mechanisms

### **Infrastructure Improvements Implemented** ✅ **COMPLETED**

- **Health Checks**: Every 60s with auto-restart
- **Resource Limits**: 400MB memory, 0.8 CPU cores
- **Auto-Restart**: `restart: unless-stopped` policy
- **Log Rotation**: 10MB max, 3 files max
- **Production Settings**: NODE_ENV=production, optimized memory

### **Next Steps**

- Deploy enhanced docker-compose.yml
- Test health check functionality
- Re-test with stability improvements
- Analyze current AWS costs and usage
- Evaluate potential infrastructure changes based on actual needs

### 3. **K6 Load Test** (`k6-scripts/basic-load.js`)

**Purpose**: Advanced performance testing with custom metrics and thresholds

**Test Flow**:

- **Stage 1 (2 min)**: Ramp up to 10 users
- **Stage 2 (5 min)**: Maintain 10 users
- **Stage 3 (2 min)**: Ramp up to 20 users
- **Stage 4 (5 min)**: Maintain 20 users
- **Stage 5 (2 min)**: Ramp down to 0 users

**What It Tests**:

- Response time percentiles (P50, P95, P99)
- Custom error tracking
- Threshold-based pass/fail criteria
- Detailed performance metrics

**Expected Results**:

- 95% of requests complete in under 2 seconds
- Error rate stays below 10%
- Custom error metrics track application-specific failures

**Duration**: ~16 minutes total

## Test Scenarios Explained

### **Public Endpoints (40% of traffic)**

- `/health` - Lightweight health check
- `/` - Main page (React app)
- `/api/instruments` - Public API data
- `/api/tags` - Public tag data

**Why 40%**: These are the most common requests and should be fastest.

### **Authentication Flow (20% of traffic)**

- `/auth/google` - OAuth redirect
- `/auth/login` - Login endpoint

**Why 20%**: Auth endpoints are critical but shouldn't dominate traffic.

### **API Endpoints (25% of traffic)**

- `/api/sessions` - User sessions (requires auth)
- `/api/tasks` - User tasks (requires auth)
- `/api/musicians` - User profiles (requires auth)

**Why 25%**: These are authenticated endpoints that represent core app functionality.

### **Static Assets (15% of traffic)**

- `/logo.svg` - Logo file
- `/favicon.ico` - Browser icon

**Why 15%**: Static files should be served quickly and efficiently.

## What Each Test Will Reveal

### **Baseline Test Results**

- **Good**: System handles 25 users smoothly, response times < 2s
- **Concerning**: Response times > 2s at 15+ users
- **Problem**: Errors start appearing at < 20 users

### **Stress Test Results**

- **Breaking Point**: Usually 50-100 concurrent users for single EC2 instance
- **Failure Modes**:
  - 429 responses = rate limiting working
  - 500 responses = application errors
  - 502/503 responses = infrastructure overload
- **Recovery**: System should return to normal within 1-2 minutes

### **K6 Test Results**

- **Performance**: Detailed response time distributions
- **Reliability**: Custom error tracking
- **Thresholds**: Pass/fail based on your performance requirements

## Key Metrics to Watch

### **Response Times**

- **P50**: Median response time (should be < 500ms)
- **P95**: 95th percentile (should be < 2s)
- **P99**: 99th percentile (should be < 5s)

### **Error Rates**

- **HTTP Errors**: 4xx and 5xx responses
- **Timeouts**: Requests taking > 30 seconds
- **Custom Errors**: Application-specific failures

### **Throughput**

- **Requests per second**: How many requests your system can handle
- **Concurrent users**: Maximum users before performance degrades
- **Resource utilization**: CPU, memory, database connections

## Next Steps After Testing

1. **Analyze Results**: Identify where performance starts to degrade
2. **Find Bottlenecks**: Database, Redis, Node.js event loop, memory
3. **Choose Infrastructure**: Based on breaking point and budget
4. **Implement Fixes**: Caching, connection pooling, resource limits
5. **Re-test**: Verify improvements with same load tests

## Troubleshooting

### **Common Issues**

- **Port conflicts**: Ensure ports 3000, 9090, 3001, 8086 are available
- **Permission errors**: Check Docker permissions
- **Memory issues**: Increase Docker memory limits
- **Network issues**: Verify firewall rules and security groups

### **Getting Help**

- Check container logs: `docker-compose logs [service]`
- Monitor resource usage: `docker stats`
- Review test results in terminal output
