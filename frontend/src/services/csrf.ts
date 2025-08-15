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
    if (this.token) {
      return this.token;
    }

    // If already refreshing, wait for that promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // Start refresh
    this.refreshPromise = this.refreshToken();
    try {
      this.token = await this.refreshPromise;
      return this.token;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Refresh CSRF token from server
   */
  private async refreshToken(): Promise<string> {
    try {
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
    const token = await this.getToken();
    return {
      [CSRF_CONFIG.tokenHeader]: token,
    };
  }

  /**
   * Initialize CSRF protection
   */
  async initialize(): Promise<void> {
    try {
      // Try to get stored token first
      const stored = this.getStoredToken();
      if (stored && this.validateTokenFormat(stored)) {
        this.token = stored;
        return;
      }

      // If no valid stored token, refresh
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
