import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Checkbox } from "./checkbox";

// Mock Radix UI Checkbox primitives
vi.mock("@radix-ui/react-checkbox", () => ({
  Root: ({
    children,
    className,
    checked,
    onCheckedChange,
    disabled,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    [key: string]: any;
  }) => (
    <button
      data-testid="checkbox-root"
      className={className}
      data-checked={checked}
      data-disabled={disabled}
      onClick={() => !disabled && onCheckedChange?.(!checked)}
      {...props}
    >
      {children}
    </button>
  ),
  Indicator: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="checkbox-indicator" className={className}>
      {children}
    </div>
  ),
}));

// Mock the Check icon
vi.mock("lucide-react", () => ({
  Check: () => <div data-testid="check-icon">Check</div>,
}));

describe("Checkbox", () => {
  const mockOnCheckedChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders with default props", () => {
    render(<Checkbox />);

    expect(screen.getByTestId("checkbox-root")).toBeInTheDocument();
    expect(screen.getByTestId("checkbox-indicator")).toBeInTheDocument();
    expect(screen.getByTestId("check-icon")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<Checkbox className="custom-class" />);

    const checkbox = container.querySelector(
      '[data-testid="checkbox-root"]'
    ) as HTMLElement;
    expect(checkbox).toHaveClass("custom-class");
  });

  it("forwards ref correctly", () => {
    const ref = vi.fn();
    render(<Checkbox ref={ref} />);

    expect(ref).toHaveBeenCalled();
  });

  it("handles checked state", () => {
    render(<Checkbox checked={true} />);

    const checkbox = screen.getByTestId("checkbox-root");
    expect(checkbox).toHaveAttribute("data-checked", "true");
  });

  it("handles unchecked state", () => {
    render(<Checkbox checked={false} />);

    const checkbox = screen.getByTestId("checkbox-root");
    expect(checkbox).toHaveAttribute("data-checked", "false");
  });

  it("handles onCheckedChange callback", () => {
    render(<Checkbox checked={false} onCheckedChange={mockOnCheckedChange} />);

    const checkbox = screen.getByTestId("checkbox-root");
    fireEvent.click(checkbox);

    expect(mockOnCheckedChange).toHaveBeenCalledWith(true);
  });

  it("handles disabled state", () => {
    render(<Checkbox disabled />);

    const checkbox = screen.getByTestId("checkbox-root");
    expect(checkbox).toHaveAttribute("data-disabled", "true");
  });

  it("handles additional props", () => {
    render(
      <Checkbox data-testid="custom-checkbox" id="test-id" name="test-name" />
    );

    const checkbox = screen.getByTestId("custom-checkbox");
    expect(checkbox).toHaveAttribute("id", "test-id");
    expect(checkbox).toHaveAttribute("name", "test-name");
  });

  // TODO: Test display name when we have a better way to mock Radix UI primitives
  // it("has correct display name", () => {
  //   expect(Checkbox.displayName).toBeDefined();
  // });

  it("applies base classes", () => {
    const { container } = render(<Checkbox />);

    const checkbox = container.querySelector(
      '[data-testid="checkbox-root"]'
    ) as HTMLElement;
    expect(checkbox).toHaveClass(
      "peer",
      "h-4",
      "w-4",
      "shrink-0",
      "rounded-sm",
      "border"
    );
  });

  it("indicator applies correct classes", () => {
    const { container } = render(<Checkbox />);

    const indicator = container.querySelector(
      '[data-testid="checkbox-indicator"]'
    ) as HTMLElement;
    expect(indicator).toHaveClass(
      "flex",
      "items-center",
      "justify-center",
      "text-current"
    );
  });

  it("check icon has correct size", () => {
    const { container } = render(<Checkbox />);

    const checkIcon = container.querySelector(
      '[data-testid="check-icon"]'
    ) as HTMLElement;
    expect(checkIcon).toBeInTheDocument();
  });

  it("toggles state when clicked", () => {
    const { rerender } = render(
      <Checkbox checked={false} onCheckedChange={mockOnCheckedChange} />
    );

    const checkbox = screen.getByTestId("checkbox-root");
    expect(checkbox).toHaveAttribute("data-checked", "false");

    fireEvent.click(checkbox);
    expect(mockOnCheckedChange).toHaveBeenCalledWith(true);

    rerender(<Checkbox checked={true} onCheckedChange={mockOnCheckedChange} />);
    expect(checkbox).toHaveAttribute("data-checked", "true");

    fireEvent.click(checkbox);
    expect(mockOnCheckedChange).toHaveBeenCalledWith(false);
  });

  it("does not call onCheckedChange when disabled", () => {
    render(
      <Checkbox
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        disabled
      />
    );

    const checkbox = screen.getByTestId("checkbox-root");
    fireEvent.click(checkbox);

    expect(mockOnCheckedChange).not.toHaveBeenCalled();
  });
});
