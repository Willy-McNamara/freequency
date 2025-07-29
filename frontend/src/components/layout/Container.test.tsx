import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Container } from "./Container";

describe("Container", () => {
  it("renders children correctly", () => {
    render(
      <Container>
        <div data-testid="test-content">Test Content</div>
      </Container>
    );

    expect(screen.getByTestId("test-content")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("applies default size class", () => {
    const { container } = render(
      <Container>
        <div>Content</div>
      </Container>
    );

    const containerElement = container.firstChild as HTMLElement;
    expect(containerElement).toHaveClass("max-w-content-lg");
  });

  it("applies different size classes", () => {
    const { container, rerender } = render(
      <Container size="sm">
        <div>Content</div>
      </Container>
    );

    let containerElement = container.firstChild as HTMLElement;
    expect(containerElement).toHaveClass("max-w-content-sm");

    rerender(
      <Container size="md">
        <div>Content</div>
      </Container>
    );

    containerElement = container.firstChild as HTMLElement;
    expect(containerElement).toHaveClass("max-w-content-md");

    rerender(
      <Container size="xl">
        <div>Content</div>
      </Container>
    );

    containerElement = container.firstChild as HTMLElement;
    expect(containerElement).toHaveClass("max-w-content-xl");
  });

  it("applies custom className", () => {
    const { container } = render(
      <Container className="custom-class">
        <div>Content</div>
      </Container>
    );

    const containerElement = container.firstChild as HTMLElement;
    expect(containerElement).toHaveClass("custom-class");
  });

  it("applies additional props", () => {
    const { container } = render(
      <Container data-testid="container" id="test-id">
        <div>Content</div>
      </Container>
    );

    const containerElement = container.firstChild as HTMLElement;
    expect(containerElement).toHaveAttribute("data-testid", "container");
    expect(containerElement).toHaveAttribute("id", "test-id");
  });

  it("has correct display name", () => {
    expect(Container.displayName).toBe("Container");
  });
});
