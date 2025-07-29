import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Section } from "./Section";

describe("Section", () => {
  it("renders children correctly", () => {
    render(
      <Section>
        <div data-testid="test-content">Test Content</div>
      </Section>
    );

    expect(screen.getByTestId("test-content")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("applies default spacing class", () => {
    const { container } = render(
      <Section>
        <div>Content</div>
      </Section>
    );

    const sectionElement = container.firstChild as HTMLElement;
    expect(sectionElement).toHaveClass("py-4"); // default md spacing
  });

  it("applies different spacing classes", () => {
    const { container, rerender } = render(
      <Section spacing="xs">
        <div>Content</div>
      </Section>
    );

    let sectionElement = container.firstChild as HTMLElement;
    expect(sectionElement).toHaveClass("py-1");

    rerender(
      <Section spacing="sm">
        <div>Content</div>
      </Section>
    );

    sectionElement = container.firstChild as HTMLElement;
    expect(sectionElement).toHaveClass("py-2");

    rerender(
      <Section spacing="lg">
        <div>Content</div>
      </Section>
    );

    sectionElement = container.firstChild as HTMLElement;
    expect(sectionElement).toHaveClass("py-6");

    rerender(
      <Section spacing="xl">
        <div>Content</div>
      </Section>
    );

    sectionElement = container.firstChild as HTMLElement;
    expect(sectionElement).toHaveClass("py-8");

    rerender(
      <Section spacing="2xl">
        <div>Content</div>
      </Section>
    );

    sectionElement = container.firstChild as HTMLElement;
    expect(sectionElement).toHaveClass("py-12");

    rerender(
      <Section spacing="3xl">
        <div>Content</div>
      </Section>
    );

    sectionElement = container.firstChild as HTMLElement;
    expect(sectionElement).toHaveClass("py-16");
  });

  it("applies custom className", () => {
    const { container } = render(
      <Section className="custom-class">
        <div>Content</div>
      </Section>
    );

    const sectionElement = container.firstChild as HTMLElement;
    expect(sectionElement).toHaveClass("custom-class");
  });

  it("applies additional props", () => {
    const { container } = render(
      <Section data-testid="section" id="test-id">
        <div>Content</div>
      </Section>
    );

    const sectionElement = container.firstChild as HTMLElement;
    expect(sectionElement).toHaveAttribute("data-testid", "section");
    expect(sectionElement).toHaveAttribute("id", "test-id");
  });

  it("has correct display name", () => {
    expect(Section.displayName).toBe("Section");
  });

  // TODO: Add comprehensive tests for responsive spacing object prop
  // This requires mocking window.innerWidth and testing the useBreakpoint hook
  // with different screen sizes and responsive spacing configurations
  // For now, we'll test the basic functionality and leave complex breakpoint
  // testing for later when we have more time to implement proper window mocking
});
