import React, { useState, useEffect } from "react";
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
import { Plus } from "lucide-react";

const TaskLibrary: React.FC = () => {
  // Sample task data
  const sampleTasks: Task[] = [
    {
      id: 1,
      title: "Warmup Routine",
      description:
        "A comprehensive warmup routine focusing on major/minor scales and arpeggios. Perfect for daily practice sessions.",
      instrument: "Guitar",
      user: {
        displayName: "John Doe",
        avatarUrl: "https://via.placeholder.com/150/FF6B6B/FFFFFF?text=JD",
      },
      tags: [
        { id: 1, label: "Warmup" },
        { id: 2, label: "Scales" },
        { id: 3, label: "Technique" },
      ],
      checklist: [
        "C major scale - 2 octaves",
        "G major scale - 2 octaves",
        "A minor scale - 2 octaves",
        "C major arpeggio - 2 octaves",
        "G major arpeggio - 2 octaves",
      ],
      savedCount: 12,
      usedCount: 5,
    },
    {
      id: 2,
      title: "Jazz Standards Practice",
      description:
        "Practice common jazz standards with focus on chord progressions and improvisation techniques.",
      instrument: "Piano",
      user: {
        displayName: "Jane Smith",
        avatarUrl: "https://via.placeholder.com/150/4ECDC4/FFFFFF?text=JS",
      },
      tags: [
        { id: 4, label: "Jazz" },
        { id: 5, label: "Improvisation" },
        { id: 6, label: "Standards" },
      ],
      checklist: [
        "Learn melody by ear",
        "Practice chord voicings",
        "Work on left hand comping",
        "Improvise over changes",
        "Record and review performance",
      ],
      savedCount: 8,
      usedCount: 3,
    },
    {
      id: 3,
      title: "Drum Groove Practice",
      description:
        "Practice essential drum grooves and fills for rock and pop music.",
      instrument: "Drums",
      user: {
        displayName: "Bob Johnson",
        avatarUrl: "https://via.placeholder.com/150/45B7D1/FFFFFF?text=BJ",
      },
      tags: [
        { id: 7, label: "Grooves" },
        { id: 8, label: "Rock" },
        { id: 9, label: "Fills" },
      ],
      checklist: [
        "Basic rock beat - 4/4 time",
        "Add hi-hat variations",
        "Practice crash cymbal placement",
        "Work on tom-tom fills",
        "Play along with backing track",
      ],
      savedCount: 15,
      usedCount: 7,
    },
    {
      id: 4,
      title: "Bass Line Construction",
      description:
        "Learn to construct walking bass lines and understand harmonic movement.",
      instrument: "Bass",
      user: {
        displayName: "Alice Wilson",
        avatarUrl: "https://via.placeholder.com/150/FF8A80/FFFFFF?text=AW",
      },
      tags: [
        { id: 10, label: "Walking" },
        { id: 11, label: "Harmony" },
        { id: 12, label: "Theory" },
      ],
      checklist: [
        "Study chord progressions",
        "Practice root-fifth patterns",
        "Add passing tones",
        "Work on chromatic approaches",
        "Play with jazz backing track",
      ],
      savedCount: 6,
      usedCount: 2,
    },
  ];

  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
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
      prev.map((filter) =>
        filter.type === filterType
          ? { ...filter, isSelected, options: options || filter.options }
          : filter
      )
    );

    // Here you would typically filter your task library based on the new filter state
    console.log(`Task Library Filter ${filterType} changed:`, {
      isSelected,
      options,
    });
  };

  const handleTaskClick = (taskId: number) => {
    console.log("Task clicked:", taskId);
    // Here you would typically navigate to the task detail page or open a modal
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

  const handleCreateTask = (taskData: CreateTaskData) => {
    // Create new task with generated ID and current user info
    const newTask: Task = {
      id: Math.max(...tasks.map((t) => t.id)) + 1, // Generate new ID
      title: taskData.title,
      description: taskData.description,
      instrument: taskData.instrument,
      user: {
        displayName: "Current User", // This would come from auth context
        avatarUrl: "https://via.placeholder.com/150/4ECDC4/FFFFFF?text=CU",
      },
      tags: taskData.tags.map((tag, index) => ({
        id:
          Math.max(...tasks.flatMap((t) => t.tags.map((tag) => tag.id))) +
          index +
          1,
        label: tag,
      })),
      checklist: taskData.checklist,
      savedCount: 0,
      usedCount: 0,
    };

    // Add to tasks list
    setTasks((prev) => [newTask, ...prev]);
    console.log("New task added to library:", newTask);
  };

  const handleModifyTask = (task: Task) => {
    console.log("handleModifyTask called with task:", task);
    // Convert task to CreateTaskData format
    const taskData: CreateTaskData = {
      title: task.title,
      description: task.description,
      instrument: task.instrument,
      tags: task.tags.map((tag) => tag.label),
      checklist: task.checklist,
    };

    console.log("Setting modify task data:", taskData);
    setModifyTaskData(taskData);
    setIsModifyModalOpen(true);
    console.log("Modal should now be open");
  };

  const handleModifySubmit = (taskData: CreateTaskData) => {
    // Create new task from modified data
    const newTask: Task = {
      id: Math.max(...tasks.map((t) => t.id)) + 1, // Generate new ID
      title: taskData.title,
      description: taskData.description,
      instrument: taskData.instrument,
      user: {
        displayName: "Current User", // This would come from auth context
        avatarUrl: "https://via.placeholder.com/150/4ECDC4/FFFFFF?text=CU",
      },
      tags: taskData.tags.map((tag, index) => ({
        id:
          Math.max(...tasks.flatMap((t) => t.tags.map((tag) => tag.id))) +
          index +
          1,
        label: tag,
      })),
      checklist: taskData.checklist,
      savedCount: 0,
      usedCount: 0,
    };

    // Add to tasks list
    setTasks((prev) => [newTask, ...prev]);
    console.log("Modified task added to library:", newTask);
  };

  // Find the selected task
  const selectedTask = selectedTaskId
    ? tasks.find((task) => task.id === selectedTaskId)
    : null;

  return (
    <>
      {/* Show detailed view if a task is selected */}
      {selectedTask ? (
        <TaskDetail
          task={selectedTask}
          onBack={handleBackToLibrary}
          onModifyTask={handleModifyTask}
        />
      ) : (
        /* Show task library view */
        <div className="flex flex-col w-full max-w-full min-w-[320px] px-4 sm:px-6 lg:px-8 mx-auto">
          {/* Filter Bar and Create Button Row */}
          <div className="flex items-center justify-between mb-6">
            <FilterBar
              filters={activeFilters}
              onFilterChange={handleFilterChange}
            />
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Task
            </button>
          </div>

          {/* Task Library Content */}
          <div className="mt-6 space-y-3">
            {tasks.map((task) => (
              <TaskListItem
                key={task.id}
                task={task}
                onTaskClick={handleTaskClick}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </div>
      )}

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
        isModifying={true}
      />
    </>
  );
};

export default TaskLibrary;
