import * as React from "react";
import { cn } from "../../lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, size = "lg", className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "mx-auto px-4 sm:px-6 lg:px-8",
        {
          "max-w-content-sm": size === "sm",
          "max-w-content-md": size === "md",
          "max-w-content-lg": size === "lg",
          "max-w-content-xl": size === "xl",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

Container.displayName = "Container";
