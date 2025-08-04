import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MediaGalleryModal } from "./MediaGalleryModal";

// Mock the icons
vi.mock("lucide-react", () => ({
  X: () => <div data-testid="x-icon">X</div>,
  ChevronLeft: () => <div data-testid="chevron-left-icon">ChevronLeft</div>,
  ChevronRight: () => <div data-testid="chevron-right-icon">ChevronRight</div>,
  Image: () => <div data-testid="image-icon">Image</div>,
  Music: () => <div data-testid="music-icon">Music</div>,
  Video: () => <div data-testid="video-icon">Video</div>,
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

describe("MediaGalleryModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  describe("Rendering", () => {
    it("returns null when no media is provided", () => {
      const { container } = render(<MediaGalleryModal media={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it("returns null when media is null", () => {
      const { container } = render(<MediaGalleryModal media={null as any} />);
      expect(container.firstChild).toBeNull();
    });

    it("renders photos correctly", () => {
      const media = [
        {
          url: "https://example.com/photo1.jpg",
          type: "image",
        },
        {
          url: "https://example.com/photo2.jpg",
          type: "image",
        },
      ];

      render(<MediaGalleryModal media={media} />);

      const images = screen.getAllByAltText("Media");
      expect(images).toHaveLength(2);
      expect(images[0]).toHaveAttribute(
        "src",
        "https://example.com/photo1.jpg"
      );
      expect(images[1]).toHaveAttribute(
        "src",
        "https://example.com/photo2.jpg"
      );
    });

    it("renders videos with thumbnails correctly", () => {
      const media = [
        {
          url: "https://example.com/video1.mp4",
          type: "video",
          thumbnailUrl: "https://example.com/thumb1.jpg",
          displayName: "My Video",
        },
      ];

      render(<MediaGalleryModal media={media} />);

      const thumbnail = screen.getByAltText("My Video");
      expect(thumbnail).toBeInTheDocument();
      expect(thumbnail).toHaveAttribute(
        "src",
        "https://example.com/thumb1.jpg"
      );
    });

    it("renders videos without thumbnails correctly", () => {
      const media = [
        {
          url: "https://example.com/video1.mp4",
          type: "video",
        },
      ];

      render(<MediaGalleryModal media={media} />);

      const video = document.querySelector("video");
      expect(video).toBeInTheDocument();
      expect(video).toHaveAttribute("src", "https://example.com/video1.mp4");
      expect(video).toHaveAttribute("poster", "https://example.com/video1.mp4");
    });

    it("renders audio files correctly", () => {
      const media = [
        {
          url: "https://example.com/audio1.mp3",
          type: "audio",
          displayName: "My Recording",
        },
        {
          url: "https://example.com/audio2.mp3",
          type: "audio",
        },
      ];

      render(<MediaGalleryModal media={media} />);

      expect(screen.getByText("My Recording")).toBeInTheDocument();
      expect(screen.getByText("Audio Recording")).toBeInTheDocument(); // default title
    });

    it("renders mixed media types correctly", () => {
      const media = [
        {
          url: "https://example.com/photo.jpg",
          type: "image",
        },
        {
          url: "https://example.com/audio.mp3",
          type: "audio",
          displayName: "My Audio",
        },
        {
          url: "https://example.com/video.mp4",
          type: "video",
          thumbnailUrl: "https://example.com/thumb.jpg",
        },
      ];

      render(<MediaGalleryModal media={media} />);

      expect(screen.getByAltText("Media")).toBeInTheDocument();
      expect(screen.getByText("My Audio")).toBeInTheDocument();
      expect(screen.getByAltText("Video thumbnail")).toBeInTheDocument();
    });

    it("applies custom className to gallery grid", () => {
      const media = [
        {
          url: "https://example.com/photo.jpg",
          type: "image",
        },
      ];

      render(<MediaGalleryModal media={media} className="custom-class" />);

      const grid = screen.getByAltText("Media").closest(".grid");
      expect(grid).toHaveClass("custom-class");
    });
  });

  describe("Modal Functionality", () => {
    it("opens modal when photo is clicked", () => {
      const media = [
        {
          url: "https://example.com/photo.jpg",
          type: "image",
        },
      ];

      render(<MediaGalleryModal media={media} />);

      const photo = screen.getByAltText("Media");
      fireEvent.click(photo);

      // Modal should be visible
      expect(screen.getByAltText("Full size")).toBeInTheDocument();
      expect(screen.getByTestId("x-icon")).toBeInTheDocument();
    });

    it("opens modal when video is clicked", () => {
      const media = [
        {
          url: "https://example.com/video.mp4",
          type: "video",
          thumbnailUrl: "https://example.com/thumb.jpg",
        },
      ];

      render(<MediaGalleryModal media={media} />);

      const videoThumbnail = screen.getByAltText("Video thumbnail");
      fireEvent.click(videoThumbnail);

      // Modal should be visible with video
      const video = document.querySelector("video");
      expect(video).toBeInTheDocument();
      expect(video).toHaveAttribute("src", "https://example.com/video.mp4");
      expect(video).toHaveAttribute("controls");
      expect(video).toHaveAttribute("autoPlay");
    });

    it("closes modal when close button is clicked", () => {
      const media = [
        {
          url: "https://example.com/photo.jpg",
          type: "image",
        },
      ];

      render(<MediaGalleryModal media={media} />);

      // Open modal
      const photo = screen.getByAltText("Media");
      fireEvent.click(photo);
      expect(screen.getByAltText("Full size")).toBeInTheDocument();

      // Close modal
      const closeButton = screen.getByTestId("x-icon").parentElement;
      fireEvent.click(closeButton!);

      // Modal should be closed
      expect(screen.queryByAltText("Full size")).not.toBeInTheDocument();
    });

    it("closes modal when clicking outside the media", () => {
      const media = [
        {
          url: "https://example.com/photo.jpg",
          type: "image",
        },
      ];

      render(<MediaGalleryModal media={media} />);

      // Open modal
      const photo = screen.getByAltText("Media");
      fireEvent.click(photo);
      expect(screen.getByAltText("Full size")).toBeInTheDocument();

      // Click outside (on the modal backdrop)
      const modalBackdrop = screen.getByAltText("Full size").closest(".fixed");
      fireEvent.click(modalBackdrop!);

      // Modal should be closed
      expect(screen.queryByAltText("Full size")).not.toBeInTheDocument();
    });

    it("does not close modal when clicking on the media itself", () => {
      const media = [
        {
          url: "https://example.com/photo.jpg",
          type: "image",
        },
      ];

      render(<MediaGalleryModal media={media} />);

      // Open modal
      const photo = screen.getByAltText("Media");
      fireEvent.click(photo);
      expect(screen.getByAltText("Full size")).toBeInTheDocument();

      // Click on the media itself
      const fullSizeImage = screen.getByAltText("Full size");
      fireEvent.click(fullSizeImage);

      // Modal should still be open
      expect(screen.getByAltText("Full size")).toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it("shows navigation buttons when multiple images/videos are present", () => {
      const media = [
        {
          url: "https://example.com/photo1.jpg",
          type: "image",
        },
        {
          url: "https://example.com/photo2.jpg",
          type: "image",
        },
      ];

      render(<MediaGalleryModal media={media} />);

      // Open modal
      const photos = screen.getAllByAltText("Media");
      fireEvent.click(photos[0]);

      expect(screen.getByTestId("chevron-left-icon")).toBeInTheDocument();
      expect(screen.getByTestId("chevron-right-icon")).toBeInTheDocument();
    });

    it("does not show navigation buttons for single media item", () => {
      const media = [
        {
          url: "https://example.com/photo.jpg",
          type: "image",
        },
      ];

      render(<MediaGalleryModal media={media} />);

      // Open modal
      const photo = screen.getByAltText("Media");
      fireEvent.click(photo);

      expect(screen.queryByTestId("chevron-left-icon")).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("chevron-right-icon")
      ).not.toBeInTheDocument();
    });

    it("navigates to next image when next button is clicked", () => {
      const media = [
        {
          url: "https://example.com/photo1.jpg",
          type: "image",
        },
        {
          url: "https://example.com/photo2.jpg",
          type: "image",
        },
      ];

      render(<MediaGalleryModal media={media} />);

      // Open modal on first image
      const firstPhoto = screen.getAllByAltText("Media")[0];
      fireEvent.click(firstPhoto);

      // Click next button
      const nextButton = screen.getByTestId("chevron-right-icon").parentElement;
      fireEvent.click(nextButton!);

      // Should show second image
      expect(screen.getByAltText("Full size")).toHaveAttribute(
        "src",
        "https://example.com/photo2.jpg"
      );
    });

    it("navigates to previous image when prev button is clicked", () => {
      const media = [
        {
          url: "https://example.com/photo1.jpg",
          type: "image",
        },
        {
          url: "https://example.com/photo2.jpg",
          type: "image",
        },
      ];

      render(<MediaGalleryModal media={media} />);

      // Open modal on second image
      const secondPhoto = screen.getAllByAltText("Media")[1];
      fireEvent.click(secondPhoto);

      // Click prev button
      const prevButton = screen.getByTestId("chevron-left-icon").parentElement;
      fireEvent.click(prevButton!);

      // Should show first image
      expect(screen.getByAltText("Full size")).toHaveAttribute(
        "src",
        "https://example.com/photo1.jpg"
      );
    });

    it("wraps around to first image when navigating past last image", () => {
      const media = [
        {
          url: "https://example.com/photo1.jpg",
          type: "image",
        },
        {
          url: "https://example.com/photo2.jpg",
          type: "image",
        },
      ];

      render(<MediaGalleryModal media={media} />);

      // Open modal on second image
      const secondPhoto = screen.getAllByAltText("Media")[1];
      fireEvent.click(secondPhoto);

      // Click next button to wrap around
      const nextButton = screen.getByTestId("chevron-right-icon").parentElement;
      fireEvent.click(nextButton!);

      // Should show first image
      expect(screen.getByAltText("Full size")).toHaveAttribute(
        "src",
        "https://example.com/photo1.jpg"
      );
    });

    it("wraps around to last image when navigating before first image", () => {
      const media = [
        {
          url: "https://example.com/photo1.jpg",
          type: "image",
        },
        {
          url: "https://example.com/photo2.jpg",
          type: "image",
        },
      ];

      render(<MediaGalleryModal media={media} />);

      // Open modal on first image
      const firstPhoto = screen.getAllByAltText("Media")[0];
      fireEvent.click(firstPhoto);

      // Click prev button to wrap around
      const prevButton = screen.getByTestId("chevron-left-icon").parentElement;
      fireEvent.click(prevButton!);

      // Should show second image
      expect(screen.getByAltText("Full size")).toHaveAttribute(
        "src",
        "https://example.com/photo2.jpg"
      );
    });
  });

  describe("Media Counter", () => {
    it("shows correct counter for single media item", () => {
      const media = [
        {
          url: "https://example.com/photo.jpg",
          type: "image",
        },
      ];

      render(<MediaGalleryModal media={media} />);

      // Open modal
      const photo = screen.getByAltText("Media");
      fireEvent.click(photo);

      expect(screen.getByText("1 / 1")).toBeInTheDocument();
    });

    it("shows correct counter for multiple media items", () => {
      const media = [
        {
          url: "https://example.com/photo1.jpg",
          type: "image",
        },
        {
          url: "https://example.com/photo2.jpg",
          type: "image",
        },
        {
          url: "https://example.com/photo3.jpg",
          type: "image",
        },
      ];

      render(<MediaGalleryModal media={media} />);

      // Open modal on second image
      const secondPhoto = screen.getAllByAltText("Media")[1];
      fireEvent.click(secondPhoto);

      expect(screen.getByText("2 / 3")).toBeInTheDocument();
    });

    it("updates counter when navigating", () => {
      const media = [
        {
          url: "https://example.com/photo1.jpg",
          type: "image",
        },
        {
          url: "https://example.com/photo2.jpg",
          type: "image",
        },
      ];

      render(<MediaGalleryModal media={media} />);

      // Open modal on first image
      const firstPhoto = screen.getAllByAltText("Media")[0];
      fireEvent.click(firstPhoto);

      expect(screen.getByText("1 / 2")).toBeInTheDocument();

      // Navigate to next image
      const nextButton = screen.getByTestId("chevron-right-icon").parentElement;
      fireEvent.click(nextButton!);

      expect(screen.getByText("2 / 2")).toBeInTheDocument();
    });
  });

  describe("Keyboard Navigation", () => {
    it("closes modal when Escape key is pressed", () => {
      const media = [
        {
          url: "https://example.com/photo.jpg",
          type: "image",
        },
      ];

      render(<MediaGalleryModal media={media} />);

      // Open modal
      const photo = screen.getByAltText("Media");
      fireEvent.click(photo);
      expect(screen.getByAltText("Full size")).toBeInTheDocument();

      // Press Escape key
      fireEvent.keyDown(document, { key: "Escape" });

      // Modal should be closed
      expect(screen.queryByAltText("Full size")).not.toBeInTheDocument();
    });

    it("navigates to next image when ArrowRight key is pressed", () => {
      const media = [
        {
          url: "https://example.com/photo1.jpg",
          type: "image",
        },
        {
          url: "https://example.com/photo2.jpg",
          type: "image",
        },
      ];

      render(<MediaGalleryModal media={media} />);

      // Open modal on first image
      const firstPhoto = screen.getAllByAltText("Media")[0];
      fireEvent.click(firstPhoto);

      // Press ArrowRight key
      fireEvent.keyDown(document, { key: "ArrowRight" });

      // Should show second image
      expect(screen.getByAltText("Full size")).toHaveAttribute(
        "src",
        "https://example.com/photo2.jpg"
      );
    });

    it("navigates to previous image when ArrowLeft key is pressed", () => {
      const media = [
        {
          url: "https://example.com/photo1.jpg",
          type: "image",
        },
        {
          url: "https://example.com/photo2.jpg",
          type: "image",
        },
      ];

      render(<MediaGalleryModal media={media} />);

      // Open modal on second image
      const secondPhoto = screen.getAllByAltText("Media")[1];
      fireEvent.click(secondPhoto);

      // Press ArrowLeft key
      fireEvent.keyDown(document, { key: "ArrowLeft" });

      // Should show first image
      expect(screen.getByAltText("Full size")).toHaveAttribute(
        "src",
        "https://example.com/photo1.jpg"
      );
    });

    it("does not respond to keyboard events when modal is closed", () => {
      const media = [
        {
          url: "https://example.com/photo1.jpg",
          type: "image",
        },
        {
          url: "https://example.com/photo2.jpg",
          type: "image",
        },
      ];

      render(<MediaGalleryModal media={media} />);

      // Press ArrowRight key without opening modal
      fireEvent.keyDown(document, { key: "ArrowRight" });

      // Should not show any modal
      expect(screen.queryByAltText("Full size")).not.toBeInTheDocument();
    });
  });

  describe("Video Handling", () => {
    it("shows video fallback when video fails to load", () => {
      const media = [
        {
          url: "https://example.com/video.mp4",
          type: "video",
        },
      ];

      render(<MediaGalleryModal media={media} />);

      const video = document.querySelector("video");

      // Simulate video load error
      fireEvent.error(video!);

      // The fallback should be visible
      const fallback = video?.parentElement?.querySelector(".video-fallback");
      expect(fallback).toBeInTheDocument();
    });

    it("handles video playback errors gracefully", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const media = [
        {
          url: "https://example.com/video.mp4",
          type: "video",
          thumbnailUrl: "https://example.com/thumb.jpg",
        },
      ];

      render(<MediaGalleryModal media={media} />);

      // Open modal
      const videoThumbnail = screen.getByAltText("Video thumbnail");
      fireEvent.click(videoThumbnail);

      const video = document.querySelector("video");

      // Simulate video playback error
      if (video) {
        fireEvent.error(video);
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        "Video playback error:",
        expect.any(Object)
      );

      consoleSpy.mockRestore();
    });
  });

  describe("File Type Icons", () => {
    it("shows correct icon for image type", () => {
      const media = [
        {
          url: "https://example.com/photo.jpg",
          type: "image",
        },
      ];

      render(<MediaGalleryModal media={media} />);

      expect(screen.getByTestId("image-icon")).toBeInTheDocument();
    });

    it("shows correct icon for video type", () => {
      const media = [
        {
          url: "https://example.com/video.mp4",
          type: "video",
          thumbnailUrl: "https://example.com/thumb.jpg",
        },
      ];

      render(<MediaGalleryModal media={media} />);

      expect(screen.getAllByTestId("video-icon")).toHaveLength(2); // fallback + file type icon
    });

    it("does not render unknown media types", () => {
      const media = [
        {
          url: "https://example.com/file.xyz",
          type: "unknown",
        },
      ];

      render(<MediaGalleryModal media={media} />);

      // Unknown types should not be rendered in the gallery
      expect(screen.queryByAltText("Media")).not.toBeInTheDocument();
      expect(screen.queryByText("Audio Recording")).not.toBeInTheDocument();
    });
  });

  describe("Mixed Media Navigation", () => {
    it("correctly handles mixed image and video navigation", () => {
      const media = [
        {
          url: "https://example.com/photo.jpg",
          type: "image",
        },
        {
          url: "https://example.com/video.mp4",
          type: "video",
          thumbnailUrl: "https://example.com/thumb.jpg",
        },
      ];

      render(<MediaGalleryModal media={media} />);

      // Open modal on first item (photo)
      const photo = screen.getByAltText("Media");
      fireEvent.click(photo);

      expect(screen.getByAltText("Full size")).toHaveAttribute(
        "src",
        "https://example.com/photo.jpg"
      );
      expect(screen.getByText("1 / 2")).toBeInTheDocument();

      // Navigate to video
      const nextButton = screen.getByTestId("chevron-right-icon").parentElement;
      fireEvent.click(nextButton!);

      const video = document.querySelector("video");
      expect(video).toHaveAttribute("src", "https://example.com/video.mp4");
      expect(screen.getByText("2 / 2")).toBeInTheDocument();
    });

    it("excludes audio files from navigation", () => {
      const media = [
        {
          url: "https://example.com/audio.mp3",
          type: "audio",
          displayName: "My Audio",
        },
        {
          url: "https://example.com/photo.jpg",
          type: "image",
        },
        {
          url: "https://example.com/video.mp4",
          type: "video",
          thumbnailUrl: "https://example.com/thumb.jpg",
        },
      ];

      render(<MediaGalleryModal media={media} />);

      // Open modal on photo
      const photo = screen.getByAltText("Media");
      fireEvent.click(photo);

      // Should only count image and video (2 total)
      expect(screen.getByText("1 / 2")).toBeInTheDocument();

      // Navigate to video
      const nextButton = screen.getByTestId("chevron-right-icon").parentElement;
      fireEvent.click(nextButton!);

      expect(screen.getByText("2 / 2")).toBeInTheDocument();
    });
  });
});
