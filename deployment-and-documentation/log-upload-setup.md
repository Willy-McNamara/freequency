# Log Upload Setup for EC2

This document describes how to set up daily log uploads from the Docker container to S3 for the Freequency application.

## Overview

- **Purpose**: Automatically upload application logs to S3 daily for persistence and analysis
- **Frequency**: Daily at midnight UTC
- **Location**: EC2 host cron job that executes inside the Docker container
- **S3 Structure**: Organized by date for easy analysis

## Prerequisites

1. **S3 Bucket**: `freequency-app-logs` (already created)
2. **EC2 IAM Role**: Must have S3 PutObject permissions for the bucket
3. **Docker Container**: Must have AWS CLI installed (already in Dockerfile)

## Files

- **Script**: `api/scripts/upload-logs-to-s3.sh` (already created)
- **Dockerfile**: Updated to include AWS CLI installation

## Setup Steps

### 1. Copy Script to EC2

SSH into your EC2 instance and copy the script:

```bash
# From your local machine
scp api/scripts/upload-logs-to-s3.sh ubuntu@your-ec2-ip:/home/ubuntu/

# Or manually create the file on EC2
nano /home/ubuntu/upload-logs-to-s3.sh
# Paste the script content
```

### 2. Make Script Executable

```bash
chmod +x /home/ubuntu/upload-logs-to-s3.sh
```

### 3. Test Script Manually

```bash
# Test that the script can access the Docker container
docker exec your-container-name aws --version

# Test the script (it will fail if no logs exist, which is expected)
./upload-logs-to-s3.sh
```

### 4. Create a Wrapper Script

Create a wrapper that executes the script inside the Docker container:

```bash
nano /home/ubuntu/run-log-upload.sh
```

Add this content:

```bash
#!/bin/bash
set -e

# Configuration
CONTAINER_NAME="your-container-name"  # Update this to your actual container name
SCRIPT_PATH="/app/api/scripts/upload-logs-to-s3.sh"

# Log the execution
echo "$(date): Starting daily log upload" >> /home/ubuntu/log-upload.log

# Execute the script inside the Docker container
if docker exec "$CONTAINER_NAME" bash -c "$SCRIPT_PATH"; then
    echo "$(date): Log upload completed successfully" >> /home/ubuntu/log-upload.log
else
    echo "$(date): Log upload failed" >> /home/ubuntu/log-upload.log
    exit 1
fi
```

Make it executable:

```bash
chmod +x /home/ubuntu/run-log-upload.sh
```

### 5. Set Up Cron Job

Edit the crontab:

```bash
crontab -e
```

Add this line to run daily at midnight UTC:

```
0 0 * * * /home/ubuntu/run-log-upload.sh
```

### 6. Verify Cron Job

```bash
# Check if cron job is set
crontab -l

# Check cron service is running
sudo systemctl status cron
```

## S3 Structure

After setup, logs will be organized as:

```
s3://freequency-app-logs/
├── logs/app/2024/01/15/app-2024-01-15.log
├── analytics/daily/2024/01/summary-2024-01-15.json
└── ...
```

## Monitoring

### Check Log Upload Status

```bash
# View cron execution logs
tail -f /home/ubuntu/log-upload.log

# Check if files were uploaded to S3
aws s3 ls s3://freequency-app-logs/logs/app/$(date +%Y/%m/%d)/

# Check analytics summaries
aws s3 ls s3://freequency-app-logs/analytics/daily/$(date +%Y/%m)/
```

### Manual Upload (if needed)

If the cron job fails, you can manually run:

```bash
/home/ubuntu/run-log-upload.sh
```

## Troubleshooting

### Common Issues

1. **Container not found**

   - Update `CONTAINER_NAME` in the wrapper script
   - Check with `docker ps`

2. **Permission denied**

   - Ensure EC2 has IAM role with S3 permissions
   - Check with `aws sts get-caller-identity`

3. **Script not found in container**

   - Ensure the script is copied to the container
   - Check the path in the wrapper script

4. **Cron not running**
   - Check cron service: `sudo systemctl status cron`
   - Check cron logs: `sudo tail -f /var/log/cron`

### Debug Commands

```bash
# Test AWS CLI in container
docker exec your-container-name aws sts get-caller-identity

# Test S3 access
docker exec your-container-name aws s3 ls s3://freequency-app-logs/

# Check if log file exists
docker exec your-container-name ls -la /app/logs/

# Run script with verbose output
docker exec your-container-name bash -c "set -x; /app/api/scripts/upload-logs-to-s3.sh"
```

## Recovery Steps (if EC2 goes down)

1. **Launch new EC2 instance**
2. **Attach the same IAM role** with S3 permissions
3. **Deploy your application** (Docker container with AWS CLI)
4. **Follow steps 1-6 above** to recreate the cron job
5. **Update container name** in the wrapper script if different

## Security Notes

- The script uses the EC2 instance IAM role (no hardcoded credentials)
- Logs are uploaded to a private S3 bucket
- Local log files are cleaned up after successful upload
- The wrapper script logs execution for monitoring

## Future Enhancements

- **CloudWatch Alarms**: Set up alerts for failed uploads
- **Athena Queries**: Analyze logs with SQL
- **QuickSight Dashboards**: Visualize log trends
- **Log Retention**: Set up S3 lifecycle policies for old logs
