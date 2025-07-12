import React, { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { RichTextEditor } from "@/components/rich-text";
import { PracticeTaskList } from "@/components/practice-task-list";
import { PracticeTagList } from "@/components/practice-tag-list";
import { PracticeTimer, PracticeTimerRef } from "@/components/practice-timer";
import { TagModal } from "@/components/TagModal";
import { SessionContext } from "@/components/SessionContext";
import type {
  SessionTask,
  SessionContextValue,
} from "@/components/SessionContext";
import { ArrowLeft, Trash2 } from "lucide-react";
import { sessionService } from "../services/sessions";

const PracticeInner: React.FC<{ session: SessionContextValue }> = ({
  session,
}) => {
  const maxLength = 40;
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const sessionTimerRef = useRef<PracticeTimerRef>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskTimer, setTaskTimer] = useState<number>(0);
  const [taskTimerRunning, setTaskTimerRunning] = useState(false);
  const [taskNotes, setTaskNotes] = useState<string>("");
  const [checklist, setChecklist] = useState<
    { item: string; checked: boolean }[]
  >([]);
  const navigate = useNavigate();
  const selectedTask = session.tasks.find(
    (t: SessionTask) => t.id === selectedTaskId
  );

  const {
    sessionTitle,
    setSessionTitle,
    tags,
    setTags,
    sessionNotes,
    setSessionNotes,
  } = session;

  const wasSessionTimerRunning = useRef(false);
  const timeAlreadyAddedToSession = useRef(0);
  const lastTaskRef = useRef<{ id: string | null; notes: string }>({
    id: null,
    notes: "",
  });

  const lastPersistedTaskId = useRef<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("practiceSelectedTaskId");
    setSelectedTaskId(stored);
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/[^a-zA-Z ]/g, "");
    if (value.length > maxLength) value = value.slice(0, maxLength);
    setSessionTitle(value);
  };

  const handleTagSelected = (tag: { id: number; label: string }) => {
    if (!tags.some((t) => t.label === tag.label)) {
      setTags([...tags, { id: String(tag.id), label: tag.label }]);
    }
  };

  // Sync state when selectedTask changes
  useEffect(() => {
    if (selectedTaskId && selectedTask) {
      console.log(
        "use effect to setChecklist, timer, notes, ran. here is selectedTask and selectedTask.checklist :",
        selectedTask,
        selectedTask.checklist
      );
      setTaskTimer(selectedTask.timeSpent || 0);
      setChecklist(selectedTask.checklist || []);
      setTaskTimerRunning(true);

      // Only update if the task or notes actually changed
      if (
        lastTaskRef.current.id !== selectedTaskId ||
        lastTaskRef.current.notes !== (selectedTask.notes || "")
      ) {
        setTaskNotes(selectedTask.notes || "");
        lastTaskRef.current = {
          id: selectedTaskId,
          notes: selectedTask.notes || "",
        };
      }

      // Track time already added to session timer
      timeAlreadyAddedToSession.current = selectedTask.timeSpent || 0;

      // Pause session timer
      wasSessionTimerRunning.current = session.sessionTimerRunning ?? false;
      if (session.sessionTimerRunning) {
        session.setSessionTimerRunning(false);
      }
    }
    // Do NOT set taskNotes to "" when no task is selected
    // eslint-disable-next-line
  }, [selectedTaskId, selectedTask?.notes]);

  // Timer logic for Task-in-Session (independent from session timer)
  useEffect(() => {
    if (taskTimerRunning) {
      const interval = setInterval(() => {
        setTaskTimer((prev: number) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [taskTimerRunning]);

  // Task Notes persistence
  useEffect(() => {
    if (selectedTask && typeof session.updateTaskNotes === "function")
      session.updateTaskNotes(selectedTask.id, taskNotes);
  }, [taskNotes, selectedTaskId]);

  // Checklist persistence
  useEffect(() => {
    // Only persist if the checklist changes for the same task
    if (
      selectedTask &&
      typeof session.updateTaskChecklist === "function" &&
      lastPersistedTaskId.current === selectedTask.id
    ) {
      session.updateTaskChecklist(selectedTask.id, checklist);
    }
    // Update the ref to the current task
    lastPersistedTaskId.current = selectedTaskId;
    // eslint-disable-next-line
  }, [checklist]);

  // Checklist toggle
  const toggleChecklistItem = (idx: number) => {
    setChecklist((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, checked: !item.checked } : item
      )
    );
  };

  // Handle leaving Task-in-Session view
  const handleBack = () => {
    if (selectedTask && typeof session.updateTaskTime === "function") {
      session.updateTaskTime(selectedTask.id, taskTimer);
      // Add only the incremental time to session timer
      const incrementalTime = taskTimer - timeAlreadyAddedToSession.current;
      if (incrementalTime > 0) {
        session.setSessionTimerSeconds(
          (session.sessionTimerSeconds || 0) + incrementalTime
        );
      }
    }
    setTaskTimerRunning(false);
    // Resume session timer when returning to Practice view
    if (wasSessionTimerRunning.current) {
      session.setSessionTimerRunning(true);
    }
    localStorage.removeItem("practiceSelectedTaskId");
    setSelectedTaskId(null);
  };

  const handleSaveSession = async () => {
    try {
      // Explicitly type sessionData to match backend DTO
      const sessionData: {
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
          checklist: { item: string; checked: boolean }[];
          tags: number[];
        }>;
      } = {
        title: session.sessionTitle || "Untitled Session",
        notes: session.sessionNotes || "",
        instruments: [], // No instrument selection in context yet
        tags: session.tags ? session.tags.map((t) => Number(t.id)) : [],
        duration: session.sessionTimerSeconds || 0,
        tasks: (session.tasks || []).map((task) => ({
          id: Number(task.id),
          title: task.title || "",
          notes: task.notes || "",
          timeSpent: task.timeSpent || 0,
          checklist: Array.isArray(task.checklist) ? task.checklist : [],
          tags: Array.isArray(task.tags)
            ? task.tags.map((t) => Number(t.id))
            : [],
        })),
      };
      await sessionService.saveSession(sessionData);
      alert("Session saved!");
    } catch (err) {
      alert(
        "Failed to save session: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  // Main Practice view
  return (
    <div className="w-[70vw] min-h-screen">
      {selectedTask ? (
        <div className="flex flex-col items-center justify-center w-[90vw] min-h-screen bg-background px-4 py-8">
          <div className="w-full max-w-xl bg-card rounded-xl shadow-lg p-8 flex flex-col items-center relative">
            {/* Back Arrow at top left */}
            <button
              type="button"
              className="absolute top-16 left-8 p-2 rounded-full hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
              onClick={handleBack}
              aria-label="Back to Session"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            {/* Task Title and Timer */}
            <div className="mb-6 w-full flex flex-col items-center">
              <span className="text-2xl font-bold mb-2 text-center">
                {selectedTask.title}
              </span>
              <PracticeTimer
                value={taskTimer}
                onChange={setTaskTimer}
                runningValue={taskTimerRunning}
                onRunningChange={setTaskTimerRunning}
              />
            </div>
            {/* Task Tags */}
            <div className="w-full mb-4">
              <PracticeTagList
                tags={selectedTask.tags || []}
                onAddTag={() => setTagModalOpen(true)}
              />
            </div>
            {/* Tag Modal for Task Tags */}
            <TagModal
              isOpen={tagModalOpen}
              onClose={() => setTagModalOpen(false)}
              onTagSelected={(tag) => {
                // Add tag to the selected task if not already present
                if (!selectedTask.tags?.some((t) => t.label === tag.label)) {
                  const updatedTags = [
                    ...(selectedTask.tags || []),
                    { id: String(tag.id), label: tag.label },
                  ];
                  // Update the task in session.tasks
                  session.setTasks(
                    session.tasks.map((task) =>
                      task.id === selectedTask.id
                        ? { ...task, tags: updatedTags }
                        : task
                    )
                  );
                }
              }}
            />
            <RichTextEditor value={taskNotes} onChange={setTaskNotes} />
            {/* Checklist */}
            <div className="mt-6 w-full">
              <h4 className="font-semibold mb-2">Checklist</h4>
              {checklist.length === 0 && (
                <div className="text-muted-foreground text-sm">
                  No checklist items.
                </div>
              )}
              {checklist.map((item, idx) => (
                <label
                  key={idx}
                  className="flex items-center mb-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleChecklistItem(idx)}
                    className="mr-2"
                  />
                  <span
                    className={
                      item.checked ? "line-through text-muted-foreground" : ""
                    }
                  >
                    {item.item}
                  </span>
                </label>
              ))}
            </div>
            {/* Remove Task from Session Button */}
            <button
              type="button"
              className="mt-6 px-6 py-2 rounded-lg bg-destructive text-destructive-foreground font-semibold shadow hover:bg-destructive/80 transition-colors focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2"
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to remove this task from the session?"
                  )
                ) {
                  // Remove the task from the session
                  session.setTasks(
                    session.tasks.filter((t) => t.id !== selectedTask.id)
                  );
                  // If this was the selected task, clear selection and localStorage
                  localStorage.removeItem("practiceSelectedTaskId");
                  setSelectedTaskId(null);
                }
              }}
            >
              Remove Task from Session
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center justify-center my-4">
            <PracticeTimer
              ref={sessionTimerRef}
              value={session.sessionTimerSeconds}
              onChange={session.setSessionTimerSeconds}
              runningValue={session.sessionTimerRunning}
              onRunningChange={(newRunning) => {
                session.setSessionTimerRunning(newRunning);
                if (newRunning) {
                  session.setIsActive(true);
                }
              }}
            />
            <input
              type="text"
              value={sessionTitle}
              onChange={handleTitleChange}
              maxLength={maxLength}
              className="font-bold text-base mb-1 text-center bg-transparent border-b border-muted focus:border-primary outline-none w-full max-w-xs"
              aria-label="Session title"
            />
          </div>
          <RichTextEditor
            value={sessionNotes || ""}
            onChange={setSessionNotes}
          />
          <PracticeTaskList
            tasks={session.tasks}
            onAddNew={() => {
              // TODO: Stop timer here
              navigate("/task-library");
            }}
            onEditTask={(id) => {
              // Set selected task and show Task-in-Session view
              localStorage.setItem("practiceSelectedTaskId", id);
              setSelectedTaskId(id);
            }}
          />
          <PracticeTagList tags={tags} onAddTag={() => setTagModalOpen(true)} />
          <TagModal
            isOpen={tagModalOpen}
            onClose={() => setTagModalOpen(false)}
            onTagSelected={handleTagSelected}
          />
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              type="button"
              className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onClick={handleSaveSession}
            >
              Save Session
            </button>
            <button
              type="button"
              className="p-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/80 transition-colors focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2"
              aria-label="Reset Session"
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to reset and delete this session? This cannot be undone."
                  )
                ) {
                  // Reset all session data
                  session.setSessionTitle("Untitled Session");
                  session.setTags([]);
                  session.setTasks([]);
                  session.setIsActive(false);
                  session.setSessionTimerSeconds(0);
                  session.setSessionTimerRunning(false);
                  localStorage.removeItem("practiceSession");
                  localStorage.removeItem("practiceSelectedTaskId");
                }
              }}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const Practice: React.FC = () => {
  const session = useContext(SessionContext);
  if (!session) return null;
  return <PracticeInner session={session} />;
};

export default Practice;
