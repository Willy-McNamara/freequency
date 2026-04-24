#!/usr/bin/env bash

set -euo pipefail

if ! command -v aws >/dev/null 2>&1; then
  echo "ERROR: aws CLI is required."
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "ERROR: curl is required."
  exit 1
fi

SG_ID="${1:-${FREEQUENCY_SG_ID:-}}"
REGION="${2:-${AWS_REGION:-us-east-2}}"
DESCRIPTION="${3:-Freequency SSH current IP}"

if [[ -z "${SG_ID}" ]]; then
  echo "Usage: $0 <security-group-id> [region] [description]"
  echo "Or set FREEQUENCY_SG_ID environment variable."
  exit 1
fi

CURRENT_IP="$(curl -s https://checkip.amazonaws.com | tr -d '\n\r')"
if [[ -z "${CURRENT_IP}" ]]; then
  echo "ERROR: could not determine public IP."
  exit 1
fi

CIDR="${CURRENT_IP}/32"
echo "Detected public IP: ${CURRENT_IP}"
echo "Target SG: ${SG_ID} (${REGION})"

EXISTING_SSH_CIDRS="$(aws ec2 describe-security-groups \
  --group-ids "${SG_ID}" \
  --region "${REGION}" \
  --query "SecurityGroups[0].IpPermissions[?FromPort==\`22\` && ToPort==\`22\` && IpProtocol==\`tcp\`].IpRanges[].CidrIp" \
  --output text 2>/dev/null || true)"

if echo "${EXISTING_SSH_CIDRS}" | tr '\t' '\n' | grep -Fxq "${CIDR}"; then
  echo "SSH rule already present: ${CIDR}"
  exit 0
fi

set +e
AUTHORIZE_OUTPUT="$(aws ec2 authorize-security-group-ingress \
  --group-id "${SG_ID}" \
  --protocol tcp \
  --port 22 \
  --cidr "${CIDR}" \
  --region "${REGION}" \
  --tag-specifications "ResourceType=security-group-rule,Tags=[{Key=Name,Value=freequency-ssh-temp}]" \
  --description "${DESCRIPTION}" 2>&1)"
AUTHORIZE_EXIT=$?
set -e

if [[ ${AUTHORIZE_EXIT} -eq 0 ]]; then
  echo "Added SSH ingress rule: ${CIDR}"
  exit 0
fi

if echo "${AUTHORIZE_OUTPUT}" | grep -q "UnauthorizedOperation"; then
  echo "ERROR: IAM user cannot modify security groups."
  echo "Use AWS Console: EC2 -> Security Groups -> ${SG_ID} -> Edit inbound rules -> SSH 22 from ${CIDR}."
  exit 2
fi

echo "ERROR: failed to add SSH ingress rule."
echo "${AUTHORIZE_OUTPUT}"
exit 1
