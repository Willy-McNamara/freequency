import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";

// Mock Radix UI Avatar primitives
vi.mock("@radix-ui/react-avatar", () => ({
  Root: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    [key: string]: any;
  }) => (
    <div data-testid="avatar-root" className={className} {...props}>
      {children}
    </div>
  ),
  Image: ({
    className,
    src,
    alt,
    ...props
  }: {
    className?: string;
    src?: string;
    alt?: string;
    [key: string]: any;
  }) => (
    <img
      data-testid="avatar-image"
      className={className}
      src={src}
      alt={alt}
      {...props}
    />
  ),
  Fallback: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    [key: string]: any;
  }) => (
    <div data-testid="avatar-fallback" className={className} {...props}>
      {children}
    </div>
  ),
}));

describe("Avatar Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  describe("Avatar", () => {
    it("renders with default props", () => {
      render(<Avatar />);

      expect(screen.getByTestId("avatar-root")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(<Avatar className="custom-class" />);

      const avatar = container.querySelector(
        '[data-testid="avatar-root"]'
      ) as HTMLElement;
      expect(avatar).toHaveClass("custom-class");
    });

    it("forwards ref correctly", () => {
      const ref = vi.fn();
      render(<Avatar ref={ref} />);

      expect(ref).toHaveBeenCalled();
    });

    it("handles additional props", () => {
      render(<Avatar data-testid="custom-avatar" id="test-id" />);

      const avatar = screen.getByTestId("custom-avatar");
      expect(avatar).toHaveAttribute("id", "test-id");
    });

    // TODO: Test display name when we have a better way to mock Radix UI primitives
    // it("has correct display name", () => {
    //   expect(Avatar.displayName).toBeDefined();
    // });

    it("applies base classes", () => {
      const { container } = render(<Avatar />);

      const avatar = container.querySelector(
        '[data-testid="avatar-root"]'
      ) as HTMLElement;
      expect(avatar).toHaveClass(
        "relative",
        "flex",
        "h-10",
        "w-10",
        "shrink-0",
        "overflow-hidden",
        "rounded-full"
      );
    });
  });

  describe("AvatarImage", () => {
    it("renders with default props", () => {
      render(<AvatarImage src="/test.jpg" alt="Test Avatar" />);

      expect(screen.getByTestId("avatar-image")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <AvatarImage className="custom-class" src="/test.jpg" alt="Test" />
      );

      const image = container.querySelector(
        '[data-testid="avatar-image"]'
      ) as HTMLElement;
      expect(image).toHaveClass("custom-class");
    });

    it("forwards ref correctly", () => {
      const ref = vi.fn();
      render(<AvatarImage ref={ref} src="/test.jpg" alt="Test" />);

      expect(ref).toHaveBeenCalled();
    });

    it("handles src and alt attributes", () => {
      render(<AvatarImage src="/test.jpg" alt="Test Avatar" />);

      const image = screen.getByTestId("avatar-image");
      expect(image).toHaveAttribute("src", "/test.jpg");
      expect(image).toHaveAttribute("alt", "Test Avatar");
    });

    it("handles additional props", () => {
      render(
        <AvatarImage data-testid="custom-image" src="/test.jpg" alt="Test" />
      );

      const image = screen.getByTestId("custom-image");
      expect(image).toHaveAttribute("src", "/test.jpg");
    });

    // TODO: Test display name when we have a better way to mock Radix UI primitives
    // it("has correct display name", () => {
    //   expect(AvatarImage.displayName).toBeDefined();
    // });

    it("applies base classes", () => {
      const { container } = render(<AvatarImage src="/test.jpg" alt="Test" />);

      const image = container.querySelector(
        '[data-testid="avatar-image"]'
      ) as HTMLElement;
      expect(image).toHaveClass("aspect-square", "h-full", "w-full");
    });
  });

  describe("AvatarFallback", () => {
    it("renders with default props", () => {
      render(<AvatarFallback>JD</AvatarFallback>);

      expect(screen.getByTestId("avatar-fallback")).toBeInTheDocument();
      expect(screen.getByText("JD")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <AvatarFallback className="custom-class">JD</AvatarFallback>
      );

      const fallback = container.querySelector(
        '[data-testid="avatar-fallback"]'
      ) as HTMLElement;
      expect(fallback).toHaveClass("custom-class");
    });

    it("forwards ref correctly", () => {
      const ref = vi.fn();
      render(<AvatarFallback ref={ref}>JD</AvatarFallback>);

      expect(ref).toHaveBeenCalled();
    });

    it("handles additional props", () => {
      render(<AvatarFallback data-testid="custom-fallback">JD</AvatarFallback>);

      const fallback = screen.getByTestId("custom-fallback");
      expect(fallback).toBeInTheDocument();
    });

    // TODO: Test display name when we have a better way to mock Radix UI primitives
    // it("has correct display name", () => {
    //   expect(AvatarFallback.displayName).toBeDefined();
    // });

    it("applies base classes", () => {
      const { container } = render(<AvatarFallback>JD</AvatarFallback>);

      const fallback = container.querySelector(
        '[data-testid="avatar-fallback"]'
      ) as HTMLElement;
      expect(fallback).toHaveClass(
        "flex",
        "h-full",
        "w-full",
        "items-center",
        "justify-center",
        "rounded-full",
        "bg-muted"
      );
    });
  });

  describe("Avatar Composition", () => {
    it("renders a complete avatar with image and fallback", () => {
      render(
        <Avatar>
          <AvatarImage src="/test.jpg" alt="Test Avatar" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      expect(screen.getByTestId("avatar-root")).toBeInTheDocument();
      expect(screen.getByTestId("avatar-image")).toBeInTheDocument();
      expect(screen.getByTestId("avatar-fallback")).toBeInTheDocument();
      expect(screen.getByText("JD")).toBeInTheDocument();
    });

    it("renders avatar with only image", () => {
      render(
        <Avatar>
          <AvatarImage src="/test.jpg" alt="Test Avatar" />
        </Avatar>
      );

      expect(screen.getByTestId("avatar-root")).toBeInTheDocument();
      expect(screen.getByTestId("avatar-image")).toBeInTheDocument();
      expect(screen.queryByTestId("avatar-fallback")).not.toBeInTheDocument();
    });

    it("renders avatar with only fallback", () => {
      render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      expect(screen.getByTestId("avatar-root")).toBeInTheDocument();
      expect(screen.queryByTestId("avatar-image")).not.toBeInTheDocument();
      expect(screen.getByTestId("avatar-fallback")).toBeInTheDocument();
      expect(screen.getByText("JD")).toBeInTheDocument();
    });

    it("handles complex fallback content", () => {
      render(
        <Avatar>
          <AvatarFallback>
            <span data-testid="initials">JD</span>
            <span data-testid="status">Online</span>
          </AvatarFallback>
        </Avatar>
      );

      expect(screen.getByTestId("avatar-root")).toBeInTheDocument();
      expect(screen.getByTestId("avatar-fallback")).toBeInTheDocument();
      expect(screen.getByTestId("initials")).toBeInTheDocument();
      expect(screen.getByTestId("status")).toBeInTheDocument();
      expect(screen.getByText("JD")).toBeInTheDocument();
      expect(screen.getByText("Online")).toBeInTheDocument();
    });
  });
});
