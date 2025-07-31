import React, { useState } from "react";
import {
  X,
  Play,
  Pause,
  Volume2,
  Image,
  Music,
  Video,
  File,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./badge";

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
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<{
    [key: string]: HTMLAudioElement;
  }>({});

  const handleAudioPlay = (mediaId: string, url: string) => {
    // Stop any currently playing audio
    if (playingAudio && audioElements[playingAudio]) {
      audioElements[playingAudio].pause();
    }

    // Create new audio element if it doesn't exist
    if (!audioElements[mediaId]) {
      const audio = new Audio(url);
      audio.addEventListener("ended", () => setPlayingAudio(null));
      setAudioElements((prev) => ({ ...prev, [mediaId]: audio }));
    }

    const audio = audioElements[mediaId];
    if (playingAudio === mediaId) {
      audio.pause();
      setPlayingAudio(null);
    } else {
      audio.play();
      setPlayingAudio(mediaId);
    }
  };

  const getFileTypeLabel = (type: string) => {
    switch (type) {
      case "image":
        return "Photo";
      case "audio":
        return "Audio";
      case "video":
        return "Video";
      default:
        return "File";
    }
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
    <div className={`space-y-3 ${className}`}>
      {media.map((item, index) => (
        <div
          key={item.id || index}
          className="relative border rounded-lg p-3 bg-card"
        >
          {/* Remove button */}
          {onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemove(index)}
              className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-3 w-3" />
            </Button>
          )}

          {/* Media content */}
          <div className="flex items-start gap-3">
            {/* Media preview */}
            <div className="flex-shrink-0">
              {item.type === "image" && (
                <img
                  src={item.url}
                  alt={item.fileName || "Uploaded image"}
                  className="w-16 h-16 object-cover rounded-md"
                />
              )}
              {item.type === "audio" && (
                <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                  <Volume2 className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              {item.type === "video" && (
                <video
                  src={item.url}
                  className="w-16 h-16 object-cover rounded-md"
                  controls
                />
              )}
            </div>

            {/* Media info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{getFileTypeIcon(item.type)}</span>
              </div>

              {item.fileName && (
                <p className="text-sm font-medium truncate">{item.fileName}</p>
              )}

              {/* Audio controls */}
              {item.type === "audio" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleAudioPlay(item.id || String(index), item.url)
                  }
                  className="mt-2"
                >
                  {playingAudio === (item.id || String(index)) ? (
                    <>
                      <Pause className="w-3 h-3 mr-1" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 mr-1" />
                      Play
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
