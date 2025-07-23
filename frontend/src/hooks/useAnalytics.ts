import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  trackPageView,
  trackUserEngagement,
  setUserId,
} from "../utils/analytics";

/**
 * Hook for tracking page views automatically
 */
export const usePageTracking = (pageTitle?: string) => {
  const location = useLocation();

  useEffect(() => {
    const title = pageTitle || document.title;
    trackPageView(title, location.pathname);
  }, [location, pageTitle]);
};

/**
 * Hook for setting user ID when user logs in
 */
export const useUserTracking = (userId?: string) => {
  useEffect(() => {
    if (userId) {
      setUserId(userId);
    }
  }, [userId]);
};

/**
 * Export analytics functions for use in components
 */
export { trackUserEngagement };
