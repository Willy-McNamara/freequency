import React, { useContext, useEffect, useState, useRef, useMemo } from "react";
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
import { useAuth } from "../components/auth/AuthProvider";
import { apiConfig } from "../config/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/layout/Section";
// import { Container } from "@/components/layout/Container";
import { TaskTagList } from "../components/TaskTagList";
import { InstrumentModal } from "../components/InstrumentModal";
import { ALL_INSTRUMENTS } from "../types/instruments.types";
import { Badge } from "../components/badge";

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
  const { user } = useAuth();
  const [userInstruments, setUserInstruments] = useState<
    { id: number; label: string }[]
  >([]);
  const [showInstrumentTagModal, setShowInstrumentTagModal] = useState(false);
  const [showDeleteSessionModal, setShowDeleteSessionModal] = useState(false);
  const [instrumentModalOpen, setInstrumentModalOpen] = useState(false);
  const [showStartModal, setShowStartModal] = useState(
    !session.sessionTimerRunning && (session.sessionTimerSeconds ?? 0) === 0
  );

  useEffect(() => {
    // Show modal if session timer is reset to 0 and not running
    if (
      !session.sessionTimerRunning &&
      (session.sessionTimerSeconds ?? 0) === 0
    ) {
      setShowStartModal(true);
    }
  }, [session.sessionTimerRunning, session.sessionTimerSeconds]);

  const {
    sessionTitle,
    setSessionTitle,
    tags,
    setTags,
    sessionNotes,
    setSessionNotes,
  } = session;

  const timeAlreadyAddedToSession = useRef(0);
  const lastTaskRef = useRef<{ id: string | null; notes: string }>({
    id: null,
    notes: "",
  });

  const lastPersistedTaskId = useRef<string | null>(null);
  const lastTaskNotesRef = useRef<string>("");

  useEffect(() => {
    const stored = localStorage.getItem("practiceSelectedTaskId");
    setSelectedTaskId(stored);
  }, []);

  // Helper to get day and time of day
  function getDefaultSessionTitle() {
    const now = new Date();
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const day = days[now.getDay()];
    const hour = now.getHours();
    let timeOfDay = "morning";
    if (hour >= 5 && hour < 12) timeOfDay = "morning";
    else if (hour >= 12 && hour < 17) timeOfDay = "afternoon";
    else timeOfDay = "evening";
    return `${day} ${timeOfDay} practice session`;
  }

  // Fetch user instruments and auto-populate tags on mount
  useEffect(() => {
    if (user && user.id) {
      fetch(apiConfig.endpoints.musicians.profile(user.id))
        .then((res) => res.json())
        .then((profile) => {
          if (profile && Array.isArray(profile.instruments)) {
            type InstrumentTag = { id: number; label: string };
            setUserInstruments(
              profile.instruments.map((inst: InstrumentTag) => ({
                id: inst.id,
                label: inst.label,
              }))
            );
            // Auto-populate tags with only the first instrument if not present
            if (session.tags.length === 0 && profile.instruments.length > 0) {
              const first = profile.instruments[0];
              session.setTags([{ id: String(first.id), label: first.label }]);
            }
          }
        });
    }
    // eslint-disable-next-line
  }, [user]);

  // In PracticeInner, useEffect to autopopulate session title if empty or 'Untitled Session'
  useEffect(() => {
    if (!sessionTitle || sessionTitle === "Untitled Session") {
      setSessionTitle(getDefaultSessionTitle());
    }
    // eslint-disable-next-line
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

  // Fix useEffect: Only set timer when selectedTaskId changes, not selectedTask (which can change on every keystroke)
  useEffect(() => {
    if (selectedTaskId) {
      const foundTask = session.tasks.find((t) => t.id === selectedTaskId);
      setTaskTimer(foundTask?.timeSpent || 0);
      setChecklist(foundTask?.checklist || []);
      setTaskTimerRunning(true);

      // Only update if the task or notes actually changed
      if (
        lastTaskRef.current.id !== selectedTaskId ||
        lastTaskRef.current.notes !== (foundTask?.notes || "")
      ) {
        setTaskNotes(foundTask?.notes || "");
        lastTaskRef.current = {
          id: selectedTaskId,
          notes: foundTask?.notes || "",
        };
      }

      // Track time already added to session timer
      timeAlreadyAddedToSession.current = foundTask?.timeSpent || 0;

      // Pause session timer
      if (session.sessionTimerRunning) {
        session.setSessionTimerRunning(false);
      }
    }
    // eslint-disable-next-line
  }, [selectedTaskId]);

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
    if (
      selectedTask &&
      typeof session.updateTaskNotes === "function" &&
      taskNotes !== lastTaskNotesRef.current
    ) {
      lastTaskNotesRef.current = taskNotes;
      session.updateTaskNotes(selectedTask.id, taskNotes);
    }
  }, [taskNotes, selectedTaskId, selectedTask, session]);

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
    // Always resume session timer when returning to Practice view
    // The session timer should be running by default unless user explicitly paused it
    session.setSessionTimerRunning(true);
    localStorage.removeItem("practiceSelectedTaskId");
    setSelectedTaskId(null);
  };

  const handleSaveSession = async () => {
    // Validate: must have at least one instrument tag
    const instrumentLabels = userInstruments.map((i) => i.label.toLowerCase());
    const hasInstrumentTag = session.tags.some((tag) =>
      instrumentLabels.includes(tag.label.toLowerCase())
    );
    if (!hasInstrumentTag) {
      setShowInstrumentTagModal(true);
      return;
    }
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

      // Clear all session state after successful save
      session.setSessionTitle("Untitled Session");
      session.setTags([]);
      session.setTasks([]);
      session.setIsActive(false);
      session.setSessionTimerSeconds(0);
      session.setSessionTimerRunning(false);
      session.setSessionNotes("");

      // Clear localStorage
      localStorage.removeItem("practiceSession");
      localStorage.removeItem("practiceSelectedTaskId");

      // Navigate to feed with filter for user's sessions
      navigate("/feed?filter=my-sessions");
    } catch (err) {
      alert(
        "Failed to save session: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  const handleDeleteTask = (taskId: string) => {
    session.setTasks(session.tasks.filter((t) => t.id !== taskId));
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
      localStorage.removeItem("practiceSelectedTaskId");
    }
  };

  // Type guard for description
  function hasDescription(task: unknown): task is { description: string } {
    return (
      !!task &&
      typeof task === "object" &&
      "description" in task &&
      typeof (task as { description?: unknown }).description === "string" &&
      (task as { description: string }).description.length > 0
    );
  }

  const startPhrases = [
    "Let's do this",
    "Pull the lever kronk",
    "Booyah.",
    "Big time.",
    "Uh 1, uh 2, uh 1, 2, 3, 4....",
  ];

  const startButtonPhrase = useMemo(() => {
    if (!showStartModal) return startPhrases[0];
    return startPhrases[Math.floor(Math.random() * startPhrases.length)];
    // Only pick a new phrase when the modal is shown
    // eslint-disable-next-line
  }, [showStartModal]);

  // Main Practice view
  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 min-h-screen mb-8">
      {/* Start Session Custom Overlay */}
      {showStartModal && (
        <>
          {/* Overlay below TopBar */}
          <div
            className="fixed top-[64px] left-0 right-0 bottom-0 z-40 bg-black/70"
            style={{ pointerEvents: "none" }}
          />
          {/* Centered content */}
          <div
            className="fixed left-1/2 z-50"
            style={{
              top: "calc(50% + 32px)",
              transform: "translate(-50%, -50%)",
              background: "rgba(255,255,255,0.95)",
              boxShadow: "none",
              border: "none",
              textAlign: "center",
              borderRadius: "1rem",
              padding: "2rem 2.5rem",
              minWidth: "320px",
              maxWidth: "90vw",
            }}
          >
            <div className="text-lg font-semibold leading-none tracking-tight text-center w-full mb-2">
              Ready to practice?
            </div>
            <Button
              style={{
                backgroundColor: "#22c55e",
                color: "white",
                fontWeight: 600,
                fontSize: "1rem",
                padding: "0.5rem 1.5rem",
                borderRadius: "9999px",
                marginTop: "1.5rem",
              }}
              onClick={() => {
                session.setSessionTimerRunning(true);
                setShowStartModal(false);
              }}
            >
              {startButtonPhrase}
            </Button>
          </div>
        </>
      )}
      {/* <Container>
      For some reason I couldn't get xontainer to work here.. */}
      {/* Instrument Tag Required Modal */}
      <Dialog
        open={showInstrumentTagModal}
        onOpenChange={setShowInstrumentTagModal}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Instrument Tag Required</DialogTitle>
            <DialogDescription>
              You must have at least one instrument tag to save a session.
              Please add an instrument tag before saving.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setShowInstrumentTagModal(false)}
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {selectedTask ? (
        <Section spacing="xl">
          <div className="w-full mx-auto bg-card rounded-xl shadow-lg p-4 md:p-8 flex flex-col items-center relative">
            {/* Back Arrow at top left */}
            <button
              type="button"
              className="absolute top-4 left-4 p-2 rounded-full hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
              onClick={handleBack}
              aria-label="Back to Session"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            {/* Task Title and Timer */}
            <Section spacing="md">
              <div className="w-full flex flex-col items-center justify-center">
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
            </Section>
            {/* Task Description */}
            {hasDescription(selectedTask) && (
              <Section spacing="sm">
                <div className="w-full">
                  <h4 className="text-sm font-semibold mb-1 text-left">
                    Description
                  </h4>
                  <p className="text-sm text-foreground leading-relaxed">
                    {selectedTask.description}
                  </p>
                </div>
              </Section>
            )}
            <Section spacing="sm">
              <div className="w-full">
                <RichTextEditor value={taskNotes} onChange={setTaskNotes} />
              </div>
            </Section>
            {/* Task Tags */}
            <Section spacing="sm">
              <div className="w-full">
                <PracticeTagList
                  tags={selectedTask.tags || []}
                  onAddTag={() => setTagModalOpen(true)}
                  onRemoveTag={(tagId) => {
                    // Remove tag from selected task's tags
                    const updatedTags = (selectedTask.tags || []).filter(
                      (t) => t.id !== tagId
                    );
                    session.setTasks(
                      session.tasks.map((task) =>
                        task.id === selectedTask.id
                          ? { ...task, tags: updatedTags }
                          : task
                      )
                    );
                  }}
                />
              </div>
            </Section>
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
            {/* Checklist */}
            <Section spacing="sm">
              <div className="w-full">
                <h4 className="font-semibold mb-2 text-left">Checklist</h4>
                {checklist.length === 0 && (
                  <div className="text-muted-foreground text-sm">
                    No checklist items.
                  </div>
                )}
                {checklist.map((item, idx) => (
                  <label
                    key={idx}
                    className="flex items-start mb-2 cursor-pointer text-left"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleChecklistItem(idx)}
                      className="mr-2 mt-1.5"
                    />
                    <span
                      className={
                        item.checked
                          ? "line-through text-muted-foreground text-left"
                          : "text-left"
                      }
                    >
                      {item.item}
                    </span>
                  </label>
                ))}
              </div>
            </Section>
            {/* Remove Task from Session Button */}
            <Section spacing="md">
              <Button
                type="button"
                className="w-full px-6 py-2 rounded-lg bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                onClick={handleBack}
              >
                Save
              </Button>
            </Section>
          </div>
        </Section>
      ) : (
        <>
          <Section spacing={{ base: "md", sm: "lg", md: "xl" }}>
            <div className="flex flex-col w-full items-center justify-center">
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
                className="font-bold text-base mb-1 bg-transparent border-b border-muted focus:border-primary outline-none w-full text-center"
                aria-label="Session title"
              />
            </div>
          </Section>
          <Section spacing={{ base: "sm", sm: "md", md: "lg" }}>
            <div className="w-full">
              <RichTextEditor
                value={sessionNotes || ""}
                onChange={setSessionNotes}
              />
            </div>
          </Section>
          <Section spacing={{ base: "sm", sm: "md", md: "lg" }}>
            <div className="w-full">
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
                onDeleteTask={handleDeleteTask}
              />
            </div>
          </Section>
          <Section spacing={{ base: "sm", sm: "md", md: "lg" }}>
            <div className="w-full">
              {/* Instrument Section */}
              <h3 className="font-bold text-base mb-1">Instrument</h3>
              <div className="flex items-center gap-2 mb-2 min-h-[32px]">
                {/* Show selected instrument badge if present */}
                {(() => {
                  const instrumentLabels = ALL_INSTRUMENTS.map((i) => i.label);
                  const instrumentTag = tags.find((tag) =>
                    instrumentLabels.includes(tag.label)
                  );
                  return instrumentTag ? (
                    <Badge
                      variant="default"
                      className="h-5 px-3 py-2 rounded-md !hover:bg-none !hover:bg-transparent"
                    >
                      {instrumentTag.label}
                    </Badge>
                  ) : null;
                })()}
                <button
                  type="button"
                  onClick={() => setInstrumentModalOpen(true)}
                  className="text-xs underline text-muted-foreground hover:text-foreground"
                >
                  {(() => {
                    const instrumentLabels = ALL_INSTRUMENTS.map(
                      (i) => i.label
                    );
                    const instrumentTag = tags.find((tag) =>
                      instrumentLabels.includes(tag.label)
                    );
                    return instrumentTag ? "Change" : "Select";
                  })()}
                  {/* Hidden input for browser validation */}
                  <input
                    type="text"
                    value={(() => {
                      const instrumentLabels = ALL_INSTRUMENTS.map(
                        (i) => i.label
                      );
                      const instrumentTag = tags.find((tag) =>
                        instrumentLabels.includes(tag.label)
                      );
                      return instrumentTag ? instrumentTag.label : "";
                    })()}
                    required
                    tabIndex={-1}
                    autoComplete="off"
                    style={{ opacity: 0, width: "1px" }}
                    onChange={() => {}}
                  />
                </button>
              </div>
              <InstrumentModal
                isOpen={instrumentModalOpen}
                onClose={() => setInstrumentModalOpen(false)}
                onInstrumentSelected={(inst) => {
                  // Remove any previous instrument from tags, then add the new one if not present
                  const instrumentLabels = ALL_INSTRUMENTS.map((i) => i.label);
                  const nonInstrumentTags = tags.filter(
                    (tag) => !instrumentLabels.includes(tag.label)
                  );
                  setTags([
                    ...nonInstrumentTags,
                    { id: inst.id.toString(), label: inst.label },
                  ]);
                  setInstrumentModalOpen(false);
                }}
              />
            </div>
          </Section>
          <Section spacing={{ base: "sm", sm: "md", md: "lg" }}>
            {/* Tags Section */}
            <h3 className="font-bold text-base mb-1">Tags</h3>
            <div className="flex flex-wrap gap-2 mb-3 items-center">
              <button
                type="button"
                onClick={() => setTagModalOpen(true)}
                className="focus:outline-none"
              >
                <Badge
                  variant="secondary"
                  className="max-h-[1.2rem] flex items-center px-2.5 cursor-pointer select-none"
                >
                  + add
                </Badge>
              </button>
              <TaskTagList
                tags={tags.map((t) => t.label)}
                onRemoveTag={(tagLabel) => {
                  setTags(tags.filter((t) => t.label !== tagLabel));
                }}
              />
            </div>
            <TagModal
              isOpen={tagModalOpen}
              onClose={() => setTagModalOpen(false)}
              onTagSelected={handleTagSelected}
            />
          </Section>
          <Section spacing={{ base: "sm", sm: "md", md: "lg" }}>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full">
              <button
                type="button"
                className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onClick={handleSaveSession}
              >
                Save Session
              </button>
              <Dialog
                open={showDeleteSessionModal}
                onOpenChange={setShowDeleteSessionModal}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Practice Session?</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this session? All data
                      from this session will be lost. This action cannot be
                      undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteSessionModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        // Reset all session data
                        session.setSessionTitle("Untitled Session");
                        session.setTags([]);
                        session.setTasks([]);
                        session.setIsActive(false);
                        session.setSessionTimerSeconds(0);
                        session.setSessionTimerRunning(false);
                        session.setSessionNotes("");
                        localStorage.removeItem("practiceSession");
                        localStorage.removeItem("practiceSelectedTaskId");
                        setShowDeleteSessionModal(false);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <button
                type="button"
                className="p-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/80 transition-colors focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2"
                aria-label="Reset Session"
                onClick={() => setShowDeleteSessionModal(true)}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </Section>
        </>
      )}
    </div>
    // </Container>
  );
};

const Practice: React.FC = () => {
  const session = useContext(SessionContext);
  if (!session) return null;
  return <PracticeInner session={session} />;
};

export default Practice;
