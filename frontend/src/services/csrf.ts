/**
 * CSRF Protection Service
 * Handles CSRF token generation, validation, and automatic inclusion in requests
 */

import { apiClient } from "./auth";

export const CSRF_CONFIG = {
  tokenHeader: "X-CSRF-Token",
  tokenCookie: "csrf-token",
  refreshEndpoint: "/auth/csrf-token",
} as const;

class CSRFService {
  private token: string | null = null;
  private refreshPromise: Promise<string> | null = null;

  async initialize(): Promise<void> {
    try {
      // Always refresh token to ensure we have the latest one
      await this.refreshToken();
    } catch (error) {
      console.warn("CSRF initialization failed:", error);
      // Don't throw - app can still function without CSRF
    }
  }

  // Method for testing localStorage functionality (not used in production)
  async initializeWithStoredToken(): Promise<void> {
    try {
      // Try to load from localStorage first (for testing purposes only)
      if (typeof window !== "undefined") {
        const storedToken = localStorage.getItem("csrf-token");
        if (storedToken && this.validateTokenFormat(storedToken)) {
          this.token = storedToken;
          return;
        }
      }

      // If no valid stored token, refresh from server
      await this.refreshToken();
    } catch (error) {
      console.warn("CSRF initialization failed:", error);
      // Don't throw - app can still function without CSRF
    }
  }

  isAvailable(): boolean {
    return this.token !== null;
  }

  validateTokenFormat(token: string): boolean {
    // Token should be at least 32 characters and contain only alphanumeric and hyphens
    const minLength = 32;
    const validFormat = /^[a-zA-Z0-9-]+$/;
    return token.length >= minLength && validFormat.test(token);
  }

  async getToken(): Promise<string> {
    // Always refresh to ensure we have the latest token

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

  async getTokenWithRefresh(): Promise<string> {
    try {
      return await this.getToken();
    } catch {
      this.clearToken();
      const newToken = await this.refreshToken();
      return newToken;
    }
  }

  async getHeaders(): Promise<Record<string, string>> {
    const token = await this.getTokenWithRefresh();
    const headers = {
      [CSRF_CONFIG.tokenHeader]: token,
    };
    return headers;
  }

  async refreshToken(): Promise<string> {
    try {
      // Clear any existing token to prevent conflicts
      this.clearToken();

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

  clearToken(): void {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("csrf-token");
    }
  }
}

export const csrfService = new CSRFService();
