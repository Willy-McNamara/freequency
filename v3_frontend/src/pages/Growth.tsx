import React, { useState, useEffect } from "react";
import {
  addWeeks,
  addMonths,
  addYears,
  startOfWeek,
  startOfMonth,
  startOfYear,
  format,
  endOfWeek,
  endOfMonth,
  endOfYear,
  isWithinInterval,
  parseISO,
} from "date-fns";
import { useAuth } from "../components/auth/AuthProvider";
import { apiConfig } from "../config/api";
import {
  TotalStatsView,
  ChronologicalStatsView,
  GoalsView,
  GrowthMenuView,
  formatMinutes,
  calculateGoalProgress,
  formatGoalSummary,
  type TaskInUseMock,
  type Goal,
} from "./Growth/index";

// Define the possible views as a union type
type ViewType = "MENU" | "TOTAL" | "CHRONOLOGICAL" | "GOALS";

// Mock data for demo
const weekData = [
  { label: "Monday", occurrence: 5, duration: 30 },
  { label: "Tuesday", occurrence: 3, duration: 20 },
  { label: "Wednesday", occurrence: 4, duration: 25 },
  { label: "Thursday", occurrence: 2, duration: 15 },
  { label: "Friday", occurrence: 6, duration: 40 },
  { label: "Saturday", occurrence: 7, duration: 50 },
  { label: "Sunday", occurrence: 2, duration: 10 },
];
const monthData = [
  { label: "W1", occurrence: 12, duration: 80 },
  { label: "W2", occurrence: 15, duration: 100 },
  { label: "W3", occurrence: 10, duration: 60 },
  { label: "W4", occurrence: 18, duration: 120 },
];
const yearData = [
  { label: "Jan", occurrence: 40, duration: 200 },
  { label: "Feb", occurrence: 35, duration: 180 },
  { label: "Mar", occurrence: 50, duration: 220 },
  { label: "Apr", occurrence: 30, duration: 150 },
  { label: "May", occurrence: 45, duration: 210 },
  { label: "Jun", occurrence: 38, duration: 170 },
  { label: "Jul", occurrence: 42, duration: 190 },
  { label: "Aug", occurrence: 37, duration: 160 },
  { label: "Sep", occurrence: 44, duration: 200 },
  { label: "Oct", occurrence: 39, duration: 175 },
  { label: "Nov", occurrence: 41, duration: 185 },
  { label: "Dec", occurrence: 48, duration: 230 },
];

const timeRanges = [
  { key: "week", label: "Week", data: weekData },
  { key: "month", label: "Month", data: monthData },
  { key: "year", label: "Year", data: yearData },
] as const;

const totalTimeRanges = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
] as const;

type TimeRange = (typeof timeRanges)[number]["key"];
type TotalTimeRange = (typeof totalTimeRanges)[number]["key"];
type Metric = "occurrence" | "duration";

type TaskInUseApiResponse = {
  duration: number;
  tags: string[];
  createdAt: string;
  sessionId: number;
};

