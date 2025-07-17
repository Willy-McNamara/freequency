import * as React from "react";
import { cn } from "../../lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  children: React.ReactNode;
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ children, spacing = "md", className, ...props }, ref) => (
    <section
      ref={ref}
      className={cn(
        {
          "py-xs": spacing === "xs",
          "py-sm": spacing === "sm",
          "py-md": spacing === "md",
          "py-lg": spacing === "lg",
          "py-xl": spacing === "xl",
          "py-2xl": spacing === "2xl",
          "py-3xl": spacing === "3xl",
        },
        className
      )}
      {...props}
    >
      {children}
    </section>
  )
);

Section.displayName = "Section";
