import React from "react";
import { X, Image, Music, Video, File } from "lucide-react";
import { Button } from "./ui/button";
import { AudioPlayer } from "./AudioPlayer";

interface MediaItem {
  id?: string;
  url: string;
  type: "image" | "audio" | "video";
  fileName?: string;
  displayName?: string;
  thumbnailUrl?: string;
}

interface MediaGalleryProps {
  media: MediaItem[];
  onRemove?: (index: number) => void;
  className?: string;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  media,
  onRemove,
  className = "",
}) => {
  // Separate media types
  const photos = media.filter((item) => item.type === "image");
  const audioFiles = media.filter((item) => item.type === "audio");
  const videos = media.filter((item) => item.type === "video");

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="w-4 h-4" />;
      case "audio":
        return <Music className="w-4 h-4" />;
      case "video":
        return <Video className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  if (media.length === 0) {
    return (
      <div className={`text-muted-foreground text-sm ${className}`}>
        No media added yet.
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Audio Files */}
      {audioFiles.length > 0 && (
        <div className="space-y-3">
          {audioFiles.map((item, index) => {
            const originalIndex = media.findIndex((m) => m === item);
            const audioId = item.id || String(originalIndex);
            return (
              <div key={item.id || index} className="relative">
                <AudioPlayer
                  audioId={audioId}
                  url={item.url}
                  size="md"
                  title={item.displayName || "Audio Recording"}
                />
                {/* Remove Button */}
                {onRemove && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(originalIndex)}
                    className="absolute top-0 right-0 h-6 w-6 p-0 bg-black/50 text-white hover:bg-black/70"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Photos and Videos Gallery */}
      {(photos.length > 0 || videos.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Photos */}
          {photos.map((item, index) => {
            const originalIndex = media.findIndex((m) => m === item);
            return (
              <div
                key={item.id || index}
                className="relative rounded-lg overflow-hidden bg-muted border"
              >
                <img
                  src={item.url}
                  alt={item.fileName || "Uploaded image"}
                  className="w-full h-32 md:h-40 object-cover"
                />
                {/* File type icon */}
                <div className="absolute top-2 left-2 bg-black/50 text-white p-1 rounded">
                  {getFileTypeIcon(item.type)}
                </div>
                {onRemove && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(originalIndex)}
                    className="absolute top-2 right-2 h-6 w-6 p-0 bg-black/50 text-white hover:bg-black/70"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            );
          })}

          {/* Videos */}
          {videos.map((item, index) => {
            const originalIndex = media.findIndex((m) => m === item);
            return (
              <div
                key={item.id || index}
                className="relative rounded-lg overflow-hidden bg-muted border"
              >
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.fileName || "Video thumbnail"}
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
                {/* File type icon */}
                <div className="absolute top-2 left-2 bg-black/50 text-white p-1 rounded">
                  {getFileTypeIcon(item.type)}
                </div>
                {onRemove && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(originalIndex)}
                    className="absolute top-2 right-2 h-6 w-6 p-0 bg-black/50 text-white hover:bg-black/70"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
