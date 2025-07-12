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
  className?: string;
}

export const RichTextRenderer: React.FC<RichTextRendererProps> = ({
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

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
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
          />
        </TooltipProvider>
      </LexicalComposer>
    </div>
  );
}

const placeholder = "Add session notes here...";

export function Plugins({ onChange }: { onChange?: (value: string) => void }) {
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
                  placeholder={placeholder}
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
