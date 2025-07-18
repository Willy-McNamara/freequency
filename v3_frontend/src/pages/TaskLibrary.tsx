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
import { useAuth } from "../components/auth/AuthProvider";
import { ALL_INSTRUMENTS } from "../types/instruments.types";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

const TaskLibrary: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [modifyTaskData, setModifyTaskData] = useState<
    CreateTaskData | undefined
  >(undefined);
  const isSettingFromUrl = useRef(false);
  const previousFilterState = useRef<string>("");
  const hasProcessedUrlParam = useRef(false);
  const shouldFetchAfterUrlParam = useRef(false);
  const { user } = useAuth();
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

      const response = await fetch(url, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTasks(Array.isArray(data) ? data : []);
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
        const response = await fetch(apiConfig.endpoints.musicians.allIdNames, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        // Assume data is an array of { id, displayName }
        setUserOptions(
          data.map((user: { id: number; displayName: string }) => ({
            id: String(user.id),
            label: user.displayName,
            checked: false,
          }))
        );
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

  // Handle user parameter from URL - set filter only
  useEffect(() => {
    const userParam = searchParams.get("user");

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
  }, [searchParams]); // Removed fetchTasks from dependencies

  const handleTaskClick = () => {
    // No-op for now
  };

  const handleUseInCurrentSession = (task: Task) => {
    if (!session) return;
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
  };

  const handleViewDetails = (taskId: number) => {
    // Update URL with task ID
    const newUrl = `${window.location.pathname}?task=${taskId}`;
    window.history.pushState({}, "", newUrl);
    setSelectedTaskId(taskId);
  };

  const handleBackToLibrary = () => {
    // Remove task ID from URL
    const newUrl = window.location.pathname;
    window.history.pushState({}, "", newUrl);
    setSelectedTaskId(null);
    // Refetch tasks using current filters
    fetchTasks(activeFilters);
  };

  const handleCreateTask = async (taskData: CreateTaskData) => {
    try {
      const response = await fetch(apiConfig.endpoints.tasks, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newTask = await response.json();

      // Add the new task to the beginning of the list
      setTasks((prev) => [newTask, ...prev]);

      setIsCreateModalOpen(false);
    } catch (err) {
      console.error("Error creating task:", err);
      alert("Failed to create task. Please try again.");
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
    };
    setModifyTaskData(modifyData);
    setIsModifyModalOpen(true);
  };

  const handleModifySubmit = async (taskData: CreateTaskData) => {
    try {
      const response = await fetch(apiConfig.endpoints.tasks, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newTask = await response.json();

      // Add the new task to the beginning of the list
      setTasks((prev) => [newTask, ...prev]);

      setIsModifyModalOpen(false);
      setModifyTaskData(undefined);
    } catch (err) {
      console.error("Error creating modified task:", err);
      alert("Failed to create modified task. Please try again.");
    }
  };

  // Find the selected task
  const selectedTask = selectedTaskId
    ? tasks.find((task) => task.id === selectedTaskId)
    : null;

  // Helper: get total session time (sum of all task timeSpent)
  const getSessionTime = () => {
    if (!session) return 0;
    return session.sessionTimerSeconds || 0;
  };

  const hasActiveSession = session && session.isActive;

  if (loading) {
    return (
      <Container>
        <Section spacing="lg">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading tasks...</p>
            </div>
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
                const total = getSessionTime();
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
    </Container>
  );
};

export default TaskLibrary;
