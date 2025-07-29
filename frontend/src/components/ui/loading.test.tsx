import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Loading } from "./loading";

// Mock the Loader2 icon
vi.mock("lucide-react", () => ({
  Loader2: ({ className }: { className?: string }) => (
    <div data-testid="loader-icon" className={className}>
      Loading...
    </div>
  ),
}));

describe("Loading", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders with default props", () => {
    render(<Loading />);

    expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<Loading className="custom-class" />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("custom-class");
  });

  it("renders with text", () => {
    render(<Loading text="Please wait..." />);

    expect(screen.getByText("Please wait...")).toBeInTheDocument();
    expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
  });

  it("does not render text when not provided", () => {
    render(<Loading />);

    expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
    expect(screen.queryByText("Please wait...")).not.toBeInTheDocument();
  });

  it("applies correct size classes for different sizes", () => {
    const { container, rerender } = render(<Loading size="sm" />);

    let loader = container.querySelector(
      '[data-testid="loader-icon"]'
    ) as HTMLElement;
    expect(loader).toHaveClass("w-4", "h-4");

    rerender(<Loading size="md" />);
    loader = container.querySelector(
      '[data-testid="loader-icon"]'
    ) as HTMLElement;
    expect(loader).toHaveClass("w-6", "h-6");

    rerender(<Loading size="lg" />);
    loader = container.querySelector(
      '[data-testid="loader-icon"]'
    ) as HTMLElement;
    expect(loader).toHaveClass("w-8", "h-8");

    rerender(<Loading size="xl" />);
    loader = container.querySelector(
      '[data-testid="loader-icon"]'
    ) as HTMLElement;
    expect(loader).toHaveClass("w-12", "h-12");
  });

  it("applies correct text sizes for different sizes", () => {
    const { container, rerender } = render(
      <Loading size="sm" text="Loading" />
    );

    let text = container.querySelector("p") as HTMLElement;
    expect(text).toHaveClass("text-sm");

    rerender(<Loading size="md" text="Loading" />);
    text = container.querySelector("p") as HTMLElement;
    expect(text).toHaveClass("text-base");

    rerender(<Loading size="lg" text="Loading" />);
    text = container.querySelector("p") as HTMLElement;
    expect(text).toHaveClass("text-lg");

    rerender(<Loading size="xl" text="Loading" />);
    text = container.querySelector("p") as HTMLElement;
    expect(text).toHaveClass("text-xl");
  });

  it("applies fullScreen wrapper when fullScreen is true", () => {
    const { container } = render(<Loading fullScreen={true} />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass(
      "flex",
      "items-center",
      "justify-center",
      "min-h-screen",
      "w-full"
    );
  });

  it("does not apply fullScreen wrapper when fullScreen is false", () => {
    const { container } = render(<Loading fullScreen={false} />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).not.toHaveClass("min-h-screen");
    expect(wrapper).toHaveClass(
      "flex",
      "flex-col",
      "items-center",
      "justify-center",
      "w-full"
    );
  });

  it("applies default size when size is not provided", () => {
    const { container } = render(<Loading />);

    const loader = container.querySelector(
      '[data-testid="loader-icon"]'
    ) as HTMLElement;
    expect(loader).toHaveClass("w-6", "h-6"); // default md size
  });

  it("applies default text size when size is not provided", () => {
    const { container } = render(<Loading text="Loading" />);

    const text = container.querySelector("p") as HTMLElement;
    expect(text).toHaveClass("text-base"); // default md size
  });

  it("applies base classes to loader icon", () => {
    const { container } = render(<Loading />);

    const loader = container.querySelector(
      '[data-testid="loader-icon"]'
    ) as HTMLElement;
    expect(loader).toHaveClass("animate-spin", "text-primary", "mb-2");
  });

  it("applies base classes to text", () => {
    const { container } = render(<Loading text="Loading" />);

    const text = container.querySelector("p") as HTMLElement;
    expect(text).toHaveClass("text-muted-foreground");
  });

  it("renders fullScreen with text", () => {
    const { container } = render(
      <Loading fullScreen={true} text="Please wait..." />
    );

    expect(screen.getByText("Please wait...")).toBeInTheDocument();
    expect(screen.getByTestId("loader-icon")).toBeInTheDocument();

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("min-h-screen");
  });

  it("combines custom className with base classes", () => {
    const { container } = render(<Loading className="custom-class" />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass(
      "custom-class",
      "flex",
      "flex-col",
      "items-center",
      "justify-center",
      "w-full"
    );
  });

  it("handles empty text string", () => {
    render(<Loading text="" />);

    expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
    // When text is empty string, no paragraph should be rendered
    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
  });
});
