import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { FeedPost } from "./feed-post";
import { sessionService } from "../services/sessions";
import { useAuth } from "./auth/AuthProvider";

// Mock the dependencies
vi.mock("../services/sessions");
vi.mock("./auth/AuthProvider");

const mockSessionService = vi.mocked(sessionService);
const mockUseAuth = vi.mocked(useAuth);

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("FeedPost", () => {
  const mockUser = {
    id: 1,
    email: "test@example.com",
    name: "Test User",
    displayName: "Test User",
    avatarUrl: undefined,
  };

  const mockPostData = {
    id: 1,
    title: "Test Session",
    notes: "Test notes",
    createdAt: "2024-01-01T00:00:00Z",
    duration: 3600,
    musician: {
      id: 2,
      displayName: "Post Creator",
      avatarUrl: null,
    },
    instruments: [{ id: 1, label: "Guitar", color: "#3b82f6" }],
    tags: [{ id: 1, label: "Practice", color: "#f59e0b" }],
    gasUps: [] as Array<{
      musician: {
        id: number;
        displayName: string;
        avatarUrl: string | null;
      };
    }>,
    comments: [] as Array<{
      musician: {
        displayName: string;
        avatarUrl: string | null;
      };
    }>,
    tasks: [] as Array<{
      id: number;
      title: string;
      notes: string;
      timeSpent: number;
      taskDefinition: {
        id: number;
        title: string;
        description: string;
        instrument: string;
        user: {
          displayName: string;
          avatarUrl: string | null;
        };
        tags: Array<{
          id: number;
          label: string;
          color: string | null;
        }>;
        checklist: string[];
        savedCount: number;
        usedCount: number;
      };
    }>,
    media: [] as Array<{
      url: string;
      type: string;
      displayName?: string;
      thumbnailUrl?: string;
    }>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      checkAuthStatus: vi.fn(),
    });
  });

  afterEach(() => {
    // Ensure any pending async operations are completed
    vi.runAllTimers();
    vi.clearAllTimers();
  });

  const renderFeedPost = (postData = mockPostData) => {
    return render(
      <MemoryRouter>
        <FeedPost postData={postData} />
      </MemoryRouter>
    );
  };

  // Helper function to check if gas up text contains expected content
  const checkGasUpText = (expectedText: string) => {
    const gasUpArea = screen.getByTitle(/Gas Up|Remove Gas Up/);
    const textElement = gasUpArea.querySelector(`[class*="font-bold"]`);
    return textElement?.textContent?.includes(expectedText) || false;
  };

  describe("Gas Up Functionality", () => {
    it("should render gas up button with correct initial state", () => {
      renderFeedPost();

      expect(checkGasUpText("0 gas ups")).toBe(true);
      expect(screen.getByTitle("Gas Up")).toBeInTheDocument();
    });

    it("should show singular 'gas up' when count is 1", () => {
      const postWithOneGasUp = {
        ...mockPostData,
        gasUps: [
          {
            musician: {
              id: 3,
              displayName: "Another User",
              avatarUrl: null,
            },
          },
        ],
      };

      renderFeedPost(postWithOneGasUp);

      expect(checkGasUpText("1 gas up")).toBe(true);
    });

    it("should show plural 'gas ups' when count is 0 or 2+", () => {
      const postWithMultipleGasUps = {
        ...mockPostData,
        gasUps: [
          {
            musician: {
              id: 3,
              displayName: "User 1",
              avatarUrl: null,
            },
          },
          {
            musician: {
              id: 4,
              displayName: "User 2",
              avatarUrl: null,
            },
          },
        ],
      };

      renderFeedPost(postWithMultipleGasUps);

      expect(checkGasUpText("2 gas ups")).toBe(true);
    });

    it("should add gas up when clicked", async () => {
      mockSessionService.addGasUp.mockResolvedValue({
        id: 1,
        musicianId: 1,
        sessionId: 1,
        musician: { id: 1, displayName: "Test User", avatarUrl: null },
      });

      renderFeedPost();

      const gasUpButton = screen.getByTitle("Gas Up");
      fireEvent.click(gasUpButton);

      await waitFor(() => {
        expect(checkGasUpText("1 gas up")).toBe(true);
      });

      expect(mockSessionService.addGasUp).toHaveBeenCalledWith(1, 2);
    });

    it("should remove gas up when clicked again", async () => {
      const postWithUserGasUp = {
        ...mockPostData,
        gasUps: [
          {
            musician: {
              id: 1,
              displayName: "Test User",
              avatarUrl: null,
            },
          },
        ],
      };

      mockSessionService.removeGasUp.mockResolvedValue({ success: true });

      renderFeedPost(postWithUserGasUp);

      const gasUpButton = screen.getByTitle("Remove Gas Up");
      fireEvent.click(gasUpButton);

      await waitFor(() => {
        expect(checkGasUpText("0 gas ups")).toBe(true);
      });

      expect(mockSessionService.removeGasUp).toHaveBeenCalledWith(1);
    });

    it("should handle API errors gracefully", async () => {
      mockSessionService.addGasUp.mockRejectedValue(new Error("API Error"));

      renderFeedPost();

      const gasUpButton = screen.getByTitle("Gas Up");
      fireEvent.click(gasUpButton);

      // Should revert to original state after error
      await waitFor(() => {
        expect(checkGasUpText("0 gas ups")).toBe(true);
      });

      // Wait for any pending state updates to complete
      await waitFor(() => {
        expect(gasUpButton).not.toHaveClass("opacity-50");
        expect(gasUpButton).not.toHaveClass("pointer-events-none");
      });

      // Additional wait to ensure all async operations complete
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    it("should prevent users from gassing up their own posts", () => {
      const ownPost = {
        ...mockPostData,
        musician: { id: 1, displayName: "Test User", avatarUrl: null },
      };

      renderFeedPost(ownPost);

      const gasUpButton = screen.getByTitle("You can't gas up your own post");
      expect(gasUpButton).toHaveClass("cursor-not-allowed");

      fireEvent.click(gasUpButton);
      expect(mockSessionService.addGasUp).not.toHaveBeenCalled();
    });

    it("should show loading state during API call", async () => {
      mockSessionService.addGasUp.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      renderFeedPost();

      const gasUpButton = screen.getByTitle("Gas Up");
      fireEvent.click(gasUpButton);

      // Should show loading state immediately
      expect(gasUpButton).toHaveClass("opacity-50");
      expect(gasUpButton).toHaveClass("pointer-events-none");
    });
  });

  describe("Navigation", () => {
    it("should navigate to post view with updated gas up state", () => {
      renderFeedPost();

      const postArea = screen.getByText("Test Session").closest("div");
      fireEvent.click(postArea!);

      expect(mockNavigate).toHaveBeenCalledWith("/post/1", {
        state: { postData: expect.objectContaining({ id: 1 }) },
      });
    });

    it("should include updated gas up state in navigation", async () => {
      // First add a gas up
      mockSessionService.addGasUp.mockResolvedValue({
        id: 1,
        musicianId: 1,
        sessionId: 1,
        musician: { id: 1, displayName: "Test User", avatarUrl: null },
      });

      renderFeedPost();

      const gasUpButton = screen.getByTitle("Gas Up");
      fireEvent.click(gasUpButton);

      // Wait for the gas up to be added
      await waitFor(() => {
        expect(checkGasUpText("1 gas up")).toBe(true);
      });

      // Then navigate
      const postArea = screen.getByText("Test Session").closest("div");
      fireEvent.click(postArea!);

      expect(mockNavigate).toHaveBeenCalledWith("/post/1", {
        state: {
          postData: expect.objectContaining({
            gasUps: expect.arrayContaining([
              expect.objectContaining({
                musician: {
                  id: 1,
                  displayName: "Test User",
                  avatarUrl: null,
                },
              }),
            ]),
          }),
        },
      });
    });
  });

  describe("UI Interactions", () => {
    it("should prevent navigation when clicking gas up button", () => {
      renderFeedPost();

      const gasUpButton = screen.getByTitle("Gas Up");
      fireEvent.click(gasUpButton);

      // Should not navigate when clicking gas up button
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should render post information correctly", () => {
      renderFeedPost();

      expect(screen.getByText("Test Session")).toBeInTheDocument();
      expect(screen.getByText("Post Creator")).toBeInTheDocument();
      expect(screen.getByText("1h 0m")).toBeInTheDocument();
      expect(screen.getByText("Guitar")).toBeInTheDocument();
      expect(screen.getByText("Practice")).toBeInTheDocument();
    });
  });
});
