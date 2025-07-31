// API Configuration
// This file centralizes all backend URL configuration for easy deployment

interface ApiConfig {
  baseUrl: string;
  authUrl: string;
  endpoints: {
    auth: {
      me: string;
      login: string;
      logout: string;
    };
    musicians: {
      profile: (id: number) => string;
      allDisplayNames: string;
      allIdNames: string;
      goals: (id: number) => string;
      follow: (id: number) => string;
      followStatus: (id: number) => string;
      followCounts: (id: number) => string;
    };
    sessions: {
      base: string;
      getSignedUrl: string;
      connectMedia: string;
    };
    tasks: string;
    tasksInUse: {
      byMusician: (id: number) => string;
    };
    tags: {
      all: string;
      create: string;
    };
    instruments: {
      all: string;
    };
  };
}

// Environment-based configuration
const getApiConfig = (): ApiConfig => {
  // In development, use localhost
  // In production, this will be overridden by environment variables
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const baseUrl =
    (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:3000";

  return {
    baseUrl,
    authUrl: `${baseUrl}/auth`,
    endpoints: {
      auth: {
        me: `${baseUrl}/auth/me`,
        login: `${baseUrl}/auth/login`,
        logout: `${baseUrl}/auth/logout`,
      },
      musicians: {
        profile: (id: number) => `${baseUrl}/musicians/${id}`,
        allDisplayNames: `${baseUrl}/musicians/all-display-names`,
        allIdNames: `${baseUrl}/musicians/all-id-names`,
        goals: (id: number) => `${baseUrl}/musicians/${id}/goals`,
        follow: (id: number) => `${baseUrl}/musicians/${id}/follow`,
        followStatus: (id: number) =>
          `${baseUrl}/musicians/${id}/follow-status`,
        followCounts: (id: number) =>
          `${baseUrl}/musicians/${id}/follow-counts`,
      },
      sessions: {
        base: `${baseUrl}/sessions`,
        getSignedUrl: `${baseUrl}/sessions/signed-url`,
        connectMedia: `${baseUrl}/sessions/connect-media`,
      },
      tasks: `${baseUrl}/tasks`,
      tasksInUse: {
        byMusician: (id: number) => `${baseUrl}/tasks-in-use/musician/${id}`,
      },
      tags: {
        all: `${baseUrl}/tags/all-labels`,
        create: `${baseUrl}/tags`,
      },
      instruments: {
        all: `${baseUrl}/instruments/all-labels`,
      },
    },
  };
};

// Export the configuration
export const apiConfig = getApiConfig();

// Utility function to build full URLs
export const buildApiUrl = (endpoint: string): string => {
  // If endpoint already has http/https, return as-is
  if (endpoint.startsWith("http")) {
    return endpoint;
  }

  // Otherwise, prepend the base URL
  return `${apiConfig.baseUrl}${
    endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  }`;
};

// Environment detection
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isDevelopment = (import.meta as any).env.DEV;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isProduction = (import.meta as any).env.PROD;

// Log configuration in development
if (isDevelopment) {
  console.log("API Configuration:", {
    baseUrl: apiConfig.baseUrl,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    environment: (import.meta as any).env.MODE,
  });
}
