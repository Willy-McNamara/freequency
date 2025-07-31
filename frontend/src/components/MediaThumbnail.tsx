import React from "react";
import { Music, Video } from "lucide-react";

interface MediaThumbnailProps {
  media: Array<{
    url: string;
    type: string;
  }>;
  className?: string;
}

export const MediaThumbnail: React.FC<MediaThumbnailProps> = ({
  media,
  className = "",
}) => {
  if (!media || media.length === 0) {
    return null;
  }

  // For feed posts, show only the first 3 media items
  const displayMedia = media.slice(0, 3);
  const hasMore = media.length > 3;

  return (
    <div className={`flex gap-2 ${className}`}>
      {displayMedia.map((item, index) => (
        <div
          key={index}
          className="relative w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0"
        >
          {item.type === "image" && (
            <img
              src={item.url}
              alt="Media"
              className="w-full h-full object-cover"
            />
          )}
          {item.type === "audio" && (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          {item.type === "video" && (
            <div className="w-full h-full flex items-center justify-center">
              <Video className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>
      ))}
      {hasMore && (
        <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
          +{media.length - 3}
        </div>
      )}
    </div>
  );
};
