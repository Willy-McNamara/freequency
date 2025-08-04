import React, { createContext, useContext, useEffect, useRef } from "react";

interface AudioContextType {
  playAudio: (audioId: string) => void;
  stopAllAudio: () => void;
  registerAudio: (audioId: string, audioElement: HTMLAudioElement) => void;
  unregisterAudio: (audioId: string) => void;
  subscribeToAudioChanges: (
    callback: (audioId: string | null) => void
  ) => () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudioContext = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudioContext must be used within an AudioProvider");
  }
  return context;
};

interface AudioProviderProps {
  children: React.ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const audioElementsRef = useRef<{ [key: string]: HTMLAudioElement }>({});
  const subscribersRef = useRef<Set<(audioId: string | null) => void>>(
    new Set()
  );
  const currentlyPlayingRef = useRef<string | null>(null);

  const playAudio = (audioId: string) => {
    // Stop any currently playing audio
    if (
      currentlyPlayingRef.current &&
      currentlyPlayingRef.current !== audioId
    ) {
      const currentAudio =
        audioElementsRef.current[currentlyPlayingRef.current];
      if (currentAudio) {
        currentAudio.pause();
      }
    }

    currentlyPlayingRef.current = audioId;

    // Notify all subscribers
    subscribersRef.current.forEach((callback) => callback(audioId));
  };

  const registerAudio = (audioId: string, audioElement: HTMLAudioElement) => {
    audioElementsRef.current[audioId] = audioElement;
  };

  const unregisterAudio = (audioId: string) => {
    delete audioElementsRef.current[audioId];
    if (currentlyPlayingRef.current === audioId) {
      currentlyPlayingRef.current = null;
      subscribersRef.current.forEach((callback) => callback(null));
    }
  };

  const stopAllAudio = () => {
    Object.values(audioElementsRef.current).forEach((audio) => {
      audio.pause();
    });
    currentlyPlayingRef.current = null;
    subscribersRef.current.forEach((callback) => callback(null));
  };

  const subscribeToAudioChanges = (
    callback: (audioId: string | null) => void
  ) => {
    subscribersRef.current.add(callback);
    return () => {
      subscribersRef.current.delete(callback);
    };
  };

  // Stop audio when navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      stopAllAudio();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const value: AudioContextType = {
    playAudio,
    stopAllAudio,
    registerAudio,
    unregisterAudio,
    subscribeToAudioChanges,
  };

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
};
