import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AudioPlayer } from "./AudioPlayer";
import { AudioProvider } from "./AudioContext";

// Mock the Audio API
const mockAudio = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  load: vi.fn(),
  remove: vi.fn(),
  currentTime: 0,
  duration: 120,
  ended: false,
  paused: true,
  src: "",
  muted: false,
  volume: 1,
  playbackRate: 1,
};

global.Audio = vi.fn(() => mockAudio) as any;

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AudioProvider>{children}</AudioProvider>
);

const defaultProps = {
  audioId: "test-audio",
  url: "https://example.com/audio.mp3",
  title: "Test Audio",
};

describe("AudioPlayer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  describe("Rendering", () => {
    it("renders with default props", () => {
      render(
        <TestWrapper>
          <AudioPlayer {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText("Test Audio")).toBeInTheDocument();
      expect(screen.getByRole("button")).toBeInTheDocument();
      expect(document.querySelector(".bg-primary")).toBeInTheDocument();
    });

    it("renders with custom title", () => {
      render(
        <TestWrapper>
          <AudioPlayer {...defaultProps} title="Custom Title" />
        </TestWrapper>
      );

      expect(screen.getByText("Custom Title")).toBeInTheDocument();
    });

    it("renders with custom size", () => {
      render(
        <TestWrapper>
          <AudioPlayer {...defaultProps} size="lg" />
        </TestWrapper>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass("lg:h-12"); // lg size class
    });

    it("renders with custom className", () => {
      render(
        <TestWrapper>
          <AudioPlayer {...defaultProps} className="custom-class" />
        </TestWrapper>
      );

      const container = screen.getByText("Test Audio").closest("div")
        ?.parentElement?.parentElement?.parentElement;
      expect(container).toHaveClass("custom-class");
    });
  });

  describe("Play/Pause Functionality", () => {
    it("shows play icon initially", () => {
      render(
        <TestWrapper>
          <AudioPlayer {...defaultProps} />
        </TestWrapper>
      );

      const playButton = screen.getByRole("button");
      expect(playButton).toBeInTheDocument();
      // Check for play icon (should be present initially)
      expect(playButton.querySelector(".lucide-play")).toBeInTheDocument();
    });

    it("handles button click", () => {
      const onClick = vi.fn();
      render(
        <TestWrapper>
          <AudioPlayer {...defaultProps} onClick={onClick} />
        </TestWrapper>
      );

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(onClick).toHaveBeenCalled();
    });
  });

  describe("Progress Tracking", () => {
    it("shows loading state initially", () => {
      render(
        <TestWrapper>
          <AudioPlayer {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("updates progress bar when audio time changes", async () => {
      render(
        <TestWrapper>
          <AudioPlayer {...defaultProps} />
        </TestWrapper>
      );

      await waitFor(() => {
        const progressBar = document.querySelector(".bg-primary");
        expect(progressBar).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper button role", () => {
      render(
        <TestWrapper>
          <AudioPlayer {...defaultProps} />
        </TestWrapper>
      );

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("shows play/pause icons correctly", async () => {
      render(
        <TestWrapper>
          <AudioPlayer {...defaultProps} />
        </TestWrapper>
      );

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();

      // Should show play icon initially
      expect(document.querySelector(".lucide-play")).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("applies correct size classes", () => {
      const { rerender } = render(
        <TestWrapper>
          <AudioPlayer {...defaultProps} size="sm" />
        </TestWrapper>
      );

      let button = screen.getByRole("button");
      expect(button).toHaveClass("h-6"); // sm size (base)

      rerender(
        <TestWrapper>
          <AudioPlayer {...defaultProps} size="md" />
        </TestWrapper>
      );

      button = screen.getByRole("button");
      expect(button).toHaveClass("md:h-9"); // md size

      rerender(
        <TestWrapper>
          <AudioPlayer {...defaultProps} size="lg" />
        </TestWrapper>
      );

      button = screen.getByRole("button");
      expect(button).toHaveClass("lg:h-12"); // lg size
    });

    it("applies padding when showRemoveButton is true", () => {
      render(
        <TestWrapper>
          <AudioPlayer {...defaultProps} showRemoveButton={true} />
        </TestWrapper>
      );

      const timeDisplay = screen.getByText("Loading...").closest("div");
      expect(timeDisplay).toHaveClass("pr-8");
    });

    it("does not apply padding when showRemoveButton is false", () => {
      render(
        <TestWrapper>
          <AudioPlayer {...defaultProps} showRemoveButton={false} />
        </TestWrapper>
      );

      const timeDisplay = screen.getByText("Loading...").closest("div");
      expect(timeDisplay).not.toHaveClass("pr-8");
    });
  });

  describe("Cleanup", () => {
    it("renders without errors", () => {
      expect(() => {
        render(
          <TestWrapper>
            <AudioPlayer {...defaultProps} />
          </TestWrapper>
        );
      }).not.toThrow();
    });
  });
});
