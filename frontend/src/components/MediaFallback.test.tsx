import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MediaFallback } from "./MediaFallback";

describe("MediaFallback", () => {
  it("renders image correctly", () => {
    render(
      <MediaFallback
        url="https://example.com/image.jpg"
        type="image"
        className="w-full h-full"
      />
    );

    const img = screen.getByAltText("Media");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/image.jpg");
  });

  it("renders video correctly when no thumbnail", () => {
    render(
      <MediaFallback
        url="https://example.com/video.mp4"
        type="video"
        className="w-full h-full"
      />
    );

    const video = screen.getByTestId("video-element");
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute("src", "https://example.com/video.mp4");
  });

  it("renders video thumbnail when available", () => {
    render(
      <MediaFallback
        url="https://example.com/video.mp4"
        type="video"
        thumbnailUrl="https://example.com/thumb.jpg"
        className="w-full h-full"
      />
    );

    const img = screen.getByAltText("Video thumbnail");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/thumb.jpg");
  });

  it("renders audio icon correctly", () => {
    render(
      <MediaFallback
        url="https://example.com/audio.mp3"
        type="audio"
        className="w-full h-full"
      />
    );

    expect(screen.getByTestId("music-icon")).toBeInTheDocument();
  });

  it("falls back to thumbnail for images", () => {
    render(
      <MediaFallback
        url="https://example.com/image.jpg"
        type="image"
        thumbnailUrl="https://example.com/thumb.jpg"
        className="w-full h-full"
      />
    );

    const img = screen.getByAltText("Media");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/image.jpg");

    // Simulate image load error
    fireEvent.error(img);

    // Should now show thumbnail
    const thumbnailImg = screen.getByAltText("Media") as HTMLImageElement;
    expect(thumbnailImg.src).toContain("thumb.jpg");
  });

  it("falls back to icon when no thumbnail available", () => {
    render(
      <MediaFallback
        url="https://example.com/image.jpg"
        type="image"
        className="w-full h-full"
      />
    );

    const img = screen.getByAltText("Media");
    expect(img).toBeInTheDocument();

    // Simulate image load error
    fireEvent.error(img);

    // Should show fallback icon
    expect(screen.getByTestId("image-icon")).toBeInTheDocument();
  });

  it("shows image fallback icon when image fails", () => {
    render(
      <MediaFallback
        url="https://example.com/image.jpg"
        type="image"
        className="w-full h-full"
      />
    );

    // Simulate error to show fallback
    const img = screen.getByAltText("Media");
    fireEvent.error(img);

    expect(screen.getByTestId("image-icon")).toBeInTheDocument();
  });

  it("shows video fallback icon when video fails", () => {
    render(
      <MediaFallback
        url="https://example.com/video.mp4"
        type="video"
        className="w-full h-full"
      />
    );

    const video = screen.getByTestId("video-element");
    fireEvent.error(video);

    expect(screen.getByTestId("video-icon")).toBeInTheDocument();
  });

  it("shows audio icon for audio type", () => {
    render(
      <MediaFallback
        url="https://example.com/audio.mp3"
        type="audio"
        className="w-full h-full"
      />
    );

    expect(screen.getByTestId("music-icon")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <MediaFallback
        url="https://example.com/image.jpg"
        type="image"
        className="custom-class"
      />
    );

    const img = screen.getByAltText("Media");
    expect(img).toHaveClass("custom-class");
  });

  it("applies fallback className", () => {
    render(
      <MediaFallback
        url="https://example.com/image.jpg"
        type="image"
        fallbackClassName="fallback-class"
      />
    );

    const img = screen.getByAltText("Media");
    fireEvent.error(img);

    // fallbackClassName applies to the outer div, not the icon container
    const fallback = screen.getByLabelText("image media");
    expect(fallback).toHaveClass("fallback-class");
  });

  it("renders with small icon size", () => {
    render(
      <MediaFallback
        url="https://example.com/image.jpg"
        type="image"
        iconSize="sm"
      />
    );

    const img = screen.getByAltText("Media");
    fireEvent.error(img);

    const icon = screen.getByTestId("image-icon");
    expect(icon).toHaveClass("w-4", "h-4");
  });

  it("renders with medium icon size", () => {
    render(
      <MediaFallback
        url="https://example.com/image2.jpg"
        type="image"
        iconSize="md"
      />
    );

    const img = screen.getByAltText("Media");
    fireEvent.error(img);

    const icon = screen.getByTestId("image-icon");
    expect(icon).toHaveClass("w-6", "h-6");
  });

  it("renders with large icon size", () => {
    render(
      <MediaFallback
        url="https://example.com/image3.jpg"
        type="image"
        iconSize="lg"
      />
    );

    const img = screen.getByAltText("Media");
    fireEvent.error(img);

    const icon = screen.getByTestId("image-icon");
    expect(icon).toHaveClass("w-8", "h-8");
  });

  it("calls onFallback callback when fallback state changes", () => {
    const mockOnFallback = vi.fn();

    render(
      <MediaFallback
        url="https://example.com/image.jpg"
        type="image"
        onFallback={mockOnFallback}
      />
    );

    const img = screen.getByAltText("Media");

    // Initially should not be in fallback state
    expect(mockOnFallback).toHaveBeenCalledWith(false);

    // Simulate error to trigger fallback
    fireEvent.error(img);

    // Should now be in fallback state
    expect(mockOnFallback).toHaveBeenCalledWith(true);
  });
});
