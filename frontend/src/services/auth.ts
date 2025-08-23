// Auth service for handling authentication API calls
import { apiConfig, buildApiUrl } from "../config/api";

interface User {
  id: number;
  email: string;
  name: string;
  displayName?: string;
  avatarUrl?: string;
}

interface ApiResponse<T> {
  data: T | null;
  error?: string;
}

// Base API client with authentication handling
export const apiClient = {
  async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Use the centralized URL builder
      const fullUrl = buildApiUrl(url);

      // Get CSRF headers for state-changing requests
      let csrfHeaders = {};
      if (
        options.method &&
        ["POST", "PUT", "DELETE", "PATCH"].includes(options.method)
      ) {
        try {
          const { csrfService } = await import("./csrf");
          csrfHeaders = await csrfService.getHeaders();
        } catch (error) {
          console.warn("CSRF headers unavailable:", error);
        }
      }

      const response = await fetch(fullUrl, {
        ...options,
        credentials: "include", // Include JWT cookies
        headers: {
          "Content-Type": "application/json",
          ...csrfHeaders,
          ...options.headers,
        },
      });

      // Check if response has content before parsing JSON
      const contentType = response.headers.get("content-type");
      const hasContent =
        contentType && contentType.includes("application/json");

      let data: T | null = null;
      
      if (response.status === 401) {
        // Check if this is a CSRF token failure by looking at the response body
        try {
          const errorData = await response.clone().json();
          if (errorData.message && (
            errorData.message.includes('CSRF') || 
            errorData.message.includes('Invalid CSRF token') ||
            errorData.message.includes('CSRF token required')
          )) {
            // CSRF token failure - refresh token and retry
            console.log("CSRF token failed, refreshing and retrying...");
            const { csrfService } = await import("./csrf");
            await csrfService.refreshToken();
            
            // Retry the request with new CSRF token
            const newCsrfHeaders = await csrfService.getHeaders();
            const retryResponse = await fetch(fullUrl, {
              ...options,
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                ...newCsrfHeaders,
                ...options.headers,
              },
            });
            
            if (retryResponse.status === 401) {
              // Still failing after refresh, redirect to login
              if (window.location.pathname !== "/login") {
                window.location.href = "/login";
              }
              throw new Error("Authentication required");
            }
            
            if (!retryResponse.ok) {
              throw new Error(`HTTP error! status: ${retryResponse.status}`);
            }
            
            // Parse retry response
            const retryContentType = retryResponse.headers.get("content-type");
            const retryHasContent = retryContentType && retryContentType.includes("application/json");
            
            if (retryHasContent) {
              try {
                data = await retryResponse.json();
              } catch (parseError) {
                console.warn("Failed to parse JSON response:", parseError);
              }
            }
            
            return { data };
          }
        } catch {
          // If we can't parse the error response, assume it's not CSRF related
        }
        
        // Redirect to login on authentication failure if not already on /login
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        throw new Error("Authentication required");
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      if (hasContent) {
        try {
          data = await response.json();
        } catch (parseError) {
          console.warn("Failed to parse JSON response:", parseError);
        }
      }

      return { data };
    } catch (error) {
      console.error("API request failed:", error);
      return {
        data: null as T,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  get: <T>(url: string) => apiClient.request<T>(url),

  post: <T>(url: string, data: Record<string, unknown>) =>
    apiClient.request<T>(url, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: <T>(url: string, data: Record<string, unknown>) =>
    apiClient.request<T>(url, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: <T>(url: string) =>
    apiClient.request<T>(url, {
      method: "DELETE",
    }),
};

// Authentication-specific API functions
export const authService = {
  // Check if user is authenticated
  async checkAuthStatus(): Promise<User | null> {
    try {
      const response = await apiClient.get<User>("/auth/me");
      return response.error ? null : response.data;
    } catch (error) {
      console.error("Auth check failed:", error);
      return null;
    }
  },

  // Initiate Google OAuth login
  loginWithGoogle(): void {
    window.location.href = apiConfig.endpoints.auth.login;
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout", {});
    } catch (error) {
      console.error("Logout failed:", error);
    }
  },

  // Get current user profile
  async getCurrentUser(): Promise<User | null> {
    return authService.checkAuthStatus();
  },
};

// Utility function for handling API errors
export const handleApiError = (error: unknown): void => {
  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    error.status === 401
  ) {
    // Redirect to login on authentication failure
    window.location.href = "/login";
  } else if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "status" in error.response &&
    error.response.status === 401
  ) {
    window.location.href = "/login";
  } else {
    console.error("API Error:", error);
  }
};

// Wrapper for authenticated API calls
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  try {
    const fullUrl = buildApiUrl(url);
    const response = await fetch(fullUrl, {
      ...options,
      credentials: "include",
    });

    if (response.status === 401) {
      window.location.href = "/login";
      throw new Error("Authentication required");
    }

    return response;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
