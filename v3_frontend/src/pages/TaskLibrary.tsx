import React, { useState } from "react";
import {
  FilterBar,
  FilterState,
  FilterType,
  FilterOption,
} from "../components/filter-bar";
import { TaskListItem, Task } from "../components/task-list-item";

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
      savedCount: 6,
      usedCount: 2,
    },
  ];

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

  return (
    <div className="flex flex-col w-full max-w-full min-w-[320px] px-4 sm:px-6 lg:px-8 mx-auto">
      {/* Filter Bar */}
      <FilterBar filters={activeFilters} onFilterChange={handleFilterChange} />

      {/* Task Library Content */}
      <div className="mt-6 space-y-3">
        {sampleTasks.map((task) => (
          <TaskListItem
            key={task.id}
            task={task}
            onTaskClick={handleTaskClick}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskLibrary;
