/**
 * CSRF Service Tests
 * Tests CSRF token management and security features
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { csrfService, CSRF_CONFIG } from "./csrf";

// Mock the auth service
vi.mock("./auth", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe("CSRF Service", () => {
  let mockApiClient: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Reset localStorage
    if (typeof window !== "undefined") {
      localStorage.clear();
    }

    // Reset CSRF service state
    csrfService.clearToken();

    // Mock API client
    mockApiClient = await import("./auth");
    mockApiClient.apiClient.get = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Token Management", () => {
    it("should generate and store token", async () => {
      const mockToken = "test-csrf-token-12345678901234567890123456789012";
      mockApiClient.apiClient.get.mockResolvedValue({
        data: { token: mockToken },
        error: null,
      });

      const token = await csrfService.getToken();

      expect(token).toBe(mockToken);
      expect(csrfService.isAvailable()).toBe(true);
    });

    it("should return cached token without additional API calls", async () => {
      const mockToken = "test-csrf-token-12345678901234567890123456789012";
      mockApiClient.apiClient.get.mockResolvedValue({
        data: { token: mockToken },
        error: null,
      });

      // First call should hit API
      await csrfService.getToken();
      expect(mockApiClient.apiClient.get).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const cachedToken = await csrfService.getToken();
      expect(cachedToken).toBe(mockToken);
      expect(mockApiClient.apiClient.get).toHaveBeenCalledTimes(1); // Still only 1 call
    });

    it("should handle API errors gracefully", async () => {
      mockApiClient.apiClient.get.mockRejectedValue(new Error("API Error"));

      await expect(csrfService.getToken()).rejects.toThrow(
        "CSRF protection unavailable"
      );
      expect(csrfService.isAvailable()).toBe(false);
    });

    it("should handle invalid token responses", async () => {
      mockApiClient.apiClient.get.mockResolvedValue({
        data: null,
        error: "Invalid response",
      });

      await expect(csrfService.getToken()).rejects.toThrow(
        "CSRF protection unavailable"
      );
    });
  });

  describe("Token Validation", () => {
    it("should validate correct token format", () => {
      const validToken = "valid-csrf-token-12345678901234567890123456789012";
      expect(csrfService.validateTokenFormat(validToken)).toBe(true);
    });

    it("should reject tokens that are too short", () => {
      const shortToken = "short-token";
      expect(csrfService.validateTokenFormat(shortToken)).toBe(false);
    });

    it("should reject tokens with invalid characters", () => {
      const invalidToken = "invalid-token-with-special-chars!@#$%^&*()";
      expect(csrfService.validateTokenFormat(invalidToken)).toBe(false);
    });

    it("should reject tokens with spaces", () => {
      const tokenWithSpaces =
        "token with spaces 12345678901234567890123456789012";
      expect(csrfService.validateTokenFormat(tokenWithSpaces)).toBe(false);
    });
  });

  describe("Local Storage Integration", () => {
    it("should store token in localStorage", async () => {
      const mockToken = "test-csrf-token-12345678901234567890123456789012";
      mockApiClient.apiClient.get.mockResolvedValue({
        data: { token: mockToken },
        error: null,
      });

      await csrfService.getToken();

      if (typeof window !== "undefined") {
        expect(localStorage.getItem("csrf-token")).toBe(mockToken);
      }
    });

    it("should retrieve stored token on initialization", async () => {
      const storedToken = "stored-csrf-token-12345678901234567890123456789012";

      if (typeof window !== "undefined") {
        localStorage.setItem("csrf-token", storedToken);
      }

      await csrfService.initialize();
      expect(csrfService.isAvailable()).toBe(true);
    });

    it("should clear token from localStorage", () => {
      const storedToken = "stored-csrf-token-12345678901234567890123456789012";

      if (typeof window !== "undefined") {
        localStorage.setItem("csrf-token", storedToken);
        csrfService.clearToken();
        expect(localStorage.getItem("csrf-token")).toBeNull();
      }
    });
  });

  describe("Concurrent Token Requests", () => {
    it("should handle multiple simultaneous token requests", async () => {
      const mockToken = "test-csrf-token-12345678901234567890123456789012";
      let resolvePromise: (value: any) => void;

      const mockPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockApiClient.apiClient.get.mockReturnValue(mockPromise);

      // Start multiple token requests
      const request1 = csrfService.getToken();
      const request2 = csrfService.getToken();
      const request3 = csrfService.getToken();

      // Resolve the mock promise
      resolvePromise!({
        data: { token: mockToken },
        error: null,
      });

      // All requests should resolve with the same token
      const [token1, token2, token3] = await Promise.all([
        request1,
        request2,
        request3,
      ]);

      expect(token1).toBe(mockToken);
      expect(token2).toBe(mockToken);
      expect(token3).toBe(mockToken);

      // API should only be called once
      expect(mockApiClient.apiClient.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("Headers Generation", () => {
    it("should generate correct headers with token", async () => {
      const mockToken = "test-csrf-token-12345678901234567890123456789012";
      mockApiClient.apiClient.get.mockResolvedValue({
        data: { token: mockToken },
        error: null,
      });

      const headers = await csrfService.getHeaders();

      expect(headers).toEqual({
        [CSRF_CONFIG.tokenHeader]: mockToken,
      });
    });

    it("should throw error when token is unavailable", async () => {
      mockApiClient.apiClient.get.mockRejectedValue(new Error("API Error"));

      await expect(csrfService.getHeaders()).rejects.toThrow(
        "CSRF protection unavailable"
      );
    });
  });

  describe("Initialization", () => {
    it("should initialize with stored token", async () => {
      const storedToken = "stored-csrf-token-12345678901234567890123456789012";

      if (typeof window !== "undefined") {
        localStorage.setItem("csrf-token", storedToken);
      }

      await csrfService.initialize();
      expect(csrfService.isAvailable()).toBe(true);
    });

    it("should refresh token if stored token is invalid", async () => {
      const invalidToken = "invalid";

      if (typeof window !== "undefined") {
        localStorage.setItem("csrf-token", invalidToken);
      }

      const mockToken = "valid-csrf-token-12345678901234567890123456789012";
      mockApiClient.apiClient.get.mockResolvedValue({
        data: { token: mockToken },
        error: null,
      });

      await csrfService.initialize();
      expect(csrfService.isAvailable()).toBe(true);
      expect(mockApiClient.apiClient.get).toHaveBeenCalledWith(
        CSRF_CONFIG.refreshEndpoint
      );
    });

    it("should handle initialization errors gracefully", async () => {
      mockApiClient.apiClient.get.mockRejectedValue(new Error("API Error"));

      // Should not throw
      await expect(csrfService.initialize()).resolves.toBeUndefined();
      expect(csrfService.isAvailable()).toBe(false);
    });
  });

  describe("Configuration", () => {
    it("should use correct configuration values", () => {
      expect(CSRF_CONFIG.tokenHeader).toBe("X-CSRF-Token");
      expect(CSRF_CONFIG.tokenCookie).toBe("csrf-token");
      expect(CSRF_CONFIG.refreshEndpoint).toBe("/auth/csrf-token");
      expect(CSRF_CONFIG.autoRefresh).toBe(true);
    });
  });
});
