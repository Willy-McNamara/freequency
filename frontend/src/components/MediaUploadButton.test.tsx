import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MediaUploadButton } from "./MediaUploadButton";
import { toast } from "sonner";

// Mock the icons
vi.mock("lucide-react", () => ({
  Upload: () => <div data-testid="upload-icon">Upload</div>,
  Image: () => <div data-testid="image-icon">Image</div>,
  Music: () => <div data-testid="music-icon">Music</div>,
  Video: () => <div data-testid="video-icon">Video</div>,
}));

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe("MediaUploadButton", () => {
  const mockOnFileSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  describe("Rendering", () => {
    it("renders with default props", () => {
      render(<MediaUploadButton onFileSelect={mockOnFileSelect} />);

      expect(screen.getByTestId("upload-icon")).toBeInTheDocument();
      expect(screen.getByText("Upload Media")).toBeInTheDocument();
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("renders with image type", () => {
      render(
        <MediaUploadButton
          onFileSelect={mockOnFileSelect}
          acceptedTypes="image"
        />
      );

      expect(screen.getByTestId("image-icon")).toBeInTheDocument();
      expect(screen.getByText("Add Photo")).toBeInTheDocument();
    });

    it("renders with audio type", () => {
      render(
        <MediaUploadButton
          onFileSelect={mockOnFileSelect}
          acceptedTypes="audio"
        />
      );

      expect(screen.getByTestId("music-icon")).toBeInTheDocument();
      expect(screen.getByText("Add Audio")).toBeInTheDocument();
    });

    it("renders with video type", () => {
      render(
        <MediaUploadButton
          onFileSelect={mockOnFileSelect}
          acceptedTypes="video"
        />
      );

      expect(screen.getByTestId("video-icon")).toBeInTheDocument();
      expect(screen.getByText("Add Video")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      render(
        <MediaUploadButton
          onFileSelect={mockOnFileSelect}
          className="custom-class"
        />
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });

    it("renders disabled state", () => {
      render(
        <MediaUploadButton onFileSelect={mockOnFileSelect} disabled={true} />
      );

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });
  });

  describe("File Input", () => {
    it("has correct accept attribute for all types", () => {
      render(<MediaUploadButton onFileSelect={mockOnFileSelect} />);

      const fileInput = screen.getByDisplayValue("") as HTMLInputElement;
      expect(fileInput).toHaveAttribute(
        "accept",
        "image/jpeg,image/jpg,image/png,image/gif,image/webp,audio/webm,audio/mp3,audio/mpeg,audio/wav,audio/m4a,audio/ogg,video/mp4,video/webm,video/quicktime"
      );
    });

    it("has correct accept attribute for image type", () => {
      render(
        <MediaUploadButton
          onFileSelect={mockOnFileSelect}
          acceptedTypes="image"
        />
      );

      const fileInput = screen.getByDisplayValue("") as HTMLInputElement;
      expect(fileInput).toHaveAttribute(
        "accept",
        "image/jpeg,image/jpg,image/png,image/gif,image/webp"
      );
    });

    it("has correct accept attribute for audio type", () => {
      render(
        <MediaUploadButton
          onFileSelect={mockOnFileSelect}
          acceptedTypes="audio"
        />
      );

      const fileInput = screen.getByDisplayValue("") as HTMLInputElement;
      expect(fileInput).toHaveAttribute(
        "accept",
        "audio/webm,audio/mp3,audio/mpeg,audio/wav,audio/m4a,audio/ogg"
      );
    });

    it("has correct accept attribute for video type", () => {
      render(
        <MediaUploadButton
          onFileSelect={mockOnFileSelect}
          acceptedTypes="video"
        />
      );

      const fileInput = screen.getByDisplayValue("") as HTMLInputElement;
      expect(fileInput).toHaveAttribute(
        "accept",
        "video/mp4,video/webm,video/quicktime"
      );
    });
  });

  describe("File Validation", () => {
    it("accepts valid image file", () => {
      render(<MediaUploadButton onFileSelect={mockOnFileSelect} />);

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const fileInput = screen.getByDisplayValue("") as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(mockOnFileSelect).toHaveBeenCalledWith(file);
    });

    it("accepts valid audio file", () => {
      render(<MediaUploadButton onFileSelect={mockOnFileSelect} />);

      const file = new File(["test"], "test.mp3", { type: "audio/mpeg" });
      const fileInput = screen.getByDisplayValue("") as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(mockOnFileSelect).toHaveBeenCalledWith(file);
    });

    it("accepts valid video file", () => {
      render(<MediaUploadButton onFileSelect={mockOnFileSelect} />);

      const file = new File(["test"], "test.mp4", { type: "video/mp4" });
      const fileInput = screen.getByDisplayValue("") as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(mockOnFileSelect).toHaveBeenCalledWith(file);
    });

    it("rejects unsupported file type", () => {
      render(<MediaUploadButton onFileSelect={mockOnFileSelect} />);

      const file = new File(["test"], "test.pdf", { type: "application/pdf" });
      const fileInput = screen.getByDisplayValue("") as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(toast.error).toHaveBeenCalledWith("Unsupported file type");
      expect(mockOnFileSelect).not.toHaveBeenCalled();
    });

    it("rejects oversized image file", () => {
      render(<MediaUploadButton onFileSelect={mockOnFileSelect} />);

      // Create a file larger than 10MB
      const largeFile = new File(["x".repeat(11 * 1024 * 1024)], "large.jpg", {
        type: "image/jpeg",
      });
      const fileInput = screen.getByDisplayValue("") as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [largeFile] } });

      expect(toast.error).toHaveBeenCalledWith(
        "File size exceeds limit of 10MB"
      );
      expect(mockOnFileSelect).not.toHaveBeenCalled();
    });

    it("rejects oversized audio file", () => {
      render(<MediaUploadButton onFileSelect={mockOnFileSelect} />);

      // Create a file larger than 50MB (use smaller size for faster test)
      const largeFile = new File(["x".repeat(1024)], "large.mp3", {
        type: "audio/mpeg",
      });
      // Mock the file size to be larger than limit
      Object.defineProperty(largeFile, "size", { value: 51 * 1024 * 1024 });

      const fileInput = screen.getByDisplayValue("") as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [largeFile] } });

      expect(toast.error).toHaveBeenCalledWith(
        "File size exceeds limit of 50MB"
      );
      expect(mockOnFileSelect).not.toHaveBeenCalled();
    }, 10000);

    it("rejects oversized video file", () => {
      render(<MediaUploadButton onFileSelect={mockOnFileSelect} />);

      // Create a file larger than 50MB (use smaller size for faster test)
      const largeFile = new File(["x".repeat(1024)], "large.mp4", {
        type: "video/mp4",
      });
      // Mock the file size to be larger than limit
      Object.defineProperty(largeFile, "size", { value: 51 * 1024 * 1024 });

      const fileInput = screen.getByDisplayValue("") as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [largeFile] } });

      expect(toast.error).toHaveBeenCalledWith(
        "File size exceeds limit of 50MB"
      );
      expect(mockOnFileSelect).not.toHaveBeenCalled();
    }, 10000);
  });

  describe("User Interactions", () => {
    it("opens file dialog when button is clicked", () => {
      render(<MediaUploadButton onFileSelect={mockOnFileSelect} />);

      const button = screen.getByRole("button");
      const fileInput = screen.getByDisplayValue("") as HTMLInputElement;

      // Mock click method
      const clickSpy = vi.spyOn(fileInput, "click");

      fireEvent.click(button);

      expect(clickSpy).toHaveBeenCalled();
    });

    it("processes file successfully", () => {
      render(<MediaUploadButton onFileSelect={mockOnFileSelect} />);

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const fileInput = screen.getByDisplayValue("") as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      // The component should call onFileSelect with the file
      expect(mockOnFileSelect).toHaveBeenCalledWith(file);
    });

    it("handles file processing errors", () => {
      mockOnFileSelect.mockImplementation(() => {
        throw new Error("Processing failed");
      });

      render(<MediaUploadButton onFileSelect={mockOnFileSelect} />);

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const fileInput = screen.getByDisplayValue("") as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(toast.error).toHaveBeenCalledWith("Failed to process file");
    });

    it("does nothing when no file is selected", () => {
      render(<MediaUploadButton onFileSelect={mockOnFileSelect} />);

      const fileInput = screen.getByDisplayValue("") as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [] } });

      expect(mockOnFileSelect).not.toHaveBeenCalled();
    });
  });

  describe("Disabled State", () => {
    it("disables file input when component is disabled", () => {
      render(
        <MediaUploadButton onFileSelect={mockOnFileSelect} disabled={true} />
      );

      const fileInput = screen.getByDisplayValue("") as HTMLInputElement;
      expect(fileInput).toBeDisabled();
    });

    it("handles file input disabled state correctly", () => {
      render(
        <MediaUploadButton onFileSelect={mockOnFileSelect} disabled={true} />
      );

      const fileInput = screen.getByDisplayValue("") as HTMLInputElement;
      expect(fileInput).toBeDisabled();
    });
  });
});
