import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Check, X } from "lucide-react";
import { Button } from "./ui/button";

interface AudioRecordingPreviewProps {
  audioBlob: Blob;
  fileName: string;
  onApprove: (audioBlob: Blob, fileName: string, displayName: string) => void;
  onReject: () => void;
  className?: string;
}

export const AudioRecordingPreview: React.FC<AudioRecordingPreviewProps> = ({
  audioBlob,
  fileName,
  onApprove,
  onReject,
  className = "",
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  };

  const [displayName, setDisplayName] = useState(
    `Clip from ${getTimeOfDay()} session`
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string>("");

  useEffect(() => {
    // Create audio URL from blob
    audioUrlRef.current = URL.createObjectURL(audioBlob);
    audioRef.current = new Audio(audioUrlRef.current);

    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
        setIsReady(true);
      } else {
        // If duration is not available, try to load it by seeking
        audio.currentTime = 24 * 60 * 60; // Seek to a large number
        audio.addEventListener(
          "seeked",
          () => {
            if (audio.duration && isFinite(audio.duration)) {
              setDuration(audio.duration);
              setIsReady(true);
            } else {
              // Fallback: estimate duration from blob size
              const estimatedDuration = audioBlob.size / 16000; // Rough estimate for WebM
              setDuration(estimatedDuration);
              setIsReady(true);
            }
            audio.currentTime = 0;
          },
          { once: true }
        );
      }
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    // Try to load metadata immediately
    audio.load();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.remove();
      }
      URL.revokeObjectURL(audioUrlRef.current);
    };
  }, [audioBlob]);

  const handlePlayPause = () => {
    if (!audioRef.current || !isReady) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
      setIsPlaying(true);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration || !isFinite(duration)) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage =
    duration && isFinite(duration) ? (currentTime / duration) * 100 : 0;

  console.log(
    "Rendering AudioRecordingPreview with progressPercentage:",
    progressPercentage
  );

  return (
    <div
      className={`w-full bg-card rounded-lg border shadow-sm p-4 ${className}`}
    >
      {/* Header with title and time */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs text-muted-foreground mb-1">
            Review and name your clip!
          </div>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-48 sm:w-64 md:w-80 px-2 py-1 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="Enter a name for this clip..."
          />
        </div>
        <div className="text-xs text-muted-foreground font-mono">
          {isReady && duration && isFinite(duration) ? (
            <span>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          ) : (
            <span>Loading...</span>
          )}
        </div>
      </div>

      {/* Audio Player Section with Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Play Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handlePlayPause}
          disabled={!isReady}
          className="h-8 w-8 p-0 flex-shrink-0"
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
        </Button>

        {/* Progress Bar */}
        <div className="flex-1 min-w-0">
          <div
            className="w-full bg-muted rounded-full cursor-pointer relative h-2"
            onClick={handleProgressClick}
          >
            <div
              className="bg-primary rounded-full h-full cursor-pointer transition-all duration-300 ease-out"
              style={{
                width: `${progressPercentage}%`,
                minWidth: "1px",
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onReject}
            className="flex items-center gap-1.5 px-2 py-1 h-8 sm:px-2 sm:gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs">Re-record</span>
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => onApprove(audioBlob, fileName, displayName)}
            className="flex items-center gap-1.5 px-2 py-1 h-8 sm:px-2 sm:gap-1.5"
          >
            <Check className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs">Save</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
