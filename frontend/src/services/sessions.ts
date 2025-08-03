import { apiClient } from "./auth";

// Type definitions for API responses
interface CreatedCommentDto {
  id: number;
  text: string;
  createdAt: string;
  musicianId: number;
  sessionId: number;
  musician: {
    id: number;
    displayName: string;
    avatarUrl: string | null;
  };
}

interface CreatedGasUpDto {
  id: number;
  musicianId: number;
  sessionId: number;
  musician: {
    id: number;
    displayName: string;
    avatarUrl: string | null;
  };
}

export const sessionService = {
  async saveSession(sessionData: {
    title: string;
    notes: string;
    instruments: string[];
    tags: string[];
    duration: number;
    tasks: Array<{
      id: number;
      title: string;
      notes: string;
      timeSpent: number;
      checklist: Array<{ item: string; checked: boolean }>;
      tags: string[];
    }>;
  }) {
    const response = await apiClient.post(
      "/sessions/newSessionWithoutAudio",
      sessionData
    );
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error("No data received from server");
    }
    return response.data as { id: number; [key: string]: unknown };
  },

  async addComment(
    sessionId: number,
    commentText: string
  ): Promise<CreatedCommentDto> {
    const response = await apiClient.post("/sessions/addComment", {
      text: commentText,
      sessionId: sessionId,
    });
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error("No data received from server");
    }
    return response.data as CreatedCommentDto;
  },

  async addGasUp(
    sessionId: number,
    musicianId: number
  ): Promise<CreatedGasUpDto> {
    const response = await apiClient.post("/sessions/addGasUp", {
      sessionId: sessionId,
      musicianId: musicianId,
    });
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error("No data received from server");
    }
    return response.data as CreatedGasUpDto;
  },

  async removeGasUp(sessionId: number): Promise<{ success: boolean }> {
    const response = await apiClient.delete(
      `/sessions/removeGasUp?sessionId=${sessionId}`
    );
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error("No data received from server");
    }
    return response.data as { success: boolean };
  },

  async getSession(sessionId: number) {
    const response = await apiClient.get(`/sessions/${sessionId}`);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error("No data received from server");
    }
    return response.data;
  },

  async connectMediaToSession(
    fileName: string,
    sessionId: number,
    displayName?: string,
    thumbnailUrl?: string
  ) {
    const response = await apiClient.post("/sessions/connect-media", {
      fileName,
      sessionId,
      displayName,
      thumbnailUrl,
    });
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error("No data received from server");
    }
    return response.data;
  },
};
