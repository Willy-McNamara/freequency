import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { MediaFallback } from "./MediaFallback";

describe("MediaFallback", () => {
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Image Handling", () => {
    it("renders image when URL is valid", () => {
      render(
        <MediaFallback
          url="https://example.com/image.jpg"
          type="image"
          displayName="Test Image"
          className="test-class"
        />
      );

      const img = screen.getByAltText("Test Image");
      expect(img).toBeInTheDocument();
      expect(img).toHaveClass("test-class");
    });

    it("falls back to thumbnail when image fails and thumbnail is available", () => {
      render(
        <MediaFallback
          url="https://invalid-url.com/image.jpg"
          type="image"
          thumbnailUrl="https://example.com/thumb.jpg"
          displayName="Test Image"
        />
      );

      const img = screen.getByAltText("Test Image");
      expect(img).toBeInTheDocument();

      // Simulate image load error to trigger thumbnail fallback
      fireEvent.error(img);

      // Should now show thumbnail
      const thumbnailImg = screen.getByAltText("Test Image");
      expect(thumbnailImg.src).toContain("thumb.jpg");
    });

    it("shows icon when image fails and no thumbnail available", () => {
      render(
        <MediaFallback
          url="https://invalid-url.com/image.jpg"
          type="image"
          displayName="Test Image"
        />
      );

      // Simulate image load error
      const img = screen.getByAltText("Test Image");
      fireEvent.error(img);

      // Should show fallback icon
      expect(screen.getByTestId("image-icon")).toBeInTheDocument();
    });
  });

  describe("Video Handling", () => {
    it("renders video when no thumbnail available", () => {
      render(
        <MediaFallback
          url="https://example.com/video.mp4"
          type="video"
          displayName="Test Video"
        />
      );

      const video = screen.getByTestId("video-element");
      expect(video).toBeInTheDocument();
    });

    it("renders thumbnail when available", () => {
      render(
        <MediaFallback
          url="https://example.com/video.mp4"
          type="video"
          thumbnailUrl="https://example.com/thumb.jpg"
          displayName="Test Video"
        />
      );

      const img = screen.getByAltText("Test Video");
      expect(img).toBeInTheDocument();
      expect(img.src).toContain("thumb.jpg");
    });

    it("shows icon when video fails", () => {
      render(
        <MediaFallback
          url="https://invalid-url.com/video.mp4"
          type="video"
          displayName="Test Video"
        />
      );

      // Simulate video load error
      const video = screen.getByTestId("video-element");
      fireEvent.error(video);

      // Should show fallback icon
      expect(screen.getByTestId("video-icon")).toBeInTheDocument();
    });
  });

  describe("Audio Handling", () => {
    it("always shows audio icon", () => {
      render(
        <MediaFallback
          url="https://example.com/audio.mp3"
          type="audio"
          displayName="Test Audio"
        />
      );

      expect(screen.getByTestId("music-icon")).toBeInTheDocument();
    });
  });

  describe("Icon Sizing", () => {
    it("applies small icon size", () => {
      render(
        <MediaFallback
          url="https://invalid-url.com/image.jpg"
          type="image"
          iconSize="sm"
        />
      );

      // Simulate error to show fallback
      const img = screen.getByAltText("Media");
      fireEvent.error(img);

      const icon = screen.getByTestId("image-icon");
      expect(icon).toHaveClass("w-4 h-4");
    });

    it("applies medium icon size", () => {
      render(
        <MediaFallback
          url="https://invalid-url.com/image2.jpg"
          type="image"
          iconSize="md"
        />
      );

      const img = screen.getByAltText("Media");
      fireEvent.error(img);
      expect(screen.getByTestId("image-icon")).toHaveClass("w-6 h-6");
    });

    it("applies large icon size", () => {
      render(
        <MediaFallback
          url="https://invalid-url.com/image3.jpg"
          type="image"
          iconSize="lg"
        />
      );

      const img = screen.getByAltText("Media");
      fireEvent.error(img);
      expect(screen.getByTestId("image-icon")).toHaveClass("w-8 h-8");
    });
  });

  describe("Error Handling", () => {
    it("calls onError callback when media fails", () => {
      render(
        <MediaFallback
          url="https://invalid-url.com/image.jpg"
          type="image"
          onError={mockOnError}
        />
      );

      const img = screen.getByAltText("Media");
      fireEvent.error(img);

      expect(mockOnError).toHaveBeenCalled();
    });

    it("calls onFallback callback when fallback state changes", () => {
      const mockOnFallback = vi.fn();

      render(
        <MediaFallback
          url="https://invalid-url.com/image.jpg"
          type="image"
          onFallback={mockOnFallback}
        />
      );

      // Initially should not be in fallback state
      expect(mockOnFallback).toHaveBeenCalledWith(false);

      // Simulate error to trigger fallback
      const img = screen.getByAltText("Media");
      fireEvent.error(img);

      // Should now be in fallback state
      expect(mockOnFallback).toHaveBeenCalledWith(true);
    });
  });
});
