# API Configuration Guide

This document explains how to configure the API endpoints for different environments.

## Overview

The frontend now uses a centralized API configuration system located in `src/config/api.ts`. This makes it easy to switch between development and production environments without hunting down hardcoded URLs.

## Configuration

### Development (Default)

The app automatically uses `http://localhost:3000` as the base URL in development.

### Production

To configure for production, set the `VITE_API_BASE_URL` environment variable:

```bash
# In your deployment environment
VITE_API_BASE_URL=https://your-api-domain.com
```

### Environment Variables

Create a `.env` file in the `v3_frontend` directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000

# For production, change to your actual API domain
# VITE_API_BASE_URL=https://api.yourdomain.com
```

## Usage

The configuration is automatically imported and used throughout the app:

```typescript
import { apiConfig } from "../config/api";

// Use endpoints
const response = await fetch(apiConfig.endpoints.auth.me);
const tasks = await fetch(apiConfig.endpoints.tasks);
```

## Available Endpoints

The configuration includes all API endpoints:

- **Auth**: `/auth/me`, `/auth/login`, `/auth/logout`
- **Musicians**: `/musicians/:id`, `/musicians/all-display-names`, `/musicians/:id/goals`
- **Sessions**: `/sessions`
- **Tasks**: `/tasks`
- **Tasks-in-Use**: `/tasks-in-use/musician/:id`
- **Tags**: `/tags/all-labels`, `/tags`
- **Instruments**: `/instruments/all-labels`

## Docker Deployment

When deploying with Docker, you can set the environment variable in your docker-compose.yml:

```yaml
services:
  frontend:
    build: ./v3_frontend
    environment:
      - VITE_API_BASE_URL=https://your-api-domain.com
```

Or pass it as a build argument:

```yaml
services:
  frontend:
    build:
      context: ./v3_frontend
      args:
        - VITE_API_BASE_URL=https://your-api-domain.com
```

## Benefits

1. **No more hardcoded URLs**: All API calls use the centralized configuration
2. **Easy environment switching**: Just change one environment variable
3. **Type safety**: All endpoints are typed and documented
4. **Consistent patterns**: All API calls follow the same pattern
5. **Deployment ready**: Works seamlessly across different environments
