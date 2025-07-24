# Quick Setup: Log Uploads to S3

## One-Command Setup (After EC2 is Ready)

```bash
# 1. Copy setup script to EC2
scp deployment/setup-log-upload.sh ubuntu@your-ec2-ip:/home/ubuntu/

# 2. Copy log upload script to EC2
scp api/scripts/upload-logs-to-s3.sh ubuntu@your-ec2-ip:/home/ubuntu/

# 3. SSH into EC2 and run setup
ssh ubuntu@your-ec2-ip
chmod +x setup-log-upload.sh
./setup-log-upload.sh your-container-name
```

## Prerequisites Checklist

- [ ] S3 bucket `freequency-app-logs` exists
- [ ] EC2 has IAM role with S3 PutObject permissions
- [ ] Docker container is running with AWS CLI installed
- [ ] Container name is known

## Manual Setup (if automated script fails)

```bash
# 1. Make scripts executable
chmod +x upload-logs-to-s3.sh

# 2. Create wrapper script manually
nano run-log-upload.sh
# Paste wrapper script content

# 3. Set up cron
crontab -e
# Add: 0 0 * * * /home/ubuntu/run-log-upload.sh
```

## Verification

```bash
# Check cron job
crontab -l

# Test manually
./run-log-upload.sh

# Monitor logs
tail -f log-upload.log
```

## Troubleshooting

- **Container not found**: Update container name in wrapper script
- **S3 access denied**: Check EC2 IAM role
- **Script not found**: Ensure script is copied to container

See `log-upload-setup.md` for detailed documentation.
