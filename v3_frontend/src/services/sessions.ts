import { buildApiUrl } from "../config/api";

export const sessionService = {
  async saveSession(sessionData: {
    title: string;
    notes: string;
    instruments: number[];
    tags: number[];
    duration: number;
    tasks: Array<{
      id: number;
      title: string;
      notes: string;
      timeSpent: number;
      checklist: Array<{ item: string; checked: boolean }>;
      tags: number[];
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
};
