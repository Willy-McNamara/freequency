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
          media.filter((m) => m.type === "image").length
      );
    }
  };

  const prevImage = () => {
    if (selectedImageIndex !== null) {
      const imageMedia = media.filter((m) => m.type === "image");
      setSelectedImageIndex(
        selectedImageIndex === 0
          ? imageMedia.length - 1
          : selectedImageIndex - 1
      );
    }
  };

  const imageMedia = media.filter((m) => m.type === "image");
  const selectedImage =
    selectedImageIndex !== null ? imageMedia[selectedImageIndex] : null;

  // Separate photos and audio for display
  const photos = media.filter((item) => item.type === "image");
  const audioFiles = media.filter((item) => item.type === "audio");

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
            />
          ))}
        </div>
      )}

      {/* Photos Gallery */}
      {photos.length > 0 && (
        <div
          className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 ${className}`}
        >
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
        </div>
      )}

      {/* Video Files */}
      {media
        .filter((item) => item.type === "video")
        .map((item, index) => (
          <div
            key={index}
            className="w-full h-32 md:h-40 flex items-center justify-center bg-muted rounded-lg"
          >
            <video
              src={item.url}
              className="w-full h-full object-cover rounded-lg"
              controls
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ))}

      {/* Full-size Image Modal */}
      {selectedImageIndex !== null && selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={selectedImage.url}
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
            {imageMedia.length > 1 && (
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

            {/* Image counter */}
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedImageIndex + 1} / {imageMedia.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
