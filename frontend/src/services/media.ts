import { apiConfig } from "../config/api";
import { apiClient } from "./auth";

export interface MediaItem {
  id?: string;
  url: string;
  type: "image" | "audio" | "video";
  fileName?: string;
}

export interface UploadResponse {
  url: string;
  fileName: string;
  thumbnailUrl?: string;
}

export class MediaService {
  static async uploadFile(
    file: File,
    musicianId: number,
    sessionId?: number
  ): Promise<UploadResponse> {
    try {
      // For videos, use server-side upload to get thumbnail
      const mediaType = this.getMediaType(file);
      if (mediaType === "video") {
        return await this.uploadVideoServerSide(file, sessionId);
      }

      // For other media types, use client-side upload
      const timestamp = Date.now();
      const fileExtension = file.name.split(".").pop();
      const fileName = `media/${musicianId}/${timestamp}.${fileExtension}`;

      // Get signed URL from backend using apiClient (includes CSRF)
      const response = await apiClient.post<{ signedUrl: string }>(
        apiConfig.endpoints.sessions.getSignedUrl,
        {
          size: file.size,
          type: file.type,
          musicianId: musicianId,
          fileName: fileName,
        }
      );

      if (response.error || !response.data?.signedUrl) {
        throw new Error(response.error || "Failed to get signed URL");
      }

      const { signedUrl } = response.data;

      // Upload file directly to S3
      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to S3");
      }

      // If sessionId is provided, connect media to session
      if (sessionId) {
        await this.connectMediaToSession(fileName, sessionId);
      }

      return {
        url: `https://freequency-music-app-dev.s3.us-east-2.amazonaws.com/${fileName}`,
        fileName: fileName,
      };
    } catch (error) {
      console.error("Media upload error:", error);
      throw new Error("Failed to upload media file");
    }
  }

  static async connectMediaToSession(
    fileName: string,
    sessionId: number,
    displayName?: string
  ): Promise<{
    url: string;
    type: string;
    displayName?: string;
    thumbnailUrl?: string;
  }> {
    try {
      const response = await apiClient.post<{
        url: string;
        type: string;
        displayName?: string;
        thumbnailUrl?: string;
      }>(apiConfig.endpoints.sessions.connectMedia, {
        fileName,
        sessionId,
        displayName,
      });

      if (response.error || !response.data) {
        throw new Error(response.error || "Failed to connect media to session");
      }

      return response.data;
    } catch (error) {
      console.error("Connect media error:", error);
      throw new Error("Failed to connect media to session");
    }
  }

  static async uploadVideoServerSide(
    file: File,
    sessionId?: number
  ): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (sessionId) {
        formData.append("sessionId", sessionId.toString());
      }

      const response = await apiClient.request<UploadResponse>(
        apiConfig.endpoints.sessions.uploadMedia,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.error || !response.data) {
        throw new Error(response.error || "Failed to upload video");
      }

      console.log("MediaService uploadVideoServerSide result:", response.data);
      return response.data;
    } catch (error) {
      console.error("Video upload error:", error);
      throw new Error("Failed to upload video file");
    }
  }

  static getMediaType(file: File): "image" | "audio" | "video" {
    if (file.type.startsWith("image/")) {
      return "image";
    } else if (file.type.startsWith("audio/")) {
      return "audio";
    } else if (file.type.startsWith("video/")) {
      return "video";
    }
    throw new Error("Unsupported file type");
  }
}

export const mediaService = new MediaService();
