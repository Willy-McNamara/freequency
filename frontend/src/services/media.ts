import { apiConfig, buildApiUrl } from "../config/api";

export interface MediaItem {
  id?: string;
  url: string;
  type: "image" | "audio" | "video";
  fileName?: string;
}

export interface UploadResponse {
  url: string;
  fileName: string;
}

export class MediaService {
  static async uploadFile(
    file: File,
    musicianId: number,
    sessionId?: number
  ): Promise<UploadResponse> {
    try {
      // Generate a unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split(".").pop();
      const fileName = `media/${musicianId}/${timestamp}.${fileExtension}`;

      // Get signed URL from backend
      const response = await fetch(
        buildApiUrl(apiConfig.endpoints.sessions.getSignedUrl),
        {
          method: "POST",
          credentials: "include", // Include JWT cookies
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            size: file.size,
            type: file.type,
            musicianId: musicianId,
            fileName: fileName,
          }),
        }
      );

      if (response.status === 401) {
        // Redirect to login on authentication failure
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        throw new Error("Authentication required");
      }

      if (!response.ok) {
        throw new Error(`Failed to get signed URL: ${response.status}`);
      }

      const { signedUrl } = await response.json();

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
        await this.connectMediaToSession(fileName, musicianId, sessionId);
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
    musicianId: number,
    sessionId: number,
    displayName?: string
  ): Promise<void> {
    try {
      const response = await fetch(
        buildApiUrl(apiConfig.endpoints.sessions.connectMedia),
        {
          method: "POST",
          credentials: "include", // Include JWT cookies
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName,
            musicianId,
            sessionId,
            displayName,
          }),
        }
      );

      if (response.status === 401) {
        // Redirect to login on authentication failure
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        throw new Error("Authentication required");
      }

      if (!response.ok) {
        throw new Error(
          `Failed to connect media to session: ${response.status}`
        );
      }
    } catch (error) {
      console.error("Connect media error:", error);
      throw new Error("Failed to connect media to session");
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
