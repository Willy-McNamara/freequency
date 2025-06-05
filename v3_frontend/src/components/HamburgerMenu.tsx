import { useState } from "react";
import { Button } from "./button";
import { cn } from "../lib/utils";

interface HamburgerMenuProps {
  children: React.ReactNode;
}

export function HamburgerMenu({ children }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleChildClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="fixed top-4 left-4 z-50">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-50 bg-background"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "h-6 w-6 transition-transform duration-200",
            isOpen && "rotate-90"
          )}
        >
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </Button>

      <div
        className={cn(
          "fixed top-0 left-0 h-screen w-64 bg-background border-r border-border shadow-lg transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="pt-16 px-4" onClick={handleChildClick}>
          {children}
        </div>
      </div>
    </div>
  );
}
