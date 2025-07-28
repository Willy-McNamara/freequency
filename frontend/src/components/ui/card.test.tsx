import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "./card";

describe("Card Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  describe("Card", () => {
    it("renders with default props", () => {
      render(<Card>Card content</Card>);

      expect(screen.getByText("Card content")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <Card className="custom-class">Content</Card>
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("custom-class");
    });

    it("forwards ref correctly", () => {
      const ref = vi.fn();
      render(<Card ref={ref}>Content</Card>);

      expect(ref).toHaveBeenCalled();
    });

    it("handles additional props", () => {
      render(
        <Card data-testid="card" id="test-id">
          Content
        </Card>
      );

      const card = screen.getByTestId("card");
      expect(card).toHaveAttribute("id", "test-id");
    });

    it("has correct display name", () => {
      expect(Card.displayName).toBe("Card");
    });

    it("applies base classes", () => {
      const { container } = render(<Card>Content</Card>);

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass(
        "rounded-xl",
        "border",
        "bg-card",
        "text-card-foreground",
        "shadow"
      );
    });
  });

  describe("CardHeader", () => {
    it("renders with default props", () => {
      render(<CardHeader>Header content</CardHeader>);

      expect(screen.getByText("Header content")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <CardHeader className="custom-class">Content</CardHeader>
      );

      const header = container.firstChild as HTMLElement;
      expect(header).toHaveClass("custom-class");
    });

    it("forwards ref correctly", () => {
      const ref = vi.fn();
      render(<CardHeader ref={ref}>Content</CardHeader>);

      expect(ref).toHaveBeenCalled();
    });

    it("has correct display name", () => {
      expect(CardHeader.displayName).toBe("CardHeader");
    });

    it("applies base classes", () => {
      const { container } = render(<CardHeader>Content</CardHeader>);

      const header = container.firstChild as HTMLElement;
      expect(header).toHaveClass("flex", "flex-col", "space-y-1.5", "p-6");
    });
  });

  describe("CardTitle", () => {
    it("renders with default props", () => {
      render(<CardTitle>Title content</CardTitle>);

      expect(screen.getByText("Title content")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <CardTitle className="custom-class">Content</CardTitle>
      );

      const title = container.firstChild as HTMLElement;
      expect(title).toHaveClass("custom-class");
    });

    it("forwards ref correctly", () => {
      const ref = vi.fn();
      render(<CardTitle ref={ref}>Content</CardTitle>);

      expect(ref).toHaveBeenCalled();
    });

    it("has correct display name", () => {
      expect(CardTitle.displayName).toBe("CardTitle");
    });

    it("applies base classes", () => {
      const { container } = render(<CardTitle>Content</CardTitle>);

      const title = container.firstChild as HTMLElement;
      expect(title).toHaveClass(
        "font-semibold",
        "leading-none",
        "tracking-tight"
      );
    });
  });

  describe("CardDescription", () => {
    it("renders with default props", () => {
      render(<CardDescription>Description content</CardDescription>);

      expect(screen.getByText("Description content")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <CardDescription className="custom-class">Content</CardDescription>
      );

      const description = container.firstChild as HTMLElement;
      expect(description).toHaveClass("custom-class");
    });

    it("forwards ref correctly", () => {
      const ref = vi.fn();
      render(<CardDescription ref={ref}>Content</CardDescription>);

      expect(ref).toHaveBeenCalled();
    });

    it("has correct display name", () => {
      expect(CardDescription.displayName).toBe("CardDescription");
    });

    it("applies base classes", () => {
      const { container } = render(<CardDescription>Content</CardDescription>);

      const description = container.firstChild as HTMLElement;
      expect(description).toHaveClass("text-sm", "text-muted-foreground");
    });
  });

  describe("CardContent", () => {
    it("renders with default props", () => {
      render(<CardContent>Content</CardContent>);

      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <CardContent className="custom-class">Content</CardContent>
      );

      const content = container.firstChild as HTMLElement;
      expect(content).toHaveClass("custom-class");
    });

    it("forwards ref correctly", () => {
      const ref = vi.fn();
      render(<CardContent ref={ref}>Content</CardContent>);

      expect(ref).toHaveBeenCalled();
    });

    it("has correct display name", () => {
      expect(CardContent.displayName).toBe("CardContent");
    });

    it("applies base classes", () => {
      const { container } = render(<CardContent>Content</CardContent>);

      const content = container.firstChild as HTMLElement;
      expect(content).toHaveClass("p-6", "pt-0");
    });
  });

  describe("CardFooter", () => {
    it("renders with default props", () => {
      render(<CardFooter>Footer content</CardFooter>);

      expect(screen.getByText("Footer content")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <CardFooter className="custom-class">Content</CardFooter>
      );

      const footer = container.firstChild as HTMLElement;
      expect(footer).toHaveClass("custom-class");
    });

    it("forwards ref correctly", () => {
      const ref = vi.fn();
      render(<CardFooter ref={ref}>Content</CardFooter>);

      expect(ref).toHaveBeenCalled();
    });

    it("has correct display name", () => {
      expect(CardFooter.displayName).toBe("CardFooter");
    });

    it("applies base classes", () => {
      const { container } = render(<CardFooter>Content</CardFooter>);

      const footer = container.firstChild as HTMLElement;
      expect(footer).toHaveClass("flex", "items-center", "p-6", "pt-0");
    });
  });

  describe("Card Composition", () => {
    it("renders a complete card with all components", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>Card Content</CardContent>
          <CardFooter>Card Footer</CardFooter>
        </Card>
      );

      expect(screen.getByText("Card Title")).toBeInTheDocument();
      expect(screen.getByText("Card Description")).toBeInTheDocument();
      expect(screen.getByText("Card Content")).toBeInTheDocument();
      expect(screen.getByText("Card Footer")).toBeInTheDocument();
    });

    it("handles nested content correctly", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Nested Title</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Nested paragraph</p>
            <span>Nested span</span>
          </CardContent>
        </Card>
      );

      expect(screen.getByText("Nested Title")).toBeInTheDocument();
      expect(screen.getByText("Nested paragraph")).toBeInTheDocument();
      expect(screen.getByText("Nested span")).toBeInTheDocument();
    });
  });
});
