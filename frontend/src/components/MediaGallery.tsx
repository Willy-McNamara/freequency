import React from "react";
import { X, Image, Music, Video, File } from "lucide-react";
import { Button } from "./ui/button";
import { AudioPlayer } from "./AudioPlayer";

interface MediaItem {
  id?: string;
  url: string;
  type: "image" | "audio" | "video";
  fileName?: string;
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
  // Separate photos and audio
  const photos = media.filter((item) => item.type === "image");
  const audioFiles = media.filter((item) => item.type === "audio");

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
      {/* Photos Gallery */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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

      {/* Audio Files */}
      {audioFiles.length > 0 && (
        <div className="space-y-3">
          {audioFiles.map((item, index) => {
            const originalIndex = media.findIndex((m) => m === item);
            const audioId = item.id || String(originalIndex);
            return (
              <div key={item.id || index} className="relative">
                <AudioPlayer audioId={audioId} url={item.url} size="md" />
                {/* Remove Button */}
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

      {/* Video Files (keeping existing design for now) */}
      {media
        .filter((item) => item.type === "video")
        .map((item, index) => {
          const originalIndex = media.findIndex((m) => m === item);
          return (
            <div
              key={item.id || index}
              className="relative border rounded-lg p-3 bg-card"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <video
                    src={item.url}
                    className="w-16 h-16 object-cover rounded-md"
                    controls
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">
                      {getFileTypeIcon(item.type)}
                    </span>
                  </div>
                  {item.fileName && (
                    <p className="text-sm font-medium truncate">
                      {item.fileName}
                    </p>
                  )}
                </div>
              </div>
              {onRemove && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(originalIndex)}
                  className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          );
        })}
    </div>
  );
};
