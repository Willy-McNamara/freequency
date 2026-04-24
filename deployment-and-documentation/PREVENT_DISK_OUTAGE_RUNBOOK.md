# Prevent Disk Outage – Runbook

Follow this once (and optionally re-check quarterly) so the disk-full outage doesn’t recur.

---

## 1. Deploy disk monitoring on EC2

This runs every 15 minutes, logs to a file, and at 90% usage runs an automatic cleanup.

### From your Mac (same directory as the freequency repo)

```bash
# Use your PEM path and EC2 hostname
KEY="/absolute/path/to/your-key.pem"
HOST="ubuntu@your-ec2-hostname"

scp -i "$KEY" deployment-and-documentation/scripts/disk-space-monitor.sh $HOST:/home/ubuntu/
scp -i "$KEY" deployment-and-documentation/scripts/setup-disk-monitoring.sh $HOST:/home/ubuntu/
```

### On the EC2 instance (SSH in first)

```bash
# Install and enable the monitor
chmod +x /home/ubuntu/disk-space-monitor.sh
chmod +x /home/ubuntu/setup-disk-monitoring.sh
/home/ubuntu/setup-disk-monitoring.sh

# Quick test
/home/ubuntu/disk-space-monitor.sh
tail -5 /home/ubuntu/disk-monitor.log
```

You should see a line like: `Disk Usage Check: 74% used (...)` and a cron job when you run `crontab -l`.

---

## 2. Optional: limit Redis container logs

The app container already has log rotation (10MB × 3 files). Redis now has limits in `docker-compose.yml` (5MB × 2 files) so its logs can’t grow unbounded.

To apply on EC2 (e.g. after you pull or copy the updated `docker-compose.yml`):

```bash
cd /home/ubuntu/freequency
sudo docker-compose up -d
```

---

## 3. Weekly habit (optional)

- SSH in and run: `tail -20 /home/ubuntu/disk-monitor.log`
- Or run once: `grep ALERT /home/ubuntu/disk-monitor.log | tail -5` to see if any alerts fired.

---

## 4. If you get an alert or disk goes high

- At **80–85%**: Script will log a WARNING/CRITICAL. Free space manually:
  ```bash
  sudo journalctl --vacuum-time=3d
  sudo docker system prune -a -f
  df -h /
  ```
- At **90%+**: The monitor script will run **emergency cleanup** automatically (journal, Docker prune, apt clean, old app logs).

---

## 5. Long-term (when you have time)

- **Larger disk**: Resize EBS to 20GB so you have more headroom.
- **Alerts you’ll see**: CloudWatch alarm on disk >80%, or a simple cron that sends you email (e.g. `ALERT` lines from `disk-monitor.log`) so you don’t have to remember to check logs.

---

## Quick reference – already on EC2

| What | Command |
|------|--------|
| Check disk | `df -h /` |
| Check monitor log | `tail -30 /home/ubuntu/disk-monitor.log` |
| Run monitor now | `/home/ubuntu/disk-space-monitor.sh` |
| List cron jobs | `crontab -l` |
| Manual cleanup | `sudo journalctl --vacuum-time=3d && sudo docker system prune -a -f` |
