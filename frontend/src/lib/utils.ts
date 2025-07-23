import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to check if rich text content is empty
export function isRichTextEmpty(html: string | undefined): boolean {
  if (!html || html.length === 0) return true;
  // Remove HTML tags and check if there's actual content
  const textContent = html.replace(/<[^>]*>/g, "").trim();
  return textContent.length === 0;
}
