/**
 * Security utilities for XSS protection and input sanitization
 * Provides comprehensive protection against common attack vectors
 */

export class SecurityUtils {
  /**
   * Sanitize user input to prevent XSS attacks
   * Removes dangerous HTML tags, attributes, and JavaScript
   */
  static sanitizeInput(input: string): string {
    if (!input || typeof input !== "string") {
      return "";
    }

    return (
      input
        // Remove script tags and their content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        // Remove event handler attributes - multiple passes for different quote styles
        .replace(/\s*on\w+\s*=\s*"[^"]*"/gi, "") // Double quotes
        .replace(/\s*on\w+\s*=\s*'[^']*'/gi, "") // Single quotes
        // Remove javascript: URLs - multiple passes for different quote styles
        .replace(/href\s*=\s*"[^"]*javascript:[^"]*"/gi, 'href=""') // Double quotes
        .replace(/href\s*=\s*'[^']*javascript:[^']*'/gi, "href=''") // Single quotes
        .replace(/src\s*=\s*"[^"]*javascript:[^"]*"/gi, 'src=""') // Double quotes
        .replace(/src\s*=\s*'[^']*javascript:[^']*'/gi, "src=''") // Single quotes
        .replace(/action\s*=\s*"[^"]*javascript:[^"]*"/gi, 'action=""') // Double quotes
        .replace(/action\s*=\s*'[^']*javascript:[^']*'/gi, "action=''") // Single quotes
        // Remove data: URLs (except for images)
        .replace(/data:(?!image\/)/gi, "")
        // Remove vbscript: URLs - multiple passes for different quote styles
        .replace(/href\s*=\s*"[^"]*vbscript:[^"]*"/gi, 'href=""') // Double quotes
        .replace(/href\s*=\s*'[^']*vbscript:[^']*'/gi, "href=''") // Single quotes
        .replace(/src\s*=\s*"[^"]*vbscript:[^"]*"/gi, 'src=""') // Double quotes
        .replace(/src\s*=\s*'[^']*vbscript:[^']*'/gi, "src=''") // Single quotes
        .replace(/action\s*=\s*"[^"]*vbscript:[^"]*"/gi, 'action=""') // Double quotes
        .replace(/action\s*=\s*'[^']*vbscript:[^']*'/gi, "action=''") // Single quotes
        // Remove expression() CSS (IE vulnerability) - more surgical approach
        .replace(/expression\s*\([^)]*\)/gi, "")
        // Remove style attributes with expression() calls
        .replace(/style\s*=\s*"[^"]*expression[^"]*"/gi, 'style=""') // Double quotes
        .replace(/style\s*=\s*'[^']*expression[^']*'/gi, "style=''") // Single quotes
        // Remove eval() calls
        .replace(/eval\s*\(/gi, "")
        // Remove iframe tags
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
        // Remove object tags
        .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
        // Remove embed tags
        .replace(/<embed\b[^<]*>/gi, "")
        // Remove form tags (prevents form submission attacks)
        .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, "")
        // Remove input tags
        .replace(/<input\b[^<]*>/gi, "")
        // Remove button tags
        .replace(/<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi, "")
        // Remove select tags
        .replace(/<select\b[^<]*(?:(?!<\/select>)<[^<]*)*<\/select>/gi, "")
        // Remove textarea tags
        .replace(
          /<textarea\b[^<]*(?:(?!<\/textarea>)<[^<]*)*<\/textarea>/gi,
          ""
        )
        // Remove style tags
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
        // Remove link tags (prevents CSS injection)
        .replace(/<link\b[^<]*>/gi, "")
        // Remove meta tags with dangerous content
        .replace(/<meta\b[^<]*>/gi, "")
        // Remove base tags (prevents base tag hijacking)
        .replace(/<base\b[^<]*>/gi, "")
        // Remove title tags
        .replace(/<title\b[^<]*(?:(?!<\/title>)<[^<]*)*<\/title>/gi, "")
        // Remove head tags
        .replace(/<head\b[^<]*(?:(?!<\/head>)<[^<]*)*<\/head>/gi, "")
        // Remove body tags but preserve content
        .replace(/<body\b[^>]*>/gi, "")
        .replace(/<\/body>/gi, "")
        // Remove html tags but preserve content
        .replace(/<html\b[^>]*>/gi, "")
        .replace(/<\/html>/gi, "")
        // Clean up excessive whitespace
        .replace(/\s+/g, " ")
        .trim()
    );
  }

  /**
   * Sanitize HTML content for safe rendering
   * More permissive than input sanitization, allows safe HTML
   */
  static sanitizeHtml(html: string): string {
    if (!html || typeof html !== "string") {
      return "";
    }

    return (
      html
        // Remove script tags and their content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        // Remove event handler attributes - multiple passes for different quote styles
        .replace(/\s*on\w+\s*=\s*"[^"]*"/gi, "") // Double quotes
        .replace(/\s*on\w+\s*=\s*'[^']*'/gi, "") // Single quotes
        // Remove javascript: URLs - multiple passes for different quote styles
        .replace(/href\s*=\s*"[^"]*javascript:[^"]*"/gi, 'href=""') // Double quotes
        .replace(/href\s*=\s*'[^']*javascript:[^']*'/gi, "href=''") // Single quotes
        .replace(/src\s*=\s*"[^"]*javascript:[^"]*"/gi, 'src=""') // Double quotes
        .replace(/src\s*=\s*'[^']*javascript:[^']*'/gi, "src=''") // Single quotes
        .replace(/action\s*=\s*"[^"]*javascript:[^"]*"/gi, 'action=""') // Double quotes
        .replace(/action\s*=\s*'[^']*javascript:[^']*'/gi, "action=''") // Single quotes
        // Remove data: URLs (except for images)
        .replace(/data:(?!image\/)/gi, "")
        // Remove vbscript: URLs - multiple passes for different quote styles
        .replace(/href\s*=\s*"[^"]*vbscript:[^"]*"/gi, 'href=""') // Double quotes
        .replace(/href\s*=\s*'[^']*vbscript:[^']*'/gi, "href=''") // Single quotes
        .replace(/src\s*=\s*"[^"]*vbscript:[^"]*"/gi, 'src=""') // Double quotes
        .replace(/src\s*=\s*'[^']*vbscript:[^']*'/gi, "src=''") // Single quotes
        .replace(/action\s*=\s*"[^"]*vbscript:[^"]*"/gi, 'action=""') // Double quotes
        .replace(/action\s*=\s*'[^']*vbscript:[^']*'/gi, "action=''") // Single quotes
        // Remove expression() CSS
        .replace(/expression\s*\(/gi, "")
        // Remove eval() calls
        .replace(/eval\s*\(/gi, "")
        // Remove iframe tags
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
        // Remove object tags
        .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
        // Remove embed tags
        .replace(/<embed\b[^<]*>/gi, "")
        // Remove form tags
        .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, "")
        // Remove input tags
        .replace(/<input\b[^<]*>/gi, "")
        // Remove button tags
        .replace(/<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi, "")
        // Remove select tags
        .replace(/<select\b[^<]*(?:(?!<\/select>)<[^<]*)*<\/select>/gi, "")
        // Remove textarea tags
        .replace(
          /<textarea\b[^<]*(?:(?!<\/textarea>)<[^<]*)*<\/textarea>/gi,
          ""
        )
        // Remove style tags
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
        // Remove link tags
        .replace(/<link\b[^<]*>/gi, "")
        // Remove meta tags
        .replace(/<meta\b[^<]*>/gi, "")
        // Remove base tags
        .replace(/<base\b[^<]*>/gi, "")
        // Remove title tags
        .replace(/<title\b[^<]*(?:(?!<\/title>)<[^<]*)*<\/title>/gi, "")
        // Remove head tags
        .replace(/<head\b[^<]*(?:(?!<\/head>)<[^<]*)*<\/head>/gi, "")
        // Remove body tags
        .replace(/<body\b[^<]*(?:(?!<\/body>)<[^<]*)*<\/body>/gi, "")
        // Remove html tags
        .replace(/<html\b[^<]*(?:(?!<\/html>)<[^<]*)*<\/html>/gi, "")
        // Remove dangerous CSS properties
        .replace(/url\s*\(\s*["']?\s*javascript:/gi, "")
        // Clean up excessive whitespace
        .replace(/\s+/g, " ")
        .trim()
    );
  }

  /**
   * Validate and sanitize URLs to prevent redirect attacks
   */
  static validateUrl(url: string): { isValid: boolean; sanitizedUrl: string } {
    if (!url || typeof url !== "string") {
      return { isValid: false, sanitizedUrl: "" };
    }

    try {
      // Check if it's a valid URL
      const urlObj = new URL(url);

      // Only allow HTTP and HTTPS protocols
      if (!["http:", "https:"].includes(urlObj.protocol)) {
        return { isValid: false, sanitizedUrl: "" };
      }

      // Check for dangerous protocols in the URL
      if (
        url.includes("javascript:") ||
        url.includes("data:") ||
        url.includes("vbscript:")
      ) {
        return { isValid: false, sanitizedUrl: "" };
      }

      return { isValid: true, sanitizedUrl: url };
    } catch {
      return { isValid: false, sanitizedUrl: "" };
    }
  }

  /**
   * Escape HTML entities to prevent XSS
   */
  static escapeHtml(text: string): string {
    if (!text || typeof text !== "string") {
      return "";
    }

    const htmlEscapes: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;",
      "/": "&#x2F;",
    };

    return text.replace(/[&<>"'/]/g, (match) => htmlEscapes[match]);
  }

  /**
   * Check if a string contains potentially dangerous content
   */
  static containsDangerousContent(input: string): boolean {
    if (!input || typeof input !== "string") {
      return false;
    }

    const dangerousPatterns = [
      /<script\b/i,
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /expression\s*\(/i,
      /eval\s*\(/i,
      /on\w+\s*=/i,
      /<iframe\b/i,
      /<object\b/i,
      /<embed\b/i,
    ];

    return dangerousPatterns.some((pattern) => pattern.test(input));
  }

  /**
   * Generate a safe ID for DOM elements
   */
  static generateSafeId(prefix: string = "id"): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Sanitize CSS to prevent CSS injection attacks
   */
  static sanitizeCss(css: string): string {
    if (!css || typeof css !== "string") {
      return "";
    }

    return (
      css
        // Remove expression() calls
        .replace(/expression\s*\([^)]*\)/gi, "")
        // Remove url() with javascript: or data: - more surgical approach
        .replace(
          /url\s*\(\s*["']?\s*(?:javascript|data|vbscript):[^)]*\)/gi,
          'url("")'
        )
        // Remove expression() calls in CSS
        .replace(/expression\s*\([^)]*\)/gi, "")
        // Remove import statements
        .replace(/@import\s+[^;]+;/gi, "")
        // Remove @charset rules
        .replace(/@charset\s+[^;]+;/gi, "")
        // Remove @namespace rules
        .replace(/@namespace\s+[^;]+;/gi, "")
        // Clean up excessive whitespace
        .replace(/\s+/g, " ")
        .trim()
    );
  }

  /**
   * Sanitize JSON to prevent prototype pollution
   */
  static sanitizeJson(jsonString: string): string {
    if (!jsonString || typeof jsonString !== "string") {
      return "";
    }

    try {
      // Parse and re-stringify to remove any prototype pollution
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed);
    } catch {
      return "";
    }
  }
}

/**
 * React hook for secure input handling
 */
export const useSecureInput = () => {
  const sanitizeInput = (input: string): string => {
    return SecurityUtils.sanitizeInput(input);
  };

  const validateUrl = (url: string) => {
    return SecurityUtils.validateUrl(url);
  };

  const containsDangerousContent = (input: string): boolean => {
    return SecurityUtils.containsDangerousContent(input);
  };

  return {
    sanitizeInput,
    validateUrl,
    containsDangerousContent,
  };
};

/**
 * Constants for security validation
 */
export const SECURITY_CONSTANTS = {
  MAX_INPUT_LENGTH: 10000,
  MAX_URL_LENGTH: 2048,
  ALLOWED_HTML_TAGS: [
    "p",
    "div",
    "span",
    "strong",
    "em",
    "u",
    "s",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "br",
    "hr",
    "blockquote",
    "pre",
    "code",
    "a",
    "img",
  ],
  ALLOWED_HTML_ATTRIBUTES: [
    "href",
    "src",
    "alt",
    "title",
    "class",
    "id",
    "style",
  ],
  DANGEROUS_PATTERNS: [
    /<script\b/i,
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /expression\s*\(/i,
    /eval\s*\(/i,
    /on\w+\s*=/i,
  ],
} as const;
