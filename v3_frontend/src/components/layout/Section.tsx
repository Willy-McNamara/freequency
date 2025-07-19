import * as React from "react";
import { cn } from "../../lib/utils";

// Responsive breakpoints in order of increasing size
const breakpoints = ["base", "sm", "md", "lg", "xl", "2xl", "3xl"] as const;
type Breakpoint = (typeof breakpoints)[number];

interface ResponsiveSpacing {
  base?: SectionSpacing;
  sm?: SectionSpacing;
  md?: SectionSpacing;
  lg?: SectionSpacing;
  xl?: SectionSpacing;
  "2xl"?: SectionSpacing;
  "3xl"?: SectionSpacing;
}

type SectionSpacing = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: SectionSpacing | ResponsiveSpacing;
  children: React.ReactNode;
}

// Simple hook to get the current breakpoint (base, sm, md, lg, xl, 2xl, 3xl)
function useBreakpoint(): Breakpoint {
  // This is a minimal implementation for demo/dev. For production, use a robust solution.
  const [breakpoint, setBreakpoint] = React.useState<Breakpoint>("base");
  React.useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w >= 1536) setBreakpoint("2xl");
      else if (w >= 1280) setBreakpoint("xl");
      else if (w >= 1024) setBreakpoint("lg");
      else if (w >= 768) setBreakpoint("md");
      else if (w >= 640) setBreakpoint("sm");
      else setBreakpoint("base");
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return breakpoint;
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ children, spacing = "md", className, ...props }, ref) => {
    const breakpoint = useBreakpoint();
    let effectiveSpacing: SectionSpacing = "md";
    if (typeof spacing === "string") {
      effectiveSpacing = spacing;
    } else if (typeof spacing === "object" && spacing !== null) {
      // Find the largest matching breakpoint <= current
      let found: SectionSpacing | undefined = undefined;
      for (const bp of breakpoints.slice().reverse()) {
        if (breakpoint === bp && spacing[bp]) {
          found = spacing[bp];
          break;
        }
        if (!found && spacing[bp]) {
          found = spacing[bp];
        }
      }
      if (found) effectiveSpacing = found;
    }
    return (
      <section
        ref={ref}
        className={cn(
          {
            "py-1": effectiveSpacing === "xs",
            "py-2": effectiveSpacing === "sm",
            "py-4": effectiveSpacing === "md",
            "py-6": effectiveSpacing === "lg",
            "py-8": effectiveSpacing === "xl",
            "py-12": effectiveSpacing === "2xl",
            "py-16": effectiveSpacing === "3xl",
          },
          className
        )}
        {...props}
      >
        {children}
      </section>
    );
  }
);

Section.displayName = "Section";
