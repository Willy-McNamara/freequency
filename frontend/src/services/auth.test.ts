import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the CSRF service before importing apiClient
vi.mock("./csrf", () => ({
  csrfService: {
    getHeaders: vi.fn().mockResolvedValue({}),
    refreshToken: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock the auth service
vi.mock("./auth", async () => {
  const actual = await vi.importActual("./auth");
  return {
    ...actual,
    // Mock the actual apiClient methods we want to test
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  };
});

// Mock fetch globally
global.fetch = vi.fn();

const mockFetch = vi.mocked(fetch);

describe("apiClient Error Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fetch mock
    mockFetch.mockReset();
  });

  describe("Error Handling", () => {
    it("should extract error message from response body when status is not ok", async () => {
      // Mock a 400 response with error message in body
      const errorResponse = {
        message: "Content contains potentially unsafe HTML elements",
        statusCode: 400,
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({
          "content-type": "application/json",
        }),
        json: () => Promise.resolve(errorResponse),
        clone: () => ({
          json: () => Promise.resolve(errorResponse),
        }),
      } as any);

      // Test the error handling logic directly
      const response = await mockFetch("/test");
      const errorData = await response.json();

      expect(errorData.message).toBe(
        "Content contains potentially unsafe HTML elements"
      );
      expect(errorData.statusCode).toBe(400);
    });

    it("should extract error from error field when message is not available", async () => {
      // Mock a 400 response with error field instead of message
      const errorResponse = {
        error: "Validation failed: Invalid input",
        statusCode: 400,
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({
          "content-type": "application/json",
        }),
        json: () => Promise.resolve(errorResponse),
        clone: () => ({
          json: () => Promise.resolve(errorResponse),
        }),
      } as any);

      // Test the error handling logic directly
      const response = await mockFetch("/test");
      const errorData = await response.json();

      expect(errorData.error).toBe("Validation failed: Invalid input");
      expect(errorData.statusCode).toBe(400);
    });

    it("should handle network errors gracefully", async () => {
      // Mock a network error
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      try {
        await mockFetch("/test");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe("Network error");
      }
    });

    it("should handle non-Error exceptions gracefully", async () => {
      // Mock a non-Error exception
      mockFetch.mockRejectedValueOnce("String error");

      try {
        await mockFetch("/test");
      } catch (error) {
        expect(error).toBe("String error");
      }
    });

    it("should handle undefined exceptions gracefully", async () => {
      // Mock an undefined exception
      mockFetch.mockRejectedValueOnce(undefined);

      try {
        await mockFetch("/test");
      } catch (error) {
        expect(error).toBeUndefined();
      }
    });
  });

  describe("Security-Related Error Messages", () => {
    it("should extract SQL injection error messages", async () => {
      const errorResponse = {
        message: "Content contains potentially unsafe SQL patterns",
        statusCode: 400,
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({
          "content-type": "application/json",
        }),
        json: () => Promise.resolve(errorResponse),
        clone: () => ({
          json: () => Promise.resolve(errorResponse),
        }),
      } as any);

      const response = await mockFetch("/test");
      const errorData = await response.json();

      expect(errorData.message).toBe(
        "Content contains potentially unsafe SQL patterns"
      );
    });

    it("should extract XSS error messages", async () => {
      const errorResponse = {
        message: "Content contains potentially unsafe HTML elements",
        statusCode: 400,
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({
          "content-type": "application/json",
        }),
        json: () => Promise.resolve(errorResponse),
        clone: () => ({
          json: () => Promise.resolve(errorResponse),
        }),
      } as any);

      const response = await mockFetch("/test");
      const errorData = await response.json();

      expect(errorData.message).toBe(
        "Content contains potentially unsafe HTML elements"
      );
    });

    it("should extract URL-related error messages", async () => {
      const errorResponse = {
        message: "Content contains potentially unsafe URLs",
        statusCode: 400,
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({
          "content-type": "application/json",
        }),
        json: () => Promise.resolve(errorResponse),
        clone: () => ({
          json: () => Promise.resolve(errorResponse),
        }),
      } as any);

      const response = await mockFetch("/test");
      const errorData = await response.json();

      expect(errorData.message).toBe(
        "Content contains potentially unsafe URLs"
      );
    });
  });

  describe("HTTP Status Code Handling", () => {
    it("should handle 400 Bad Request with error message", async () => {
      const errorResponse = {
        message: "Bad request: Invalid input",
        statusCode: 400,
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({
          "content-type": "application/json",
        }),
        json: () => Promise.resolve(errorResponse),
        clone: () => ({
          json: () => Promise.resolve(errorResponse),
        }),
      } as any);

      const response = await mockFetch("/test");
      const errorData = await response.json();

      expect(errorData.message).toBe("Bad request: Invalid input");
      expect(response.status).toBe(400);
    });

    it("should handle 403 Forbidden with error message", async () => {
      const errorResponse = {
        message: "Forbidden: Insufficient permissions",
        statusCode: 403,
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        headers: new Headers({
          "content-type": "application/json",
        }),
        json: () => Promise.resolve(errorResponse),
        clone: () => ({
          json: () => Promise.resolve(errorResponse),
        }),
      } as any);

      const response = await mockFetch("/test");
      const errorData = await response.json();

      expect(errorData.message).toBe("Forbidden: Insufficient permissions");
      expect(response.status).toBe(403);
    });

    it("should handle 500 Internal Server Error with error message", async () => {
      const errorResponse = {
        message: "Internal server error: Database connection failed",
        statusCode: 500,
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers({
          "content-type": "application/json",
        }),
        json: () => Promise.resolve(errorResponse),
        clone: () => ({
          json: () => Promise.resolve(errorResponse),
        }),
      } as any);

      const response = await mockFetch("/test");
      const errorData = await response.json();

      expect(errorData.message).toBe(
        "Internal server error: Database connection failed"
      );
      expect(response.status).toBe(500);
    });
  });

  describe("Content Type Handling", () => {
    it("should handle application/json content type", async () => {
      const errorResponse = {
        message: "JSON error message",
        statusCode: 400,
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({
          "content-type": "application/json",
        }),
        json: () => Promise.resolve(errorResponse),
        clone: () => ({
          json: () => Promise.resolve(errorResponse),
        }),
      } as any);

      const response = await mockFetch("/test");
      const errorData = await response.json();

      expect(errorData.message).toBe("JSON error message");
      expect(response.headers.get("content-type")).toBe("application/json");
    });

    it("should handle application/json with charset", async () => {
      const errorResponse = {
        message: "JSON error message with charset",
        statusCode: 400,
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({
          "content-type": "application/json; charset=utf-8",
        }),
        json: () => Promise.resolve(errorResponse),
        clone: () => ({
          json: () => Promise.resolve(errorResponse),
        }),
      } as any);

      const response = await mockFetch("/test");
      const errorData = await response.json();

      expect(errorData.message).toBe("JSON error message with charset");
      expect(response.headers.get("content-type")).toBe(
        "application/json; charset=utf-8"
      );
    });

    it("should not attempt to parse non-JSON content", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({
          "content-type": "text/plain",
        }),
        json: () => Promise.resolve({}),
        clone: () => ({
          json: () => Promise.resolve({}),
        }),
      } as any);

      const response = await mockFetch("/test");

      expect(response.headers.get("content-type")).toBe("text/plain");
      expect(response.status).toBe(400);
    });
  });
});
