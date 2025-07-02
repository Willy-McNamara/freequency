import React, { useState, useEffect, useContext } from "react";
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
import { Pause, Timer } from "lucide-react";

const TaskLibrary: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [modifyTaskData, setModifyTaskData] = useState<
    CreateTaskData | undefined
  >(undefined);

  const [activeFilters, setActiveFilters] = useState<FilterState[]>([
    {
      type: "user",
      isSelected: false,
      options: [
        { id: "user1", label: "John Doe", checked: false },
        { id: "user2", label: "Jane Smith", checked: false },
        { id: "user3", label: "Bob Johnson", checked: false },
      ],
    },
    {
      type: "instrument",
      isSelected: false,
      options: [
        { id: "guitar", label: "Guitar", checked: false },
        { id: "piano", label: "Piano", checked: false },
        { id: "drums", label: "Drums", checked: false },
        { id: "bass", label: "Bass", checked: false },
      ],
    },
    { type: "saved", isSelected: false },
  ]);

  // Get task ID from URL query parameter
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const session = useContext(SessionContext);
  const navigate = useNavigate();

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("http://localhost:3000/tasks");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setTasks(data);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
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
          const updatedOptions = options || filter.options;
          // Check if any options are actually selected
          const hasSelectedOptions =
            updatedOptions?.some((option) => option.checked) || false;

          return {
            ...filter,
            isSelected: hasSelectedOptions, // Only highlight if options are actually selected
            options: updatedOptions,
          };
        }
        return filter;
      })
    );
  };

  // Apply filters to tasks
  const filteredTasks = tasks.filter((task) => {
    // User filter
    const userFilter = activeFilters.find((f) => f.type === "user");
    if (userFilter?.isSelected && userFilter.options) {
      const selectedUsers = userFilter.options
        .filter((option) => option.checked)
        .map((option) => option.label);
      if (
        selectedUsers.length > 0 &&
        !selectedUsers.includes(task.user.displayName)
      ) {
        return false;
      }
    }

    // Instrument filter
    const instrumentFilter = activeFilters.find((f) => f.type === "instrument");
    if (instrumentFilter?.isSelected && instrumentFilter.options) {
      const selectedInstruments = instrumentFilter.options
        .filter((option) => option.checked)
        .map((option) => option.label);
      if (
        selectedInstruments.length > 0 &&
        !selectedInstruments.includes(task.instrument)
      ) {
        return false;
      }
    }

    // Saved filter (show only tasks with savedCount > 0)
    const savedFilter = activeFilters.find((f) => f.type === "saved");
    if (savedFilter?.isSelected && task.savedCount === 0) {
      return false;
    }

    return true;
  });

  // Update filter options based on available data
  useEffect(() => {
    if (tasks.length > 0) {
      // Get unique users from tasks
      const uniqueUsers = [
        ...new Set(tasks.map((task) => task.user.displayName)),
      ];
      const userOptions = uniqueUsers.map((user) => ({
        id: user.toLowerCase().replace(/\s+/g, ""),
        label: user,
        checked: false,
      }));

      // Get unique instruments from tasks
      const uniqueInstruments = [
        ...new Set(tasks.map((task) => task.instrument)),
      ];
      const instrumentOptions = uniqueInstruments.map((instrument) => ({
        id: instrument.toLowerCase(),
        label: instrument,
        checked: false,
      }));

      setActiveFilters((prev) =>
        prev.map((filter) => {
          if (filter.type === "user") {
            return { ...filter, options: userOptions };
          }
          if (filter.type === "instrument") {
            return { ...filter, options: instrumentOptions };
          }
          return filter;
        })
      );
    }
  }, [tasks]);

  const handleTaskClick = () => {
    // No-op for now
  };

  const handleUseInCurrentSession = (task: Task) => {
    if (!session) return;
    // Add the task to the session if not already present
    console.log("logging checklist in handleUseInSesh :", task.checklist);
    if (!session.tasks.some((t) => t.id === String(task.id))) {
      session.setTasks([
        ...session.tasks,
        {
          id: String(task.id),
          title: task.title,
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
  };

  const handleCreateTask = async (taskData: CreateTaskData) => {
    try {
      const response = await fetch("http://localhost:3000/tasks", {
        method: "POST",
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

      console.log("Task created successfully:", newTask);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error("Error creating task:", err);
      alert("Failed to create task. Please try again.");
    }
  };

  const handleModifyTask = (task: Task) => {
    console.log("Modifying task:", task);
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
      console.log("Submitting modified task:", taskData);

      const response = await fetch("http://localhost:3000/tasks", {
        method: "POST",
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

      console.log("Modified task created successfully:", newTask);
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
    if (!session || !session.tasks.length) return 0;
    return session.tasks.reduce((sum, t) => sum + (t.timeSpent || 0), 0);
  };

  const hasActiveSession = session && session.isActive;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
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
      </div>
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
      </>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      {/* Active Session Indicator */}
      {hasActiveSession && (
        <div className="flex items-center gap-4 bg-primary/10 border border-primary rounded-lg px-4 py-2 mt-4 mb-2">
          <Timer className="w-5 h-5 text-primary" />
          <span className="font-semibold text-primary">Active Session</span>
          <span className="ml-2 text-sm text-muted-foreground flex items-center gap-1">
            <Pause className="w-4 h-4 inline-block" />
            {Math.floor(getSessionTime() / 60)}:
            {String(getSessionTime() % 60).padStart(2, "0")}
          </span>
          <button
            className="ml-auto px-3 py-1 rounded bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            onClick={() => navigate("/practice")}
          >
            Return to Practice
          </button>
        </div>
      )}
      <FilterBar filters={activeFilters} onFilterChange={handleFilterChange} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTasks.map((task) => (
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
        ))}
      </div>

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
    </div>
  );
};

export default TaskLibrary;
