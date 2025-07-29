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

        # Debug: Show first few lines of log file to understand format
        log "Debug: First 3 lines of log file:"
        head -3 "$log_file" | while read -r line; do
            log "  $line"
        done

        # Count log levels - Pino uses numeric levels in JSON format
        # Pino level mapping: 10=trace, 20=debug, 30=info, 40=warn, 50=error, 60=fatal
        local error_count=$(grep -c '"level":50' "$log_file" 2>/dev/null || echo "0")
        local warn_count=$(grep -c '"level":40' "$log_file" 2>/dev/null || echo "0")
        local info_count=$(grep -c '"level":30' "$log_file" 2>/dev/null || echo "0")
        local debug_count=$(grep -c '"level":20' "$log_file" 2>/dev/null || echo "0")

        # Also try string format in case it's configured differently
        if [ "$error_count" -eq 0 ]; then
            error_count=$(grep -c '"level":"error"' "$log_file" 2>/dev/null || echo "0")
        fi
        if [ "$warn_count" -eq 0 ]; then
            warn_count=$(grep -c '"level":"warn"' "$log_file" 2>/dev/null || echo "0")
        fi
        if [ "$info_count" -eq 0 ]; then
            info_count=$(grep -c '"level":"info"' "$log_file" 2>/dev/null || echo "0")
        fi
        if [ "$debug_count" -eq 0 ]; then
            debug_count=$(grep -c '"level":"debug"' "$log_file" 2>/dev/null || echo "0")
        fi

        # Debug: Show what we found
        log "Debug: Found log counts - error: $error_count, warn: $warn_count, info: $info_count, debug: $debug_count"

        # If all counts are 0, try a more comprehensive search
        if [ "$error_count" -eq 0 ] && [ "$warn_count" -eq 0 ] && [ "$info_count" -eq 0 ] && [ "$debug_count" -eq 0 ]; then
            log "Debug: No log levels found with standard patterns, trying alternative search..."

            # Try to find any log entries with level field
            local total_logs=$(grep -c '"level"' "$log_file" || echo "0")
            log "Debug: Total log entries with 'level' field: $total_logs"

            # Show a few examples of level fields found
            log "Debug: Sample level fields found:"
            grep '"level"' "$log_file" | head -3 | while read -r line; do
                log "  $line"
            done
        fi

        # Extract business metrics from logs
        log "Extracting business metrics..."

        # Authentication events
        local login_events=$(grep -c '"msg":"User authenticated\|login\|Login\|LOGIN"' "$log_file" 2>/dev/null || echo "0")
        local logout_events=$(grep -c '"msg":"User logged out\|logout\|Logout\|LOGOUT"' "$log_file" 2>/dev/null || echo "0")
        local auth_failures=$(grep -c '"msg":"Authentication failed\|auth.*fail\|Auth.*fail"' "$log_file" 2>/dev/null || echo "0")

        # API usage patterns
        local total_requests=$(grep -c '"msg":"request completed"' "$log_file" 2>/dev/null || echo "0")
        local get_requests=$(grep -c '"method":"GET"' "$log_file" 2>/dev/null || echo "0")
        local post_requests=$(grep -c '"method":"POST"' "$log_file" 2>/dev/null || echo "0")
        local put_requests=$(grep -c '"method":"PUT"' "$log_file" 2>/dev/null || echo "0")
        local delete_requests=$(grep -c '"method":"DELETE"' "$log_file" 2>/dev/null || echo "0")

        # HTTP status codes
        local status_200=$(grep -c '"statusCode":200' "$log_file" 2>/dev/null || echo "0")
        local status_404=$(grep -c '"statusCode":404' "$log_file" 2>/dev/null || echo "0")
        local status_500=$(grep -c '"statusCode":500' "$log_file" 2>/dev/null || echo "0")
        local status_4xx=$(grep -c '"statusCode":4[0-9][0-9]' "$log_file" 2>/dev/null || echo "0")
        local status_5xx=$(grep -c '"statusCode":5[0-9][0-9]' "$log_file" 2>/dev/null || echo "0")

        # Business-specific endpoints
        local sessions_created=$(grep -c '"url":"/sessions\|POST.*sessions"' "$log_file" 2>/dev/null || echo "0")
        local tasks_accessed=$(grep -c '"url":"/tasks\|GET.*tasks"' "$log_file" 2>/dev/null || echo "0")
        local practice_sessions=$(grep -c '"url":"/practice\|practice.*session"' "$log_file" 2>/dev/null || echo "0")
        local feed_views=$(grep -c '"url":"/feed\|GET.*feed"' "$log_file" 2>/dev/null || echo "0")

        # Performance metrics
        local avg_response_time=$(grep '"responseTime"' "$log_file" | awk -F'"responseTime":' '{sum+=$2; count++} END {if(count>0) printf "%.2f", sum/count; else print "0"}' 2>/dev/null || echo "0")
        local slow_requests=$(grep '"responseTime":[0-9]\{3,\}' "$log_file" | wc -l 2>/dev/null || echo "0")

        # Error patterns
        local database_errors=$(grep -c '"msg":"Database\|Prisma\|prisma.*error\|database.*error"' "$log_file" 2>/dev/null || echo "0")
        local validation_errors=$(grep -c '"msg":"Validation\|validation.*error\|Validation.*failed"' "$log_file" 2>/dev/null || echo "0")

        # Get file size
        local file_size=$(stat -f%z "$log_file" 2>/dev/null || stat -c%s "$log_file" 2>/dev/null || echo "0")

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
    "authentication": {
        "logins": ${login_events},
        "logouts": ${logout_events},
        "auth_failures": ${auth_failures}
    },
    "api_usage": {
        "total_requests": ${total_requests},
        "get_requests": ${get_requests},
        "post_requests": ${post_requests},
        "put_requests": ${put_requests},
        "delete_requests": ${delete_requests}
    },
    "http_status": {
        "200_ok": ${status_200},
        "404_not_found": ${status_404},
        "500_server_error": ${status_500},
        "4xx_client_errors": ${status_4xx},
        "5xx_server_errors": ${status_5xx}
    },
    "business_metrics": {
        "sessions_created": ${sessions_created},
        "tasks_accessed": ${tasks_accessed},
        "practice_sessions": ${practice_sessions},
        "feed_views": ${feed_views}
    },
    "performance": {
        "avg_response_time_ms": ${avg_response_time},
        "slow_requests_over_1000ms": ${slow_requests}
    },
    "error_patterns": {
        "database_errors": ${database_errors},
        "validation_errors": ${validation_errors}
    },
    "upload_timestamp": "$(date -u +'%Y-%m-%dT%H:%M:%SZ')",
    "upload_status": "success"
}
EOF

        # Upload summary to analytics folder
        aws s3 cp "$summary_file" "s3://${BUCKET}/app/analytics/${YEAR}/${MONTH}/summary-${DATE}.json"
        log "Uploaded enhanced analytics summary to S3"

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