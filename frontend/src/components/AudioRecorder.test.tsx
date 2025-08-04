import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AudioRecorder } from "./AudioRecorder";

// Mock MediaRecorder
const mockMediaRecorder = {
  start: vi.fn(),
  stop: vi.fn(),
  stream: {
    getTracks: vi.fn(() => [{ stop: vi.fn() }]),
  },
  ondataavailable: null as ((event: { data: Blob }) => void) | null,
  onstop: null as (() => void) | null,
  state: "inactive" as string,
};

global.MediaRecorder = vi.fn(() => mockMediaRecorder) as any;

// Mock navigator.mediaDevices
const mockGetUserMedia = vi.fn().mockResolvedValue({
  getTracks: () => [{ stop: vi.fn() }],
});

Object.defineProperty(navigator, "mediaDevices", {
  value: {
    getUserMedia: mockGetUserMedia,
  },
  writable: true,
});

// Mock console.error
const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

const defaultProps = {
  onRecordingComplete: vi.fn(),
};

describe("AudioRecorder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  afterEach(() => {
    cleanup();
    consoleSpy.mockClear();
  });

  describe("Rendering", () => {
    it("renders with default props", () => {
      render(<AudioRecorder {...defaultProps} />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("Record Audio");
    });

    it("renders with custom className", () => {
      render(<AudioRecorder {...defaultProps} className="custom-class" />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });

    it("shows microphone icon", () => {
      render(<AudioRecorder {...defaultProps} />);

      expect(document.querySelector(".lucide-mic")).toBeInTheDocument();
    });
  });

  describe("Recording Functionality", () => {
    it("shows recording state when recording", async () => {
      render(<AudioRecorder {...defaultProps} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveTextContent("Stop Recording");
        expect(document.querySelector(".lucide-square")).toBeInTheDocument();
      });
    });

    it("handles button click", () => {
      render(<AudioRecorder {...defaultProps} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(button).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("handles permission denied error", async () => {
      mockGetUserMedia.mockRejectedValueOnce(new Error("Permission denied"));

      render(<AudioRecorder {...defaultProps} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error starting recording:",
          expect.any(Error)
        );
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper button role", () => {
      render(<AudioRecorder {...defaultProps} />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("is disabled when disabled prop is true", () => {
      render(<AudioRecorder {...defaultProps} disabled />);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });
  });

  describe("Cleanup", () => {
    it("renders without errors", () => {
      expect(() => {
        render(<AudioRecorder {...defaultProps} />);
      }).not.toThrow();
    });
  });
});
