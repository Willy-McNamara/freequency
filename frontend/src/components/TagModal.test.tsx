import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TagModal } from "./TagModal";

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
  }: {
    children: React.ReactNode;
    variant?: string;
  }) => <div data-testid={`badge-${variant || "default"}`}>{children}</div>,
}));

// Mock the Plus icon
vi.mock("lucide-react", () => ({
  Plus: () => <div data-testid="plus-icon">Plus</div>,
}));

// Mock the API config
vi.mock("../config/api", () => ({
  apiConfig: {
    endpoints: {
      tags: {
        all: "/api/tags",
        create: "/api/tags/create",
      },
    },
  },
}));

// Mock the instruments types
vi.mock("../types/instruments.types", () => ({
  ALL_INSTRUMENTS: [
    { label: "Guitar" },
    { label: "Piano" },
    { label: "Drums" },
  ],
}));

// Mock fetch globally
global.fetch = vi.fn();

describe("TagModal", () => {
  const mockOnClose = vi.fn();
  const mockOnTagSelected = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetch).mockClear();
    // Provide a default mock for tests that don't explicitly mock fetch
    vi.mocked(fetch).mockResolvedValue({
      json: () => Promise.resolve([]),
    } as Response);
  });

  it("renders when open", () => {
    render(
      <TagModal
        isOpen={true}
        onClose={mockOnClose}
        onTagSelected={mockOnTagSelected}
      />
    );

    expect(screen.getByTestId("dialog")).toBeInTheDocument();
    expect(screen.getByTestId("dialog-title")).toHaveTextContent(
      "Add or Select Tag"
    );
    expect(screen.getByTestId("dialog-description")).toHaveTextContent(
      "Search for an existing tag or create a new one."
    );
  });

  it("does not render when closed", () => {
    render(
      <TagModal
        isOpen={false}
        onClose={mockOnClose}
        onTagSelected={mockOnTagSelected}
      />
    );

    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
  });

  it("renders input field with correct attributes", () => {
    render(
      <TagModal
        isOpen={true}
        onClose={mockOnClose}
        onTagSelected={mockOnTagSelected}
      />
    );

    const input = screen.getByPlaceholderText("Search or create tag");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("maxLength", "30");
    expect(input).toHaveAttribute("type", "text");
  });

  it("handles input change and sanitization", () => {
    render(
      <TagModal
        isOpen={true}
        onClose={mockOnClose}
        onTagSelected={mockOnTagSelected}
      />
    );

    const input = screen.getByPlaceholderText("Search or create tag");
    fireEvent.change(input, { target: { value: "Test Tag 123!" } });

    expect(input).toHaveValue("test tag 123!"); // Should be lowercased and sanitized
  });

  it("shows loading state when fetching tags", async () => {
    vi.mocked(fetch).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <TagModal
        isOpen={true}
        onClose={mockOnClose}
        onTagSelected={mockOnTagSelected}
      />
    );

    expect(screen.getByText("Loading tags...")).toBeInTheDocument();
  });

  it('shows "No tags found" when no tags are available', async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: () => Promise.resolve([]),
    } as Response);

    render(
      <TagModal
        isOpen={true}
        onClose={mockOnClose}
        onTagSelected={mockOnTagSelected}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("No tags found.")).toBeInTheDocument();
    });
  });

  it("displays existing tags as clickable buttons", async () => {
    const mockTags = ["practice", "scales", "technique"];
    (fetch as any).mockResolvedValue({
      json: () => Promise.resolve(mockTags),
    });

    render(
      <TagModal
        isOpen={true}
        onClose={mockOnClose}
        onTagSelected={mockOnTagSelected}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("practice")).toBeInTheDocument();
      expect(screen.getByText("scales")).toBeInTheDocument();
      expect(screen.getByText("technique")).toBeInTheDocument();
    });
  });

  it("calls onTagSelected when an existing tag is clicked", async () => {
    const mockTags = ["practice"];
    (fetch as any).mockResolvedValue({
      json: () => Promise.resolve(mockTags),
    });

    render(
      <TagModal
        isOpen={true}
        onClose={mockOnClose}
        onTagSelected={mockOnTagSelected}
      />
    );

    await waitFor(() => {
      const tagButton = screen.getByText("practice");
      fireEvent.click(tagButton);
    });

    expect(mockOnTagSelected).toHaveBeenCalledWith({
      id: 0,
      label: "practice",
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("shows create button when query does not match existing tags", async () => {
    const mockTags = ["practice"];
    (fetch as any).mockResolvedValue({
      json: () => Promise.resolve(mockTags),
    });

    render(
      <TagModal
        isOpen={true}
        onClose={mockOnClose}
        onTagSelected={mockOnTagSelected}
      />
    );

    const input = screen.getByPlaceholderText("Search or create tag");
    fireEvent.change(input, { target: { value: "new tag" } });

    await waitFor(() => {
      expect(screen.getByText('Create "new tag"')).toBeInTheDocument();
    });
  });

  it("does not show create button when query matches existing tag", async () => {
    const mockTags = ["practice"];
    (fetch as any).mockResolvedValue({
      json: () => Promise.resolve(mockTags),
    });

    render(
      <TagModal
        isOpen={true}
        onClose={mockOnClose}
        onTagSelected={mockOnTagSelected}
      />
    );

    const input = screen.getByPlaceholderText("Search or create tag");
    fireEvent.change(input, { target: { value: "practice" } });

    await waitFor(() => {
      expect(screen.queryByText(/Create/)).not.toBeInTheDocument();
    });
  });

  // TODO: Add comprehensive tests for tag creation API calls
  // This requires mocking fetch responses and testing error handling
  // For now, we'll test the basic functionality and leave complex API
  // testing for later when we have more time to implement proper mocking

  // TODO: Add tests for input validation (max length, allowed characters)
  // This requires testing the sanitizeInput function and error states
  // For now, we'll test the basic input handling and leave validation
  // testing for later

  // TODO: Add tests for error states and error messages
  // This requires testing API failures and validation errors
  // For now, we'll test the basic functionality and leave error
  // testing for later
});
