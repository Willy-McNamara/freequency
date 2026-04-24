#!/bin/bash
# Disk Space Monitoring and Alert Script
# Checks disk usage and alerts if above threshold
# Automatically triggers cleanup if critical

set -e

# Configuration
DISK_PATH="/"
WARNING_THRESHOLD=80  # Percentage
CRITICAL_THRESHOLD=85 # Percentage
AUTOCLEAN_THRESHOLD=90 # Percentage - triggers automatic cleanup
LOG_FILE="/home/ubuntu/disk-monitor.log"
ALERT_EMAIL=""  # Set this if you have email configured

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

alert() {
    local message="$1"
    log "ALERT: $message"
    echo -e "${RED}ALERT: $message${NC}" >&2

    # If email is configured, send alert
    if [ ! -z "$ALERT_EMAIL" ]; then
        echo "$message" | mail -s "DISK SPACE ALERT: $(hostname)" "$ALERT_EMAIL" 2>/dev/null || true
    fi
}

# Emergency cleanup function
emergency_cleanup() {
    log "Starting emergency cleanup..."

    # 1. Clean journal logs (keep last 3 days)
    log "Cleaning journal logs..."
    BEFORE_JOURNAL=$(df "$DISK_PATH" | awk 'NR==2 {print $3}')
    sudo journalctl --vacuum-time=3d >/dev/null 2>&1 || log "Warning: Journal cleanup failed"
    AFTER_JOURNAL=$(df "$DISK_PATH" | awk 'NR==2 {print $3}')
    JOURNAL_FREED=$((BEFORE_JOURNAL - AFTER_JOURNAL))
    log "Journal cleanup completed (freed ~${JOURNAL_FREED}KB)"

    # 2. Clean Docker system (aggressive)
    log "Cleaning Docker system..."
    DOCKER_FREED=$(sudo docker system prune -a -f --volumes 2>&1 | grep "Total reclaimed space" | awk '{print $4,$5}' || echo "unknown")
    log "Docker cleanup completed (freed: $DOCKER_FREED)"

    # 3. Clean apt cache
    log "Cleaning apt cache..."
    sudo apt-get clean >/dev/null 2>&1 || log "Warning: Apt clean failed"
    sudo apt-get autoremove -y >/dev/null 2>&1 || log "Warning: Apt autoremove failed"
    log "Apt cleanup completed"

    # 4. Clean old log files (older than 7 days)
    log "Cleaning old application logs..."
    find /home/ubuntu/freequency/logs -name "*.log" -type f -mtime +7 -delete 2>/dev/null || true
    log "Log cleanup completed"

    # Check final disk usage
    FINAL_USAGE=$(df "$DISK_PATH" | awk 'NR==2 {print $5}' | sed 's/%//')
    FINAL_AVAILABLE=$(df -h "$DISK_PATH" | awk 'NR==2 {print $4}')
    log "Emergency cleanup completed. Final disk usage: ${FINAL_USAGE}% (${FINAL_AVAILABLE} available)"

    if [ "$FINAL_USAGE" -ge "$CRITICAL_THRESHOLD" ]; then
        alert "CLEANUP COMPLETE: Disk still critical at ${FINAL_USAGE}%. Manual intervention may be required."
    else
        log "CLEANUP SUCCESS: Disk usage reduced to ${FINAL_USAGE}%"
    fi
}

# Get disk usage percentage
DISK_USAGE=$(df "$DISK_PATH" | awk 'NR==2 {print $5}' | sed 's/%//')
DISK_AVAILABLE=$(df -h "$DISK_PATH" | awk 'NR==2 {print $4}')
DISK_USED=$(df -h "$DISK_PATH" | awk 'NR==2 {print $3}')
DISK_TOTAL=$(df -h "$DISK_PATH" | awk 'NR==2 {print $2}')

log "Disk Usage Check: ${DISK_USAGE}% used (${DISK_USED}/${DISK_TOTAL}, ${DISK_AVAILABLE} available)"

# Check thresholds
if [ "$DISK_USAGE" -ge "$AUTOCLEAN_THRESHOLD" ]; then
    alert "CRITICAL: Disk usage at ${DISK_USAGE}%! Initiating emergency cleanup..."
    emergency_cleanup
elif [ "$DISK_USAGE" -ge "$CRITICAL_THRESHOLD" ]; then
    alert "CRITICAL: Disk usage at ${DISK_USAGE}% (${DISK_USED}/${DISK_TOTAL}, ${DISK_AVAILABLE} available)"
elif [ "$DISK_USAGE" -ge "$WARNING_THRESHOLD" ]; then
    alert "WARNING: Disk usage at ${DISK_USAGE}% (${DISK_USED}/${DISK_TOTAL}, ${DISK_AVAILABLE} available)"
else
    log "OK: Disk usage at ${DISK_USAGE}% (${DISK_USED}/${DISK_TOTAL}, ${DISK_AVAILABLE} available)"
fi

exit 0

