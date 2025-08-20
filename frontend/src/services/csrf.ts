/**
 * CSRF Protection Service
 * Handles CSRF token generation, validation, and automatic inclusion in requests
 */

import { apiClient } from "./auth";

export interface CSRFConfig {
  tokenHeader: string;
  tokenCookie: string;
  refreshEndpoint: string;
  autoRefresh: boolean;
}

export const CSRF_CONFIG: CSRFConfig = {
  tokenHeader: "X-CSRF-Token",
  tokenCookie: "csrf-token",
  refreshEndpoint: "/auth/csrf-token",
  autoRefresh: true,
};

class CSRFService {
  private token: string | null = null;
  private refreshPromise: Promise<string> | null = null;

  /**
   * Get CSRF token, refreshing if necessary
   */
  async getToken(): Promise<string> {
    // Always refresh to ensure we have the latest token
    console.log("CSRF: Always refreshing token to avoid stale tokens...");

    // If already refreshing, wait for that promise
    if (this.refreshPromise) {
      console.log("CSRF: Waiting for existing refresh promise...");
      return this.refreshPromise;
    }

    // Start refresh
    console.log("CSRF: Starting token refresh...");
    this.refreshPromise = this.refreshToken();
    try {
      this.token = await this.refreshPromise;
      console.log(
        "CSRF: Token refresh completed:",
        this.token.substring(0, 8) + "..."
      );
      return this.token;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Get CSRF token with automatic refresh on failure
   */
  async getTokenWithRefresh(): Promise<string> {
    try {
      console.log("CSRF: Attempting to get token...");
      return await this.getToken();
    } catch {
      // If getting token fails, try to refresh and get a new one
      console.log("CSRF: Token retrieval failed, refreshing...");
      this.clearToken();
      const newToken = await this.refreshToken();
      console.log(
        "CSRF: Token refresh successful:",
        newToken.substring(0, 8) + "..."
      );
      return newToken;
    }
  }

  /**
   * Refresh CSRF token from backend
   */
  async refreshToken(): Promise<string> {
    try {
      // Clear any existing token to prevent conflicts
      this.clearToken();

      console.log("CSRF: Refreshing token from backend...");
      const response = await apiClient.get<{ token: string }>(
        CSRF_CONFIG.refreshEndpoint
      );

      if (response.error || !response.data?.token) {
        throw new Error("Failed to refresh CSRF token");
      }

      this.token = response.data.token;

      // Store in localStorage for persistence across page reloads
      if (typeof window !== "undefined") {
        localStorage.setItem("csrf-token", this.token);
      }

      return this.token;
    } catch (error) {
      console.error("CSRF token refresh failed:", error);
      throw new Error("CSRF protection unavailable");
    }
  }

  /**
   * Get stored token from localStorage (for page reloads)
   */
  getStoredToken(): string | null {
    if (typeof window === "undefined") return null;

    const stored = localStorage.getItem("csrf-token");
    if (stored) {
      this.token = stored;
      return stored;
    }
    return null;
  }

  /**
   * Clear stored token
   */
  clearToken(): void {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("csrf-token");
    }
  }

  /**
   * Validate token format (basic check)
   */
  validateTokenFormat(token: string): boolean {
    // CSRF tokens should be at least 32 characters and contain alphanumeric characters
    return token.length >= 32 && /^[a-zA-Z0-9\-_]+$/.test(token);
  }

  /**
   * Get headers with CSRF token
   */
  async getHeaders(): Promise<Record<string, string>> {
    console.log("CSRF: Getting headers...");
    const token = await this.getTokenWithRefresh();
    const headers = {
      [CSRF_CONFIG.tokenHeader]: token,
    };
    console.log("CSRF: Generated headers:", headers);
    return headers;
  }

  /**
   * Initialize CSRF protection
   */
  async initialize(): Promise<void> {
    try {
      // Always refresh token to ensure we have the latest one
      console.log("CSRF: Initializing - always refreshing token...");
      await this.refreshToken();
    } catch (error) {
      console.warn("CSRF initialization failed:", error);
      // Don't throw - app can still function without CSRF
    }
  }

  /**
   * Check if CSRF protection is available
   */
  isAvailable(): boolean {
    return this.token !== null && this.validateTokenFormat(this.token);
  }
}

// Export singleton instance
export const csrfService = new CSRFService();

// Export utility functions
export const getCSRFHeaders = () => csrfService.getHeaders();
export const initializeCSRF = () => csrfService.initialize();
export const isCSRFAvailable = () => csrfService.isAvailable();
