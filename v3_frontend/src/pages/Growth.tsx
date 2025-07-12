import { ChartBarLabel } from "@/components/bar-chart";
import { ChartPieDonutActive } from "@/components/pie-chart";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardDescription,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  ChevronDownIcon,
  TagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
} from "lucide-react";
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
  startOfDay,
  endOfDay,
} from "date-fns";
import { useAuth } from "../components/auth/AuthProvider";
import { apiConfig } from "../config/api";

// NOTE: If you see a 'Cannot find module "date-fns"' error, run: npm install date-fns

// Define the possible views as a union type
type ViewType = "MENU" | "TOTAL" | "CHRONOLOGICAL" | "GOALS";

// Goal types and interfaces
type GoalType = "duration" | "frequency";
type GoalTimeFrame = "daily" | "weekly" | "monthly" | "annually";

interface Goal {
  id: string;
  tag: string; // "All Tags" or specific tag name
  type: GoalType;
  target: number; // minutes for duration, occurrences for frequency
  timeFrame: GoalTimeFrame;
  createdAt: string;
}

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

// Mock data for tag breakdown (for demo)
// Mock data for tag breakdown (for demo) - unused but kept for reference
// const _tagTotalsMock = {
//   day: [
//     { tag: "Scales", minutes: 40, percent: 40 },
//     { tag: "Arpeggios", minutes: 30, percent: 30 },
//     { tag: "Sight Reading", minutes: 20, percent: 20 },
//     { tag: "Improvisation", minutes: 10, percent: 10 },
//     { tag: "Ear Training", minutes: 15, percent: 12 },
//     { tag: "Transcription", minutes: 12, percent: 8 },
//     { tag: "Repertoire", minutes: 18, percent: 15 },
//     { tag: "Rhythm", minutes: 8, percent: 7 },
//   ],
//   week: [
//     { tag: "Scales", minutes: 200, percent: 33 },
//     { tag: "Arpeggios", minutes: 180, percent: 30 },
//     { tag: "Sight Reading", minutes: 120, percent: 20 },
//     { tag: "Improvisation", minutes: 100, percent: 17 },
//     { tag: "Ear Training", minutes: 90, percent: 14 },
//     { tag: "Transcription", minutes: 80, percent: 12 },
//     { tag: "Repertoire", minutes: 110, percent: 18 },
//     { tag: "Rhythm", minutes: 60, percent: 10 },
//   ],
//   month: [
//     { tag: "Scales", minutes: 800, percent: 32 },
//     { tag: "Arpeggios", minutes: 700, percent: 28 },
//     { tag: "Sight Reading", minutes: 600, percent: 24 },
//     { tag: "Improvisation", minutes: 400, percent: 16 },
//     { tag: "Ear Training", minutes: 350, percent: 14 },
//     { tag: "Transcription", minutes: 300, percent: 12 },
//     { tag: "Repertoire", minutes: 420, percent: 17 },
//     { tag: "Rhythm", minutes: 250, percent: 10 },
//   ],
//   year: [
//     { tag: "Scales", minutes: 9000, percent: 30 },
//     { tag: "Arpeggios", minutes: 8000, percent: 27 },
//     { tag: "Sight Reading", minutes: 7000, percent: 23 },
//     { tag: "Improvisation", minutes: 6000, percent: 20 },
//     { tag: "Ear Training", minutes: 5500, percent: 18 },
//     { tag: "Transcription", minutes: 5000, percent: 15 },
//     { tag: "Repertoire", minutes: 6500, percent: 22 },
//     { tag: "Rhythm", minutes: 4000, percent: 12 },
//   ],
// };

// const pieChartColors = [
//   "#60a5fa", // blue
//   "#fbbf24", // yellow
//   "#34d399", // green
//   "#f472b6", // pink
//   "#a78bfa", // purple
//   "#f87171", // red
//   "#facc15", // gold
//   "#38bdf8", // sky
// ];

