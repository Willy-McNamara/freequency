import React, { useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useAudioContext } from "./AudioContext";

interface AudioPlayerProps {
  audioId: string;
  url: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  onClick?: (e: React.MouseEvent) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioId,
  url,
  className = "",
  size = "md",
  onClick,
}) => {
  const { playAudio, registerAudio, unregisterAudio, subscribeToAudioChanges } =
    useAudioContext();
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
  const [audioReady, setAudioReady] = useState<{
    [key: string]: boolean;
  }>({});

  // Pre-load audio element when component mounts
  useEffect(() => {
    if (!audioElements[audioId]) {
      const audio = new Audio(url);
      audio.addEventListener("ended", () => setPlayingAudio(null));
      audio.addEventListener("loadedmetadata", () => {
        setAudioDuration((prev) => ({ ...prev, [audioId]: audio.duration }));
      });
      audio.addEventListener("timeupdate", () => {
        setAudioProgress((prev) => ({ ...prev, [audioId]: audio.currentTime }));
      });
      audio.addEventListener("canplaythrough", () => {
        setAudioReady((prev) => ({ ...prev, [audioId]: true }));
      });
      setAudioElements((prev) => ({ ...prev, [audioId]: audio }));
      registerAudio(audioId, audio);
    }

    // Cleanup audio elements on unmount
    return () => {
      Object.values(audioElements).forEach((audio) => {
        audio.pause();
        audio.remove();
      });
      unregisterAudio(audioId);
    };
  }, [audioId, url, registerAudio, unregisterAudio]);

  // Listen for global audio changes and stop local audio if needed
  useEffect(() => {
    const unsubscribe = subscribeToAudioChanges((globalAudioId) => {
      // If this audio is not the currently playing one, stop it
      if (globalAudioId !== audioId) {
        const audio = audioElements[audioId];
        if (audio && !audio.paused) {
          audio.pause();
          setPlayingAudio(null);
        }
      }
    });

    return unsubscribe;
  }, [audioId, audioElements, subscribeToAudioChanges]);

  const handleAudioPlay = (mediaId: string) => {
    const audio = audioElements[mediaId];
    if (!audio) {
      console.error("Audio element not found:", mediaId);
      return;
    }

    if (playingAudio === mediaId) {
      audio.pause();
      setPlayingAudio(null);
    } else {
      // Use global context to stop other audio
      playAudio(mediaId);

      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
        toast.error("Failed to play audio file");
      });
      setPlayingAudio(mediaId);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Responsive size configurations
  const getResponsiveConfig = () => {
    // Base size from prop, but responsive to screen size
    const baseSize = size;

    return {
      buttonSize:
        baseSize === "sm"
          ? "h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8"
          : baseSize === "lg"
          ? "h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-12 lg:w-12"
          : "h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-10 lg:w-10", // md default
      iconSize:
        baseSize === "sm"
          ? "w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4"
          : baseSize === "lg"
          ? "w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7"
          : "w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6", // md default
      textSize: "text-xs sm:text-sm md:text-sm",
      barHeight:
        baseSize === "sm" ? "h-1 sm:h-1.5 md:h-2" : "h-1.5 sm:h-2 md:h-2.5",
      padding:
        baseSize === "sm" ? "p-2 sm:p-2.5 md:p-3" : "p-2.5 sm:p-3 md:p-4",
    };
  };

  const config = getResponsiveConfig();

  return (
    <div
      className={`w-full ${className} cursor-default`}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
    >
      <div className="flex items-center gap-4">
        {/* Audio Info */}
        <div className="flex-1 min-w-0">
          <div className={`${config.textSize} font-medium`}>
            Audio Recording
          </div>
        </div>

        {/* Time Display */}
        <div
          className={`${config.textSize} text-muted-foreground flex-shrink-0`}
        >
          {audioDuration[audioId] ? (
            <span>
              {formatTime(audioProgress[audioId] || 0)} /{" "}
              {formatTime(audioDuration[audioId] || 0)}
            </span>
          ) : (
            <span>Loading...</span>
          )}
        </div>
      </div>

      {/* Progress Bar with Play Button */}
      <div className="mt-2 flex items-center gap-3">
        {/* Play/Pause Button */}
        <Button
          type="button"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.(e);
            handleAudioPlay(audioId);
          }}
          disabled={!audioReady[audioId]}
          className={`${config.buttonSize} p-1 flex-shrink-0 cursor-pointer`}
        >
          {playingAudio === audioId ? (
            <Pause className={config.iconSize} />
          ) : (
            <Play className={config.iconSize} />
          )}
        </Button>

        {/* Progress Bar */}
        <div
          className="flex-1 bg-muted-foreground/20 rounded-full cursor-pointer relative"
          onClick={(e) => {
            if (!audioDuration[audioId]) return;
            e.stopPropagation();
            onClick?.(e);

            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = clickX / rect.width;
            const newTime = percentage * audioDuration[audioId];

            const audio = audioElements[audioId];
            if (audio) {
              audio.currentTime = newTime;
              setAudioProgress((prev) => ({ ...prev, [audioId]: newTime }));
            }
          }}
        >
          <div
            className={`bg-primary rounded-full will-change-transform ${config.barHeight} cursor-pointer`}
            style={{
              width: `${
                audioDuration[audioId]
                  ? ((audioProgress[audioId] || 0) /
                      (audioDuration[audioId] || 1)) *
                    100
                  : 0
              }%`,
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
              transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </div>
      </div>
    </div>
  );
};
