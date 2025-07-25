#!/bin/bash
set -e

# Configuration
LOG_DIR="/app/api/logs"
LOG_FILE="app.log"
BUCKET="freequency-app-logs"
DATE=$(date +'%Y-%m-%d')
YEAR=$(date +'%Y')
MONTH=$(date +'%m')
DAY=$(date +'%d')
S3_PATH="s3://${BUCKET}/app/${YEAR}/${MONTH}/${DAY}/"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Check if log file exists
if [ ! -f "${LOG_DIR}/${LOG_FILE}" ]; then
    warn "Log file ${LOG_DIR}/${LOG_FILE} does not exist. Nothing to upload."
    exit 0
fi

# Check if log file is empty
if [ ! -s "${LOG_DIR}/${LOG_FILE}" ]; then
    warn "Log file ${LOG_DIR}/${LOG_FILE} is empty. Nothing to upload."
    exit 0
fi

# Create backup with timestamp
BACKUP_FILE="app-${DATE}.log"
log "Creating backup: ${BACKUP_FILE}"

# Copy current log to backup
cp "${LOG_DIR}/${LOG_FILE}" "${LOG_DIR}/${BACKUP_FILE}"

# Upload to S3
log "Uploading ${BACKUP_FILE} to S3..."
if aws s3 cp "${LOG_DIR}/${BACKUP_FILE}" "${S3_PATH}${BACKUP_FILE}"; then
    log "Successfully uploaded ${BACKUP_FILE} to ${S3_PATH}"

    # Create a JSON summary for analytics
    create_analytics_summary() {
        local log_file="$1"
        local summary_file="${LOG_DIR}/summary-${DATE}.json"

        # Count log levels
        local error_count=$(grep -c '"level":"error"' "$log_file" || echo "0")
        local warn_count=$(grep -c '"level":"warn"' "$log_file" || echo "0")
        local info_count=$(grep -c '"level":"info"' "$log_file" || echo "0")
        local debug_count=$(grep -c '"level":"debug"' "$log_file" || echo "0")

        # Get file size
        local file_size=$(stat -c%s "$log_file")

        # Create JSON summary
        cat > "$summary_file" << EOF
{
    "date": "${DATE}",
    "filename": "${BACKUP_FILE}",
    "file_size_bytes": ${file_size},
    "log_counts": {
        "error": ${error_count},
        "warn": ${warn_count},
        "info": ${info_count},
        "debug": ${debug_count}
    },
    "upload_timestamp": "$(date -u +'%Y-%m-%dT%H:%M:%SZ')",
    "upload_status": "success"
}
EOF

        # Upload summary to analytics folder
        aws s3 cp "$summary_file" "s3://${BUCKET}/app/analytics/${YEAR}/${MONTH}/summary-${DATE}.json"
        log "Uploaded analytics summary to S3"

        # Clean up local summary
        rm -f "$summary_file"
    }

    # Create and upload analytics summary
    create_analytics_summary "${LOG_DIR}/${BACKUP_FILE}"

    # Clean up local backup file
    rm -f "${LOG_DIR}/${BACKUP_FILE}"
    log "Cleaned up local backup file"

    # Truncate the original log file (keep it open for the application)
    log "Truncating original log file..."
    > "${LOG_DIR}/${LOG_FILE}"
    log "Log rotation complete"

else
    error "Failed to upload ${BACKUP_FILE} to S3"
    # Keep the backup file locally for manual upload later
    warn "Keeping ${BACKUP_FILE} locally for manual upload"
    exit 1
fi

# Optional: Clean up old local log files (keep last 7 days)
log "Cleaning up old local log files..."
find "${LOG_DIR}" -name "app-*.log" -mtime +7 -delete 2>/dev/null || true

log "Daily log upload completed successfully"