#!/bin/bash
set -e

# Log Upload Setup Script for EC2
# This script automates the setup of daily log uploads to S3

echo "Setting up log upload automation..."

# Configuration
SCRIPT_DIR="/home/ubuntu"
CONTAINER_NAME="${1:-}"  # Pass container name as first argument

if [ -z "$CONTAINER_NAME" ]; then
    echo "Error: Please provide the Docker container name as an argument"
    echo "Usage: $0 <container-name>"
    echo ""
    echo "To find your container name, run: docker ps"
    exit 1
fi

echo "Container name: $CONTAINER_NAME"

# Step 1: Create the wrapper script
echo "Creating wrapper script..."
cat > "$SCRIPT_DIR/run-log-upload.sh" << 'EOF'
#!/bin/bash
set -e

# Configuration
CONTAINER_NAME="CONTAINER_NAME_PLACEHOLDER"
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
EOF

# Replace placeholder with actual container name
sed -i "s/CONTAINER_NAME_PLACEHOLDER/$CONTAINER_NAME/g" "$SCRIPT_DIR/run-log-upload.sh"

# Make wrapper script executable
chmod +x "$SCRIPT_DIR/run-log-upload.sh"

# Step 2: Set up cron job
echo "Setting up cron job..."
(crontab -l 2>/dev/null; echo "0 0 * * * $SCRIPT_DIR/run-log-upload.sh") | crontab -

# Step 3: Test the setup
echo "Testing setup..."

# Test that container exists
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "Error: Container '$CONTAINER_NAME' not found"
    echo "Available containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}"
    exit 1
fi

# Test AWS CLI in container
echo "Testing AWS CLI in container..."
if docker exec "$CONTAINER_NAME" aws --version > /dev/null 2>&1; then
    echo "✅ AWS CLI is available in container"
else
    echo "❌ AWS CLI not found in container"
    echo "Make sure your Dockerfile includes AWS CLI installation"
    exit 1
fi

# Test S3 access
echo "Testing S3 access..."
if docker exec "$CONTAINER_NAME" aws s3 ls s3://freequency-app-logs/ > /dev/null 2>&1; then
    echo "✅ S3 access confirmed"
else
    echo "❌ S3 access failed"
    echo "Make sure your EC2 instance has the correct IAM role attached"
    exit 1
fi

# Test wrapper script
echo "Testing wrapper script..."
if "$SCRIPT_DIR/run-log-upload.sh" > /dev/null 2>&1; then
    echo "✅ Wrapper script test passed"
else
    echo "⚠️  Wrapper script test failed (this might be expected if no logs exist yet)"
fi

# Step 4: Show status
echo ""
echo "✅ Log upload setup completed!"
echo ""
echo "Cron job will run daily at midnight UTC"
echo "Container name: $CONTAINER_NAME"
echo "Wrapper script: $SCRIPT_DIR/run-log-upload.sh"
echo "Log file: $SCRIPT_DIR/log-upload.log"
echo ""
echo "To monitor:"
echo "  tail -f $SCRIPT_DIR/log-upload.log"
echo ""
echo "To test manually:"
echo "  $SCRIPT_DIR/run-log-upload.sh"
echo ""
echo "To check cron job:"
echo "  crontab -l"