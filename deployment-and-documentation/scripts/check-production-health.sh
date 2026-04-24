#!/usr/bin/env bash

set -euo pipefail

KEY_PATH="${1:-${FREEQUENCY_SSH_KEY:-}}"
HOST="${2:-${FREEQUENCY_HOST:-}}"

if [[ -z "${KEY_PATH}" || -z "${HOST}" ]]; then
  echo "Usage: $0 <key-path> <user@host>"
  echo "Or set FREEQUENCY_SSH_KEY and FREEQUENCY_HOST environment variables."
  exit 1
fi

echo "Checking production health on ${HOST}"
echo

ssh -i "${KEY_PATH}" "${HOST}" '
  set -e
  echo "=== App health ==="
  curl -fsS http://localhost:3000/health
  echo
  echo
  echo "=== Root disk usage ==="
  df -h /
  echo
  echo "=== Containers ==="
  sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
  echo
  echo "=== Disk monitor log (last 8 lines) ==="
  tail -n 8 /home/ubuntu/disk-monitor.log || true
'
