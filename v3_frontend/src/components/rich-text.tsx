import React from "react";
import "./rich-text.css";

interface RichTextProps {
  content: string;
  maxLength?: number;
  className?: string;
}

export const RichText: React.FC<RichTextProps> = ({
  content,
  maxLength = 200,
  className = "",
}) => {
  // Simple HTML sanitization - remove potentially dangerous attributes and tags
  const sanitizeHtml = (html: string): string => {
    return (
      html
        // Remove script tags and their content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        // Remove onclick, onload, etc. attributes
        .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "")
        // Remove javascript: URLs
        .replace(/javascript:/gi, "")
        // Remove data: URLs (except for images)
        .replace(/data:(?!image\/)/gi, "")
        // Clean up excessive whitespace
        .replace(/\s+/g, " ")
        .trim()
    );
  };

  // Truncate HTML content while preserving structure
  const truncateHtml = (html: string, maxLength: number): string => {
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // Get text content for length calculation
    const textContent = tempDiv.textContent || tempDiv.innerText || "";

    if (textContent.length <= maxLength) {
      return html;
    }

    // Find where to truncate
    let currentLength = 0;
    let truncatedHtml = "";

    const walkNodes = (node: Node): boolean => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";
        if (currentLength + text.length <= maxLength) {
          truncatedHtml += text;
          currentLength += text.length;
          return false; // Continue walking
        } else {
          // Truncate this text node
          const remainingLength = maxLength - currentLength;
          truncatedHtml += text.substring(0, remainingLength) + "...";
          return true; // Stop walking
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();

        // Skip certain tags that might break layout
        if (["script", "style", "meta", "link"].includes(tagName)) {
          return false;
        }

        truncatedHtml += `<${tagName}`;

        // Copy safe attributes
        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i];
          const attrName = attr.name.toLowerCase();

          // Only allow safe attributes
          if (["class", "style", "id", "dir"].includes(attrName)) {
            truncatedHtml += ` ${attrName}="${attr.value}"`;
          }
        }

        truncatedHtml += ">";

        // Process child nodes
        for (let i = 0; i < element.childNodes.length; i++) {
          if (walkNodes(element.childNodes[i])) {
            break; // Stop if we've reached the limit
          }
        }

        truncatedHtml += `</${tagName}>`;
        return false;
      }

      return false;
    };

    walkNodes(tempDiv);
    return truncatedHtml;
  };

  const sanitizedContent = sanitizeHtml(content);
  const truncatedContent = truncateHtml(sanitizedContent, maxLength);

  return (
    <div
      className={`rich-text ${className}`}
      dangerouslySetInnerHTML={{ __html: truncatedContent }}
      style={{
        // Basic styling for rich text content
        lineHeight: "1.5",
        wordBreak: "break-word",
      }}
    />
  );
};

// Simple rich text editor component for Practice page
interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Add notes...",
  className = "",
}) => {
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.innerHTML;
    onChange(content);
  };

  return (
    <div
      className={`rich-text-editor ${className}`}
      contentEditable
      onInput={handleInput}
      dangerouslySetInnerHTML={{ __html: value || "" }}
      data-placeholder={placeholder}
      style={{
        minHeight: "100px",
        padding: "8px 12px",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        outline: "none",
        lineHeight: "1.5",
        wordBreak: "break-word",
        position: "relative",
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "#3b82f6";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "#d1d5db";
      }}
    />
  );
};
