import { buildApiUrl } from "../config/api";

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
    const response = await fetch(
      buildApiUrl("/sessions/newSessionWithoutAudio"),
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData),
      }
    );
    if (!response.ok) {
      throw new Error("Failed to save session");
    }
    return response.json();
  },

  async getSessionById(sessionId: number) {
    const response = await fetch(buildApiUrl(`/sessions/${sessionId}`), {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch session");
    }
    return response.json();
  },

  async addComment(sessionId: number, commentText: string) {
    const response = await fetch(buildApiUrl("/sessions/addComment"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: commentText,
        sessionId: sessionId,
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to add comment");
    }
    return response.json();
  },

  async addGasUp(sessionId: number, musicianId: number) {
    const response = await fetch(buildApiUrl("/sessions/addGasUp"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: sessionId,
        musicianId: musicianId,
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to add gas up");
    }
    return response.json();
  },
};
