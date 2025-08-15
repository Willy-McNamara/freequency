/**
 * Simplified security utilities test suite
 * Focuses on core XSS protection functionality
 */

import { describe, it, expect } from 'vitest';
import { SecurityUtils, SECURITY_CONSTANTS } from './security';

describe('SecurityUtils - Core XSS Protection', () => {
  describe('Basic XSS Prevention', () => {
    it('should remove script tags', () => {
      const input = '<script>alert("XSS")</script>Hello World';
      const result = SecurityUtils.sanitizeInput(input);
      expect(result).toBe('Hello World');
    });

    it('should remove iframe tags', () => {
      const input = '<iframe src="evil.com"></iframe>Content';
      const result = SecurityUtils.sanitizeInput(input);
      expect(result).toBe('Content');
    });

    it('should preserve safe content', () => {
      const input = '<p>This is <strong>safe</strong> content</p>';
      const result = SecurityUtils.sanitizeInput(input);
      expect(result).toBe('<p>This is <strong>safe</strong> content</p>');
    });
  });

  describe('URL Validation', () => {
    it('should validate HTTP URLs', () => {
      const { isValid, sanitizedUrl } = SecurityUtils.validateUrl('http://example.com');
      expect(isValid).toBe(true);
      expect(sanitizedUrl).toBe('http://example.com');
    });

    it('should reject javascript: URLs', () => {
      const { isValid } = SecurityUtils.validateUrl('javascript:alert("XSS")');
      expect(isValid).toBe(false);
    });
  });

  describe('HTML Escaping', () => {
    it('should escape basic HTML entities', () => {
      const input = '<script>alert("XSS")</script>';
      const result = SecurityUtils.escapeHtml(input);
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
    });
  });

  describe('Dangerous Content Detection', () => {
    it('should detect script tags', () => {
      expect(SecurityUtils.containsDangerousContent('<script>alert("XSS")</script>')).toBe(true);
    });

    it('should not flag safe content', () => {
      expect(SecurityUtils.containsDangerousContent('<p>Safe content</p>')).toBe(false);
    });
  });
});
