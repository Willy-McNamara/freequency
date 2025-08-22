import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import { useSearchParams } from "react-router-dom";
import {
  FilterBar,
  FilterState,
  FilterType,
  FilterOption,
} from "../components/filter-bar";
import { TaskListItem, Task } from "../components/task-list-item";
import { TaskDetail } from "../components/task-detail";
import {
  CreateTaskModal,
  CreateTaskData,
} from "../components/create-task-modal";
import { useNavigate } from "react-router";
import { SessionContext } from "@/components/SessionContext";
import { Timer, Plus, Play } from "lucide-react";
import { apiConfig } from "../config/api";
import { Button } from "@/components/ui/button";
import { ALL_INSTRUMENTS } from "../types/instruments.types";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loading } from "@/components/ui/loading";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { usePageTracking } from "../hooks/useAnalytics";
import { apiClient } from "../services/auth";

const TaskLibrary: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Track page view for analytics
  usePageTracking("Task Library");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [modifyTaskData, setModifyTaskData] = useState<
    CreateTaskData | undefined
  >(undefined);

  const [showInstrumentWarningModal, setShowInstrumentWarningModal] =
    useState(false);
  const [taskWithDifferentInstrument, setTaskWithDifferentInstrument] =
    useState<Task | null>(null);
  const isSettingFromUrl = useRef(false);
  const previousFilterState = useRef<string>("");
  const hasProcessedUrlParam = useRef(false);
  const shouldFetchAfterUrlParam = useRef(false);
  // const { user } = useAuth();
  const [userOptions, setUserOptions] = useState<FilterOption[]>([]);

  const [activeFilters, setActiveFilters] = useState<FilterState[]>(() => [
    {
      type: "user",
      isSelected: false,
      options: [], // Will be set after fetch
    },
    {
      type: "instrument",
      isSelected: false,
      options: ALL_INSTRUMENTS.map((instrument) => ({
        id: instrument.label.toLowerCase(),
        label: instrument.label,
        checked: false,
      })),
    },
    { type: "saved", isSelected: false },
  ]);

  // Update user filter options when userOptions changes
  useEffect(() => {
    setActiveFilters((prev) =>
      prev.map((filter) =>
        filter.type === "user" ? { ...filter, options: userOptions } : filter
      )
    );
  }, [userOptions]);

  // Get task ID from URL query parameter
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const session = useContext(SessionContext);
  const navigate = useNavigate();

  // --- Live session timer logic ---
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (session && session.sessionTimerRunning) {
      const interval = setInterval(() => setTick((t) => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [session && session.sessionTimerRunning]);

  function getLiveSessionTime() {
    if (!session) return 0;
    if (session.sessionTimerRunning && session.sessionTimerStartTime != null) {
      return (
        (session.sessionTimerAccumulated || 0) +
        Math.floor((Date.now() - session.sessionTimerStartTime) / 1000)
      );
    }
    return session.sessionTimerAccumulated || 0;
  }

  // Fetch tasks from API
  const fetchTasks = useCallback(async (filters?: FilterState[]) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      const currentFilters = filters || activeFilters;

      const userFilter = currentFilters.find((f) => f.type === "user");
      if (userFilter?.isSelected && userFilter.options) {
        const selectedUsers = userFilter.options
          .filter((option) => option.checked)
          .map((option) => option.label);

        // Check if "Following" is selected
        const followingSelected = selectedUsers.includes("Following");
        if (followingSelected) {
          params.append("following", "true");
        } else if (selectedUsers.length > 0) {
          // Only add users param if not using following filter
          params.append("users", selectedUsers.join(","));
        }
      }

      const instrumentFilter = currentFilters.find(
        (f) => f.type === "instrument"
      );
      if (instrumentFilter?.isSelected && instrumentFilter.options) {
        const selectedInstruments = instrumentFilter.options
          .filter((option) => option.checked)
          .map((option) => option.label);
        if (selectedInstruments.length > 0) {
          params.append("instruments", selectedInstruments.join(","));
        }
      }

      const savedFilter = currentFilters.find((f) => f.type === "saved");
      if (savedFilter?.isSelected) {
        params.append("saved", "true");
      }

      const url = `${apiConfig.endpoints.tasks}?${params.toString()}`;

      const response = await apiClient.get(url);
      if (response.data) {
        const data = response.data;
        setTasks(Array.isArray(data) ? data : []);
      } else {
        throw new Error(response.error || "Failed to fetch tasks");
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await apiClient.get(
          apiConfig.endpoints.musicians.allIdNames
        );
        if (response.data) {
          const data = response.data as { id: number; displayName: string }[];
          // Assume data is an array of { id, displayName }
          setUserOptions(
            data.map((user) => ({
              id: String(user.id),
              label: user.displayName,
              checked: false,
            }))
          );
        } else {
          throw new Error(response.error || "Failed to fetch users");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const taskId = urlParams.get("task");
    if (taskId) {
      const id = parseInt(taskId, 10);
      if (!isNaN(id)) {
        setSelectedTaskId(id);
      }
    }
  }, []);

  const handleFilterChange = (
    filterType: FilterType,
    isSelected: boolean,
    options?: FilterOption[]
  ) => {
    setActiveFilters((prev) =>
      prev.map((filter) => {
        if (filter.type === filterType) {
          if (filterType === "saved") {
            // For saved, just toggle isSelected
            return { ...filter, isSelected };
          }
          const updatedOptions = options || filter.options;
          const hasSelectedOptions =
            updatedOptions?.some((option) => option.checked) || false;
          return {
            ...filter,
            isSelected: hasSelectedOptions,
            options: updatedOptions,
          };
        }
        return filter;
      })
    );
  };

  // Tasks are now filtered server-side, so we use tasks directly

  // Trigger fetch when filters change
  useEffect(() => {
    // Create a string representation of the current filter state for comparison
    const currentFilterState = JSON.stringify(
      activeFilters.map((filter) => ({
        type: filter.type,
        isSelected: filter.isSelected,
        selectedOptions:
          filter.options
            ?.filter((opt) => opt.checked)
            .map((opt) => opt.label) || [],
      }))
    );

    // Check if we need to fetch after setting URL parameter
    if (shouldFetchAfterUrlParam.current) {
      shouldFetchAfterUrlParam.current = false;
      fetchTasks(activeFilters);
      return;
    }

    // Fetch tasks when filters change (but not on initial load)
    if (
      previousFilterState.current &&
      previousFilterState.current !== currentFilterState
    ) {
      if (isSettingFromUrl.current) {
        isSettingFromUrl.current = false;
      } else {
        fetchTasks(activeFilters);
      }
    }

    // Update the previous filter state
    previousFilterState.current = currentFilterState;
  }, [activeFilters, fetchTasks]);

  // Handle URL parameters
  useEffect(() => {
    const userParam = searchParams.get("user");
    const taskParam = searchParams.get("task");

    // Handle user parameter - set filter only
    if (userParam && !hasProcessedUrlParam.current) {
      hasProcessedUrlParam.current = true;
      const userLabel = decodeURIComponent(userParam);

      // Set the filter immediately without checking if it's already set
      isSettingFromUrl.current = true;
      setActiveFilters((prev) => {
        return prev.map((filter) => {
          if (filter.type === "user") {
            // Check if the user is already in the options
            const userExists = filter.options?.some(
              (opt) => opt.label === userLabel
            );
            let updatedOptions = filter.options || [];

            // If user doesn't exist in options, add them
            if (!userExists) {
              updatedOptions = [
                ...updatedOptions,
                {
                  id: userLabel.toLowerCase().replace(/\s+/g, ""),
                  label: userLabel,
                  checked: true,
                },
              ];
            } else {
              // If user exists, update their checked status
              updatedOptions = updatedOptions.map((opt) => ({
                ...opt,
                checked: opt.label === userLabel,
              }));
            }

            return {
              ...filter,
              isSelected: true,
              options: updatedOptions,
            };
          }
          return filter;
        });
      });

      // Signal that we need to fetch after setting the filter
      shouldFetchAfterUrlParam.current = true;
    }

    // Handle task parameter - set selected task
    if (taskParam) {
      const taskId = parseInt(taskParam, 10);
      if (!isNaN(taskId)) {
        setSelectedTaskId(taskId);
      }
    } else {
      // If no task parameter, clear selected task
      setSelectedTaskId(null);
    }
  }, [searchParams]); // Removed fetchTasks from dependencies

  const handleTaskClick = () => {
    // No-op for now
  };

  const handleUseInCurrentSession = (task: Task) => {
    if (!session) return;
    console.log("task", task);

    // Check if task instrument matches session instrument
    const instrumentLabels = ALL_INSTRUMENTS.map((i) => i.label.toLowerCase());
    console.log("instrumentLabels", instrumentLabels);
    const hasMatchingInstrument = task.tags?.some((taskTag) =>
      session.tags?.some(
        (sessionTag) =>
          instrumentLabels.includes(taskTag.label.toLowerCase()) &&
          instrumentLabels.includes(sessionTag.label.toLowerCase()) &&
          taskTag.label.toLowerCase() === sessionTag.label.toLowerCase()
      )
    );
    console.log("hasMatchingInstrument", hasMatchingInstrument);
    if (hasMatchingInstrument) {
      // Add the task to the session if not already present
      if (!session.tasks.some((t) => t.id === String(task.id))) {
        session.setTasks([
          ...session.tasks,
          {
            id: String(task.id),
            title: task.title,
            description: task.description,
            tags:
              task.tags?.map((tag) => ({
                id: String(tag.id),
                label: tag.label,
              })) || [],
            checklist:
              task.checklist?.map((item) => ({ item, checked: false })) || [],
          },
        ]);
      }
      // Set a flag in localStorage for the selected task
      localStorage.setItem("practiceSelectedTaskId", String(task.id));
      navigate("/practice", { replace: true });
      return;
    }
    setShowInstrumentWarningModal(true);
    setTaskWithDifferentInstrument(task);
  };

  const handleViewTaskDetails = () => {
    if (!taskWithDifferentInstrument) return;
    setShowInstrumentWarningModal(false);
    handleViewDetails(taskWithDifferentInstrument.id);
  };

  const handleViewDetails = (taskId: number) => {
    // Navigate to task library with task ID parameter
    navigate(`/task-library?task=${taskId}`);
    setSelectedTaskId(taskId);
  };

  const handleBackToLibrary = () => {
    // Navigate back to task library without task parameter
    navigate("/task-library");
    setSelectedTaskId(null);
    // Refetch tasks using current filters
    fetchTasks(activeFilters);
  };

  const handleCreateTask = async (taskData: CreateTaskData) => {
    try {
      const response = await apiClient.post(
        apiConfig.endpoints.tasks,
        taskData as unknown as Record<string, unknown>
      );
      if (response.data) {
        const newTask = response.data as Task;
        setTasks((prev) => [newTask, ...prev]);
        setIsCreateModalOpen(false);
        toast.success(`Task "${newTask.title}" created successfully!`);
      } else {
        throw new Error(response.error || "Failed to create task");
      }
    } catch (err) {
      console.error("Error creating task:", err);
      toast.error("Failed to create task. Please try again.");
    }
  };

  const handleModifyTask = (task: Task) => {
    // Convert Task to CreateTaskData format
    const modifyData: CreateTaskData = {
      title: task.title,
      description: task.description,
      instrument: task.instrument,
      checklist: task.checklist,
      tags: task.tags.map((tag) => tag.label),
      parentTaskId: task.id, // Set the current task as the parent
    };
    setModifyTaskData(modifyData);
    setIsModifyModalOpen(true);
  };

  const handleModifySubmit = async (taskData: CreateTaskData) => {
    try {
      const response = await apiClient.post(
        apiConfig.endpoints.tasks,
        taskData as unknown as Record<string, unknown>
      );
      if (response.data) {
        const newTask = response.data as Task;
        setIsModifyModalOpen(false);
        setModifyTaskData(undefined);
        toast.success(`Task "${newTask.title}" created successfully!`);
        // Reload the page and navigate to the new task's detail view
        window.location.href = `/task-library?task=${newTask.id}`;
      } else {
        throw new Error(response.error || "Failed to create modified task");
      }
    } catch (err) {
      console.error("Error creating modified task:", err);
      toast.error("Failed to create modified task. Please try again.");
    }
  };

  // Find the selected task
  const selectedTask = selectedTaskId
    ? tasks.find((task) => task.id === selectedTaskId)
    : null;

  const hasActiveSession = session && session.isActive;

  if (loading) {
    return (
      <Container>
        <Section spacing="lg">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loading size="lg" text="Loading tasks..." />
          </div>
        </Section>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Section spacing="lg">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-destructive mb-4">Error: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Try Again
              </button>
            </div>
          </div>
        </Section>
      </Container>
    );
  }

  // Show task detail if a task is selected
  if (selectedTask) {
    return (
      <>
        <TaskDetail
          task={selectedTask}
          onBack={handleBackToLibrary}
          onModifyTask={handleModifyTask}
          hasActiveSession={hasActiveSession}
          onUseInCurrentSession={
            hasActiveSession ? handleUseInCurrentSession : undefined
          }
        />
        <CreateTaskModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateTask}
        />
        <CreateTaskModal
          isOpen={isModifyModalOpen}
          onClose={() => {
            setIsModifyModalOpen(false);
            setModifyTaskData(undefined);
          }}
          onSubmit={handleModifySubmit}
          initialData={modifyTaskData}
        />
        {/* Instrument Warning Modal */}
        <Dialog
          open={showInstrumentWarningModal}
          onOpenChange={(open) => {
            if (!open) {
              setShowInstrumentWarningModal(false);
              setTaskWithDifferentInstrument(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hold yer horses!</DialogTitle>
              <DialogDescription>
                This task is designed for a different instrument than you're
                using in your current practice session. To use this task, just
                "Make it your own" in the Task Details view to create a
                different version of it with the instrument of your choosing!
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 mt-4">
              <Button
                onClick={() => {
                  setShowInstrumentWarningModal(false);
                  setTaskWithDifferentInstrument(null);
                }}
                className="w-full"
              >
                Got it
              </Button>
              <Button
                onClick={handleViewTaskDetails}
                className="w-full"
                variant="outline"
              >
                View Task Details
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Container>
      {/* Active Session Indicator */}
      {hasActiveSession && (
        <Section spacing="sm">
          <div className="flex items-center gap-4 bg-primary/10 border border-primary rounded-lg px-4 py-2">
            <Timer className="w-5 h-5 text-primary" />
            <span className="font-semibold text-primary">Active Session</span>
            <span className="ml-2 text-sm text-muted-foreground flex items-center gap-1">
              <Play className="w-4 h-4 inline-block" />
              {(() => {
                // Use tick to force re-render
                void tick;
                const total = getLiveSessionTime();
                const min = Math.floor(total / 60);
                const sec = String(total % 60).padStart(2, "0");
                return `${min}:${sec}`;
              })()}
            </span>
            <button
              className="ml-auto px-3 py-1 rounded bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              onClick={() => navigate("/practice")}
            >
              Return to Practice
            </button>
          </div>
        </Section>
      )}
      <Section spacing="md">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Task Library</h1>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </Button>
        </div>
      </Section>
      <Section spacing="sm">
        <FilterBar
          filters={activeFilters}
          onFilterChange={handleFilterChange}
        />
      </Section>
      <Section spacing="md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <div className="text-2xl font-semibold text-muted-foreground mb-2">
                No tasks found
              </div>
              <div className="text-muted-foreground mb-4">
                Try adjusting your filters or create a new task.
              </div>
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="relative">
                <TaskListItem
                  task={task}
                  onTaskClick={handleTaskClick}
                  onViewDetails={handleViewDetails}
                  hasActiveSession={hasActiveSession}
                  onUseInCurrentSession={
                    hasActiveSession ? handleUseInCurrentSession : undefined
                  }
                />
              </div>
            ))
          )}
        </div>
      </Section>
      {/* Create Task Modal - Always rendered */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
      />
      {/* Modify Task Modal - Always rendered */}
      <CreateTaskModal
        isOpen={isModifyModalOpen}
        onClose={() => {
          setIsModifyModalOpen(false);
          setModifyTaskData(undefined);
        }}
        onSubmit={handleModifySubmit}
        initialData={modifyTaskData}
      />
      {/* Instrument Warning Modal */}
      <Dialog
        open={showInstrumentWarningModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowInstrumentWarningModal(false);
            setTaskWithDifferentInstrument(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hold yer horses!</DialogTitle>
            <DialogDescription>
              This task is designed for a different instrument than you're using
              in your current practice session. To use this task, just "Make it
              your own" in the Task Details view to create a different version
              of it with the instrument of your choosing!
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button
              onClick={() => {
                setShowInstrumentWarningModal(false);
                setTaskWithDifferentInstrument(null);
              }}
              className="w-full"
            >
              Got it
            </Button>
            <Button
              onClick={handleViewTaskDetails}
              className="w-full"
              variant="outline"
            >
              View Task Details
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Toaster position="bottom-center" />
    </Container>
  );
};

export default TaskLibrary;
