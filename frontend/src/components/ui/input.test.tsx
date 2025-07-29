import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Input } from "./input";

describe("Input", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders with default props", () => {
    render(<Input />);

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    // When no type is specified, HTML inputs default to text behavior
    // but may not have an explicit type attribute
  });

  it("applies custom className", () => {
    const { container } = render(<Input className="custom-class" />);

    const input = container.firstChild as HTMLElement;
    expect(input).toHaveClass("custom-class");
  });

  it("handles different input types", () => {
    const { rerender } = render(<Input type="text" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "text");

    rerender(<Input type="email" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");

    rerender(<Input type="password" />);
    expect(screen.getByDisplayValue("")).toHaveAttribute("type", "password");

    rerender(<Input type="number" />);
    expect(screen.getByRole("spinbutton")).toHaveAttribute("type", "number");
  });

  it("handles value and onChange", () => {
    render(<Input value="test value" onChange={mockOnChange} />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("test value");

    fireEvent.change(input, { target: { value: "new value" } });
    expect(mockOnChange).toHaveBeenCalled();
  });

  it("handles placeholder", () => {
    render(<Input placeholder="Enter your name" />);

    const input = screen.getByPlaceholderText("Enter your name");
    expect(input).toBeInTheDocument();
  });

  it("handles disabled state", () => {
    render(<Input disabled />);

    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });

  it("forwards ref correctly", () => {
    const ref = vi.fn();
    render(<Input ref={ref} />);

    expect(ref).toHaveBeenCalled();
  });

  it("handles additional props", () => {
    render(
      <Input
        data-testid="custom-input"
        id="test-id"
        name="test-name"
        required
      />
    );

    const input = screen.getByTestId("custom-input");
    expect(input).toHaveAttribute("id", "test-id");
    expect(input).toHaveAttribute("name", "test-name");
    expect(input).toBeRequired();
  });

  it("has correct display name", () => {
    expect(Input.displayName).toBe("Input");
  });

  it("handles focus and blur events", () => {
    const mockOnFocus = vi.fn();
    const mockOnBlur = vi.fn();

    render(<Input onFocus={mockOnFocus} onBlur={mockOnBlur} />);

    const input = screen.getByRole("textbox");

    fireEvent.focus(input);
    expect(mockOnFocus).toHaveBeenCalled();

    fireEvent.blur(input);
    expect(mockOnBlur).toHaveBeenCalled();
  });

  it("handles key events", () => {
    const mockOnKeyDown = vi.fn();
    const mockOnKeyUp = vi.fn();

    render(<Input onKeyDown={mockOnKeyDown} onKeyUp={mockOnKeyUp} />);

    const input = screen.getByRole("textbox");

    fireEvent.keyDown(input, { key: "Enter" });
    expect(mockOnKeyDown).toHaveBeenCalled();

    fireEvent.keyUp(input, { key: "Enter" });
    expect(mockOnKeyUp).toHaveBeenCalled();
  });

  it("handles controlled input", () => {
    const { rerender } = render(
      <Input value="initial" onChange={mockOnChange} />
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("initial");

    rerender(<Input value="updated" onChange={mockOnChange} />);
    expect(input).toHaveValue("updated");
  });

  it("handles uncontrolled input", () => {
    render(<Input defaultValue="default" />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("default");
  });

  it("applies base classes", () => {
    const { container } = render(<Input />);

    const input = container.firstChild as HTMLElement;
    expect(input).toHaveClass("flex", "h-9", "w-full", "rounded-md", "border");
  });
});
