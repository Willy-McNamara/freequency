/**
 * Safe content rendering components with XSS protection
 * Provides secure ways to display user-generated content
 */

import React from "react";
import { SecurityUtils } from "../../utils/security";

interface SafeTextProps {
  text: string;
  className?: string;
  maxLength?: number;
  showEllipsis?: boolean;
}

/**
 * Safe text display component - escapes HTML to prevent XSS
 * Use this for displaying plain text content
 */
export const SafeText: React.FC<SafeTextProps> = ({
  text,
  className = "",
  maxLength,
  showEllipsis = true,
}) => {
  if (!text) return null;

  // Escape HTML entities to prevent XSS
  let safeText = SecurityUtils.escapeHtml(text);

  // Truncate if maxLength is specified
  if (maxLength && safeText.length > maxLength) {
    safeText = safeText.substring(0, maxLength);
    if (showEllipsis) {
      safeText += "...";
    }
  }

  return <span className={className}>{safeText}</span>;
};

interface SafeHtmlProps {
  html: string;
  className?: string;
  maxLength?: number;
  maxLines?: number;
  allowedTags?: string[];
  allowedAttributes?: string[];
}

/**
 * Safe HTML rendering component - sanitizes HTML before rendering
 * Use this for displaying HTML content that needs formatting
 */
export const SafeHtml: React.FC<SafeHtmlProps> = ({
  html,
  className = "",
  maxLength,
  maxLines,
  allowedTags = [
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
  allowedAttributes = ["href", "src", "alt", "title", "class", "id", "style"],
}) => {
  if (!html) return null;

  // Sanitize HTML content
  let safeHtml = SecurityUtils.sanitizeHtml(html);

  // Apply length limits if specified
  if (maxLength && safeHtml.length > maxLength) {
    // Simple truncation - in production you might want more sophisticated HTML truncation
    safeHtml = safeHtml.substring(0, maxLength) + "...";
  }

  // Apply line limits if specified
  if (maxLines) {
    const lines = safeHtml.split("\n");
    if (lines.length > maxLines) {
      safeHtml = lines.slice(0, maxLines).join("\n") + "...";
    }
  }

  return (
    <div
      className={`safe-html ${className}`}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
};

interface SafeUrlProps {
  url: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
  fallback?: React.ReactNode;
}

/**
 * Safe URL link component - validates URLs before creating links
 * Prevents redirect attacks and malicious URLs
 */
export const SafeUrl: React.FC<SafeUrlProps> = ({
  url,
  children,
  className = "",
  target = "_blank",
  rel = "noopener noreferrer",
  fallback = <span className="text-red-500">Invalid URL</span>,
}) => {
  if (!url) return null;

  // Validate and sanitize URL
  const { isValid, sanitizedUrl } = SecurityUtils.validateUrl(url);

  if (!isValid) {
    return <>{fallback}</>;
  }

  return (
    <a href={sanitizedUrl} className={className} target={target} rel={rel}>
      {children}
    </a>
  );
};

interface SafeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  type?: "text" | "email" | "url" | "password";
  maxLength?: number;
  required?: boolean;
  disabled?: boolean;
  onDangerousContent?: (hasDangerousContent: boolean) => void;
}

/**
 * Safe input component - sanitizes input and detects dangerous content
 * Provides real-time feedback about potentially malicious input
 */
export const SafeInput: React.FC<SafeInputProps> = ({
  value,
  onChange,
  placeholder,
  className = "",
  type = "text",
  maxLength,
  required = false,
  disabled = false,
  onDangerousContent,
}) => {
  const [hasDangerousContent, setHasDangerousContent] = React.useState(false);
  const [localValue, setLocalValue] = React.useState(value);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    // Check for dangerous content
    const dangerous = SecurityUtils.containsDangerousContent(newValue);
    setHasDangerousContent(dangerous);

    // Notify parent about dangerous content
    if (onDangerousContent) {
      onDangerousContent(dangerous);
    }

    // Only call onChange if content is safe
    if (!dangerous) {
      onChange(newValue);
    }
  };

  const handleBlur = () => {
    // Sanitize on blur if there was dangerous content
    if (hasDangerousContent) {
      const sanitized = SecurityUtils.sanitizeInput(localValue);
      setLocalValue(sanitized);
      setHasDangerousContent(false);
      onChange(sanitized);
    }
  };

  return (
    <div className="safe-input-container">
      <input
        type={type}
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`${className} ${
          hasDangerousContent ? "border-red-500" : ""
        }`}
        maxLength={maxLength}
        required={required}
        disabled={disabled}
      />
      {hasDangerousContent && (
        <div className="text-red-500 text-sm mt-1">
          ⚠️ Potentially dangerous content detected and removed
        </div>
      )}
    </div>
  );
};

interface SafeTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  maxLength?: number;
  required?: boolean;
  disabled?: boolean;
  onDangerousContent?: (hasDangerousContent: boolean) => void;
}

/**
 * Safe textarea component - sanitizes input and detects dangerous content
 * Similar to SafeInput but for multi-line text
 */
export const SafeTextarea: React.FC<SafeTextareaProps> = ({
  value,
  onChange,
  placeholder,
  className = "",
  rows = 3,
  maxLength,
  required = false,
  disabled = false,
  onDangerousContent,
}) => {
  const [hasDangerousContent, setHasDangerousContent] = React.useState(false);
  const [localValue, setLocalValue] = React.useState(value);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    // Check for dangerous content
    const dangerous = SecurityUtils.containsDangerousContent(newValue);
    setHasDangerousContent(dangerous);

    // Notify parent about dangerous content
    if (onDangerousContent) {
      onDangerousContent(dangerous);
    }

    // Only call onChange if content is safe
    if (!dangerous) {
      onChange(newValue);
    }
  };

  const handleBlur = () => {
    // Sanitize on blur if there was dangerous content
    if (hasDangerousContent) {
      const sanitized = SecurityUtils.sanitizeInput(localValue);
      setLocalValue(sanitized);
      setHasDangerousContent(false);
      onChange(sanitized);
    }
  };

  return (
    <div className="safe-textarea-container">
      <textarea
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`${className} ${
          hasDangerousContent ? "border-red-500" : ""
        }`}
        rows={rows}
        maxLength={maxLength}
        required={required}
        disabled={disabled}
      />
      {hasDangerousContent && (
        <div className="text-red-500 text-sm mt-1">
          ⚠️ Potentially dangerous content detected and removed
        </div>
      )}
    </div>
  );
};

/**
 * Higher-order component for adding security to any component
 * Wraps components with input sanitization and dangerous content detection
 */
export const withSecurity = <P extends object>(
  Component: React.ComponentType<P>,
  securityOptions: {
    sanitizeInputs?: boolean;
    detectDangerousContent?: boolean;
    escapeOutputs?: boolean;
  } = {}
) => {
  const {
    sanitizeInputs = true,
    detectDangerousContent = true,
    escapeOutputs = true,
  } = securityOptions;

  return React.forwardRef<any, P>((props, ref) => {
    // Add security props to the wrapped component
    const securityProps = {
      ...props,
      // Add security methods if needed
      sanitizeInput: sanitizeInputs ? SecurityUtils.sanitizeInput : undefined,
      containsDangerousContent: detectDangerousContent
        ? SecurityUtils.containsDangerousContent
        : undefined,
      escapeHtml: escapeOutputs ? SecurityUtils.escapeHtml : undefined,
    };

    return <Component {...securityProps} ref={ref} />;
  });
};
