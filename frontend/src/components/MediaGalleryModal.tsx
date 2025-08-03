import React, { useState, useEffect } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Music,
  Image,
  Video,
} from "lucide-react";
import { Button } from "./ui/button";

import { AudioPlayer } from "./AudioPlayer";

interface MediaItem {
  url: string;
  type: string;
  displayName?: string;
  thumbnailUrl?: string;
}

interface MediaGalleryModalProps {
  media: MediaItem[];
  className?: string;
}

export const MediaGalleryModal: React.FC<MediaGalleryModalProps> = ({
  media,
  className = "",
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (selectedImageIndex === null) return;

      switch (event.key) {
        case "Escape":
          event.preventDefault();
          closeModal();
          break;
        case "ArrowLeft":
          event.preventDefault();
          prevImage();
          break;
        case "ArrowRight":
          event.preventDefault();
          nextImage();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex]);

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="w-4 h-4" />;
      case "audio":
        return <Music className="w-4 h-4" />;
      case "video":
        return <Video className="w-4 h-4" />;
      default:
        return <Image className="w-4 h-4" />;
    }
  };

  const closeModal = () => {
    setSelectedImageIndex(null);
  };

  const nextImage = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex(
        (selectedImageIndex + 1) %
          media.filter((m) => m.type === "image" || m.type === "video").length
      );
    }
  };

  const prevImage = () => {
    if (selectedImageIndex !== null) {
      const imageAndVideoMedia = media.filter(
        (m) => m.type === "image" || m.type === "video"
      );
      setSelectedImageIndex(
        selectedImageIndex === 0
          ? imageAndVideoMedia.length - 1
          : selectedImageIndex - 1
      );
    }
  };

  const imageAndVideoMedia = media.filter(
    (m) => m.type === "image" || m.type === "video"
  );
  const selectedMedia =
    selectedImageIndex !== null ? imageAndVideoMedia[selectedImageIndex] : null;

  // Separate media types for display
  const photos = media.filter((item) => item.type === "image");
  const audioFiles = media.filter((item) => item.type === "audio");
  const videos = media.filter((item) => item.type === "video");

  if (!media || media.length === 0) {
    return null;
  }

  return (
    <>
      {/* Audio Files */}
      {audioFiles.length > 0 && (
        <div className="space-y-3 mb-4">
          {audioFiles.map((item, index) => (
            <AudioPlayer
              key={`modal-audio-${index}`}
              audioId={`modal-audio-${Date.now()}-${index}`}
              url={item.url}
              size="md"
              title={item.displayName || "Audio Recording"}
            />
          ))}
        </div>
      )}

      {/* Photos and Videos Gallery */}
      {(photos.length > 0 || videos.length > 0) && (
        <div
          className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 ${className}`}
        >
          {/* Photos */}
          {photos.map((item, index) => (
            <div
              key={index}
              className="relative rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => handleImageClick(index)}
            >
              <img
                src={item.url}
                alt="Media"
                className="w-full h-32 md:h-40 object-cover"
              />
              <div className="absolute top-2 left-2">
                <div className="bg-black/50 text-white p-1 rounded">
                  {getFileTypeIcon(item.type)}
                </div>
              </div>
            </div>
          ))}

          {/* Videos */}
          {videos.map((item, index) => {
            const videoIndex = photos.length + index;
            return (
              <div
                key={index}
                className="relative rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(videoIndex)}
              >
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.displayName || "Video thumbnail"}
                    className="w-full h-32 md:h-40 object-cover"
                  />
                ) : (
                  <video
                    src={item.url}
                    className="w-full h-32 md:h-40 object-cover"
                    muted
                    preload="metadata"
                    poster={item.url}
                    onError={(e) => {
                      // Fallback to video icon if video fails to load
                      const target = e.target as HTMLVideoElement;
                      target.style.display = "none";
                      const fallback = target.parentElement?.querySelector(
                        ".video-fallback"
                      ) as HTMLElement;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                )}
                {/* Fallback video icon */}
                <div className="video-fallback hidden absolute inset-0 bg-muted flex items-center justify-center">
                  <Video className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="absolute top-2 left-2">
                  <div className="bg-black/50 text-white p-1 rounded">
                    {getFileTypeIcon(item.type)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full-size Media Modal */}
      {selectedImageIndex !== null && selectedMedia && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {selectedMedia.type === "image" ? (
              <img
                src={selectedMedia.url}
                alt="Full size"
                className="max-w-full max-h-full object-contain"
                style={{
                  maxWidth: "100vw",
                  maxHeight: "100vh",
                  width: "auto",
                  height: "auto",
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <video
                src={selectedMedia.url}
                className="max-w-full max-h-full object-contain"
                style={{
                  maxWidth: "100vw",
                  maxHeight: "100vh",
                  width: "auto",
                  height: "auto",
                }}
                controls
                autoPlay
                onClick={(e) => e.stopPropagation()}
                onError={(e) => {
                  console.error("Video playback error:", e);
                }}
              />
            )}

            {/* Close button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                closeModal();
              }}
              className="absolute top-4 right-4 h-8 w-8 p-0 bg-black/50 text-white hover:bg-black/70"
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Navigation buttons */}
            {imageAndVideoMedia.length > 1 && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 p-0 bg-black/50 text-white hover:bg-black/70"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 p-0 bg-black/50 text-white hover:bg-black/70"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Media counter */}
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedImageIndex + 1} / {imageAndVideoMedia.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