// const pieChartDataMock = {
//   day: [
//     { tag: "Scales", value: 40, fill: pieChartColors[0] },
//     { tag: "Arpeggios", value: 30, fill: pieChartColors[1] },
//     { tag: "Sight Reading", value: 20, fill: pieChartColors[2] },
//     { tag: "Improvisation", value: 10, fill: pieChartColors[3] },
//     { tag: "Ear Training", value: 15, fill: pieChartColors[4] },
//     { tag: "Transcription", value: 12, fill: pieChartColors[5] },
//     { tag: "Repertoire", value: 18, fill: pieChartColors[6] },
//     { tag: "Rhythm", value: 8, fill: pieChartColors[7] },
//   ],
//   week: [
//     { tag: "Scales", value: 200, fill: pieChartColors[0] },
//     { tag: "Arpeggios", value: 180, fill: pieChartColors[1] },
//     { tag: "Sight Reading", value: 120, fill: pieChartColors[2] },
//     { tag: "Improvisation", value: 100, fill: pieChartColors[3] },
//     { tag: "Ear Training", value: 90, fill: pieChartColors[4] },
//     { tag: "Transcription", value: 80, fill: pieChartColors[5] },
//     { tag: "Repertoire", value: 110, fill: pieChartColors[6] },
//     { tag: "Rhythm", value: 60, fill: pieChartColors[7] },
//   ],
//   month: [
//     { tag: "Scales", value: 800, fill: pieChartColors[0] },
//     { tag: "Arpeggios", value: 700, fill: pieChartColors[1] },
//     { tag: "Sight Reading", value: 600, fill: pieChartColors[2] },
//     { tag: "Improvisation", value: 400, fill: pieChartColors[3] },
//     { tag: "Ear Training", value: 350, fill: pieChartColors[4] },
//     { tag: "Transcription", value: 300, fill: pieChartColors[5] },
//     { tag: "Repertoire", value: 420, fill: pieChartColors[6] },
//     { tag: "Rhythm", value: 250, fill: pieChartColors[7] },
//   ],
//   year: [
//     { tag: "Scales", value: 9000, fill: pieChartColors[0] },
//     { tag: "Arpeggios", value: 8000, fill: pieChartColors[1] },
//     { tag: "Sight Reading", value: 7000, fill: pieChartColors[2] },
//     { tag: "Improvisation", value: 6000, fill: pieChartColors[3] },
//     { tag: "Ear Training", value: 5500, fill: pieChartColors[4] },
//     { tag: "Transcription", value: 5000, fill: pieChartColors[5] },
//     { tag: "Repertoire", value: 6500, fill: pieChartColors[6] },
//     { tag: "Rhythm", value: 4000, fill: pieChartColors[7] },
//   ],
// };

// Mock tag options for dropdown
// Remove unused variable: tagOptions

