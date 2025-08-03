import React, { createContext, useState, useEffect } from "react";

export interface SessionTask {
  id: string;
  title: string;
  notes?: string;
  checklist?: { item: string; checked: boolean }[];
  timeSpent?: number; // in seconds (legacy)
  tags?: { id: string; label: string }[];
  description?: string;
  // Per-task timer fields:
  taskTimerAccumulated?: number;
  taskTimerStartTime?: number | null;
  taskTimerRunning?: boolean;
}

export interface SessionTag {
  id: string;
  label: string;
}

export interface SessionMedia {
  id?: string;
  url: string;
  type: "image" | "audio" | "video";
  fileName?: string; // S3 key for storage
  displayName?: string; // User-facing display name
}

export interface SessionState {
  sessionTitle: string;
  tags: SessionTag[];
  tasks: SessionTask[];
  media: SessionMedia[];
  isActive?: boolean;
  sessionTimerAccumulated?: number; // total seconds before last start
  sessionTimerStartTime?: number | null; // timestamp in ms, or null if paused
  sessionTimerRunning?: boolean;
  sessionNotes?: string;
}

export interface SessionContextValue extends SessionState {
  setSessionTitle: (title: string) => void;
  setTags: (tags: SessionTag[]) => void;
  setTasks: (tasks: SessionTask[]) => void;
  setMedia: (media: SessionMedia[]) => void;
  addMedia: (media: SessionMedia) => void;
  removeMedia: (index: number) => void;
  setIsActive: (active: boolean) => void;
  setSessionTimerAccumulated: (seconds: number) => void;
  setSessionTimerStartTime: (timestamp: number | null) => void;
  setSessionTimerRunning: (running: boolean) => void;
  setSessionNotes: (notes: string) => void;
  updateTaskNotes: (taskId: string, notes: string) => void;
  updateTaskChecklist: (
    taskId: string,
    checklist: { item: string; checked: boolean }[]
  ) => void;
  updateTaskTime: (taskId: string, timeSpent: number) => void;
  // New per-task timer methods:
  setTaskTimerAccumulated: (taskId: string, seconds: number) => void;
  setTaskTimerStartTime: (taskId: string, timestamp: number | null) => void;
  setTaskTimerRunning: (taskId: string, running: boolean) => void;
}

const defaultSession: SessionState = {
  sessionTitle: "Untitled Session",
  tags: [],
  tasks: [],
  media: [],
  isActive: false,
  sessionTimerAccumulated: 0,
  sessionTimerStartTime: null,
  sessionTimerRunning: false,
  sessionNotes: "",
};

const SESSION_STORAGE_KEY = "practiceSession";

export const SessionContext = createContext<SessionContextValue | undefined>(
  undefined
);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sessionTitle, setSessionTitle] = useState(defaultSession.sessionTitle);
  const [tags, setTags] = useState<SessionTag[]>(defaultSession.tags);
  const [tasks, setTasks] = useState<SessionTask[]>(defaultSession.tasks);
  const [isActive, setIsActive] = useState<boolean>(
    defaultSession.isActive || false
  );
  const [sessionTimerAccumulated, setSessionTimerAccumulated] =
    useState<number>(defaultSession.sessionTimerAccumulated || 0);
  const [sessionTimerStartTime, setSessionTimerStartTime] = useState<
    number | null
  >(defaultSession.sessionTimerStartTime || null);
  const [sessionTimerRunning, setSessionTimerRunning] = useState<boolean>(
    defaultSession.sessionTimerRunning || false
  );
  const [sessionNotes, setSessionNotes] = useState<string>(
    defaultSession.sessionNotes || ""
  );
  const [media, setMedia] = useState<SessionMedia[]>(defaultSession.media);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.sessionTitle) setSessionTitle(parsed.sessionTitle);
        if (parsed.tags) setTags(parsed.tags);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.media) setMedia(parsed.media);
        if (typeof parsed.isActive === "boolean") setIsActive(parsed.isActive);
        if (typeof parsed.sessionTimerAccumulated === "number")
          setSessionTimerAccumulated(parsed.sessionTimerAccumulated);
        if (
          typeof parsed.sessionTimerStartTime === "number" ||
          parsed.sessionTimerStartTime === null
        )
          setSessionTimerStartTime(parsed.sessionTimerStartTime);
        if (typeof parsed.sessionTimerRunning === "boolean")
          setSessionTimerRunning(parsed.sessionTimerRunning);
        if (typeof parsed.sessionNotes === "string")
          setSessionNotes(parsed.sessionNotes);
        // --- REMOVE recalculation of elapsed time on mount ---
      } catch {
        /* ignore JSON parse errors */
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        sessionTitle,
        tags,
        tasks,
        media,
        isActive,
        sessionTimerAccumulated,
        sessionTimerStartTime,
        sessionTimerRunning,
        sessionNotes,
      })
    );
  }, [
    sessionTitle,
    tags,
    tasks,
    media,
    isActive,
    sessionTimerAccumulated,
    sessionTimerStartTime,
    sessionTimerRunning,
    sessionNotes,
  ]);

  // REMOVE: Persist session timer state every second while running
  // (No longer needed; only update accumulated on pause)

  const updateTaskNotes = (taskId: string, notes: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, notes } : task))
    );
  };

  const updateTaskChecklist = (
    taskId: string,
    checklist: { item: string; checked: boolean }[]
  ) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, checklist } : task))
    );
  };

  const updateTaskTime = (taskId: string, timeSpent: number) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, timeSpent } : task))
    );
  };

  // Add per-task timer methods
  const setTaskTimerAccumulated = (taskId: string, seconds: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, taskTimerAccumulated: seconds } : task
      )
    );
  };
  const setTaskTimerStartTime = (taskId: string, timestamp: number | null) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, taskTimerStartTime: timestamp } : task
      )
    );
  };
  const setTaskTimerRunning = (taskId: string, running: boolean) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, taskTimerRunning: running } : task
      )
    );
  };

  const addMedia = (newMedia: SessionMedia) => {
    setMedia((prev) => [...prev, newMedia]);
  };

  const removeMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const value: SessionContextValue = {
    sessionTitle,
    setSessionTitle,
    tags,
    setTags,
    tasks,
    setTasks,
    media,
    setMedia,
    addMedia,
    removeMedia,
    isActive,
    setIsActive,
    sessionTimerAccumulated,
    setSessionTimerAccumulated,
    sessionTimerStartTime,
    setSessionTimerStartTime,
    sessionTimerRunning,
    setSessionTimerRunning,
    sessionNotes,
    setSessionNotes,
    updateTaskNotes,
    updateTaskChecklist,
    updateTaskTime,
    setTaskTimerAccumulated,
    setTaskTimerStartTime,
    setTaskTimerRunning,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};
