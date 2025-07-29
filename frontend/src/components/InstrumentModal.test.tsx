import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { InstrumentModal } from "./InstrumentModal";

// Mock the dialog components
vi.mock("./ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-title">{children}</div>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-description">{children}</div>
  ),
  DialogClose: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-close">{children}</div>
  ),
}));

// Mock the Badge component
vi.mock("./badge", () => ({
  Badge: ({
    children,
    variant,
    className,
  }: {
    children: React.ReactNode;
    variant?: string;
    className?: string;
  }) => (
    <div data-testid={`badge-${variant || "default"}`} className={className}>
      {children}
    </div>
  ),
}));

// Mock the instruments types
vi.mock("../types/instruments.types", () => ({
  ALL_INSTRUMENTS: [
    { id: 1, label: "Guitar" },
    { id: 2, label: "Piano" },
    { id: 3, label: "Drums" },
    { id: 4, label: "Bass" },
    { id: 5, label: "Violin" },
  ],
}));

describe("InstrumentModal", () => {
  const mockOnClose = vi.fn();
  const mockOnInstrumentSelected = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders when open", () => {
    render(
      <InstrumentModal
        isOpen={true}
        onClose={mockOnClose}
        onInstrumentSelected={mockOnInstrumentSelected}
      />
    );

    expect(screen.getByTestId("dialog")).toBeInTheDocument();
    expect(screen.getByTestId("dialog-title")).toHaveTextContent(
      "Select Instrument"
    );
    expect(screen.getByTestId("dialog-description")).toHaveTextContent(
      "Search and select an instrument for this task."
    );
  });

  it("does not render when closed", () => {
    render(
      <InstrumentModal
        isOpen={false}
        onClose={mockOnClose}
        onInstrumentSelected={mockOnInstrumentSelected}
      />
    );

    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
  });

  it("renders input field with correct attributes", () => {
    render(
      <InstrumentModal
        isOpen={true}
        onClose={mockOnClose}
        onInstrumentSelected={mockOnInstrumentSelected}
      />
    );

    const input = screen.getByPlaceholderText("Search instrument");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "text");
  });

  it("displays all instruments when no search query", () => {
    render(
      <InstrumentModal
        isOpen={true}
        onClose={mockOnClose}
        onInstrumentSelected={mockOnInstrumentSelected}
      />
    );

    expect(screen.getByText("Guitar")).toBeInTheDocument();
    expect(screen.getByText("Piano")).toBeInTheDocument();
    expect(screen.getByText("Drums")).toBeInTheDocument();
    expect(screen.getByText("Bass")).toBeInTheDocument();
    expect(screen.getByText("Violin")).toBeInTheDocument();
  });

  it("filters instruments based on search query", () => {
    render(
      <InstrumentModal
        isOpen={true}
        onClose={mockOnClose}
        onInstrumentSelected={mockOnInstrumentSelected}
      />
    );

    const input = screen.getByPlaceholderText("Search instrument");
    fireEvent.change(input, { target: { value: "guitar" } });

    expect(screen.getByText("Guitar")).toBeInTheDocument();
    expect(screen.queryByText("Piano")).not.toBeInTheDocument();
    expect(screen.queryByText("Drums")).not.toBeInTheDocument();
    expect(screen.queryByText("Bass")).not.toBeInTheDocument();
    expect(screen.queryByText("Violin")).not.toBeInTheDocument();
  });

  it('shows "No instruments found" when search has no results', () => {
    render(
      <InstrumentModal
        isOpen={true}
        onClose={mockOnClose}
        onInstrumentSelected={mockOnInstrumentSelected}
      />
    );

    const input = screen.getByPlaceholderText("Search instrument");
    fireEvent.change(input, { target: { value: "xyz" } });

    expect(screen.getByText("No instruments found.")).toBeInTheDocument();
    expect(screen.queryByText("Guitar")).not.toBeInTheDocument();
    expect(screen.queryByText("Piano")).not.toBeInTheDocument();
  });

  it("calls onInstrumentSelected and onClose when instrument is clicked", () => {
    render(
      <InstrumentModal
        isOpen={true}
        onClose={mockOnClose}
        onInstrumentSelected={mockOnInstrumentSelected}
      />
    );

    const guitarButton = screen.getByText("Guitar");
    fireEvent.click(guitarButton);

    expect(mockOnInstrumentSelected).toHaveBeenCalledWith({
      id: 1,
      label: "Guitar",
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("clears search query when modal is closed and reopened", () => {
    const { rerender } = render(
      <InstrumentModal
        isOpen={true}
        onClose={mockOnClose}
        onInstrumentSelected={mockOnInstrumentSelected}
      />
    );

    const input = screen.getByPlaceholderText("Search instrument");
    fireEvent.change(input, { target: { value: "guitar" } });
    expect(input).toHaveValue("guitar");

    // Close modal
    rerender(
      <InstrumentModal
        isOpen={false}
        onClose={mockOnClose}
        onInstrumentSelected={mockOnInstrumentSelected}
      />
    );

    // Reopen modal
    rerender(
      <InstrumentModal
        isOpen={true}
        onClose={mockOnClose}
        onInstrumentSelected={mockOnInstrumentSelected}
      />
    );

    const newInput = screen.getByPlaceholderText("Search instrument");
    expect(newInput).toHaveValue("");
  });

  it("handles case-insensitive search", () => {
    render(
      <InstrumentModal
        isOpen={true}
        onClose={mockOnClose}
        onInstrumentSelected={mockOnInstrumentSelected}
      />
    );

    const input = screen.getByPlaceholderText("Search instrument");
    fireEvent.change(input, { target: { value: "GUITAR" } });

    expect(screen.getByText("Guitar")).toBeInTheDocument();
    expect(screen.queryByText("Piano")).not.toBeInTheDocument();
  });

  it("handles partial search matches", () => {
    render(
      <InstrumentModal
        isOpen={true}
        onClose={mockOnClose}
        onInstrumentSelected={mockOnInstrumentSelected}
      />
    );

    const input = screen.getByPlaceholderText("Search instrument");
    fireEvent.change(input, { target: { value: "in" } });

    expect(screen.getByText("Violin")).toBeInTheDocument();
    expect(screen.queryByText("Guitar")).not.toBeInTheDocument();
    expect(screen.queryByText("Piano")).not.toBeInTheDocument();
  });
});
