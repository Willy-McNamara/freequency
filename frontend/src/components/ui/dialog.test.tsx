import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./dialog";

// Mock Radix UI Dialog primitives
vi.mock("@radix-ui/react-dialog", () => ({
  Root: ({ children, open }: { children: React.ReactNode; open?: boolean }) => (
    <div data-testid="dialog-root" data-open={open}>
      {children}
    </div>
  ),
  Trigger: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: any;
  }) => (
    <button data-testid="dialog-trigger" {...props}>
      {children}
    </button>
  ),
  Portal: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-portal">{children}</div>
  ),
  Overlay: ({
    children,
    className,
    ...props
  }: {
    children?: React.ReactNode;
    className?: string;
    [key: string]: any;
  }) => (
    <div data-testid="dialog-overlay" className={className} {...props}>
      {children}
    </div>
  ),
  Content: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    [key: string]: any;
  }) => (
    <div data-testid="dialog-content" className={className} {...props}>
      {children}
    </div>
  ),
  Close: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    [key: string]: any;
  }) => (
    <button data-testid="dialog-close" className={className} {...props}>
      {children}
    </button>
  ),
  Title: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    [key: string]: any;
  }) => (
    <div data-testid="dialog-title" className={className} {...props}>
      {children}
    </div>
  ),
  Description: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    [key: string]: any;
  }) => (
    <div data-testid="dialog-description" className={className} {...props}>
      {children}
    </div>
  ),
}));

// Mock the X icon
vi.mock("lucide-react", () => ({
  X: () => <div data-testid="x-icon">X</div>,
}));

