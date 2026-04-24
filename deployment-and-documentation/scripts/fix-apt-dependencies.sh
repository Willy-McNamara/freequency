#!/bin/bash
# Fix broken apt dependencies on EC2 instance

set -e

echo "Fixing broken apt dependencies..."

# Update package lists
sudo apt-get update

# Fix broken dependencies
sudo apt --fix-broken install -y

# Clean up
sudo apt-get clean
sudo apt-get autoremove -y

echo "✅ Apt dependencies fixed!"


