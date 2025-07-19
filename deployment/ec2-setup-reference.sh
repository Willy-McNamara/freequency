#!/bin/bash
# Reference script: Steps to prime a new Ubuntu EC2 instance for Dockerized app deployment
# Not meant to be run directly; use as a checklist or for automation manifests

# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Docker
sudo apt-get install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker

# (Optional) Add user to docker group for non-root Docker usage
sudo usermod -aG docker $USER
# You may need to log out and back in for group changes to take effect

# 3. Install AWS CLI
sudo apt-get install -y awscli

# 4. Authenticate Docker to ECR (replace region/account as needed)
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 1234.dkr.ecr.us-east-2.amazonaws.com

# 5. Pull and run your app (after copying .env.production to the instance)
docker pull 1234.dkr.ecr.us-east-2.amazonaws.com/freequency-dev:latest
docker run --name freequency-app --env-file /path/to/.env.production -p 3000:3000 -d 1234.dkr.ecr.us-east-2.amazonaws.com/freequency-dev:latest

# 6. (In AWS Console) Ensure EC2 Security Group allows inbound TCP on port 3000
# 7. (Optional) Set up Elastic IP or DNS for stable public access