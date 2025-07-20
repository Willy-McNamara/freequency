"use client";

import React from "react";
import { useState, useEffect, useRef } from "react";
import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import {
  ParagraphNode,
  TextNode,
  LexicalEditor,
  LexicalNode,
  $getRoot,
} from "lexical";
import { OverflowNode } from "@lexical/overflow";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { ContentEditable } from "@/components/editor/editor-ui/content-editable";
import { FontFormatToolbarPlugin } from "@/components/editor/plugins/toolbar/font-format-toolbar-plugin";
import { ToolbarPlugin } from "@/components/editor/plugins/toolbar/toolbar-plugin";
import { editorTheme } from "@/components/editor/themes/editor-theme";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./rich-text.css";

// Rich text renderer for displaying content (used in feed and post view)
interface RichTextRendererProps {
  content: string;
  maxLength?: number;
  maxLines?: number;
  noTruncate?: boolean;
  className?: string;
}

export const RichTextRenderer: React.FC<RichTextRendererProps> = ({
  content,
  maxLength = 200,
  maxLines = 5,
  noTruncate = false,
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
  const truncateHtml = (
    html: string,
    maxLength: number,
    maxLines: number
  ): string => {
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // Get text content for length calculation
    const textContent = tempDiv.textContent || tempDiv.innerText || "";

    if (textContent.length <= maxLength) {
      // Even if under character limit, check line count
      const lineCount = countLines(tempDiv);

      if (lineCount <= maxLines) {
        return html;
      }
    }

    // Find where to truncate
    let currentLength = 0;
    let currentLines = 0;
    let truncatedHtml = "";
    let shouldTruncate = false;

    const walkNodes = (node: Node): boolean => {
      if (shouldTruncate) {
        return true; // Stop walking if we've already decided to truncate
      }

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";
        const textLines = countTextLines(text);

        // Check if adding this text would exceed either limit
        if (
          currentLength + text.length <= maxLength &&
          currentLines + textLines <= maxLines
        ) {
          truncatedHtml += text;
          currentLength += text.length;
          currentLines += textLines;
          return false; // Continue walking
        } else {
          // Truncate this text node
          const remainingLength = Math.max(0, maxLength - currentLength);
          const remainingLines = Math.max(0, maxLines - currentLines);

          // Truncate based on whichever limit is hit first
          let truncatedText = text;
          if (currentLength + text.length > maxLength) {
            truncatedText = text.substring(0, remainingLength);
          }
          if (currentLines + textLines > maxLines) {
            // Find the nth line break
            const lines = text.split("\n");
            let lineCount = 0;
            let charCount = 0;
            for (
              let i = 0;
              i < lines.length && lineCount < remainingLines;
              i++
            ) {
              charCount += lines[i].length + (i < lines.length - 1 ? 1 : 0); // +1 for newline
              lineCount++;
            }
            // Use the shorter truncation if both limits are exceeded
            const lineTruncatedText = text.substring(0, charCount);
            if (lineTruncatedText.length < truncatedText.length) {
              truncatedText = lineTruncatedText;
            }
          }

          truncatedHtml += truncatedText;
          shouldTruncate = true; // Mark that we should truncate, but don't add ellipsis yet
          return true; // Stop walking
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();

        // Skip certain tags that might break layout
        if (["script", "style", "meta", "link"].includes(tagName)) {
          return false;
        }

        // Check if this element creates a new line
        const createsNewLine = [
          "p",
          "div",
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "br",
          "li",
        ].includes(tagName);
        if (createsNewLine && currentLines >= maxLines) {
          shouldTruncate = true; // Mark that we should truncate, but don't add ellipsis yet
          return true; // Stop walking
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

        // Increment line count for block elements
        if (createsNewLine) {
          currentLines++;
        }

        return false;
      }

      return false;
    };

    walkNodes(tempDiv);

    // Add ellipsis only once at the very end if truncation occurred
    if (shouldTruncate) {
      truncatedHtml += "...";
    }

    return truncatedHtml;
  };

  // Helper function to count lines in a DOM element
  const countLines = (element: Element): number => {
    let lineCount = 0;

    const walkElement = (el: Element) => {
      // Count block elements that create new lines
      const tagName = el.tagName.toLowerCase();
      if (
        ["p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "li"].includes(tagName)
      ) {
        lineCount++;
      }

      // Count <br> tags
      if (tagName === "br") {
        lineCount++;
      }

      // Recursively process child elements
      for (let i = 0; i < el.children.length; i++) {
        walkElement(el.children[i]);
      }
    };

    walkElement(element);

    // If no structural line breaks found, estimate from text length
    if (lineCount === 0) {
      const text = element.textContent || "";
      lineCount = Math.ceil(text.length / 80);
    }

    return lineCount;
  };

  // Helper function to count lines in text (including newlines and estimated line breaks)
  const countTextLines = (text: string): number => {
    if (!text) return 0;
    // Count explicit newlines
    const explicitLines = text.split("\n").length;
    // Estimate additional lines from text length (assuming ~80 chars per line)
    const estimatedLines = Math.ceil(text.length / 80);
    const result = Math.max(explicitLines, estimatedLines);

    return result;
  };

  const sanitizedContent = sanitizeHtml(content);
  const finalContent = noTruncate
    ? sanitizedContent
    : truncateHtml(sanitizedContent, maxLength, maxLines);

  return (
    <div
      className={`rich-text ${className}`}
      dangerouslySetInnerHTML={{ __html: finalContent }}
      style={{
        // Basic styling for rich text content
        lineHeight: "1.5",
        wordBreak: "break-word",
      }}
    />
  );
};

// Lexical-based rich text editor for input (used in Practice page)
const editorConfig: InitialConfigType = {
  namespace: "Editor",
  theme: editorTheme,
  nodes: [HeadingNode, ParagraphNode, TextNode, QuoteNode, OverflowNode],
  onError: (error: Error) => {
    console.error(error);
  },
};

export interface RichTextEditorProps {
  value: string; // HTML string
  onChange: (value: string) => void;
  placeholder?: string;
}

// Syncs the editor state with the value prop when it changes
function RichTextSync({
  value,
  lastHtmlRef,
}: {
  value: string;
  lastHtmlRef: React.MutableRefObject<string>;
}) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!editor) return;
    // Only update if the incoming value is different from the last HTML set in the editor
    if (value !== lastHtmlRef.current) {
      const parser = new DOMParser();
      const dom = parser.parseFromString(value, "text/html");
      editor.update(() => {
        const nodes: LexicalNode[] = $generateNodesFromDOM(editor, dom);
        $getRoot().clear();
        $getRoot().append(...nodes);
      });
      lastHtmlRef.current = value;
    }
  }, [editor, value, lastHtmlRef]);
  return null;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  // Set initial editor state from HTML value
  const lastHtmlRef = useRef(value);
  const initialConfig = {
    ...editorConfig,
    editorState: (editor: LexicalEditor) => {
      if (!value) return;
      const parser = new DOMParser();
      const dom = parser.parseFromString(value, "text/html");
      editor.update(() => {
        const nodes: LexicalNode[] = $generateNodesFromDOM(editor, dom);
        $getRoot().clear();
        $getRoot().append(...nodes);
      });
      lastHtmlRef.current = value;
    },
  };

  return (
    <div className="bg-background w-full overflow-hidden rounded-lg border">
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextSync value={value} lastHtmlRef={lastHtmlRef} />
        <TooltipProvider>
          <Plugins
            onChange={(html) => {
              lastHtmlRef.current = html;
              onChange(html);
            }}
            placeholder={placeholder}
          />
        </TooltipProvider>
      </LexicalComposer>
    </div>
  );
}

