import React, { useState, useEffect } from "react";
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
import { toast } from "sonner";

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
  const [audioProgress, setAudioProgress] = useState<{
    [key: string]: number;
  }>({});
  const [audioDuration, setAudioDuration] = useState<{
    [key: string]: number;
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
      audio.addEventListener("loadedmetadata", () => {
        setAudioDuration((prev) => ({ ...prev, [mediaId]: audio.duration }));
      });
      audio.addEventListener("timeupdate", () => {
        setAudioProgress((prev) => ({ ...prev, [mediaId]: audio.currentTime }));
      });
      setAudioElements((prev) => ({ ...prev, [mediaId]: audio }));
    }

    const audio = audioElements[mediaId];
    if (playingAudio === mediaId) {
      audio.pause();
      setPlayingAudio(null);
    } else {
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
        toast.error("Failed to play audio file");
      });
      setPlayingAudio(mediaId);
    }
  };

  // Cleanup audio elements on unmount
  useEffect(() => {
    return () => {
      Object.values(audioElements).forEach((audio) => {
        audio.pause();
        audio.remove();
      });
    };
  }, [audioElements]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleAudioPlay(item.id || String(index), item.url)
                      }
                      className="h-8 w-8 p-0"
                    >
                      {playingAudio === (item.id || String(index)) ? (
                        <Pause className="w-3 h-3" />
                      ) : (
                        <Play className="w-3 h-3" />
                      )}
                    </Button>
                    <div className="flex-1 text-xs text-muted-foreground">
                      {audioDuration[item.id || String(index)] ? (
                        <span>
                          {formatTime(
                            audioProgress[item.id || String(index)] || 0
                          )}{" "}
                          /{" "}
                          {formatTime(
                            audioDuration[item.id || String(index)] || 0
                          )}
                        </span>
                      ) : (
                        <span>Loading...</span>
                      )}
                    </div>
                  </div>
                  {audioDuration[item.id || String(index)] && (
                    <div className="w-full bg-muted rounded-full h-1">
                      <div
                        className="bg-primary h-1 rounded-full transition-all duration-100"
                        style={{
                          width: `${
                            ((audioProgress[item.id || String(index)] || 0) /
                              (audioDuration[item.id || String(index)] || 1)) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
