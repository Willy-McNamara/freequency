import React, { useState, useEffect } from "react";
import { Music, Video, Image, File } from "lucide-react";

interface MediaFallbackProps {
  url: string;
  type: string;
  displayName?: string;
  thumbnailUrl?: string;
  className?: string;
  alt?: string;
  fallbackClassName?: string;
  iconSize?: "sm" | "md" | "lg";
  onError?: (error: Event) => void;
  onFallback?: (isFallback: boolean) => void;
}

export const MediaFallback: React.FC<MediaFallbackProps> = ({
  url,
  type,
  displayName,
  thumbnailUrl,
  className = "",
  alt,
  fallbackClassName = "",
  iconSize = "md",
  onError,
  onFallback,
}) => {
  const [hasError, setHasError] = useState(false);
  const [useThumbnail, setUseThumbnail] = useState(false);

  // Notify parent component when fallback state changes
  useEffect(() => {
    const isInFallback = hasError && !useThumbnail;
    onFallback?.(isInFallback);
  }, [hasError, useThumbnail, onFallback]);

  const getIconSize = () => {
    switch (iconSize) {
      case "sm":
        return "w-4 h-4";
      case "lg":
        return "w-8 h-8";
      default:
        return "w-6 h-6";
    }
  };

  const getMediaTypeIcon = (mediaType: string) => {
    switch (mediaType) {
      case "image":
        return <Image className={getIconSize()} data-testid="image-icon" />;
      case "audio":
        return <Music className={getIconSize()} data-testid="music-icon" />;
      case "video":
        return <Video className={getIconSize()} data-testid="video-icon" />;
      default:
        return <File className={getIconSize()} data-testid="file-icon" />;
    }
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    if (thumbnailUrl && !useThumbnail) {
      // Try thumbnail first
      setUseThumbnail(true);
      setHasError(false);
    } else {
      // Fallback to icon
      setHasError(true);
      onError?.(e.nativeEvent);
    }
  };

  const handleVideoError = (
    e: React.SyntheticEvent<HTMLVideoElement, Event>
  ) => {
    setHasError(true);
    onError?.(e.nativeEvent);
  };

  // If we have an error and no thumbnail to try, show icon
  if (hasError && !useThumbnail) {
    return (
      <div
        className={`flex items-center justify-center bg-muted/50 ${fallbackClassName}`}
        aria-label={`${type} media`}
      >
        <div className="text-muted-foreground">{getMediaTypeIcon(type)}</div>
      </div>
    );
  }

  // Render based on media type
  switch (type) {
    case "image":
      return (
        <img
          src={useThumbnail ? thumbnailUrl! : url}
          alt={alt || displayName || "Media"}
          className={className}
          onError={handleImageError}
        />
      );

    case "video":
      if (thumbnailUrl) {
        return (
          <img
            src={thumbnailUrl}
            alt={alt || displayName || "Video thumbnail"}
            className={className}
            onError={handleImageError}
          />
        );
      }
      return (
        <video
          src={url}
          className={className}
          muted
          preload="metadata"
          onError={handleVideoError}
          data-testid="video-element"
        />
      );

    case "audio":
      // Audio always shows icon - no URL dependency
      return (
        <div
          className={`flex items-center justify-center bg-muted/50 ${fallbackClassName}`}
          aria-label="Audio media"
        >
          <div className="text-muted-foreground">{getMediaTypeIcon(type)}</div>
        </div>
      );

    default:
      return (
        <div
          className={`flex items-center justify-center bg-muted/50 ${fallbackClassName}`}
          aria-label={`${type} media`}
        >
          <div className="text-muted-foreground">{getMediaTypeIcon(type)}</div>
        </div>
      );
  }
};