function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// TagSelectDropdown component
function TagSelectDropdown({
  options,
  value,
  onChange,
  className = "",
}: {
  options: { id: number; label: string; color?: string }[];
  value: string;
  onChange: (tag: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = options.filter((tag) =>
    tag.label.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <>
      <Button
        variant="outline"
        className={`flex items-center gap-2 min-w-[180px] justify-between ${className}`}
        onClick={() => setOpen(true)}
        type="button"
      >
        <span className="flex items-center gap-2">
          <TagIcon className="w-4 h-4" />
          {value}
        </span>
        <ChevronDownIcon className="w-4 h-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[350px]">
          <DialogHeader>
            <DialogTitle>Select Tag</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Search your tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-2"
          />
          <div className="max-h-60 overflow-y-auto space-y-1">
            {filtered.length === 0 && (
              <div className="text-muted-foreground text-sm py-2 px-1">
                No tags found
              </div>
            )}
            {filtered.map((tag) => (
              <button
                key={tag.id}
                className={`w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors ${
                  tag.label === value ? "bg-primary/10 font-semibold" : ""
                }`}
                onClick={() => {
                  onChange(tag.label);
                  setOpen(false);
                }}
                type="button"
              >
                {tag.label}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Mock API data and functions
// const mockTags = [
//   { id: 1, label: "Scales", color: "#60a5fa" },
//   { id: 2, label: "Arpeggios", color: "#fbbf24" },
//   { id: 3, label: "Sight Reading", color: "#34d399" },
//   { id: 4, label: "Improvisation", color: "#f472b6" },
//   { id: 5, label: "Ear Training", color: "#a78bfa" },
//   { id: 6, label: "Transcription", color: "#f87171" },
//   { id: 7, label: "Repertoire", color: "#facc15" },
//   { id: 8, label: "Rhythm", color: "#38bdf8" },
// ];

type TimeRangeKey = "week" | "month" | "year";
type TaskInUseMock = {
  label: string;
  occurrence: number;
  duration: number;
  tags: string[];
  createdAt: string; // ISO date string
  sessionId: number; // Added for occurrence tracking
};

type TaskInUseApiResponse = {
  duration: number;
  tags: string[];
  createdAt: string;
  sessionId: number; // Added for occurrence tracking
  // ...other fields if needed
};

// Helper to get a date for a given week, month, or year bucket
// function getDateForLabel(
//   label: string,
//   range: TimeRangeKey,
//   baseDate: Date
// ): Date {
//   if (range === "week") {
//     const days = [
//       "Monday",
//       "Tuesday",
//       "Wednesday",
//       "Thursday",
//       "Friday",
//       "Saturday",
//       "Sunday",
//     ];
//     const idx = days.indexOf(label);
//     return addDays(startOfWeek(baseDate, { weekStartsOn: 1 }), idx);
//   }
//   if (range === "month") {
//     const weeks = ["W1", "W2", "W3", "W4"];
//     const idx = weeks.indexOf(label);
//     return addWeeks(startOfMonth(baseDate), idx);
//   }
//   if (range === "year") {
//     const months = [
//       "Jan",
//       "Feb",
//       "Mar",
//       "Apr",
//       "May",
//       "Jun",
//       "Jul",
//       "Aug",
//       "Sep",
//       "Oct",
//       "Nov",
//       "Dec",
//     ];
//     const idx = months.indexOf(label);
//     return addMonths(startOfYear(baseDate), idx);
//   }
//   return baseDate;
// }

// Generate mock tasks-in-use with createdAt dates for the last 8 weeks, 6 months, 2 years
// function generateMockTasksInUse(): TaskInUseMock[] {
//   const now = new Date();
//   const tasks: TaskInUseMock[] = [];
//   // Weeks
//   for (let w = 0; w < 8; w++) {
//     const weekStart = subWeeks(startOfWeek(now, { weekStartsOn: 1 }), w);
//     [
//       "Monday",
//       "Tuesday",
//       "Wednesday",
//       "Thursday",
//       "Friday",
//       "Saturday",
//       "Sunday",
//     ].forEach((day, i) => {
//       if (Math.random() > 0.6) return; // skip some days for realism
//       const date = addDays(weekStart, i);
//       tasks.push({
//         label: day,
//         occurrence: Math.floor(Math.random() * 8),
//         duration: Math.floor(Math.random() * 60),
//         tags: [mockTags[Math.floor(Math.random() * mockTags.length)].label],
//         createdAt: date.toISOString(),
//         sessionId: Math.floor(Math.random() * 100), // Mock sessionId
//       });
//     });
//   }
//   // Months
//   for (let m = 0; m < 6; m++) {
//     const monthStart = subMonths(startOfMonth(now), m);
//     ["W1", "W2", "W3", "W4"].forEach((week, i) => {
//       if (Math.random() > 0.5) return;
//       const date = addWeeks(monthStart, i);
//       tasks.push({
//         label: week,
//         occurrence: Math.floor(Math.random() * 20),
//         duration: Math.floor(Math.random() * 200),
//         tags: [mockTags[Math.floor(Math.random() * mockTags.length)].label],
//         createdAt: date.toISOString(),
//         sessionId: Math.floor(Math.random() * 100), // Mock sessionId
//       });
//     });
//   }
//   // Years
//   for (let y = 0; y < 2; y++) {
//     const yearStart = subYears(startOfYear(now), y);
//     [
//       "Jan",
//       "Feb",
//       "Mar",
//       "Apr",
//       "May",
//       "Jun",
//       "Jul",
//       "Aug",
//       "Sep",
//       "Oct",
//       "Nov",
//       "Dec",
//     ].forEach((month, i) => {
//       if (Math.random() > 0.4) return;
//       const date = addMonths(yearStart, i);
//       tasks.push({
//         label: month,
//         occurrence: Math.floor(Math.random() * 50),
//         duration: Math.floor(Math.random() * 500),
//         tags: [mockTags[Math.floor(Math.random() * mockTags.length)].label],
//         createdAt: date.toISOString(),
//         sessionId: Math.floor(Math.random() * 100), // Mock sessionId
//       });
//     });
//   }
//   return tasks;
// }

// Goal calculation functions
function calculateGoalProgress(
  goal: Goal,
  tasksInUse: TaskInUseMock[]
): number {
  const now = new Date();
  let periodStart: Date, periodEnd: Date;

  // Determine the current period based on goal timeFrame
  switch (goal.timeFrame) {
    case "daily":
      periodStart = startOfDay(now);
      periodEnd = endOfDay(now);
      break;
    case "weekly":
      periodStart = startOfWeek(now, { weekStartsOn: 1 });
      periodEnd = endOfWeek(now, { weekStartsOn: 1 });
      break;
    case "monthly":
      periodStart = startOfMonth(now);
      periodEnd = endOfMonth(now);
      break;
    case "annually":
      periodStart = startOfYear(now);
      periodEnd = endOfYear(now);
      break;
  }

  // Filter tasks within the current period
  const periodTasks = tasksInUse.filter((task) => {
    const taskDate = parseISO(task.createdAt);
    return isWithinInterval(taskDate, { start: periodStart, end: periodEnd });
  });

  // Filter by tag if goal is tag-specific
  const relevantTasks =
    goal.tag === "All Tags"
      ? periodTasks
      : periodTasks.filter((task) => task.tags.includes(goal.tag));

  // Calculate progress based on goal type
  if (goal.type === "duration") {
    const totalMinutes = relevantTasks.reduce(
      (sum, task) => sum + task.duration,
      0
    );
    return Math.min(totalMinutes, goal.target);
  } else {
    const totalOccurrences = relevantTasks.reduce(
      (sum, task) => sum + task.occurrence,
      0
    );
    return Math.min(totalOccurrences, goal.target);
  }
}

function formatGoalSummary(goal: Goal): string {
  const tagDisplay =
    goal.tag === "All Tags" ? "all tags" : goal.tag.toLowerCase();
  const typeDisplay = goal.type === "duration" ? "minutes" : "sessions";
  const timeFrameDisplay =
    goal.timeFrame.charAt(0).toUpperCase() + goal.timeFrame.slice(1);

  return `${tagDisplay} | ${goal.target} ${typeDisplay} | ${timeFrameDisplay}`;
}

// Mock API functions - removed duplicates, see updated versions inside component

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

  if (view === "TOTAL") {
    // Aggregate tag totals from allTasksInUse for the selected period
    // 1. Group by tag, sum durations
    const tagTotalsMap: Record<string, number> = {};
    let totalMinutes = 0;
    allTasksInUse.forEach((task) => {
      (task.tags || ["Untagged"]).forEach((tag) => {
        tagTotalsMap[tag] = (tagTotalsMap[tag] || 0) + (task.duration || 0);
        totalMinutes += task.duration || 0;
      });
    });
    // 2. Build tagTotals array
    const tagTotals = Object.entries(tagTotalsMap)
      .map(([tag, minutes]) => ({
        tag,
        minutes,
        percent:
          totalMinutes > 0 ? Math.round((minutes / totalMinutes) * 100) : 0,
      }))
      .sort((a, b) => b.minutes - a.minutes);
    // 3. Build pie chart data
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
      value: t.minutes,
      fill: pieChartColors[i % pieChartColors.length],
    }));
    // Map tag to color for indicator
    const tagColorMap: Record<string, string> = {};
    pieData.forEach((item) => {
      if (typeof item.tag === "string" && typeof item.fill === "string") {
        tagColorMap[item.tag] = item.fill;
      }
    });
    return (
      <div className="w-[75vw] mx-auto">
        <div className="flex justify-start mb-2">
          <Button
            onClick={handleBack}
            variant="ghost"
            className="text-sm text-muted-foreground"
          >
            &larr; Back
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-center mb-4">Stats Totals</h1>
        {/* Time range buttons */}
        <div className="flex justify-center gap-3 mb-4">
          {totalTimeRanges.map((range) => (
            <Button
              key={range.key}
              onClick={() => setSelectedTotalRange(range.key)}
              variant={selectedTotalRange === range.key ? "default" : "outline"}
              className={
                selectedTotalRange === range.key
                  ? "font-semibold"
                  : "font-normal"
              }
            >
              {range.label}
            </Button>
          ))}
        </div>
        {/* Pie Chart */}
        <div className="flex justify-center mb-8">
          <ChartPieDonutActive data={pieData} />
        </div>
        {/* Tag breakdown cards */}
        <div className="flex flex-col gap-4">
          {tagTotals.map((tag) => (
            <Card
              key={tag.tag}
              className="flex flex-row items-center justify-between p-4 group"
            >
              <div className="flex items-center gap-3">
                {/* Color indicator */}
                <span
                  className="inline-block w-4 h-4 rounded-full border"
                  style={{ backgroundColor: tagColorMap[tag.tag] || "#ccc" }}
                />
                <div>
                  <CardTitle className="text-lg font-semibold mb-1">
                    {tag.tag}
                  </CardTitle>
                  <CardDescription>
                    Total: {formatMinutes(tag.minutes)}
                  </CardDescription>
                </div>
              </div>
              <div className="text-xl font-bold text-primary">
                {tag.percent}%
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (view === "CHRONOLOGICAL") {
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
    // Aggregate all records by label for duration
    const dataByLabel = labeledData.reduce((acc, entry) => {
      if (!acc[entry.label]) {
        acc[entry.label] = { label: entry.label, occurrence: 0, duration: 0 };
      }
      acc[entry.label].duration += entry.duration || 0;
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
    console.log("[Chronological] chartData:", chartData);
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
    return (
      <div className="w-[75vw]">
        <div className="flex justify-start mb-2">
          <button
            onClick={handleBack}
            className="text-sm text-muted-foreground hover:underline"
          >
            &larr; Back
          </button>
        </div>
        <h1 className="text-2xl font-bold text-center mb-4">
          Chronological Stats
        </h1>
        {/* Tag filter dropdown */}
        <div className="flex justify-center mb-4">
          <TagSelectDropdown
            options={[{ id: 0, label: "All Tags" }, ...userTags]}
            value={selectedTag}
            onChange={setSelectedTag}
          />
        </div>
        {/* Time navigation */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            className="p-2 rounded-full border disabled:opacity-50"
            onClick={() => setCurrentIndex((i) => i + 1)}
            disabled={!canGoBack}
            aria-label="Previous"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <span className="font-semibold text-base min-w-[120px] text-center">
            {periodLabel}
          </span>
          <button
            className="p-2 rounded-full border disabled:opacity-50"
            onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
            disabled={!canGoForward}
            aria-label="Next"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
        {/* Time range buttons */}
        <div className="flex justify-center gap-3 mb-4">
          {timeRanges.map((range) => (
            <button
              key={range.key}
              onClick={() => {
                setSelectedTimeRange(range.key as TimeRangeKey);
                setCurrentIndex(0);
              }}
              className={`px-4 py-2 rounded-md border transition-colors duration-150 focus:outline-none ${
                selectedTimeRange === range.key
                  ? "border-primary bg-muted font-semibold"
                  : "border-border bg-background font-normal hover:bg-muted/50"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
        {/* Chart */}
        <ChartBarLabel
          data={chartData}
          xAxisKey="label"
          yAxisKey={selectedMetric}
          title={chartTitle}
          description={chartDescription}
        />
        {/* Metric buttons */}
        <div className="flex gap-3 mt-4 justify-center">
          <button
            onClick={() => setSelectedMetric("occurrence")}
            className={`px-4 py-2 rounded-md border transition-colors duration-150 focus:outline-none ${
              selectedMetric === "occurrence"
                ? "border-primary bg-muted font-semibold"
                : "border-border bg-background font-normal hover:bg-muted/50"
            }`}
          >
            Occurrences
          </button>
          <button
            onClick={() => setSelectedMetric("duration")}
            className={`px-4 py-2 rounded-md border transition-colors duration-150 focus:outline-none ${
              selectedMetric === "duration"
                ? "border-primary bg-muted font-semibold"
                : "border-border bg-background font-normal hover:bg-muted/50"
            }`}
          >
            Duration (min)
          </button>
        </div>
      </div>
    );
  }

  if (view === "GOALS") {
    // Add Goal Button
    const openCreateModal = () => {
      setEditingGoal(null);
      setIsGoalModalOpen(true);
    };
    const openEditModal = (goal: Goal) => {
      setEditingGoal(goal);
      setIsGoalModalOpen(true);
    };
    return (
      <div className="w-[75vw] mx-auto">
        <div className="flex justify-start mb-2">
          <Button
            onClick={handleBack}
            variant="ghost"
            className="text-sm text-muted-foreground"
          >
            &larr; Back
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-center mb-4">Goals</h1>
        {/* Add Goal Button */}
        <div className="flex justify-center mb-6">
          <Button onClick={openCreateModal} className="flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Add Goal
          </Button>
        </div>
        {/* Goals List */}
        <div className="space-y-4">
          {goals.map((goal) => {
            const progress = calculateGoalProgress(goal, allTasksInUse);
            const progressPercentage = Math.min(
              (progress / goal.target) * 100,
              100
            );
            const isComplete = progress >= goal.target;
            return (
              <Card
                key={goal.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => openEditModal(goal)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold mb-2">
                        {formatGoalSummary(goal)}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          Progress: {progress} / {goal.target}{" "}
                          {goal.type === "duration" ? "minutes" : "sessions"}
                        </span>
                        <span
                          className={`font-semibold ${
                            isComplete ? "text-green-600" : "text-blue-600"
                          }`}
                        >
                          {Math.round(progressPercentage)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(goal);
                        }}
                      >
                        <EditIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGoal(goal.id);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isComplete ? "bg-green-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        {/* Goal Modal */}
        <Dialog open={isGoalModalOpen} onOpenChange={setIsGoalModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingGoal ? "Edit Goal" : "Create New Goal"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Tag Selection */}
              <div className="grid gap-2">
                <label className="text-sm font-medium">Tag</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={editingGoal?.tag || newGoal.tag}
                  onChange={(e) => {
                    if (editingGoal) {
                      setEditingGoal({ ...editingGoal, tag: e.target.value });
                    } else {
                      setNewGoal({ ...newGoal, tag: e.target.value });
                    }
                  }}
                >
                  <option value="All Tags">All Tags</option>
                  {userTags.map((tag) => (
                    <option key={tag.id} value={tag.label}>
                      {tag.label}
                    </option>
                  ))}
                </select>
              </div>
              {/* Goal Type */}
              <div className="grid gap-2">
                <label className="text-sm font-medium">Goal Type</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={editingGoal?.type || newGoal.type}
                  onChange={(e) => {
                    if (editingGoal) {
                      setEditingGoal({
                        ...editingGoal,
                        type: e.target.value as GoalType,
                      });
                    } else {
                      setNewGoal({
                        ...newGoal,
                        type: e.target.value as GoalType,
                      });
                    }
                  }}
                >
                  <option value="duration">Duration (minutes)</option>
                  <option value="frequency">Frequency (sessions)</option>
                </select>
              </div>
              {/* Target Amount */}
              <div className="grid gap-2">
                <label className="text-sm font-medium">Target Amount</label>
                <Input
                  type="number"
                  min="1"
                  value={editingGoal?.target || newGoal.target}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    if (editingGoal) {
                      setEditingGoal({ ...editingGoal, target: value });
                    } else {
                      setNewGoal({ ...newGoal, target: value });
                    }
                  }}
                />
              </div>
              {/* Time Frame */}
              <div className="grid gap-2">
                <label className="text-sm font-medium">Time Frame</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={editingGoal?.timeFrame || newGoal.timeFrame}
                  onChange={(e) => {
                    if (editingGoal) {
                      setEditingGoal({
                        ...editingGoal,
                        timeFrame: e.target.value as GoalTimeFrame,
                      });
                    } else {
                      setNewGoal({
                        ...newGoal,
                        timeFrame: e.target.value as GoalTimeFrame,
                      });
                    }
                  }}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="annually">Annually</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsGoalModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={editingGoal ? handleEditGoal : handleCreateGoal}
                disabled={
                  editingGoal
                    ? !editingGoal.target || editingGoal.target <= 0
                    : !newGoal.target || newGoal.target <= 0
                }
              >
                {editingGoal ? "Save Changes" : "Create Goal"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="w-[75vw] mx-auto">
      <h1 className="text-2xl font-bold text-center mb-4">Growth</h1>
      <p className="text-center text-muted-foreground mb-6">
        Track your musical practice over time.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 text-center flex flex-col items-center justify-between">
          <CardTitle className="text-lg font-semibold mb-2">
            Total Practice Time
          </CardTitle>
          <p className="text-4xl font-bold text-primary mb-2">
            {formatMinutes(
              allTasksInUse.reduce((sum, task) => sum + task.duration, 0)
            )}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Across all sessions
          </p>
          <Button onClick={() => setView("TOTAL")} className="mt-auto">
            View Totals
          </Button>
        </Card>
        <Card className="p-6 text-center flex flex-col items-center justify-between">
          <CardTitle className="text-lg font-semibold mb-2">
            Total Sessions
          </CardTitle>
          <p className="text-4xl font-bold text-primary mb-2">
            {allTasksInUse.length}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            For the selected period
          </p>
          <Button onClick={() => setView("CHRONOLOGICAL")} className="mt-auto">
            View Chronological
          </Button>
        </Card>
        <Card className="p-6 text-center flex flex-col items-center justify-between">
          <CardTitle className="text-lg font-semibold mb-2">
            Active Goals
          </CardTitle>
          <p className="text-4xl font-bold text-primary mb-2">{goals.length}</p>
          <p className="text-sm text-muted-foreground mb-4">
            Set for your practice
          </p>
          <Button onClick={() => setView("GOALS")} className="mt-auto">
            Manage Goals
          </Button>
        </Card>
      </div>
      {/* Remove the row of buttons below the cards */}
      {/*
      <div className="mt-8 flex justify-center gap-4">
        <Button onClick={() => setView("TOTAL")} className="w-full md:w-auto">
          View Totals
        </Button>
        <Button
          onClick={() => setView("CHRONOLOGICAL")}
          className="w-full md:w-auto"
        >
          View Chronological
        </Button>
        <Button onClick={() => setView("GOALS")} className="w-full md:w-auto">
          Manage Goals
        </Button>
      </div>
      */}
    </div>
  );
};

export default Growth;
