# Today's Outage Work Summary (2026-04-24)

## Objective

Restore production service, reduce repeat disk-exhaustion risk, and document a repeatable recovery process.

## What was wrong

- The app service container was not running while Redis remained up.
- Historical incidents showed repeat outages caused by disk pressure and log accumulation on a small root volume.
- SSH access was intermittently blocked due to changing public IPs and security-group ingress mismatches.

## Actions completed

1. Restored access and verified infrastructure state
   - Confirmed EC2 target and security groups in `us-east-2`.
   - Confirmed current client IP and SSH path.

2. Restored application service
   - Connected to EC2 and checked disk/container state.
   - Restarted app stack with:
     - `sudo docker-compose up -d`
   - Verified service health:
     - `curl -fsS http://localhost:3000/health` returned healthy status.

3. Implemented monitoring and auto-remediation on host
   - Deployed and installed:
     - `/home/ubuntu/disk-space-monitor.sh`
     - `/home/ubuntu/setup-disk-monitoring.sh`
   - Verified cron execution every 15 minutes:
     - `*/15 * * * * /home/ubuntu/disk-space-monitor.sh >> /home/ubuntu/disk-monitor.log 2>&1`
   - Verified monitor log output and threshold behavior.

4. Added operator scripts and documentation in repo
   - Added `deployment-and-documentation/scripts/update-ssh-ip-rule.sh` for quick current-IP SG updates (with console fallback on IAM denial).
   - Added `deployment-and-documentation/scripts/check-production-health.sh` for one-command health + disk + container status checks.
   - Added `deployment-and-documentation/OUTAGE_RECOVERY_AND_PREVENTION_PLAYBOOK_2026-04-24.md` as primary runbook.

## Current status

- Application is up and healthy.
- Disk monitoring is active and writing logs.
- Risk is reduced substantially versus previous incidents, but not eliminated due to small disk size and no external alerts enabled yet.

## Deferred by choice

- CloudWatch/SNS alerting was not fully executed at this time.
- If needed later, follow the GUI steps in:
  - `deployment-and-documentation/OUTAGE_RECOVERY_AND_PREVENTION_PLAYBOOK_2026-04-24.md`

## Recommended lightweight routine (no alerting)

- Weekly:
  - `df -h /`
  - `tail -30 /home/ubuntu/disk-monitor.log`
- On suspicion of outage:
  - Run `deployment-and-documentation/scripts/check-production-health.sh` locally.
