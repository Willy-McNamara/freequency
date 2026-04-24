# Outage Recovery and Recurrence Prevention Playbook (2026-04-24)

This playbook captures the production recovery and hardening actions used after repeated disk-space outages.

## Current production status

- EC2 production instance is running.
- Application container was restarted successfully with `docker-compose up -d`.
- Health endpoint is passing:
  - `curl -fsS http://localhost:3000/health`
- Disk usage is stable near 74% (headroom available, but still needs ongoing monitoring and alerting).
- Disk monitor is installed and running every 15 minutes via cron.

## Fast access workflow (coffee shop / changing IP)

1. Get your current IP:
   - `curl -s https://checkip.amazonaws.com`
2. Add `x.x.x.x/32` to SSH inbound on your production security group (port `22`).
3. Connect:
   - `ssh -i "/absolute/path/to/your-key.pem" ubuntu@your-ec2-hostname`

Optional helper script:

- `deployment-and-documentation/scripts/update-ssh-ip-rule.sh`
- Example:
  - `./deployment-and-documentation/scripts/update-ssh-ip-rule.sh <your-security-group-id> us-east-2`

If IAM blocks SG edits, the script prints the exact console fallback.

## Recovery commands (run on EC2)

```bash
df -h /
sudo docker ps -a
sudo docker system df
cd /home/ubuntu/freequency
sudo docker-compose up -d
curl -fsS http://localhost:3000/health
```

If disk is above 85%:

```bash
sudo journalctl --vacuum-time=3d
sudo docker system prune -a -f
df -h /
```

## Monitoring deployed

Scripts copied and enabled:

- `/home/ubuntu/disk-space-monitor.sh`
- `/home/ubuntu/setup-disk-monitoring.sh`

Cron entries now include:

- `*/15 * * * * /home/ubuntu/disk-space-monitor.sh >> /home/ubuntu/disk-monitor.log 2>&1`
- Existing cleanup jobs:
  - `0 0 * * * /home/ubuntu/run-log-upload.sh >> /home/ubuntu/log-upload.log 2>&1`
  - `0 1 * * * /home/ubuntu/system-cleanup.sh`

Verification commands:

```bash
crontab -l
tail -20 /home/ubuntu/disk-monitor.log
```

## CloudWatch + SNS alerts (GUI path, recommended)

Your current CLI user lacks permission to create SNS topics and CloudWatch alarms, so create these in AWS Console:

1. Create SNS topic in `us-east-2`:
   - Name: `freequency-prod-alerts`
   - Subscription: your email (confirm subscription email).
2. Create CloudWatch alarm: EC2 status check failure
   - Namespace: `AWS/EC2`
   - Metric: `StatusCheckFailed`
   - Dimension: your production instance ID
   - Period: 1 minute, Evaluation periods: 2
   - Threshold: `>= 1`
   - Action: notify `freequency-prod-alerts`
3. Create disk-usage alarm (after CloudWatch Agent disk metric is available):
   - Metric: `disk_used_percent` for `/`
   - Threshold warning: `>= 80`
   - Threshold critical: `>= 90`
   - Action: notify `freequency-prod-alerts`

## SSM fallback access (no port 22 dependency)

Set up Systems Manager Session Manager so you can connect even when SSH is blocked:

1. Attach IAM role with `AmazonSSMManagedInstanceCore` to the EC2 instance.
2. Verify SSM agent is installed/running on instance.
3. In AWS Console -> Systems Manager -> Session Manager, start a session to the instance.
4. Optional local CLI fallback:
   - Install Session Manager plugin.
   - `aws ssm start-session --target <your-instance-id> --region us-east-2`

## Recurring validation checklist

Weekly:

- `tail -50 /home/ubuntu/disk-monitor.log`
- `df -h /`
- `sudo docker system df`

Monthly:

- Trigger an alarm test (CloudWatch alarm action test path).
- Verify access both ways:
  - SSH (after IP refresh)
  - SSM Session Manager

Quarterly:

- Reassess EBS size (target 20GB minimum).
- Review log-retention and pruning effectiveness.