export function Plugins({
  onChange,
  placeholder,
}: {
  onChange?: (value: string) => void;
  placeholder?: string;
}) {
  const defaultPlaceholder = "Add notes here...";
  const finalPlaceholder = placeholder || defaultPlaceholder;

  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== floatingAnchorElem) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  return (
    <div className="relative">
      {/* toolbar plugins */}
      <ToolbarPlugin>
        {() => (
          <div className="vertical-align-middle sticky top-0 z-10 flex gap-2 overflow-auto border-b p-1">
            <FontFormatToolbarPlugin format="bold" />
            <FontFormatToolbarPlugin format="italic" />
            <FontFormatToolbarPlugin format="underline" />
            <FontFormatToolbarPlugin format="strikethrough" />
          </div>
        )}
      </ToolbarPlugin>

      <div className="relative">
        <RichTextPlugin
          contentEditable={
            <div className="">
              <div className="" ref={onRef}>
                <ContentEditable
                  placeholder={finalPlaceholder}
                  className="ContentEditable__root relative block min-h-[2.5rem] text-left overflow-auto
px-3 pt-2 focus:outline-none"
                />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        {onChange && (
          <OnChangePlugin
            ignoreSelectionChange={true}
            onChange={(_editorState, editor) => {
              editor.update(() => {
                const html = $generateHtmlFromNodes(editor, null);
                onChange(html);
              });
            }}
          />
        )}
        {/* rest of the plugins */}
      </div>
    </div>
  );
}

// Export the old name for backward compatibility
export const RichText = RichTextRenderer;
