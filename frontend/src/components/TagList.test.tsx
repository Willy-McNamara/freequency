import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TagList } from "./TagList";

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

// Mock the X icon
vi.mock("lucide-react", () => ({
  X: () => <div data-testid="x-icon">X</div>,
}));

// Mock the instruments types
vi.mock("../types/instruments.types", () => ({
  ALL_INSTRUMENTS: [
    { label: "Guitar" },
    { label: "Piano" },
    { label: "Drums" },
  ],
}));

describe("TagList", () => {
  it("renders empty when no tags provided", () => {
    render(<TagList tags={[]} />);

    expect(screen.queryByTestId("badge-default")).not.toBeInTheDocument();
    expect(screen.queryByTestId("badge-secondary")).not.toBeInTheDocument();
  });

  it("renders regular tags correctly", () => {
    const tags = ["practice", "scales", "technique"];
    render(<TagList tags={tags} />);

    expect(screen.getByText("practice")).toBeInTheDocument();
    expect(screen.getByText("scales")).toBeInTheDocument();
    expect(screen.getByText("technique")).toBeInTheDocument();

    // Should render as secondary badges
    expect(screen.getAllByTestId("badge-secondary")).toHaveLength(3);
  });

  it("renders instrument tag as default variant", () => {
    const tags = ["Guitar", "practice"];
    render(<TagList tags={tags} />);

    expect(screen.getByText("Guitar")).toBeInTheDocument();
    expect(screen.getByText("practice")).toBeInTheDocument();

    // Instrument tag should be default variant
    expect(screen.getByTestId("badge-default")).toBeInTheDocument();
    // Regular tag should be secondary variant
    expect(screen.getByTestId("badge-secondary")).toBeInTheDocument();
  });

  it("handles multiple instrument tags (shows first one)", () => {
    const tags = ["Guitar", "Piano", "practice"];
    render(<TagList tags={tags} />);

    // Should show first instrument tag (Guitar) as default
    expect(screen.getByText("Guitar")).toBeInTheDocument();
    expect(screen.getByText("practice")).toBeInTheDocument();

    // Should not show Piano as it's the second instrument tag
    expect(screen.queryByText("Piano")).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <TagList tags={["test"]} className="custom-class" />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("custom-class");
  });

  it("shows remove buttons when onRemoveTag is provided", () => {
    const onRemoveTag = vi.fn();
    const tags = ["practice", "scales"];
    render(<TagList tags={tags} onRemoveTag={onRemoveTag} />);

    const removeButtons = screen.getAllByRole("button");
    expect(removeButtons).toHaveLength(2);

    // Check aria-labels
    expect(removeButtons[0]).toHaveAttribute(
      "aria-label",
      "Remove tag practice"
    );
    expect(removeButtons[1]).toHaveAttribute("aria-label", "Remove tag scales");
  });

  it("calls onRemoveTag when remove button is clicked", () => {
    const onRemoveTag = vi.fn();
    const tags = ["practice"];
    render(<TagList tags={tags} onRemoveTag={onRemoveTag} />);

    const removeButton = screen.getByRole("button");
    fireEvent.click(removeButton);

    expect(onRemoveTag).toHaveBeenCalledWith("practice");
  });

  it("does not show remove buttons when onRemoveTag is not provided", () => {
    const tags = ["practice"];
    render(<TagList tags={tags} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("handles instrument tag with remove functionality", () => {
    const onRemoveTag = vi.fn();
    const tags = ["Guitar", "practice"];
    render(<TagList tags={tags} onRemoveTag={onRemoveTag} />);

    // Instrument tag should not have remove button
    const removeButtons = screen.getAllByRole("button");
    expect(removeButtons).toHaveLength(1); // Only the practice tag

    fireEvent.click(removeButtons[0]);
    expect(onRemoveTag).toHaveBeenCalledWith("practice");
  });
});
