import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MediaThumbnail } from "./MediaThumbnail";

describe("MediaThumbnail", () => {
  describe("Rendering", () => {
    it("returns null when media is empty", () => {
      const { container } = render(<MediaThumbnail media={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it("returns null when media is null", () => {
      const { container } = render(<MediaThumbnail media={null as any} />);
      expect(container.firstChild).toBeNull();
    });

    it("renders with custom className", () => {
      const media = [
        {
          url: "https://example.com/image.jpg",
          type: "image",
        },
      ];

      render(<MediaThumbnail media={media} className="custom-class" />);

      const container = screen
        .getByAltText("Media")
        .closest("div")?.parentElement;
      expect(container).toHaveClass("custom-class");
    });
  });

  describe("Image Media", () => {
    it("renders image correctly", () => {
      const media = [
        {
          url: "https://example.com/image.jpg",
          type: "image",
        },
      ];

      render(<MediaThumbnail media={media} />);

      const image = screen.getByAltText("Media");
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", "https://example.com/image.jpg");
      expect(image).toHaveClass("w-full", "h-full", "object-cover");
    });

    it("shows image icon overlay", () => {
      const media = [
        {
          url: "https://example.com/image.jpg",
          type: "image",
        },
      ];

      render(<MediaThumbnail media={media} />);

      const icon = document.querySelector(".lucide-image");
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Audio Media", () => {
    it("renders audio icon correctly", () => {
      const media = [
        {
          url: "https://example.com/audio.webm",
          type: "audio",
        },
      ];

      render(<MediaThumbnail media={media} />);

      const audioIcon = document.querySelector(".lucide-music");
      expect(audioIcon).toBeInTheDocument();
      expect(audioIcon).toHaveClass("w-6", "h-6", "text-muted-foreground");
    });

    it("shows audio icon overlay", () => {
      const media = [
        {
          url: "https://example.com/audio.webm",
          type: "audio",
        },
      ];

      render(<MediaThumbnail media={media} />);

      const overlayIcon = document.querySelectorAll(".lucide-music")[1]; // Second music icon (overlay)
      expect(overlayIcon).toBeInTheDocument();
      expect(overlayIcon).toHaveClass("w-3", "h-3");
    });
  });

  describe("Video Media", () => {
    it("renders video with thumbnail", () => {
      const media = [
        {
          url: "https://example.com/video.mp4",
          type: "video",
          thumbnailUrl: "https://example.com/thumb.jpg",
          displayName: "My Video",
        },
      ];

      render(<MediaThumbnail media={media} />);

      const thumbnail = screen.getByAltText("My Video");
      expect(thumbnail).toBeInTheDocument();
      expect(thumbnail).toHaveAttribute("src", "https://example.com/thumb.jpg");
      expect(thumbnail).toHaveClass("w-full", "h-full", "object-cover");
    });

    it("renders video icon when no thumbnail", () => {
      const media = [
        {
          url: "https://example.com/video.mp4",
          type: "video",
        },
      ];

      render(<MediaThumbnail media={media} />);

      const videoIcon = document.querySelector(".lucide-video");
      expect(videoIcon).toBeInTheDocument();
      expect(videoIcon).toHaveClass("w-6", "h-6", "text-muted-foreground");
    });

    it("uses default alt text when no displayName", () => {
      const media = [
        {
          url: "https://example.com/video.mp4",
          type: "video",
          thumbnailUrl: "https://example.com/thumb.jpg",
        },
      ];

      render(<MediaThumbnail media={media} />);

      const thumbnail = screen.getByAltText("Video thumbnail");
      expect(thumbnail).toBeInTheDocument();
    });

    it("shows video icon overlay", () => {
      const media = [
        {
          url: "https://example.com/video.mp4",
          type: "video",
          thumbnailUrl: "https://example.com/thumb.jpg",
        },
      ];

      render(<MediaThumbnail media={media} />);

      const overlayIcon = document.querySelector(".lucide-video"); // Only one video icon (overlay)
      expect(overlayIcon).toBeInTheDocument();
      expect(overlayIcon).toHaveClass("w-3", "h-3");
    });
  });

  describe("Multiple Media Items", () => {
    it("renders multiple media items", () => {
      const media = [
        {
          url: "https://example.com/image1.jpg",
          type: "image",
        },
        {
          url: "https://example.com/audio.webm",
          type: "audio",
        },
        {
          url: "https://example.com/video.mp4",
          type: "video",
          thumbnailUrl: "https://example.com/thumb.jpg",
        },
      ];

      render(<MediaThumbnail media={media} />);

      expect(screen.getByAltText("Media")).toBeInTheDocument();
      expect(document.querySelector(".lucide-music")).toBeInTheDocument();
      expect(screen.getByAltText("Video thumbnail")).toBeInTheDocument();
    });

    it("limits display to first 3 items", () => {
      const media = [
        {
          url: "https://example.com/image1.jpg",
          type: "image",
        },
        {
          url: "https://example.com/image2.jpg",
          type: "image",
        },
        {
          url: "https://example.com/image3.jpg",
          type: "image",
        },
        {
          url: "https://example.com/image4.jpg",
          type: "image",
        },
        {
          url: "https://example.com/image5.jpg",
          type: "image",
        },
      ];

      render(<MediaThumbnail media={media} />);

      const images = screen.getAllByAltText("Media");
      expect(images).toHaveLength(3);
    });

    it("shows 'more media' indicator when more than 3 items", () => {
      const media = [
        {
          url: "https://example.com/image1.jpg",
          type: "image",
        },
        {
          url: "https://example.com/image2.jpg",
          type: "image",
        },
        {
          url: "https://example.com/image3.jpg",
          type: "image",
        },
        {
          url: "https://example.com/image4.jpg",
          type: "image",
        },
      ];

      render(<MediaThumbnail media={media} />);

      expect(screen.getByText("+1")).toBeInTheDocument();
    });

    it("shows correct count in 'more media' indicator", () => {
      const media = [
        {
          url: "https://example.com/image1.jpg",
          type: "image",
        },
        {
          url: "https://example.com/image2.jpg",
          type: "image",
        },
        {
          url: "https://example.com/image3.jpg",
          type: "image",
        },
        {
          url: "https://example.com/image4.jpg",
          type: "image",
        },
        {
          url: "https://example.com/image5.jpg",
          type: "image",
        },
        {
          url: "https://example.com/image6.jpg",
          type: "image",
        },
      ];

      render(<MediaThumbnail media={media} />);

      expect(screen.getByText("+3")).toBeInTheDocument();
    });

    it("does not show 'more media' indicator when 3 or fewer items", () => {
      const media = [
        {
          url: "https://example.com/image1.jpg",
          type: "image",
        },
        {
          url: "https://example.com/image2.jpg",
          type: "image",
        },
        {
          url: "https://example.com/image3.jpg",
          type: "image",
        },
      ];

      render(<MediaThumbnail media={media} />);

      expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
    });
  });

  describe("Unknown Media Types", () => {
    it("defaults to image icon for unknown types", () => {
      const media = [
        {
          url: "https://example.com/unknown.file",
          type: "unknown",
        },
      ];

      render(<MediaThumbnail media={media} />);

      const icon = document.querySelector(".lucide-image");
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Layout and Styling", () => {
    it("applies correct container classes", () => {
      const media = [
        {
          url: "https://example.com/image.jpg",
          type: "image",
        },
      ];

      render(<MediaThumbnail media={media} />);

      const container = screen
        .getByAltText("Media")
        .closest("div")?.parentElement;
      expect(container).toHaveClass("flex", "gap-2");
    });

    it("applies correct thumbnail container classes", () => {
      const media = [
        {
          url: "https://example.com/image.jpg",
          type: "image",
        },
      ];

      render(<MediaThumbnail media={media} />);

      const thumbnailContainer = screen.getByAltText("Media").closest("div");
      expect(thumbnailContainer).toHaveClass(
        "relative",
        "w-16",
        "h-16",
        "rounded-md",
        "overflow-hidden",
        "bg-muted",
        "flex-shrink-0"
      );
    });

    it("applies correct overlay classes", () => {
      const media = [
        {
          url: "https://example.com/image.jpg",
          type: "image",
        },
      ];

      render(<MediaThumbnail media={media} />);

      const overlay = document.querySelector(".lucide-image")?.closest("div");
      expect(overlay).toHaveClass(
        "bg-black/50",
        "text-white",
        "p-0.5",
        "rounded"
      );
    });
  });

  describe("Mixed Media Types", () => {
    it("handles mixed media types correctly", () => {
      const media = [
        {
          url: "https://example.com/image.jpg",
          type: "image",
        },
        {
          url: "https://example.com/audio.webm",
          type: "audio",
        },
        {
          url: "https://example.com/video.mp4",
          type: "video",
          thumbnailUrl: "https://example.com/thumb.jpg",
        },
        {
          url: "https://example.com/unknown.file",
          type: "unknown",
        },
      ];

      render(<MediaThumbnail media={media} />);

      // Should show first 3 items
      expect(screen.getByAltText("Media")).toBeInTheDocument();
      expect(document.querySelector(".lucide-music")).toBeInTheDocument();
      expect(screen.getByAltText("Video thumbnail")).toBeInTheDocument();

      // Should show +1 indicator
      expect(screen.getByText("+1")).toBeInTheDocument();
    });
  });
});
