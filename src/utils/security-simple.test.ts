/**
 * Simplified security utilities test suite
 * Focuses on core XSS protection functionality
 */

import { describe, it, expect } from "vitest";
import { SecurityUtils, SECURITY_CONSTANTS } from "./security";

describe("SecurityUtils - Core XSS Protection", () => {
  describe("Basic XSS Prevention", () => {
    it("should remove script tags", () => {
      const input = '<script>alert("XSS")</script>Hello World';
      const result = SecurityUtils.sanitizeInput(input);
      expect(result).toBe("Hello World");
    });

    it("should remove iframe tags", () => {
      const input = '<iframe src="evil.com"></iframe>Content';
      const result = SecurityUtils.sanitizeInput(input);
      expect(result).toBe("Content");
    });

    it("should remove object tags", () => {
      const input = '<object data="evil.swf"></object>Content';
      const result = SecurityUtils.sanitizeInput(input);
      expect(result).toBe("Content");
    });

    it("should remove form tags", () => {
      const input = '<form action="evil.com"><input type="text"></form>Content';
      const result = SecurityUtils.sanitizeInput(input);
      expect(result).toBe("Content");
    });

    it("should preserve safe content", () => {
      const input = "<p>This is <strong>safe</strong> content</p>";
      const result = SecurityUtils.sanitizeInput(input);
      expect(result).toBe("<p>This is <strong>safe</strong> content</p>");
    });
  });

  describe("URL Validation", () => {
    it("should validate HTTP URLs", () => {
      const { isValid, sanitizedUrl } =
        SecurityUtils.validateUrl("http://example.com");
      expect(isValid).toBe(true);
      expect(sanitizedUrl).toBe("http://example.com");
    });

    it("should validate HTTPS URLs", () => {
      const { isValid, sanitizedUrl } = SecurityUtils.validateUrl(
        "https://example.com"
      );
      expect(isValid).toBe(true);
      expect(sanitizedUrl).toBe("https://example.com");
    });

    it("should reject javascript: URLs", () => {
      const { isValid } = SecurityUtils.validateUrl('javascript:alert("XSS")');
      expect(isValid).toBe(false);
    });

    it("should reject data: URLs", () => {
      const { isValid } = SecurityUtils.validateUrl(
        'data:text/html,<script>alert("XSS")</script>'
      );
      expect(isValid).toBe(false);
    });
  });

  describe("HTML Escaping", () => {
    it("should escape basic HTML entities", () => {
      const input = '<script>alert("XSS")</script>';
      const result = SecurityUtils.escapeHtml(input);
      expect(result).toContain("&lt;");
      expect(result).toContain("&gt;");
      expect(result).toContain("&quot;");
    });

    it("should handle special characters", () => {
      const input = "&<>\"'/";
      const result = SecurityUtils.escapeHtml(input);
      expect(result).toContain("&amp;");
      expect(result).toContain("&lt;");
      expect(result).toContain("&gt;");
    });
  });

  describe("Dangerous Content Detection", () => {
    it("should detect script tags", () => {
      expect(
        SecurityUtils.containsDangerousContent('<script>alert("XSS")</script>')
      ).toBe(true);
    });

    it("should detect javascript: URLs", () => {
      expect(
        SecurityUtils.containsDangerousContent('javascript:alert("XSS")')
      ).toBe(true);
    });

    it("should detect data: URLs", () => {
      expect(
        SecurityUtils.containsDangerousContent(
          'data:text/html,<script>alert("XSS")</script>'
        )
      ).toBe(true);
    });

    it("should not flag safe content", () => {
      expect(
        SecurityUtils.containsDangerousContent("<p>Safe content</p>")
      ).toBe(false);
      expect(SecurityUtils.containsDangerousContent("Just plain text")).toBe(
        false
      );
    });
  });

  describe("Utility Functions", () => {
    it("should generate unique IDs", () => {
      const id1 = SecurityUtils.generateSafeId("test");
      const id2 = SecurityUtils.generateSafeId("test");
      expect(id1).not.toBe(id2);
    });

    it("should sanitize valid JSON", () => {
      const input = '{"name": "John", "age": 30}';
      const result = SecurityUtils.sanitizeJson(input);
      expect(result).toBe('{"name":"John","age":30}');
    });

    it("should handle invalid JSON", () => {
      const input = '{"name": "John", "age": 30,}'; // Invalid trailing comma
      const result = SecurityUtils.sanitizeJson(input);
      expect(result).toBe("");
    });
  });
});

describe("SECURITY_CONSTANTS", () => {
  it("should have reasonable limits", () => {
    expect(SECURITY_CONSTANTS.MAX_INPUT_LENGTH).toBe(10000);
    expect(SECURITY_CONSTANTS.MAX_URL_LENGTH).toBe(2048);
  });

  it("should define allowed HTML tags", () => {
    expect(SECURITY_CONSTANTS.ALLOWED_HTML_TAGS).toContain("p");
    expect(SECURITY_CONSTANTS.ALLOWED_HTML_TAGS).toContain("div");
    expect(SECURITY_CONSTANTS.ALLOWED_HTML_TAGS).toContain("strong");
    expect(SECURITY_CONSTANTS.ALLOWED_HTML_TAGS).toContain("em");
  });

  it("should define dangerous patterns", () => {
    expect(SECURITY_CONSTANTS.DANGEROUS_PATTERNS.length).toBeGreaterThan(0);
    expect(
      SECURITY_CONSTANTS.DANGEROUS_PATTERNS.some((p) =>
        p.source.includes("script")
      )
    ).toBe(true);
  });
});
