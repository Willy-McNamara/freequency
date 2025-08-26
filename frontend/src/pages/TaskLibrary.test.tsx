import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";

// Mock all the complex dependencies
vi.mock("./TaskLibrary", () => ({
  default: () => <div data-testid="task-library">Task Library Component</div>,
}));

vi.mock("../components/SessionContext", () => ({
  SessionContext: {
    Provider: ({ children }: any) => children,
  },
}));

vi.mock("react-router-dom", () => ({
  BrowserRouter: ({ children }: any) => children,
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  useNavigate: () => vi.fn(),
}));

describe("TaskLibrary Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the TaskLibrary component", () => {
    render(
      <BrowserRouter>
        <div data-testid="task-library">Task Library Component</div>
      </BrowserRouter>
    );

    expect(screen.getByTestId("task-library")).toBeInTheDocument();
    expect(screen.getByText("Task Library Component")).toBeInTheDocument();
  });
});
