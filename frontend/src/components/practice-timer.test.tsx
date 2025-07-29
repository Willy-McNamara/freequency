import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PracticeTimer } from "./practice-timer";

// Mock the icons
vi.mock("lucide-react", () => ({
  Play: () => <div data-testid="play-icon">Play</div>,
  Pause: () => <div data-testid="pause-icon">Pause</div>,
}));

describe("PracticeTimer", () => {
  const mockOnChange = vi.fn();
  const mockOnRunningChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders with default state", () => {
    render(<PracticeTimer />);

    expect(screen.getByTestId("play-icon")).toBeInTheDocument();
    expect(screen.getByText("0:00")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "Start timer"
    );
  });

  it("renders with initial value", () => {
    render(<PracticeTimer value={65} />);

    expect(screen.getByText("1:05")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<PracticeTimer className="custom-class" />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("custom-class");
  });

  it("shows play icon when not running", () => {
    render(<PracticeTimer runningValue={false} />);

    expect(screen.getByTestId("play-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("pause-icon")).not.toBeInTheDocument();
  });

  it("shows pause icon when running", () => {
    render(<PracticeTimer runningValue={true} />);

    expect(screen.getByTestId("pause-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("play-icon")).not.toBeInTheDocument();
  });

  it("calls onRunningChange when button is clicked", () => {
    render(
      <PracticeTimer
        runningValue={false}
        onRunningChange={mockOnRunningChange}
      />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockOnRunningChange).toHaveBeenCalledWith(true);
  });

  it("formats time correctly", () => {
    const { rerender } = render(<PracticeTimer value={0} />);
    expect(screen.getByText("0:00")).toBeInTheDocument();

    rerender(<PracticeTimer value={30} />);
    expect(screen.getByText("0:30")).toBeInTheDocument();

    rerender(<PracticeTimer value={60} />);
    expect(screen.getByText("1:00")).toBeInTheDocument();

    rerender(<PracticeTimer value={125} />);
    expect(screen.getByText("2:05")).toBeInTheDocument();
  });

  it("syncs with external value changes", () => {
    const { rerender } = render(
      <PracticeTimer value={30} onChange={mockOnChange} />
    );

    expect(screen.getByText("0:30")).toBeInTheDocument();

    rerender(<PracticeTimer value={60} onChange={mockOnChange} />);
    expect(screen.getByText("1:00")).toBeInTheDocument();
  });

  it("calls onChange on initial mount", () => {
    render(<PracticeTimer value={30} onChange={mockOnChange} />);

    expect(mockOnChange).toHaveBeenCalledWith(30);
  });

  it("has correct display name", () => {
    expect(PracticeTimer.displayName).toBe("PracticeTimer");
  });

  // TODO: Add comprehensive tests for timer functionality
  // This requires testing the actual timer intervals, start/pause/reset
  // functionality, and the imperative handle methods
  // For now, we'll test the basic rendering and prop handling
  // and leave complex timer testing for later when we have more time
  // to implement proper timer mocking and interval testing

  // TODO: Add tests for imperative handle methods (start, pause, reset, getTime)
  // This requires testing the ref functionality and ensuring the exposed
  // methods work correctly

  // TODO: Add tests for timer accuracy and interval cleanup
  // This requires testing that the timer actually counts correctly
  // and that intervals are properly cleaned up on unmount
});
