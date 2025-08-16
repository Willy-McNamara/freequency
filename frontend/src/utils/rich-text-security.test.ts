import { describe, it, expect } from "vitest";
import { SecurityUtils } from "./security";

describe("Rich Text HTML Security", () => {
  describe("Safe Content Preservation", () => {
    it("should preserve safe HTML formatting", () => {
      const input =
        "<p class='leading-7'>This is <strong>bold</strong> and <em>italic</em> text</p>";
      const result = SecurityUtils.sanitizeHtml(input);
      expect(result).toContain("<p");
      expect(result).toContain("<strong>bold</strong>");
      expect(result).toContain("<em>italic</em>");
    });

    it("should preserve safe CSS classes", () => {
      const input =
        '<span class="text-blue-500 bg-gray-100">Colored text</span>';
      const result = SecurityUtils.sanitizeHtml(input);
      expect(result).toContain('class="text-blue-500 bg-gray-100"');
    });

    it("should preserve safe attributes", () => {
      const input =
        '<div data-testid="content" aria-label="Description">Content</div>';
      const result = SecurityUtils.sanitizeHtml(input);
      expect(result).toContain('data-testid="content"');
      expect(result).toContain('aria-label="Description"');
    });

    it("should preserve safe styling", () => {
      const input =
        '<div style="color: blue; font-size: 16px;">Styled content</div>';
      const result = SecurityUtils.sanitizeHtml(input);
      expect(result).toContain('style="color: blue; font-size: 16px;"');
    });
  });

  describe("Dangerous Content Removal", () => {
    it("should remove script tags", () => {
      const input =
        "<p>Content</p><script>alert('XSS')</script><p>More content</p>";
      const result = SecurityUtils.sanitizeHtml(input);
      expect(result).not.toContain("<script>");
      expect(result).not.toContain("alert('XSS')");
      expect(result).toContain("<p>Content</p>");
      expect(result).toContain("<p>More content</p>");
    });

    it("should remove event handlers", () => {
      const input = "<p onclick=\"alert('XSS')\">Click me</p>";
      const result = SecurityUtils.sanitizeHtml(input);
      expect(result).toBe("<p>Click me</p>");
    });

    it("should remove javascript: URLs", () => {
      const input = "<a href=\"javascript:alert('XSS')\">Click me</a>";
      const result = SecurityUtils.sanitizeHtml(input);
      expect(result).toBe('<a href="">Click me</a>');
    });

    it("should remove iframe tags", () => {
      const input =
        "<p>Content</p><iframe src='evil.com'></iframe><p>More content</p>";
      const result = SecurityUtils.sanitizeHtml(input);
      expect(result).not.toContain("<iframe>");
      expect(result).toContain("<p>Content</p>");
      expect(result).toContain("<p>More content</p>");
    });

    it("should remove form tags", () => {
      const input =
        "<p>Content</p><form action='evil.com'><input type='text'></form><p>More content</p>";
      const result = SecurityUtils.sanitizeHtml(input);
      expect(result).not.toContain("<form>");
      expect(result).not.toContain("<input>");
      expect(result).toContain("<p>Content</p>");
      expect(result).toContain("<p>More content</p>");
    });
  });

  describe("Lexical Editor Compatibility", () => {
    it("should preserve Lexical editor structure", () => {
      const input =
        '<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Content</span></p>';
      const result = SecurityUtils.sanitizeHtml(input);
      expect(result).toContain('class="leading-7 [&:not(:first-child)]:mt-6"');
      expect(result).toContain('dir="ltr"');
      expect(result).toContain('style="white-space: pre-wrap;"');
    });

    it("should preserve complex CSS selectors", () => {
      const input =
        '<div class="[&>p]:mt-4 [&>p:first-child]:mt-0">Content</div>';
      const result = SecurityUtils.sanitizeHtml(input);
      expect(result).toContain('class="[&>p]:mt-4 [&>p:first-child]:mt-0"');
    });

    it("should preserve safe data attributes", () => {
      const input =
        '<div data-lexical-editor="true" data-testid="editor">Editor content</div>';
      const result = SecurityUtils.sanitizeHtml(input);
      expect(result).toContain('data-lexical-editor="true"');
      expect(result).toContain('data-testid="editor"');
    });
  });

  describe("Mixed Content Handling", () => {
    it("should handle content with both safe and dangerous elements", () => {
      const input =
        '<p>Safe content</p><script>alert("XSS")</script><div class="safe">More safe content</div>';
      const result = SecurityUtils.sanitizeHtml(input);
      expect(result).toContain("<p>Safe content</p>");
      expect(result).not.toContain("<script>");
      expect(result).toContain('<div class="safe">More safe content</div>');
    });

    it("should preserve content around dangerous elements", () => {
      const input = '<p>Before</p><iframe src="evil.com"></iframe><p>After</p>';
      const result = SecurityUtils.sanitizeHtml(input);
      expect(result).toContain("<p>Before</p>");
      expect(result).not.toContain("<iframe>");
      expect(result).toContain("<p>After</p>");
    });
  });
});