const Growth: React.FC = () => {
  const { user } = useAuth();
  const [view, setView] = useState<ViewType>("MENU");
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>("week");
  const [selectedMetric, setSelectedMetric] = useState<Metric>("occurrence");
  const [selectedTotalRange, setSelectedTotalRange] =
    useState<TotalTimeRange>("week");
  const [selectedTag, setSelectedTag] = useState<string>("All Tags");
  const [userTags, setUserTags] = useState<
    { id: number; label: string; color?: string }[]
  >([]);
  const [allTasksInUse, setAllTasksInUse] = useState<TaskInUseMock[]>([]);
  const [tasksInUse, setTasksInUse] = useState<TaskInUseMock[]>([]); // filtered for current window
  const [currentIndex, setCurrentIndex] = useState(0); // 0 = present, 1 = previous, etc.

  // Goals state
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [newGoal, setNewGoal] = useState<Omit<Goal, "id" | "createdAt">>({
    tag: "All Tags",
    type: "duration",
    target: 30,
    timeFrame: "daily",
  });

  // Back button for subviews
  const handleBack = () => setView("MENU");

  // Place these handlers inside the Growth component:
  function handleDeleteGoal(goalId: string) {
    setGoals((prevGoals) => prevGoals.filter((goal) => goal.id !== goalId));
    console.log(`Deleting goal with ID: ${goalId}`);
  }
  function handleCreateGoal() {
    const newGoalWithId = {
      ...newGoal,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
    };
    setGoals((prevGoals) => [...prevGoals, newGoalWithId]);
    console.log("Creating new goal:", newGoalWithId);
    setIsGoalModalOpen(false);
  }
  function handleEditGoal() {
    setGoals((prevGoals) =>
      prevGoals.map((goal) =>
        goal.id === editingGoal?.id ? editingGoal : goal
      )
    );
    console.log("Editing goal:", editingGoal);
    setIsGoalModalOpen(false);
  }

  // Update API functions to use authenticated user
  function fetchUserTags(): Promise<
    { id: number; label: string; color?: string }[]
  > {
    return fetch(apiConfig.endpoints.tags.all)
      .then((res) => res.json())
      .then((labels: string[]) =>
        labels.map((label, idx) => ({
          id: idx + 1,
          label,
          color: undefined, // Color is not provided by the API
        }))
      );
  }

  // Move fetchAllTasksInUse inside component to access user
  function fetchAllTasksInUse(): Promise<TaskInUseMock[]> {
    // Use authenticated user's ID instead of hardcoded 26
    const musicianId = user?.id || 26; // Fallback to 26 if no user
    return fetch(apiConfig.endpoints.tasksInUse.byMusician(musicianId))
      .then((res) => res.json())
      .then((tasks: TaskInUseApiResponse[]) =>
        tasks.map((t) => ({
          label: "", // Not provided by backend
          occurrence: 1, // Each TaskInUse is one occurrence
          duration: t.duration,
          tags: t.tags || [],
          createdAt:
            typeof t.createdAt === "string"
              ? t.createdAt
              : new Date(t.createdAt).toISOString(),
          sessionId: t.sessionId, // Add sessionId
        }))
      );
  }

  function fetchGoals(musicianId: number): Promise<Goal[]> {
    return fetch(apiConfig.endpoints.musicians.goals(musicianId))
      .then((res) => res.json())
      .then((goals: Goal[]) =>
        goals.map((g) => ({
          ...g,
          id: String(g.id),
          createdAt:
            typeof g.createdAt === "string"
              ? g.createdAt
              : new Date(g.createdAt).toISOString(),
        }))
      );
  }

  // Update useEffect to use authenticated user
  useEffect(() => {
    const musicianId = user?.id || 26; // Fallback to 26 if no user

    fetchUserTags().then((tags) => {
      console.log("[Growth] Tags from API:", tags);
      setUserTags(tags);
    });
    fetchAllTasksInUse().then((tasks) => {
      console.log("[Growth] TasksInUse from API:", tasks);
      setAllTasksInUse(tasks);
    });
    fetchGoals(musicianId).then((goals) => {
      console.log("[Growth] Goals from API:", goals);
      setGoals(goals);
    });
  }, [user]); // Add user as dependency

  // When time range, currentIndex, or allTasksInUse changes, filter for current window
  useEffect(() => {
    const now = new Date();
    let windowStart: Date, windowEnd: Date;
    if (selectedTimeRange === "week") {
      windowStart = startOfWeek(addWeeks(now, -currentIndex), {
        weekStartsOn: 1,
      });
      windowEnd = endOfWeek(addWeeks(now, -currentIndex), { weekStartsOn: 1 });
    } else if (selectedTimeRange === "month") {
      windowStart = startOfMonth(addMonths(now, -currentIndex));
      windowEnd = endOfMonth(addMonths(now, -currentIndex));
    } else {
      windowStart = startOfYear(addYears(now, -currentIndex));
      windowEnd = endOfYear(addYears(now, -currentIndex));
    }
    setTasksInUse(
      allTasksInUse.filter((task) => {
        const date = parseISO(task.createdAt);
        return isWithinInterval(date, { start: windowStart, end: windowEnd });
      })
    );
  }, [selectedTimeRange, currentIndex, allTasksInUse]);

  // Calculate data for Total Stats view
  const calculateTotalStatsData = () => {
    // Aggregate tag totals from allTasksInUse for the selected period
    // 1. Group by tag, sum durations (in seconds)
    const tagTotalsMap: Record<string, number> = {};
    let totalSeconds = 0;
    allTasksInUse.forEach((task) => {
      (task.tags || ["Untagged"]).forEach((tag) => {
        tagTotalsMap[tag] = (tagTotalsMap[tag] || 0) + (task.duration || 0);
        totalSeconds += task.duration || 0;
      });
    });
    // 2. Build tagTotals array (convert seconds to minutes for display)
    const tagTotals = Object.entries(tagTotalsMap)
      .map(([tag, seconds]) => ({
        tag,
        minutes: Math.round(seconds / 60), // Convert seconds to minutes
        seconds, // Keep original seconds for pie chart
        percent:
          totalSeconds > 0 ? Math.round((seconds / totalSeconds) * 100) : 0,
      }))
      .sort((a, b) => b.seconds - a.seconds);
    // 3. Build pie chart data (use seconds for accurate representation)
    const pieChartColors = [
      "#60a5fa", // blue
      "#fbbf24", // yellow
      "#34d399", // green
      "#f472b6", // pink
      "#a78bfa", // purple
      "#f87171", // red
      "#facc15", // gold
      "#38bdf8", // sky
    ];
    const pieData = tagTotals.map((t, i) => ({
      tag: t.tag,
      value: t.seconds, // Use seconds for pie chart
      fill: pieChartColors[i % pieChartColors.length],
    }));

    // Map tag to color for indicator
    const tagColorMap: Record<string, string> = {};
    pieData.forEach((item) => {
      if (typeof item.tag === "string" && typeof item.fill === "string") {
        tagColorMap[item.tag] = item.fill;
      }
    });

    return { tagTotals, pieData, tagColorMap };
  };

  // Calculate data for Chronological Stats view
  const calculateChronologicalStatsData = () => {
    // Full label sets for each time range
    const fullLabels: Record<string, string[]> = {
      week: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      month: ["W1", "W2", "W3", "W4"],
      year: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
    };
    // Filter tasks-in-use by selected tag
    let filteredData = tasksInUse;
    if (selectedTag !== "All Tags") {
      filteredData = tasksInUse.filter((entry) =>
        entry.tags.includes(selectedTag)
      );
    }
    // Assign label based on createdAt and selectedTimeRange
    const labeledData = filteredData.map((entry) => {
      const date = parseISO(entry.createdAt);
      let label = "";
      if (selectedTimeRange === "week") {
        label = format(date, "EEEE"); // "Monday", etc.
      } else if (selectedTimeRange === "month") {
        const weekOfMonth = Math.floor((date.getDate() - 1) / 7) + 1;
        label = `W${weekOfMonth}`;
      } else if (selectedTimeRange === "year") {
        label = format(date, "MMM"); // "Jan", etc.
      }
      return { ...entry, label };
    });
    const currentLabels = fullLabels[selectedTimeRange];
    // Aggregate all records by label for duration (convert seconds to minutes)
    const dataByLabel = labeledData.reduce((acc, entry) => {
      if (!acc[entry.label]) {
        acc[entry.label] = { label: entry.label, occurrence: 0, duration: 0 };
      }
      // Convert seconds to minutes
      acc[entry.label].duration += Math.round((entry.duration || 0) / 60);
      return acc;
    }, {} as Record<string, { label: string; occurrence: number; duration: number }>);

    // For occurrence: count unique sessionIds per label for the selected tag
    const tagSessionMap: Record<string, Set<number>> = {};
    labeledData.forEach((entry) => {
      if (selectedTag === "All Tags" || entry.tags.includes(selectedTag)) {
        if (!tagSessionMap[entry.label]) tagSessionMap[entry.label] = new Set();
        tagSessionMap[entry.label].add(entry.sessionId);
      }
    });

    const chartData = currentLabels.map((label) => {
      if (selectedMetric === "occurrence") {
        return {
          label,
          occurrence: tagSessionMap[label]?.size || 0,
          duration: dataByLabel[label]?.duration || 0,
        };
      } else {
        return dataByLabel[label]
          ? dataByLabel[label]
          : { label, occurrence: 0, duration: 0 };
      }
    });

    // Calculate total for selected metric
    const total = chartData.reduce(
      (sum, entry) => sum + (entry[selectedMetric] as number),
      0
    );
    // Build description string
    let totalString = "";
    if (selectedMetric === "duration") {
      if (total >= 60) {
        const hours = Math.floor(total / 60);
        const minutes = total % 60;
        totalString = `${hours} hr${hours > 1 ? "s" : ""}${
          minutes > 0 ? ` ${minutes} min` : ""
        }`;
      } else {
        totalString = `${total} min`;
      }
    } else {
      totalString = `${total} occurrences`;
    }
    const period =
      selectedTimeRange === "week"
        ? "this week"
        : selectedTimeRange === "month"
        ? "this month"
        : "this year";
    const chartDescription = `${totalString} total ${period}`;

    // Navigation logic
    // Find the earliest and latest periods with data
    const now = new Date();
    let minIndex = 0;
    if (allTasksInUse.length > 0) {
      const allDates = allTasksInUse.map((t) => parseISO(t.createdAt));
      if (selectedTimeRange === "week") {
        const earliest = allDates.reduce((a, b) => (a < b ? a : b));
        minIndex = Math.floor(
          (now.getTime() -
            startOfWeek(earliest, { weekStartsOn: 1 }).getTime()) /
            (7 * 24 * 60 * 60 * 1000)
        );
      } else if (selectedTimeRange === "month") {
        const earliest = allDates.reduce((a, b) => (a < b ? a : b));
        minIndex = Math.floor(
          (now.getFullYear() - earliest.getFullYear()) * 12 +
            (now.getMonth() - earliest.getMonth())
        );
      } else {
        const earliest = allDates.reduce((a, b) => (a < b ? a : b));
        minIndex = now.getFullYear() - earliest.getFullYear();
      }
    }
    // UI for navigation
    const canGoBack = currentIndex < minIndex;
    const canGoForward = currentIndex > 0;
    // Display label for current period
    let periodLabel = "";
    if (selectedTimeRange === "week") {
      const start = startOfWeek(addWeeks(now, -currentIndex), {
        weekStartsOn: 1,
      });
      const end = endOfWeek(addWeeks(now, -currentIndex), { weekStartsOn: 1 });
      periodLabel = `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
    } else if (selectedTimeRange === "month") {
      const start = startOfMonth(addMonths(now, -currentIndex));
      periodLabel = format(start, "MMMM yyyy");
    } else {
      const start = startOfYear(addYears(now, -currentIndex));
      periodLabel = format(start, "yyyy");
    }
    // Build chart title
    const tagDisplay =
      selectedTag === "All Tags" ? "all tags" : selectedTag.toLowerCase();
    const chartTitle =
      selectedMetric === "duration"
        ? `Time spent on ${tagDisplay}`
        : `Sessions including ${tagDisplay}`;

    return {
      chartData,
      chartTitle,
      chartDescription,
      periodLabel,
      canGoBack,
      canGoForward,
    };
  };

  // Render the appropriate view
  if (view === "TOTAL") {
    const { tagTotals, pieData, tagColorMap } = calculateTotalStatsData();

    return (
      <TotalStatsView
        onBack={handleBack}
        selectedTotalRange={selectedTotalRange}
        onRangeChange={setSelectedTotalRange}
        tagTotals={tagTotals}
        pieData={pieData}
        tagColorMap={tagColorMap}
        formatMinutes={formatMinutes}
        totalTimeRanges={totalTimeRanges}
      />
    );
  }

  if (view === "CHRONOLOGICAL") {
    const {
      chartData,
      chartTitle,
      chartDescription,
      periodLabel,
      canGoBack,
      canGoForward,
    } = calculateChronologicalStatsData();

    return (
      <ChronologicalStatsView
        onBack={handleBack}
        selectedTag={selectedTag}
        onTagChange={setSelectedTag}
        userTags={userTags}
        selectedTimeRange={selectedTimeRange}
        onTimeRangeChange={setSelectedTimeRange}
        currentIndex={currentIndex}
        onCurrentIndexChange={setCurrentIndex}
        selectedMetric={selectedMetric}
        onMetricChange={setSelectedMetric}
        chartData={chartData}
        chartTitle={chartTitle}
        chartDescription={chartDescription}
        periodLabel={periodLabel}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        timeRanges={timeRanges}
      />
    );
  }

  if (view === "GOALS") {
    return (
      <GoalsView
        onBack={handleBack}
        goals={goals}
        userTags={userTags}
        isGoalModalOpen={isGoalModalOpen}
        onGoalModalOpenChange={setIsGoalModalOpen}
        editingGoal={editingGoal}
        newGoal={newGoal}
        onNewGoalChange={setNewGoal}
        onEditingGoalChange={setEditingGoal}
        onDeleteGoal={handleDeleteGoal}
        onCreateGoal={handleCreateGoal}
        onEditGoal={handleEditGoal}
        formatGoalSummary={formatGoalSummary}
        calculateGoalProgress={calculateGoalProgress}
        allTasksInUse={allTasksInUse}
      />
    );
  }

  // Default menu view
  return (
    <GrowthMenuView
      allTasksInUse={allTasksInUse}
      goals={goals}
      onViewChange={setView}
      formatMinutes={formatMinutes}
    />
  );
};

export default Growth;
