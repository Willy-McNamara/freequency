# Google Analytics Integration Guide

This document explains how to use Google Analytics for tracking user behavior and business metrics in the Freequency React app.

## Setup Instructions

### 1. Create Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new account for your app
3. Create a new property (GA4)
4. Get your **Measurement ID** (starts with "G-")

### 2. Measurement ID Configuration

Your Measurement ID `G-ME5N6V63GL` is already configured in:

- `frontend/src/main.tsx` (2 places)
- `frontend/src/utils/analytics.ts` (3 places)

### 3. Deploy to Production

Google Analytics only works in production (`import.meta.env.PROD` is true).

## What's Already Set Up

✅ **Automatic page view tracking**
✅ **User authentication tracking** (login/logout)
✅ **Utility functions** for custom events
✅ **React hooks** for easy integration
✅ **TypeScript support**

## How to Use Google Analytics

### 1. Track Page Views (Automatic)

Page views are automatically tracked when you use the `usePageTracking` hook:

```typescript
import { usePageTracking } from "../hooks/useAnalytics";

function MyPage() {
  usePageTracking("My Page Title");

  return <div>My page content</div>;
}
```

### 2. Track Custom Events

```typescript
import { trackUserEngagement } from "../hooks/useAnalytics";

// Track practice session
trackUserEngagement.practiceSessionStarted(30, "guitar");

// Track goal completion
trackUserEngagement.goalCompleted("daily_practice");

// Track feature usage
trackUserEngagement.featureUsed("practice_timer");
```

### 3. Track Custom Events (Advanced)

```typescript
import { trackEvent } from "../utils/analytics";

// Custom event with category, action, label, and value
trackEvent("button_click", "ui", "start_practice_button", 1);
```

## Pre-built Tracking Functions

### Practice Events

```typescript
trackUserEngagement.practiceSessionStarted(duration, instrument);
trackUserEngagement.practiceSessionCompleted(duration, instrument);
```

### Goal Events

```typescript
trackUserEngagement.goalCreated(goalType);
trackUserEngagement.goalCompleted(goalType);
```

### Task Events

```typescript
trackUserEngagement.taskStarted(taskType);
trackUserEngagement.taskCompleted(taskType);
```

### Feature Usage

```typescript
trackUserEngagement.featureUsed(feature);
```

### Authentication

```typescript
trackUserEngagement.userLoggedIn(method);
trackUserEngagement.userLoggedOut();
```

## Integration Examples

### Practice Timer Component

```typescript
import { trackUserEngagement } from "../hooks/useAnalytics";

function PracticeTimer() {
  const startSession = () => {
    trackUserEngagement.practiceSessionStarted(30, "guitar");
    // Start timer logic
  };

  const completeSession = () => {
    trackUserEngagement.practiceSessionCompleted(30, "guitar");
    // Complete session logic
  };

  return (
    <div>
      <button onClick={startSession}>Start Practice</button>
      <button onClick={completeSession}>Complete Session</button>
    </div>
  );
}
```

### Goals Component

```typescript
import { trackUserEngagement } from "../hooks/useAnalytics";

function GoalsView() {
  const createGoal = (type: string) => {
    trackUserEngagement.goalCreated(type);
    // Create goal logic
  };

  const completeGoal = (type: string) => {
    trackUserEngagement.goalCompleted(type);
    // Complete goal logic
  };

  return <div>{/* Goal UI */}</div>;
}
```

## Google Analytics Dashboard

### Key Metrics to Monitor

1. **User Engagement**

   - Page views per session
   - Time on page
   - Bounce rate

2. **Feature Usage**

   - Practice sessions started/completed
   - Goals created/completed
   - Feature adoption rates

3. **User Journey**

   - Most common user paths
   - Drop-off points
   - Conversion funnels

4. **User Demographics**
   - Geographic location
   - Device types
   - Browser usage

### Setting Up Custom Reports

1. Go to Google Analytics → Reports → Explore
2. Create custom reports for:
   - Practice session metrics
   - Goal completion rates
   - Feature usage trends
   - User retention

### Setting Up Goals

1. Go to Google Analytics → Admin → Goals
2. Create goals for:
   - Practice session completion
   - Goal achievement
   - User registration
   - Feature adoption

## Privacy Considerations

### Data Collection

- Google Analytics collects anonymous usage data
- No personally identifiable information (PII) is sent
- User IDs are hashed for privacy

### GDPR Compliance

- Consider adding a cookie consent banner
- Provide opt-out mechanisms
- Document data collection practices

### Data Retention

- Google Analytics data is retained for 26 months by default
- You can adjust retention settings in GA4

## Troubleshooting

### Analytics Not Working?

1. **Check environment**: Make sure `NODE_ENV=production`
2. **Check Measurement ID**: Verify it's correct in all files
3. **Check browser console**: Look for GA-related errors
4. **Check network**: Ensure GA can reach the internet

### Events Not Showing?

1. **Check event names**: Use consistent naming conventions
2. **Check timing**: Events may take 24-48 hours to appear
3. **Check filters**: Ensure no filters are blocking events
4. **Check real-time reports**: Events appear immediately in real-time

## Best Practices

### 1. Consistent Naming

```typescript
// ✅ Good
trackUserEngagement.practiceSessionStarted(30, "guitar");

// ❌ Bad
trackEvent("start", "practice", "guitar", 30);
```

### 2. Meaningful Categories

```typescript
// ✅ Good categories
"practice", "goals", "tasks", "features", "authentication";

// ❌ Bad categories
"click", "action", "event";
```

### 3. Descriptive Labels

```typescript
// ✅ Good labels
"practice_session_started", "goal_completed", "feature_used";

// ❌ Bad labels
"click", "submit", "action";
```

## Next Steps

- [ ] Replace `G-XXXXXXXXXX` with your actual Measurement ID
- [ ] Deploy to production to start collecting data
- [ ] Set up custom reports and goals in Google Analytics
- [ ] Add tracking to key user interactions
- [ ] Monitor and analyze user behavior patterns
