#!/usr/bin/env node

/**
 * Deployment Configuration Script
 *
 * This script helps generate the correct environment configuration
 * for different deployment scenarios.
 *
 * Usage:
 *   node scripts/deploy-config.js [environment]
 *
 * Examples:
 *   node scripts/deploy-config.js development
 *   node scripts/deploy-config.js production
 *   node scripts/deploy-config.js staging
 */

const fs = require("fs");
const path = require("path");

const environments = {
  development: {
    VITE_API_BASE_URL: "http://localhost:3000",
    description: "Local development environment",
  },
  staging: {
    VITE_API_BASE_URL: "https://staging-api.yourdomain.com",
    description: "Staging environment",
  },
  production: {
    VITE_API_BASE_URL: "https://api.yourdomain.com",
    description: "Production environment",
  },
};

function generateEnvFile(envName) {
  const config = environments[envName];

  if (!config) {
    console.error(`❌ Unknown environment: ${envName}`);
    console.log(
      "Available environments:",
      Object.keys(environments).join(", ")
    );
    process.exit(1);
  }

  const envContent = `# Environment: ${envName}
# ${config.description}
# Generated on: ${new Date().toISOString()}

# API Configuration
VITE_API_BASE_URL=${config.VITE_API_BASE_URL}

# Add other environment-specific variables here
# VITE_APP_NAME=Freequency
# VITE_APP_VERSION=1.0.0
`;

  const envPath = path.join(__dirname, "..", ".env");

  try {
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Generated .env file for ${envName} environment`);
    console.log(`📁 File location: ${envPath}`);
    console.log(`🔗 API Base URL: ${config.VITE_API_BASE_URL}`);
  } catch (error) {
    console.error(`❌ Failed to write .env file: ${error.message}`);
    process.exit(1);
  }
}

function showDockerCommand(envName) {
  const config = environments[envName];

  if (!config) {
    console.error(`❌ Unknown environment: ${envName}`);
    return;
  }

  console.log("\n🐳 Docker Build Command:");
  console.log(
    `docker build --build-arg VITE_API_BASE_URL=${config.VITE_API_BASE_URL} -t freequency:${envName} .`
  );

  console.log("\n🐳 Docker Compose Example:");
  console.log(`# docker-compose.yml
services:
  app:
    build:
      context: .
      args:
        VITE_API_BASE_URL: ${config.VITE_API_BASE_URL}
    ports:
      - "3000:3000"
`);
}

// Main execution
const envName = process.argv[2] || "development";

console.log(`🚀 Configuring deployment for: ${envName}`);
console.log(
  `📝 ${environments[envName]?.description || "Unknown environment"}`
);

generateEnvFile(envName);
showDockerCommand(envName);

console.log("\n📚 For more information, see API_CONFIG.md");