describe("Dialog Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  describe("Dialog (Root)", () => {
    it("renders with default props", () => {
      render(
        <Dialog>
          <div>Dialog content</div>
        </Dialog>
      );

      expect(screen.getByTestId("dialog-root")).toBeInTheDocument();
      expect(screen.getByText("Dialog content")).toBeInTheDocument();
    });

    it("handles open state", () => {
      render(
        <Dialog open={true}>
          <div>Open dialog</div>
        </Dialog>
      );

      const root = screen.getByTestId("dialog-root");
      expect(root).toHaveAttribute("data-open", "true");
    });

    it("handles onOpenChange", () => {
      const mockOnOpenChange = vi.fn();
      render(
        <Dialog open={false} onOpenChange={mockOnOpenChange}>
          <div>Dialog</div>
        </Dialog>
      );

      expect(screen.getByTestId("dialog-root")).toHaveAttribute(
        "data-open",
        "false"
      );
    });
  });

  describe("DialogTrigger", () => {
    it("renders trigger button", () => {
      render(<DialogTrigger>Open Dialog</DialogTrigger>);

      expect(screen.getByTestId("dialog-trigger")).toBeInTheDocument();
      expect(screen.getByText("Open Dialog")).toBeInTheDocument();
    });

    it("handles click events", () => {
      const mockOnClick = vi.fn();
      render(<DialogTrigger onClick={mockOnClick}>Trigger</DialogTrigger>);

      const trigger = screen.getByTestId("dialog-trigger");
      fireEvent.click(trigger);

      expect(mockOnClick).toHaveBeenCalled();
    });
  });

  describe("DialogPortal", () => {
    it("renders portal", () => {
      render(
        <DialogPortal>
          <div>Portal content</div>
        </DialogPortal>
      );

      expect(screen.getByTestId("dialog-portal")).toBeInTheDocument();
      expect(screen.getByText("Portal content")).toBeInTheDocument();
    });
  });

  describe("DialogOverlay", () => {
    it("renders overlay with default props", () => {
      render(<DialogOverlay />);

      expect(screen.getByTestId("dialog-overlay")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(<DialogOverlay className="custom-class" />);

      const overlay = container.querySelector(
        '[data-testid="dialog-overlay"]'
      ) as HTMLElement;
      expect(overlay).toHaveClass("custom-class");
    });

    it("forwards ref correctly", () => {
      const ref = vi.fn();
      render(<DialogOverlay ref={ref} />);

      expect(ref).toHaveBeenCalled();
    });

    it("applies base classes", () => {
      const { container } = render(<DialogOverlay />);

      const overlay = container.querySelector(
        '[data-testid="dialog-overlay"]'
      ) as HTMLElement;
      expect(overlay).toHaveClass("fixed", "inset-0", "z-50", "bg-black/80");
    });
  });

  describe("DialogContent", () => {
    it("renders content with portal and overlay", () => {
      render(
        <DialogContent>
          <div>Content</div>
        </DialogContent>
      );

      expect(screen.getByTestId("dialog-portal")).toBeInTheDocument();
      expect(screen.getByTestId("dialog-overlay")).toBeInTheDocument();
      expect(screen.getByTestId("dialog-content")).toBeInTheDocument();
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("renders close button", () => {
      render(<DialogContent>Content</DialogContent>);

      expect(screen.getByTestId("dialog-close")).toBeInTheDocument();
      expect(screen.getByTestId("x-icon")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <DialogContent className="custom-class">Content</DialogContent>
      );

      const content = container.querySelector(
        '[data-testid="dialog-content"]'
      ) as HTMLElement;
      expect(content).toHaveClass("custom-class");
    });

    it("forwards ref correctly", () => {
      const ref = vi.fn();
      render(<DialogContent ref={ref}>Content</DialogContent>);

      expect(ref).toHaveBeenCalled();
    });

    it("applies base classes", () => {
      const { container } = render(<DialogContent>Content</DialogContent>);

      const content = container.querySelector(
        '[data-testid="dialog-content"]'
      ) as HTMLElement;
      expect(content).toHaveClass(
        "fixed",
        "left-[50%]",
        "top-[50%]",
        "z-50",
        "grid"
      );
    });
  });

  describe("DialogHeader", () => {
    it("renders with default props", () => {
      render(<DialogHeader>Header content</DialogHeader>);

      expect(screen.getByText("Header content")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <DialogHeader className="custom-class">Content</DialogHeader>
      );

      const header = container.firstChild as HTMLElement;
      expect(header).toHaveClass("custom-class");
    });

    it("has correct display name", () => {
      expect(DialogHeader.displayName).toBe("DialogHeader");
    });

    it("applies base classes", () => {
      const { container } = render(<DialogHeader>Content</DialogHeader>);

      const header = container.firstChild as HTMLElement;
      expect(header).toHaveClass(
        "flex",
        "flex-col",
        "space-y-1.5",
        "text-center",
        "sm:text-left"
      );
    });
  });

  describe("DialogFooter", () => {
    it("renders with default props", () => {
      render(<DialogFooter>Footer content</DialogFooter>);

      expect(screen.getByText("Footer content")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <DialogFooter className="custom-class">Content</DialogFooter>
      );

      const footer = container.firstChild as HTMLElement;
      expect(footer).toHaveClass("custom-class");
    });

    it("has correct display name", () => {
      expect(DialogFooter.displayName).toBe("DialogFooter");
    });

    it("applies base classes", () => {
      const { container } = render(<DialogFooter>Content</DialogFooter>);

      const footer = container.firstChild as HTMLElement;
      expect(footer).toHaveClass(
        "flex",
        "flex-col-reverse",
        "sm:flex-row",
        "sm:justify-end",
        "sm:space-x-2"
      );
    });
  });

  describe("DialogTitle", () => {
    it("renders with default props", () => {
      render(<DialogTitle>Title content</DialogTitle>);

      expect(screen.getByTestId("dialog-title")).toBeInTheDocument();
      expect(screen.getByText("Title content")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <DialogTitle className="custom-class">Content</DialogTitle>
      );

      const title = container.querySelector(
        '[data-testid="dialog-title"]'
      ) as HTMLElement;
      expect(title).toHaveClass("custom-class");
    });

    it("forwards ref correctly", () => {
      const ref = vi.fn();
      render(<DialogTitle ref={ref}>Content</DialogTitle>);

      expect(ref).toHaveBeenCalled();
    });

    it("applies base classes", () => {
      const { container } = render(<DialogTitle>Content</DialogTitle>);

      const title = container.querySelector(
        '[data-testid="dialog-title"]'
      ) as HTMLElement;
      expect(title).toHaveClass(
        "text-lg",
        "font-semibold",
        "leading-none",
        "tracking-tight"
      );
    });
  });

  describe("DialogDescription", () => {
    it("renders with default props", () => {
      render(<DialogDescription>Description content</DialogDescription>);

      expect(screen.getByTestId("dialog-description")).toBeInTheDocument();
      expect(screen.getByText("Description content")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <DialogDescription className="custom-class">Content</DialogDescription>
      );

      const description = container.querySelector(
        '[data-testid="dialog-description"]'
      ) as HTMLElement;
      expect(description).toHaveClass("custom-class");
    });

    it("forwards ref correctly", () => {
      const ref = vi.fn();
      render(<DialogDescription ref={ref}>Content</DialogDescription>);

      expect(ref).toHaveBeenCalled();
    });

    it("applies base classes", () => {
      const { container } = render(
        <DialogDescription>Content</DialogDescription>
      );

      const description = container.querySelector(
        '[data-testid="dialog-description"]'
      ) as HTMLElement;
      expect(description).toHaveClass("text-sm", "text-muted-foreground");
    });
  });

  describe("DialogClose", () => {
    it("renders close button", () => {
      render(<DialogClose>Close</DialogClose>);

      expect(screen.getByTestId("dialog-close")).toBeInTheDocument();
      expect(screen.getByText("Close")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <DialogClose className="custom-class">Close</DialogClose>
      );

      const close = container.querySelector(
        '[data-testid="dialog-close"]'
      ) as HTMLElement;
      expect(close).toHaveClass("custom-class");
    });

    it("handles click events", () => {
      const mockOnClick = vi.fn();
      render(<DialogClose onClick={mockOnClick}>Close</DialogClose>);

      const close = screen.getByTestId("dialog-close");
      fireEvent.click(close);

      expect(mockOnClick).toHaveBeenCalled();
    });
  });

  describe("Dialog Composition", () => {
    it("renders a complete dialog with all components", () => {
      render(
        <Dialog open={true}>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
              <DialogDescription>Dialog Description</DialogDescription>
            </DialogHeader>
            <div>Dialog Content</div>
            <DialogFooter>
              <DialogClose>Cancel</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByTestId("dialog-root")).toBeInTheDocument();
      expect(screen.getByTestId("dialog-trigger")).toBeInTheDocument();
      expect(screen.getByTestId("dialog-content")).toBeInTheDocument();
      expect(screen.getByTestId("dialog-title")).toBeInTheDocument();
      expect(screen.getByTestId("dialog-description")).toBeInTheDocument();
      expect(screen.getByText("Dialog Content")).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });
  });
});
