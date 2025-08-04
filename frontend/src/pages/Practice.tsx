import React, { useContext, useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router";
import { RichTextEditor, RichTextRenderer } from "@/components/rich-text";
import { PracticeTaskList } from "@/components/practice-task-list";
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
import { TagList } from "../components/TagList";
import { InstrumentModal } from "../components/InstrumentModal";
import { ALL_INSTRUMENTS } from "../types/instruments.types";
import { Badge } from "../components/badge";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { usePageTracking } from "../hooks/useAnalytics";
import { MediaUploadButton } from "@/components/MediaUploadButton";
import { MediaGallery } from "@/components/MediaGallery";
import { MediaService } from "../services/media";

import { HelpCircle } from "lucide-react";
import { AudioRecorder } from "@/components/AudioRecorder";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PracticeInner: React.FC<{ session: SessionContextValue }> = ({
  session,
}) => {
  const maxLength = 40;
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const sessionTimerRef = useRef<PracticeTimerRef>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  // --- Per-task timer state ---
  const [taskNotes, setTaskNotes] = useState<string>("");
  const [checklist, setChecklist] = useState<
    { item: string; checked: boolean }[]
  >([]);
  const navigate = useNavigate();
  const selectedTask = session.tasks.find(
    (t: SessionTask) => t.id === selectedTaskId
  );
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [showInstrumentTagModal, setShowInstrumentTagModal] = useState(false);
  const [showDeleteSessionModal, setShowDeleteSessionModal] = useState(false);
  const [instrumentModalOpen, setInstrumentModalOpen] = useState(false);
  const [showStartModal, setShowStartModal] = useState(
    !session.sessionTimerRunning && (session.sessionTimerAccumulated || 0) === 0
  );
  const [showMediaModal, setShowMediaModal] = useState(false);

  // Mobile detection hook
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Show modal if session timer is reset to 0 and not running
    if (
      !session.sessionTimerRunning &&
      (session.sessionTimerAccumulated || 0) === 0
    ) {
      setShowStartModal(true);
    }
  }, [session.sessionTimerRunning, session.sessionTimerAccumulated]);

  const {
    sessionTitle,
    setSessionTitle,
    tags,
    setTags,
    sessionNotes,
    setSessionNotes,
  } = session;

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

  // Auto-populate tags with first instrument if not present
  useEffect(() => {
    if (user && user.id && session.tags.length === 0) {
      fetch(apiConfig.endpoints.musicians.profile(user.id))
        .then((res) => res.json())
        .then((profile) => {
          if (
            profile &&
            Array.isArray(profile.instruments) &&
            profile.instruments.length > 0
          ) {
            const first = profile.instruments[0];
            session.setTags([{ id: String(first.id), label: first.label }]);
          }
        });
    }
    // eslint-disable-next-line
  }, [user]);

  // In PracticeInner, useEffect to autopopulate session title if empty or 'Untitled Session'
  useEffect(() => {
    // Helper function to check if title is auto-generated and stale
    const isAutoGeneratedAndStale = (title: string) => {
      const titlePattern =
        /^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday) (morning|afternoon|evening) practice session$/;
      if (!titlePattern.test(title)) return false; // Not auto-generated

      // Extract day and time of day from title
      const match = title.match(
        /^(\w+) (morning|afternoon|evening) practice session$/
      );
      if (!match) return false;

      const [, storedDay, storedTimeOfDay] = match;
      const now = new Date();

      // Check if day is wrong
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const currentDay = days[now.getDay()];
      if (storedDay !== currentDay) return true;

      // Check if time of day is wrong
      const hour = now.getHours();
      let currentTimeOfDay = "morning";
      if (hour >= 5 && hour < 12) currentTimeOfDay = "morning";
      else if (hour >= 12 && hour < 17) currentTimeOfDay = "afternoon";
      else currentTimeOfDay = "evening";

      return storedTimeOfDay !== currentTimeOfDay;
    };

    if (
      !sessionTitle ||
      sessionTitle === "Untitled Session" ||
      isAutoGeneratedAndStale(sessionTitle)
    ) {
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

  // When entering Task-in-Session view, start the task timer if not running
  useEffect(() => {
    if (selectedTaskId && selectedTask) {
      setChecklist(selectedTask.checklist || []);
      setTaskNotes(selectedTask.notes || "");
      // Start the task timer if not running
      if (!selectedTask.taskTimerRunning) {
        session.setTaskTimerRunning(selectedTask.id, true);
        session.setTaskTimerStartTime(selectedTask.id, Date.now());
      }
      // Do NOT pause or accumulate the session timer
    }
    // eslint-disable-next-line
  }, [selectedTaskId]);

  // When leaving Task-in-Session view, pause the task timer and accumulate time
  const handleBack = () => {
    if (selectedTask) {
      if (
        selectedTask.taskTimerRunning &&
        selectedTask.taskTimerStartTime != null
      ) {
        const elapsed = Math.floor(
          (Date.now() - selectedTask.taskTimerStartTime) / 1000
        );
        session.setTaskTimerAccumulated(
          selectedTask.id,
          (selectedTask.taskTimerAccumulated || 0) + elapsed
        );
        session.setTaskTimerStartTime(selectedTask.id, null);
        session.setTaskTimerRunning(selectedTask.id, false);
      }
    }
    // Do NOT resume or start the session timer here
    localStorage.removeItem("practiceSelectedTaskId");
    setSelectedTaskId(null);
  };

  // --- Per-task timer state ---
  function getTaskElapsed() {
    if (!selectedTask) return 0;
    if (
      selectedTask.taskTimerRunning &&
      selectedTask.taskTimerStartTime != null
    ) {
      return (
        (selectedTask.taskTimerAccumulated || 0) +
        Math.floor((Date.now() - selectedTask.taskTimerStartTime) / 1000)
      );
    }
    return selectedTask.taskTimerAccumulated || 0;
  }

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
  const handleSaveSession = async () => {
    setIsSaving(true);
    // Validate: must have at least one instrument tag
    const instruments = ALL_INSTRUMENTS.map((i) => i.label.toLowerCase());
    const hasInstrumentTag = session.tags.some((tag) =>
      instruments.includes(tag.label.toLowerCase())
    );

    if (!hasInstrumentTag) {
      setShowInstrumentTagModal(true);
      return;
    }
    try {
      // Separate instrument tags from regular tags
      const instrumentTags = session.tags.filter((tag) =>
        instruments.includes(tag.label.toLowerCase())
      );
      const regularTags = session.tags.filter(
        (tag) => !instruments.includes(tag.label.toLowerCase())
      );

      // Explicitly type sessionData to match backend DTO
      const sessionData: {
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
          checklist: { item: string; checked: boolean }[];
          tags: string[];
        }>;
      } = {
        title: session.sessionTitle || "Untitled Session",
        notes: session.sessionNotes || "",
        instruments: instrumentTags.map((t) => t.label), // Send instrument labels
        tags: regularTags.map((t) => t.label), // Send regular tag labels
        duration: getSessionElapsed(),
        tasks: (session.tasks || []).map((task) => ({
          id: Number(task.id),
          title: task.title || "",
          notes: task.notes || "",
          timeSpent: task.taskTimerAccumulated || 0,
          checklist: Array.isArray(task.checklist) ? task.checklist : [],
          tags: Array.isArray(task.tags) ? task.tags.map((t) => t.label) : [],
        })),
      };

      const savedSession = await sessionService.saveSession(sessionData);

      // Connect media to the saved session
      if (session.media && session.media.length > 0) {
        for (const mediaItem of session.media) {
          if (mediaItem.fileName) {
            try {
              await sessionService.connectMediaToSession(
                mediaItem.fileName,
                savedSession.id,
                mediaItem.type === "audio" ? mediaItem.displayName : undefined,
                mediaItem.thumbnailUrl
              );
              // Note: The thumbnailUrl is now stored in the database
              // and will be available when the session is fetched
            } catch (error) {
              console.error("Error connecting media to session:", error);
            }
          }
        }
      }

      toast.success(`Successful save! Routing to your posts...`);
      await new Promise((resolve) => setTimeout(resolve, 2500)); // Pause so the user can read the toast before redirect

      // Extract current instrument before clearing session data
      const instrumentLabels = ALL_INSTRUMENTS.map((i) => i.label);
      const currentInstrument = session.tags.find((tag) =>
        instrumentLabels.includes(tag.label)
      );

      // Clear all session state after successful save
      session.setSessionTitle("Untitled Session");
      session.setTags([]);
      session.setTasks([]);
      session.setMedia([]);
      session.setIsActive(false);
      session.setSessionTimerAccumulated(0);
      session.setSessionTimerStartTime(null);
      session.setSessionTimerRunning(false);
      session.setSessionNotes("");

      // Clear localStorage
      localStorage.removeItem("practiceSession");
      localStorage.removeItem("practiceSelectedTaskId");

      // Preserve the current instrument for the next session
      if (currentInstrument) {
        session.setTags([currentInstrument]);
      }

      setIsSaving(false);

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

  // Media limit validation helpers
  const getMediaCounts = () => {
    const photos = session.media.filter((item) => item.type === "image").length;
    const audio = session.media.filter((item) => item.type === "audio").length;
    const videos = session.media.filter((item) => item.type === "video").length;
    return { photos, audio, videos };
  };

  const canAddPhoto = () => {
    const { photos } = getMediaCounts();
    return photos < 4;
  };

  const canAddAudio = () => {
    const { audio } = getMediaCounts();
    return audio < 3;
  };

  const canAddVideo = () => {
    const { videos } = getMediaCounts();
    return videos < 1;
  };

  const checkAudioDuration = async (audioBlob: Blob): Promise<boolean> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      const url = URL.createObjectURL(audioBlob);

      audio.addEventListener("loadedmetadata", () => {
        if (audio.duration && isFinite(audio.duration)) {
          URL.revokeObjectURL(url);
          const durationInMinutes = audio.duration / 60;
          resolve(durationInMinutes <= 3);
        } else {
          // Try seeking to force duration calculation
          audio.currentTime = 24 * 60 * 60; // Seek to a large number
          audio.addEventListener(
            "seeked",
            () => {
              if (audio.duration && isFinite(audio.duration)) {
                URL.revokeObjectURL(url);
                const durationInMinutes = audio.duration / 60;
                resolve(durationInMinutes <= 3);
              } else {
                // Fallback: estimate from blob size
                URL.revokeObjectURL(url);
                const estimatedDuration = audioBlob.size / (16000 * 2); // Rough estimate: 16kHz, 16-bit
                const durationInMinutes = estimatedDuration / 60;
                resolve(durationInMinutes <= 3);
              }
              audio.currentTime = 0;
            },
            { once: true }
          );
        }
      });

      audio.addEventListener("error", () => {
        URL.revokeObjectURL(url);
        // On error, assume it's valid (better to allow than reject incorrectly)
        resolve(true);
      });

      audio.load(); // Try to load metadata immediately
      audio.src = url;
    });
  };

  const checkVideoDuration = async (videoFile: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      const url = URL.createObjectURL(videoFile);

      video.addEventListener("loadedmetadata", () => {
        if (video.duration && isFinite(video.duration)) {
          URL.revokeObjectURL(url);
          const durationInMinutes = video.duration / 60;
          resolve(durationInMinutes <= 1);
        } else {
          // Try seeking to force duration calculation
          video.currentTime = 24 * 60 * 60; // Seek to a large number
          video.addEventListener(
            "seeked",
            () => {
              if (video.duration && isFinite(video.duration)) {
                URL.revokeObjectURL(url);
                const durationInMinutes = video.duration / 60;
                resolve(durationInMinutes <= 1);
              } else {
                // Fallback: estimate from file size
                URL.revokeObjectURL(url);
                const estimatedDuration = videoFile.size / 5000000; // Rough estimate: 5MB per minute
                const durationInMinutes = estimatedDuration / 60;
                resolve(durationInMinutes <= 1);
              }
              video.currentTime = 0;
            },
            { once: true }
          );
        }
      });

      video.addEventListener("error", () => {
        URL.revokeObjectURL(url);
        // On error, assume it's valid (better to allow than reject incorrectly)
        resolve(true);
      });

      video.load(); // Try to load metadata immediately
      video.src = url;
    });
  };

  // Helper to get elapsed session time
  function getSessionElapsed() {
    if (session.sessionTimerRunning && session.sessionTimerStartTime != null) {
      return (
        (session.sessionTimerAccumulated || 0) +
        Math.floor((Date.now() - session.sessionTimerStartTime) / 1000)
      );
    }
    return session.sessionTimerAccumulated || 0;
  }

  // Main Practice view
  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 min-h-screen mb-8">
      <Toaster position="bottom-center" />
      {/* Start/Resume Session Custom Overlay - only show if not in Task-in-Session view */}
      {!session.sessionTimerRunning && !selectedTaskId && (
        <>
          {/* Overlay below TopBar */}
          <div
            className="fixed top-[64px] left-0 right-0 bottom-0 z-30 bg-black/70"
            style={{ pointerEvents: "none" }}
          />
          {/* Centered content */}
          <div
            className="fixed left-1/2 z-40"
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
              {(session.sessionTimerAccumulated || 0) > 0
                ? "Ready to resume?"
                : "Ready to practice?"}
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
                session.setSessionTimerStartTime(Date.now());
                session.setIsActive(true);
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
      {/* Task in Session view*/}
      {selectedTask ? (
        <Section spacing="sm">
          <Section spacing="md">
            {/* Header */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2 text-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Session
            </Button>
          </Section>
          <div className="w-full mx-auto bg-card rounded-xl shadow-lg p-4 md:p-8 flex flex-col items-stretch relative align-start">
            {/* Task Title and Timer */}
            <Section spacing="md">
              <div className="w-full flex flex-col items-center justify-center">
                <span className="text-2xl font-bold mb-2 text-center">
                  {selectedTask.title}
                </span>
                {/* In Task-in-Session view, use PracticeTimer with per-task timer state */}
                <PracticeTimer
                  value={getTaskElapsed()}
                  onChange={() => {}}
                  runningValue={selectedTask?.taskTimerRunning}
                  onRunningChange={(newRunning) => {
                    if (!selectedTask) return;
                    if (newRunning) {
                      // Start timer
                      if (!selectedTask.taskTimerRunning) {
                        session.setTaskTimerRunning(selectedTask.id, true);
                        session.setTaskTimerStartTime(
                          selectedTask.id,
                          Date.now()
                        );
                      }
                    } else {
                      // Pause timer
                      if (
                        selectedTask.taskTimerRunning &&
                        selectedTask.taskTimerStartTime != null
                      ) {
                        const elapsed = Math.floor(
                          (Date.now() - selectedTask.taskTimerStartTime) / 1000
                        );
                        session.setTaskTimerAccumulated(
                          selectedTask.id,
                          (selectedTask.taskTimerAccumulated || 0) + elapsed
                        );
                        session.setTaskTimerStartTime(selectedTask.id, null);
                        session.setTaskTimerRunning(selectedTask.id, false);
                      }
                    }
                  }}
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
                  <RichTextRenderer
                    content={selectedTask.description}
                    noTruncate={true}
                    className="font-['Inter',Helvetica] text-foreground text-sm font-normal leading-6 mb-2"
                  />
                </div>
              </Section>
            )}
            <Section spacing="sm">
              <div className="w-full">
                <RichTextEditor
                  value={taskNotes}
                  onChange={setTaskNotes}
                  placeholder="Add task notes here..."
                />
              </div>
            </Section>
            {/* Task Tags */}
            <Section spacing="sm">
              <h4 className="text-sm font-semibold mb-1 text-left">Tags</h4>
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
                <TagList
                  tags={selectedTask.tags?.map((t) => t.label) || []}
                  onRemoveTag={(tagLabel) => {
                    // Remove tag from selected task's tags
                    const updatedTags = (selectedTask.tags || []).filter(
                      (t) => t.label !== tagLabel
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
            {/* Save Button */}
            <Section spacing="md">
              <div className="flex justify-center">
                <Button
                  type="button"
                  className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                  onClick={handleBack}
                >
                  Save
                </Button>
              </div>
            </Section>
          </div>
        </Section>
      ) : (
        <>
          <Section spacing={{ base: "md", sm: "lg", md: "xl" }}>
            <div className="flex flex-col w-full items-center justify-center">
              <PracticeTimer
                ref={sessionTimerRef}
                value={getSessionElapsed()}
                onChange={() => {}}
                runningValue={session.sessionTimerRunning}
                onRunningChange={(newRunning) => {
                  if (newRunning) {
                    // Start timer: set running true and set startTime if not already set
                    if (!session.sessionTimerRunning) {
                      session.setSessionTimerRunning(true);
                      session.setSessionTimerStartTime(Date.now());
                    }
                  } else {
                    // Pause timer: accumulate elapsed, clear startTime
                    if (
                      session.sessionTimerRunning &&
                      session.sessionTimerStartTime != null
                    ) {
                      const elapsed = Math.floor(
                        (Date.now() - session.sessionTimerStartTime) / 1000
                      );
                      session.setSessionTimerAccumulated(
                        (session.sessionTimerAccumulated || 0) + elapsed
                      );
                      session.setSessionTimerStartTime(null);
                      session.setSessionTimerRunning(false);
                    }
                  }
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
                placeholder="Add session notes here..."
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
              <TagList
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
            <div className="w-full">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-base">Media</h3>
                {isMobile ? (
                  <HelpCircle
                    className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => setShowMediaModal(true)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setShowMediaModal(true);
                      }
                    }}
                  />
                ) : (
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs" side="right">
                        <p className="text-sm">
                          <p className="text-center">
                            <strong>
                              Easy, in-session audio recording to capture
                              anything worth saving or sharing.
                            </strong>
                            <br />
                            Upload option for photos, videos, or recordings
                            you've captured elsewhere.
                          </p>
                          <br />
                          🎵 Audio: Up to 3 recordings per session (max 3
                          minutes each)
                          <br />
                          📸 Photos: Up to 4 photos per session (max 10MB each)
                          <br />
                          🎥 Video: Up to 1 video per session (max 1 minute,
                          50MB)
                          <br />
                          <br />
                          <span className="text-xs text-muted-foreground">
                            <strong>Accepted file types:</strong>
                            <br />
                            Audio: MP3, WAV, M4A, OGG, WebM
                            <br />
                            Photos: JPEG, PNG, GIF, WebP
                            <br />
                            Audio: MP3, WAV, M4A, OGG, WebM
                            <br />
                            Video: MP4, WebM, MOV
                          </span>
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mb-3 items-center">
                <MediaUploadButton
                  onFileSelect={async (file) => {
                    try {
                      if (!user?.id) {
                        toast.error("Please log in to upload media");
                        return;
                      }

                      const mediaType = MediaService.getMediaType(file);

                      // Check photo limit
                      if (mediaType === "image" && !canAddPhoto()) {
                        toast.error("Maximum 4 photos allowed per session");
                        return;
                      }

                      // Check video limit
                      if (mediaType === "video" && !canAddVideo()) {
                        toast.error("Maximum 1 video allowed per session");
                        return;
                      }

                      // Check video duration
                      if (mediaType === "video") {
                        const isWithinLimit = await checkVideoDuration(file);
                        if (!isWithinLimit) {
                          toast.error("Video must be 1 minute or shorter");
                          return;
                        }
                      }

                      // Show loading toast
                      const loadingToast = toast.loading("Uploading media...");

                      const uploadResult = await MediaService.uploadFile(
                        file,
                        user.id
                      );

                      console.log("Practice upload result:", uploadResult);

                      // Add the media to the session state with thumbnail if available
                      session.addMedia({
                        url: uploadResult.url,
                        type: mediaType,
                        fileName: uploadResult.fileName,
                        thumbnailUrl: uploadResult.thumbnailUrl,
                      });

                      console.log(
                        "Practice session media after add:",
                        session.media
                      );

                      // Dismiss loading toast and show success
                      toast.dismiss(loadingToast);
                      toast.success("Media uploaded successfully!");
                    } catch (error) {
                      console.error("Upload error:", error);
                      toast.error("Failed to upload media");
                    }
                  }}
                  acceptedTypes="all"
                  className="flex items-center gap-2"
                  disabled={!canAddPhoto() && !canAddVideo()}
                />
                <AudioRecorder
                  onRecordingComplete={async (
                    audioBlob,
                    fileName,
                    displayName
                  ) => {
                    try {
                      if (!user?.id) {
                        toast.error("Please log in to record audio");
                        return;
                      }

                      // Check audio limit
                      if (!canAddAudio()) {
                        toast.error(
                          "Maximum 3 audio recordings allowed per session"
                        );
                        return;
                      }

                      // Check audio duration
                      const isWithinLimit = await checkAudioDuration(audioBlob);
                      if (!isWithinLimit) {
                        toast.error(
                          "Audio recordings must be 3 minutes or shorter"
                        );
                        return;
                      }

                      // Convert blob to file
                      const file = new File([audioBlob], fileName, {
                        type: "audio/webm",
                      });

                      // Show loading toast
                      const loadingToast = toast.loading(
                        "Uploading audio recording..."
                      );

                      const uploadResult = await MediaService.uploadFile(
                        file,
                        user.id
                      );

                      session.addMedia({
                        url: uploadResult.url,
                        type: "audio",
                        fileName: uploadResult.fileName,
                        displayName: displayName,
                      });

                      // Dismiss loading toast and show success
                      toast.dismiss(loadingToast);
                      toast.success("Audio recording uploaded successfully!");
                    } catch (error) {
                      console.error("Recording upload error:", error);
                      toast.error("Failed to upload audio recording");
                    }
                  }}
                  className="flex items-center gap-2"
                  disabled={!canAddAudio()}
                />
              </div>
              <MediaGallery
                media={session.media}
                onRemove={(index) => session.removeMedia(index)}
              />
            </div>
          </Section>
          <Section spacing={{ base: "sm", sm: "md", md: "lg" }}>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full">
              <button
                type="button"
                className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onClick={handleSaveSession}
                disabled={isSaving}
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
                  <div className="flex justify-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteSessionModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        // Extract current instrument before clearing session data
                        const instrumentLabels = ALL_INSTRUMENTS.map(
                          (i) => i.label
                        );
                        const currentInstrument = session.tags.find((tag) =>
                          instrumentLabels.includes(tag.label)
                        );

                        // Reset all session data
                        session.setSessionTitle(getDefaultSessionTitle());
                        session.setTags([]);
                        session.setTasks([]);
                        session.setMedia([]);
                        session.setIsActive(false);
                        session.setSessionTimerAccumulated(0);
                        session.setSessionTimerStartTime(null);
                        session.setSessionTimerRunning(false);
                        session.setSessionNotes("");
                        localStorage.removeItem("practiceSession");
                        localStorage.removeItem("practiceSelectedTaskId");
                        sessionTimerRef.current?.reset();

                        // Preserve the current instrument for the next session
                        if (currentInstrument) {
                          session.setTags([currentInstrument]);
                        }

                        setShowDeleteSessionModal(false);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Media Info Modal for Mobile */}
              <Dialog open={showMediaModal} onOpenChange={setShowMediaModal}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add media to your session!</DialogTitle>
                  </DialogHeader>
                  <div className="text-sm">
                    <p className="text-center">
                      <strong>
                        Easy, in-session audio recording to capture anything
                        worth saving or sharing.
                      </strong>
                      <br />
                      Upload option for photos or recordings you've captured
                      elsewhere.
                    </p>
                    <br />
                    <p>
                      <br />
                      🎵 Audio: Up to 3 recordings per session (max 3 minutes
                      each)
                      <br />
                      📸 Photos: Up to 4 photos per session (max 10MB each)
                      <br />
                      🎥 Video: Up to 1 video per session (max 1 minute, 50MB)
                      <br />
                      <span className="text-xs text-muted-foreground">
                        <strong>Accepted file types:</strong>
                        <br />
                        Audio: MP3, WAV, M4A, OGG, WebM
                        <br />
                        Photos: JPEG, PNG, GIF, WebP
                        <br />
                        Audio: MP3, WAV, M4A, OGG, WebM
                        <br />
                        Video: MP4, WebM, MOV
                      </span>
                    </p>
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

  // Track page view for analytics
  usePageTracking("Practice");

  if (!session) return null;
  return <PracticeInner session={session} />;
};

export default Practice;
