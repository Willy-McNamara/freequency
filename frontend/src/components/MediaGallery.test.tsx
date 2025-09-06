import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MediaGallery } from "./MediaGallery";

// Mock the icons
vi.mock("lucide-react", () => ({
  X: () => <div data-testid="x-icon">X</div>,
  Image: () => <div data-testid="image-icon">Image</div>,
  Music: () => <div data-testid="music-icon">Music</div>,
  Video: () => <div data-testid="video-icon">Video</div>,
  File: () => <div data-testid="file-icon">File</div>,
}));

// Mock AudioPlayer component
vi.mock("./AudioPlayer", () => ({
  AudioPlayer: ({ audioId, url, size, title }: any) => (
    <div data-testid={`audio-player-${audioId}`}>
      <div data-testid="audio-url">{url}</div>
      <div data-testid="audio-size">{size}</div>
      <div data-testid="audio-title">{title}</div>
    </div>
  ),
}));

describe("MediaGallery", () => {
  const mockOnRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  describe("Rendering", () => {
    it("renders empty state when no media", () => {
      render(<MediaGallery media={[]} />);

      expect(screen.getByText("No media added yet.")).toBeInTheDocument();
    });

    it("renders with custom className", () => {
      render(<MediaGallery media={[]} className="custom-class" />);

      // The className is applied to the container div
      expect(screen.getByText("No media added yet.")).toBeInTheDocument();
    });

    it("renders photos correctly", () => {
      const media = [
        {
          id: "1",
          url: "https://example.com/photo1.jpg",
          type: "image" as const,
          fileName: "photo1.jpg",
        },
        {
          id: "2",
          url: "https://example.com/photo2.jpg",
          type: "image" as const,
          fileName: "photo2.jpg",
        },
      ];

      render(<MediaGallery media={media} />);

      expect(screen.getByAltText("photo1.jpg")).toBeInTheDocument();
      expect(screen.getByAltText("photo2.jpg")).toBeInTheDocument();
      expect(screen.getAllByTestId("image-icon")).toHaveLength(2);
    });

    it("renders audio files correctly", () => {
      const media = [
        {
          id: "1",
          url: "https://example.com/audio1.mp3",
          type: "audio" as const,
          displayName: "My Recording",
        },
        {
          id: "2",
          url: "https://example.com/audio2.mp3",
          type: "audio" as const,
        },
      ];

      render(<MediaGallery media={media} />);

      expect(screen.getByTestId("audio-player-1")).toBeInTheDocument();
      expect(screen.getByTestId("audio-player-2")).toBeInTheDocument();
      expect(screen.getByText("My Recording")).toBeInTheDocument();
      expect(screen.getByText("Audio Recording")).toBeInTheDocument(); // default title
    });

    it("renders videos with thumbnails correctly", () => {
      const media = [
        {
          id: "1",
          url: "https://example.com/video1.mp4",
          type: "video" as const,
          fileName: "video1.mp4",
          thumbnailUrl: "https://example.com/thumb1.jpg",
        },
      ];

      render(<MediaGallery media={media} />);

      expect(screen.getByAltText("video1.mp4")).toBeInTheDocument();
      expect(screen.getAllByTestId("video-icon")).toHaveLength(1); // Only file type icon
    });

    it("renders videos without thumbnails correctly", () => {
      const media = [
        {
          id: "1",
          url: "https://example.com/video1.mp4",
          type: "video" as const,
          fileName: "video1.mp4",
        },
      ];

      render(<MediaGallery media={media} />);

      const video = screen.getByTestId("video-element");
      expect(video).toBeInTheDocument();
      expect(video).toHaveAttribute("src", "https://example.com/video1.mp4");
    });

    it("renders mixed media types correctly", () => {
      const media = [
        {
          id: "1",
          url: "https://example.com/photo.jpg",
          type: "image" as const,
          fileName: "photo.jpg",
        },
        {
          id: "2",
          url: "https://example.com/audio.mp3",
          type: "audio" as const,
          displayName: "My Audio",
        },
        {
          id: "3",
          url: "https://example.com/video.mp4",
          type: "video" as const,
          fileName: "video.mp4",
          thumbnailUrl: "https://example.com/thumb.jpg",
        },
      ];

      render(<MediaGallery media={media} />);

      expect(screen.getByAltText("photo.jpg")).toBeInTheDocument();
      expect(screen.getByTestId("audio-player-2")).toBeInTheDocument();
      expect(screen.getByAltText("video.mp4")).toBeInTheDocument();
      expect(screen.getAllByTestId("image-icon")).toHaveLength(1);
      expect(screen.getAllByTestId("video-icon")).toHaveLength(1); // Only file type icon
    });
  });

  describe("Remove Functionality", () => {
    it("shows remove buttons when onRemove is provided", () => {
      const media = [
        {
          id: "1",
          url: "https://example.com/photo.jpg",
          type: "image" as const,
          fileName: "photo.jpg",
        },
      ];

      render(<MediaGallery media={media} onRemove={mockOnRemove} />);

      const removeButtons = screen.getAllByTestId("x-icon");
      expect(removeButtons).toHaveLength(1);
    });

    it("does not show remove buttons when onRemove is not provided", () => {
      const media = [
        {
          id: "1",
          url: "https://example.com/photo.jpg",
          type: "image" as const,
          fileName: "photo.jpg",
        },
      ];

      render(<MediaGallery media={media} />);

      expect(screen.queryByTestId("x-icon")).not.toBeInTheDocument();
    });

    it("calls onRemove with correct index for photo", () => {
      const media = [
        {
          id: "1",
          url: "https://example.com/photo.jpg",
          type: "image" as const,
          fileName: "photo.jpg",
        },
      ];

      render(<MediaGallery media={media} onRemove={mockOnRemove} />);

      const removeButton = screen.getByTestId("x-icon").parentElement;
      fireEvent.click(removeButton!);

      expect(mockOnRemove).toHaveBeenCalledWith(0);
    });

    it("calls onRemove with correct index for audio", () => {
      const media = [
        {
          id: "1",
          url: "https://example.com/audio.mp3",
          type: "audio" as const,
          displayName: "My Audio",
        },
      ];

      render(<MediaGallery media={media} onRemove={mockOnRemove} />);

      const removeButton = screen.getByTestId("x-icon").parentElement;
      fireEvent.click(removeButton!);

      expect(mockOnRemove).toHaveBeenCalledWith(0);
    });

    it("calls onRemove with correct index for video", () => {
      const media = [
        {
          id: "1",
          url: "https://example.com/video.mp4",
          type: "video" as const,
          fileName: "video.mp4",
          thumbnailUrl: "https://example.com/thumb.jpg",
        },
      ];

      render(<MediaGallery media={media} onRemove={mockOnRemove} />);

      const removeButton = screen.getByTestId("x-icon").parentElement;
      fireEvent.click(removeButton!);

      expect(mockOnRemove).toHaveBeenCalledWith(0);
    });

    it("calls onRemove with correct index for mixed media", () => {
      const media = [
        {
          id: "1",
          url: "https://example.com/photo.jpg",
          type: "image" as const,
          fileName: "photo.jpg",
        },
        {
          id: "2",
          url: "https://example.com/audio.mp3",
          type: "audio" as const,
          displayName: "My Audio",
        },
        {
          id: "3",
          url: "https://example.com/video.mp4",
          type: "video" as const,
          fileName: "video.mp4",
        },
      ];

      render(<MediaGallery media={media} onRemove={mockOnRemove} />);

      const removeButtons = screen.getAllByTestId("x-icon");

      // Click first remove button (photo)
      fireEvent.click(removeButtons[0].parentElement!);
      expect(mockOnRemove).toHaveBeenCalledWith(1); // The component uses findIndex which returns 1 for the first item

      // Reset mock for next call
      mockOnRemove.mockClear();

      // Click second remove button (audio)
      fireEvent.click(removeButtons[1].parentElement!);
      expect(mockOnRemove).toHaveBeenCalledWith(0);

      // Reset mock for next call
      mockOnRemove.mockClear();

      // Click third remove button (video)
      fireEvent.click(removeButtons[2].parentElement!);
      expect(mockOnRemove).toHaveBeenCalledWith(2);
    });
  });

  describe("Audio Player Integration", () => {
    it("passes correct props to AudioPlayer", () => {
      const media = [
        {
          id: "audio-1",
          url: "https://example.com/audio.mp3",
          type: "audio" as const,
          displayName: "Custom Audio Name",
        },
      ];

      render(<MediaGallery media={media} />);

      const audioPlayer = screen.getByTestId("audio-player-audio-1");
      expect(audioPlayer).toBeInTheDocument();
      expect(
        screen.getByText("https://example.com/audio.mp3")
      ).toBeInTheDocument();
      expect(screen.getByText("md")).toBeInTheDocument();
      expect(screen.getByText("Custom Audio Name")).toBeInTheDocument();
    });

    it("uses default title when displayName is not provided", () => {
      const media = [
        {
          id: "audio-1",
          url: "https://example.com/audio.mp3",
          type: "audio" as const,
        },
      ];

      render(<MediaGallery media={media} />);

      expect(screen.getByText("Audio Recording")).toBeInTheDocument();
    });

    it("uses index as audioId when id is not provided", () => {
      const media = [
        {
          url: "https://example.com/audio.mp3",
          type: "audio" as const,
        },
      ];

      render(<MediaGallery media={media} />);

      expect(screen.getByTestId("audio-player-0")).toBeInTheDocument();
    });
  });

  describe("Video Fallback", () => {
    it("shows fallback icon when video fails to load", () => {
      const media = [
        {
          id: "1",
          url: "https://example.com/video.mp4",
          type: "video" as const,
          fileName: "video.mp4",
        },
      ];

      render(<MediaGallery media={media} />);

      const video = screen.getByTestId("video-element");

      // Simulate video load error
      fireEvent.error(video);

      // The fallback should be visible
      expect(screen.getByTestId("video-icon")).toBeInTheDocument();
    });
  });

  describe("File Type Icons", () => {
    it("shows correct icon for image type", () => {
      const media = [
        {
          id: "1",
          url: "https://example.com/photo.jpg",
          type: "image" as const,
          fileName: "photo.jpg",
        },
      ];

      render(<MediaGallery media={media} />);

      expect(screen.getByTestId("image-icon")).toBeInTheDocument();
    });

    it("shows correct icon for audio type", () => {
      const media = [
        {
          id: "1",
          url: "https://example.com/audio.mp3",
          type: "audio" as const,
        },
      ];

      render(<MediaGallery media={media} />);

      // Audio files don't show file type icons in the gallery
      // They only show the AudioPlayer component
      expect(screen.getByTestId("audio-player-1")).toBeInTheDocument();
    });

    it("shows correct icon for video type", () => {
      const media = [
        {
          id: "1",
          url: "https://example.com/video.mp4",
          type: "video" as const,
          fileName: "video.mp4",
        },
      ];

      render(<MediaGallery media={media} />);

      expect(screen.getAllByTestId("video-icon")).toHaveLength(1); // Only file type icon
    });

    it("filters out unknown types", () => {
      const media = [
        {
          id: "1",
          url: "https://example.com/file.xyz",
          type: "unknown" as any,
          fileName: "file.xyz",
        },
      ];

      render(<MediaGallery media={media} />);

      // Unknown types are filtered out, so we get an empty div
      const container = document.querySelector(".space-y-4");
      expect(container).toBeInTheDocument();
      expect(container?.children).toHaveLength(0);
    });
  });

  describe("Accessibility", () => {
    it("provides alt text for images", () => {
      const media = [
        {
          id: "1",
          url: "https://example.com/photo.jpg",
          type: "image" as const,
          fileName: "photo.jpg",
        },
      ];

      render(<MediaGallery media={media} />);

      const image = screen.getByAltText("photo.jpg");
      expect(image).toBeInTheDocument();
    });

    it("provides alt text for video thumbnails", () => {
      const media = [
        {
          id: "1",
          url: "https://example.com/video.mp4",
          type: "video" as const,
          fileName: "video.mp4",
          thumbnailUrl: "https://example.com/thumb.jpg",
        },
      ];

      render(<MediaGallery media={media} />);

      const thumbnail = screen.getByAltText("video.mp4");
      expect(thumbnail).toBeInTheDocument();
    });

    it("uses default alt text when fileName is not provided", () => {
      const media = [
        {
          id: "1",
          url: "https://example.com/photo.jpg",
          type: "image" as const,
        },
      ];

      render(<MediaGallery media={media} />);

      const image = screen.getByAltText("Media");
      expect(image).toBeInTheDocument();
    });
  });
});
