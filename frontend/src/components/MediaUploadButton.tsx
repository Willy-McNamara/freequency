import React, { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Upload, Image, Music, Video } from "lucide-react";
import { toast } from "sonner";

interface MediaUploadButtonProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: "image" | "audio" | "video" | "all";
  disabled?: boolean;
  className?: string;
}

export const MediaUploadButton: React.FC<MediaUploadButtonProps> = ({
  onFileSelect,
  acceptedTypes = "all",
  disabled = false,
  className = "",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const getAcceptedMimeTypes = () => {
    switch (acceptedTypes) {
      case "image":
        return "image/jpeg,image/jpg,image/png,image/gif,image/webp";
      case "audio":
        return "audio/webm,audio/mp3,audio/mpeg,audio/wav,audio/m4a,audio/ogg";
      case "video":
        return "video/mp4,video/webm,video/ogg,video/quicktime";
      case "all":
      default:
        return "image/jpeg,image/jpg,image/png,image/gif,image/webp,audio/webm,audio/mp3,audio/mpeg,audio/wav,audio/m4a,audio/ogg,video/mp4,video/webm,video/ogg,video/quicktime";
    }
  };

  const getIcon = () => {
    switch (acceptedTypes) {
      case "image":
        return <Image className="w-4 h-4" />;
      case "audio":
        return <Music className="w-4 h-4" />;
      case "video":
        return <Video className="w-4 h-4" />;
      case "all":
      default:
        return <Upload className="w-4 h-4" />;
    }
  };

  const getButtonText = () => {
    switch (acceptedTypes) {
      case "image":
        return "Add Photo";
      case "audio":
        return "Add Audio";
      case "video":
        return "Add Video";
      case "all":
      default:
        return "Add Media";
    }
  };

  const validateFile = (file: File): boolean => {
    // File size limits (in bytes)
    const fileSizeLimits = {
      image: 10 * 1024 * 1024, // 10MB
      audio: 50 * 1024 * 1024, // 50MB
      video: 100 * 1024 * 1024, // 100MB
    };

    // Determine file category
    let fileCategory: "image" | "audio" | "video" | null = null;
    if (file.type.startsWith("image/")) {
      fileCategory = "image";
    } else if (file.type.startsWith("audio/")) {
      fileCategory = "audio";
    } else if (file.type.startsWith("video/")) {
      fileCategory = "video";
    }

    if (!fileCategory) {
      toast.error("Unsupported file type");
      return false;
    }

    // Check file size
    const maxFileSize = fileSizeLimits[fileCategory];
    if (file.size > maxFileSize) {
      const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));
      toast.error(`File size exceeds limit of ${maxSizeMB}MB`);
      return false;
    }

    return true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) {
      return;
    }

    setIsUploading(true);
    try {
      onFileSelect(file);
    } catch {
      toast.error("Failed to process file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptedMimeTypes()}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={disabled || isUploading}
        className={`flex items-center gap-2 ${className}`}
      >
        {getIcon()}
        {isUploading ? "Uploading..." : getButtonText()}
      </Button>
    </>
  );
};
