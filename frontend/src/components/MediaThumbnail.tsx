import React from "react";
import { Music, Video, Image } from "lucide-react";
import { MediaFallback } from "./MediaFallback";

interface MediaThumbnailProps {
  media: Array<{
    url: string;
    type: string;
    displayName?: string;
    thumbnailUrl?: string;
  }>;
  className?: string;
}

// Separate component to handle individual media items with state
const MediaThumbnailItem: React.FC<{
  item: {
    url: string;
    type: string;
    displayName?: string;
    thumbnailUrl?: string;
  };
}> = ({ item }) => {
  const [isFallback, setIsFallback] = React.useState(false);

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="w-3 h-3" />;
      case "audio":
        return <Music className="w-3 h-3" />;
      case "video":
        return <Video className="w-3 h-3" />;
      default:
        return <Image className="w-3 h-3" />;
    }
  };

  return (
    <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
      <MediaFallback
        url={item.url}
        type={item.type}
        displayName={item.displayName}
        thumbnailUrl={item.thumbnailUrl}
        className="w-full h-full object-cover"
        fallbackClassName="w-full h-full"
        iconSize="md"
        onFallback={setIsFallback}
      />

      {/* File type icon overlay - hidden for fallback states */}
      {!isFallback && (
        <div className="absolute top-1 left-1 pointer-events-none">
          <div className="bg-black/50 text-white p-0.5 rounded">
            {getFileTypeIcon(item.type)}
          </div>
        </div>
      )}
    </div>
  );
};

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
        <MediaThumbnailItem key={index} item={item} />
      ))}
      {hasMore && (
        <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
          +{media.length - 3}
        </div>
      )}
    </div>
  );
};
