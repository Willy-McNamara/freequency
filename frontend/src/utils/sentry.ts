import * as Sentry from "@sentry/react";

/**
 * Set user context for Sentry tracking
 * Call this when user logs in
 */
export const setSentryUser = (user: {
  id: string;
  email?: string;
  username?: string;
}) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
};

/**
 * Clear user context when user logs out
 */
export const clearSentryUser = () => {
  Sentry.setUser(null);
};

/**
 * Add breadcrumb for user actions
 * Useful for tracking user journey
 */
export const addSentryBreadcrumb = (
  message: string,
  category: string = "user.action",
  data?: Record<string, unknown>
) => {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: "info",
  });
};

/**
 * Track custom events
 * Useful for business metrics
 */
export const trackSentryEvent = (
  eventName: string,
  data?: Record<string, unknown>
) => {
  Sentry.captureEvent({
    message: eventName,
    level: "info",
    tags: {
      event_type: "custom",
    },
    extra: data,
  });
};

/**
 * Track performance of async operations
 * Note: This is a simplified version that just captures exceptions
 */
export const trackPerformance = async <T>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T> => {
  try {
    const result = await operation();
    return result;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { operation: operationName },
    });
    throw error;
  }
};

/**
 * Set tags for better error categorization
 */
export const setSentryTag = (key: string, value: string) => {
  Sentry.setTag(key, value);
};

/**
 * Set context for better error debugging
 */
export const setSentryContext = (
  name: string,
  data: Record<string, unknown>
) => {
  Sentry.setContext(name, data);
};
