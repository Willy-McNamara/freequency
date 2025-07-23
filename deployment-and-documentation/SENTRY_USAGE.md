# Sentry Integration Guide

This document explains how to use Sentry for error tracking and monitoring in the Freequency React app.

## What's Already Set Up

✅ **Sentry initialization** in `main.tsx`
✅ **Error boundary integration** in `ErrorBoundary.tsx`
✅ **Auth integration** in `AuthProvider.tsx`
✅ **Utility functions** in `utils/sentry.ts`

## Features Enabled

- **Error tracking**: Automatic capture of React errors and exceptions
- **Performance monitoring**: Page load times and user interactions
- **Session replay**: See what users were doing when errors occurred
- **User context**: Track errors by user ID, email, etc.
- **Breadcrumbs**: Track user journey through the app

## How to Use Sentry in Your Components

### 1. Track User Actions (Breadcrumbs)

```typescript
import { addSentryBreadcrumb } from "../utils/sentry";

// Track user actions
addSentryBreadcrumb("User clicked practice button", "user.action", {
  page: "practice",
  button: "start-session",
});
```

### 2. Track Custom Events

```typescript
import { trackSentryEvent } from "../utils/sentry";

// Track business events
trackSentryEvent("practice_session_started", {
  duration: 30,
  instrument: "guitar",
  taskType: "scales",
});
```

### 3. Track Performance of Async Operations

```typescript
import { trackPerformance } from "../utils/sentry";

// Wrap async operations
const result = await trackPerformance("fetch_user_data", async () => {
  return await api.getUserData();
});
```

### 4. Set Context for Better Debugging

```typescript
import { setSentryContext, setSentryTag } from "../utils/sentry";

// Add context to errors
setSentryContext("practice_session", {
  instrument: "guitar",
  duration: 30,
  taskId: "123",
});

// Add tags for filtering
setSentryTag("feature", "practice_timer");
```

## Best Practices

### 1. Don't Log Sensitive Data

```typescript
// ❌ Don't do this
addSentryBreadcrumb("User entered password", "auth", {
  password: "secret123", // Never log passwords!
});

// ✅ Do this instead
addSentryBreadcrumb("User attempted login", "auth", {
  method: "google_oauth",
});
```

### 2. Use Descriptive Messages

```typescript
// ❌ Too vague
addSentryBreadcrumb("Error occurred");

// ✅ More descriptive
addSentryBreadcrumb("Failed to save practice session", "api.error", {
  endpoint: "/api/sessions",
  statusCode: 500,
});
```

### 3. Group Related Actions

```typescript
// Track a complete user flow
addSentryBreadcrumb("Practice session started", "practice");
addSentryBreadcrumb("Timer started", "practice");
addSentryBreadcrumb("Session completed", "practice");
```

## Environment Configuration

- **Development**: Sentry is disabled (`enabled: import.meta.env.PROD`)
- **Production**: Full error tracking and performance monitoring
- **Session replay**: 10% of sessions, 100% of error sessions

## Monitoring in Sentry Dashboard

### Key Metrics to Watch

1. **Error Rate**: How often errors occur
2. **Performance**: Page load times and user interactions
3. **User Impact**: Which users are affected by errors
4. **Session Replays**: See exactly what users were doing

### Setting Up Alerts

1. Go to Sentry Dashboard → Alerts
2. Create alerts for:
   - High error rates (>5% in 5 minutes)
   - Performance degradation
   - New error types

## Common Use Cases

### API Error Tracking

```typescript
try {
  const data = await api.fetchData();
  addSentryBreadcrumb("API call successful", "api");
} catch (error) {
  addSentryBreadcrumb("API call failed", "api.error", {
    endpoint: "/api/data",
    statusCode: error.status,
  });
  throw error; // Sentry will automatically capture this
}
```

### Feature Usage Tracking

```typescript
// Track feature adoption
trackSentryEvent("feature_used", {
  feature: "practice_timer",
  version: "1.0.0",
});
```

### Performance Monitoring

```typescript
// Track slow operations
const result = await trackPerformance("slow_operation", async () => {
  // Your slow operation here
  return await heavyComputation();
});
```

## Troubleshooting

### Sentry Not Working?

1. **Check environment**: Make sure `NODE_ENV=production`
2. **Check DSN**: Verify the DSN in `main.tsx`
3. **Check network**: Ensure Sentry can reach the internet
4. **Check console**: Look for Sentry-related errors

### Too Many Events?

1. **Adjust sampling rates** in `main.tsx`
2. **Filter events** using tags and context
3. **Set up alerts** to monitor event volume

## Next Steps

- [ ] Set up Sentry alerts for critical errors
- [ ] Create custom dashboards for business metrics
- [ ] Integrate with your CI/CD pipeline
- [ ] Set up release tracking for better debugging
