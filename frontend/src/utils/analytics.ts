// Google Analytics utility functions

/**
 * Track a page view
 */
export const trackPageView = (pageTitle: string, pagePath?: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", "G-ME5N6V63GL", {
      page_title: pageTitle,
      page_location: pagePath || window.location.href,
    });
  }
};

/**
 * Track a custom event
 */
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

/**
 * Track user engagement events
 */
export const trackUserEngagement = {
  // Practice session events
  practiceSessionStarted: (duration: number, instrument: string) => {
    trackEvent("practice_session_started", "practice", instrument, duration);
  },

  practiceSessionCompleted: (duration: number, instrument: string) => {
    trackEvent("practice_session_completed", "practice", instrument, duration);
  },

  // Goal events
  goalCreated: (goalType: string) => {
    trackEvent("goal_created", "goals", goalType);
  },

  goalCompleted: (goalType: string) => {
    trackEvent("goal_completed", "goals", goalType);
  },

  // Task events
  taskStarted: (taskType: string) => {
    trackEvent("task_started", "tasks", taskType);
  },

  taskCompleted: (taskType: string) => {
    trackEvent("task_completed", "tasks", taskType);
  },

  // Feature usage
  featureUsed: (feature: string) => {
    trackEvent("feature_used", "features", feature);
  },

  // Authentication events
  userLoggedIn: (method: string) => {
    trackEvent("login", "authentication", method);
  },

  userLoggedOut: () => {
    trackEvent("logout", "authentication");
  },
};

/**
 * Track user properties (for user segmentation)
 */
export const setUserProperties = (properties: Record<string, string>) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", "G-ME5N6V63GL", {
      custom_map: properties,
    });
  }
};

/**
 * Track user ID (for cross-device tracking)
 */
export const setUserId = (userId: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", "G-ME5N6V63GL", {
      user_id: userId,
    });
  }
};
