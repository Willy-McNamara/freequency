import React, { createContext, useState, useEffect } from "react";

export interface SessionTask {
  id: string;
  title: string;
  notes?: string;
  checklist?: { item: string; checked: boolean }[];
  timeSpent?: number; // in seconds
  tags?: { id: string; label: string }[];
}

export interface SessionTag {
  id: string;
  label: string;
}

export interface SessionState {
  sessionTitle: string;
  tags: SessionTag[];
  tasks: SessionTask[];
  isActive?: boolean;
  sessionTimerSeconds?: number;
  sessionTimerRunning?: boolean;
  sessionNotes?: string;
}

export interface SessionContextValue extends SessionState {
  setSessionTitle: (title: string) => void;
  setTags: (tags: SessionTag[]) => void;
  setTasks: (tasks: SessionTask[]) => void;
  setIsActive: (active: boolean) => void;
  setSessionTimerSeconds: (seconds: number) => void;
  setSessionTimerRunning: (running: boolean) => void;
  setSessionNotes: (notes: string) => void;
  updateTaskNotes: (taskId: string, notes: string) => void;
  updateTaskChecklist: (
    taskId: string,
    checklist: { item: string; checked: boolean }[]
  ) => void;
  updateTaskTime: (taskId: string, timeSpent: number) => void;
}

const defaultSession: SessionState = {
  sessionTitle: "Untitled Session",
  tags: [],
  tasks: [],
  isActive: false,
  sessionTimerSeconds: 0,
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
  const [sessionTimerSeconds, setSessionTimerSeconds] = useState<number>(
    defaultSession.sessionTimerSeconds || 0
  );
  const [sessionTimerRunning, setSessionTimerRunning] = useState<boolean>(
    defaultSession.sessionTimerRunning || false
  );
  const [sessionNotes, setSessionNotes] = useState<string>(
    defaultSession.sessionNotes || ""
  );

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.sessionTitle) setSessionTitle(parsed.sessionTitle);
        if (parsed.tags) setTags(parsed.tags);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (typeof parsed.isActive === "boolean") setIsActive(parsed.isActive);
        if (typeof parsed.sessionTimerSeconds === "number")
          setSessionTimerSeconds(parsed.sessionTimerSeconds);
        if (typeof parsed.sessionTimerRunning === "boolean")
          setSessionTimerRunning(parsed.sessionTimerRunning);
        if (typeof parsed.sessionNotes === "string")
          setSessionNotes(parsed.sessionNotes);
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
        isActive,
        sessionTimerSeconds,
        sessionTimerRunning,
        sessionNotes,
      })
    );
  }, [
    sessionTitle,
    tags,
    tasks,
    isActive,
    sessionTimerSeconds,
    sessionTimerRunning,
    sessionNotes,
  ]);

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

  const value: SessionContextValue = {
    sessionTitle,
    setSessionTitle,
    tags,
    setTags,
    tasks,
    setTasks,
    isActive,
    setIsActive,
    sessionTimerSeconds,
    setSessionTimerSeconds,
    sessionTimerRunning,
    setSessionTimerRunning,
    sessionNotes,
    setSessionNotes,
    updateTaskNotes,
    updateTaskChecklist,
    updateTaskTime,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};
