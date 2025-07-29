import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Button } from "./button";

// Mock the Slot component from Radix UI
vi.mock("@radix-ui/react-slot", () => ({
  Slot: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: any;
  }) => (
    <div data-testid="slot" {...props}>
      {children}
    </div>
  ),
}));

describe("Button", () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders with default props", () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Click me");
  });

  it("applies custom className", () => {
    const { container } = render(
      <Button className="custom-class">Click me</Button>
    );

    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass("custom-class");
  });

  it("handles click events", () => {
    render(<Button onClick={mockOnClick}>Click me</Button>);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalled();
  });

  it("applies different variants", () => {
    const { container, rerender } = render(
      <Button variant="default">Default</Button>
    );

    let button = container.firstChild as HTMLElement;
    expect(button).toHaveClass("bg-primary");

    rerender(<Button variant="destructive">Destructive</Button>);
    button = container.firstChild as HTMLElement;
    expect(button).toHaveClass("bg-destructive");

    rerender(<Button variant="outline">Outline</Button>);
    button = container.firstChild as HTMLElement;
    expect(button).toHaveClass("border-input");

    rerender(<Button variant="secondary">Secondary</Button>);
    button = container.firstChild as HTMLElement;
    expect(button).toHaveClass("bg-secondary");

    rerender(<Button variant="ghost">Ghost</Button>);
    button = container.firstChild as HTMLElement;
    expect(button).toHaveClass("hover:bg-accent");

    rerender(<Button variant="link">Link</Button>);
    button = container.firstChild as HTMLElement;
    expect(button).toHaveClass("text-primary");
  });

  it("applies different sizes", () => {
    const { container, rerender } = render(
      <Button size="default">Default</Button>
    );

    let button = container.firstChild as HTMLElement;
    expect(button).toHaveClass("h-9");

    rerender(<Button size="sm">Small</Button>);
    button = container.firstChild as HTMLElement;
    expect(button).toHaveClass("h-8");

    rerender(<Button size="lg">Large</Button>);
    button = container.firstChild as HTMLElement;
    expect(button).toHaveClass("h-10");

    rerender(<Button size="icon">Icon</Button>);
    button = container.firstChild as HTMLElement;
    expect(button).toHaveClass("h-9", "w-9");
  });

  it("renders as child when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );

    expect(screen.getByTestId("slot")).toBeInTheDocument();
    expect(screen.getByText("Link Button")).toBeInTheDocument();
  });

  it("renders as button when asChild is false", () => {
    render(<Button>Regular Button</Button>);

    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.queryByTestId("slot")).not.toBeInTheDocument();
  });

  it("forwards ref correctly", () => {
    const ref = vi.fn();
    render(<Button ref={ref}>Ref Button</Button>);

    expect(ref).toHaveBeenCalled();
  });

  it("applies disabled state", () => {
    render(<Button disabled>Disabled Button</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("disabled:opacity-50");
  });

  it("handles additional props", () => {
    render(
      <Button data-testid="custom-button" id="test-id" type="submit">
        Custom Button
      </Button>
    );

    const button = screen.getByTestId("custom-button");
    expect(button).toHaveAttribute("id", "test-id");
    expect(button).toHaveAttribute("type", "submit");
  });

  it("has correct display name", () => {
    expect(Button.displayName).toBe("Button");
  });

  it("renders with icon and text", () => {
    render(
      <Button>
        <span data-testid="icon">🎵</span>
        Play Music
      </Button>
    );

    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByText("Play Music")).toBeInTheDocument();
  });

  it("combines variant and size classes", () => {
    const { container } = render(
      <Button variant="destructive" size="lg">
        Large Destructive
      </Button>
    );

    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass("bg-destructive"); // variant class
    expect(button).toHaveClass("h-10"); // size class
  });
});
