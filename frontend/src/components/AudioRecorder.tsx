import React, { useState, useRef, useCallback } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { AudioRecordingPreview } from "./AudioRecordingPreview";

interface AudioRecorderProps {
  onRecordingComplete: (
    audioBlob: Blob,
    fileName: string,
    displayName: string
  ) => void;
  className?: string;
  disabled?: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  className = "",
  disabled = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedFileName, setRecordedFileName] = useState<string>("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);

        try {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });

          // Generate filename with timestamp
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
          const fileName = `recording-${timestamp}.webm`;

          setRecordedBlob(audioBlob);
          setRecordedFileName(fileName);
          setShowPreview(true);
          toast.success("Recording completed! Preview your audio.");
        } catch (error) {
          console.error("Error processing recording:", error);
          toast.error("Failed to process audio recording");
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Recording started...");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error(
        "Failed to start recording. Please check microphone permissions."
      );
    }
  }, [onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();

      // Stop all tracks to release microphone
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());

      setIsRecording(false);
    }
  }, [isRecording]);

  const handleButtonClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleApprove = (
    audioBlob: Blob,
    fileName: string,
    displayName: string
  ) => {
    onRecordingComplete(audioBlob, fileName, displayName);
    setShowPreview(false);
    setRecordedBlob(null);
    setRecordedFileName("");
  };

  const handleReject = () => {
    setShowPreview(false);
    setRecordedBlob(null);
    setRecordedFileName("");
  };

  if (showPreview && recordedBlob) {
    return (
      <div className="w-full">
        <AudioRecordingPreview
          audioBlob={recordedBlob}
          fileName={recordedFileName}
          onApprove={handleApprove}
          onReject={handleReject}
          className="w-full"
        />
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleButtonClick}
      disabled={isProcessing || disabled}
      className={`flex items-center gap-2 ${className}`}
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : isRecording ? (
        <>
          <Square className="h-4 w-4 text-red-500" />
          Stop Recording
        </>
      ) : (
        <>
          <Mic className="h-4 w-4" />
          Record Audio
        </>
      )}
    </Button>
  );
};
