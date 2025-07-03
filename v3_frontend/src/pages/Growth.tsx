import { ChartBarLabel } from "@/components/bar-chart";
import { ChartPieDonutActive } from "@/components/pie-chart";
import React, { useState, useEffect } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  startOfWeek,
  startOfMonth,
  startOfYear,
  format,
  subWeeks,
  subMonths,
  subYears,
  endOfWeek,
  endOfMonth,
  endOfYear,
  isWithinInterval,
  parseISO,
} from "date-fns";

// NOTE: If you see a 'Cannot find module "date-fns"' error, run: npm install date-fns

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

// Mock data for tag breakdown (for demo)
const tagTotalsMock = {
  day: [
    { tag: "Scales", minutes: 40, percent: 40 },
    { tag: "Arpeggios", minutes: 30, percent: 30 },
    { tag: "Sight Reading", minutes: 20, percent: 20 },
    { tag: "Improvisation", minutes: 10, percent: 10 },
    { tag: "Ear Training", minutes: 15, percent: 12 },
    { tag: "Transcription", minutes: 12, percent: 8 },
    { tag: "Repertoire", minutes: 18, percent: 15 },
    { tag: "Rhythm", minutes: 8, percent: 7 },
  ],
  week: [
    { tag: "Scales", minutes: 200, percent: 33 },
    { tag: "Arpeggios", minutes: 180, percent: 30 },
    { tag: "Sight Reading", minutes: 120, percent: 20 },
    { tag: "Improvisation", minutes: 100, percent: 17 },
    { tag: "Ear Training", minutes: 90, percent: 14 },
    { tag: "Transcription", minutes: 80, percent: 12 },
    { tag: "Repertoire", minutes: 110, percent: 18 },
    { tag: "Rhythm", minutes: 60, percent: 10 },
  ],
  month: [
    { tag: "Scales", minutes: 800, percent: 32 },
    { tag: "Arpeggios", minutes: 700, percent: 28 },
    { tag: "Sight Reading", minutes: 600, percent: 24 },
    { tag: "Improvisation", minutes: 400, percent: 16 },
    { tag: "Ear Training", minutes: 350, percent: 14 },
    { tag: "Transcription", minutes: 300, percent: 12 },
    { tag: "Repertoire", minutes: 420, percent: 17 },
    { tag: "Rhythm", minutes: 250, percent: 10 },
  ],
  year: [
    { tag: "Scales", minutes: 9000, percent: 30 },
    { tag: "Arpeggios", minutes: 8000, percent: 27 },
    { tag: "Sight Reading", minutes: 7000, percent: 23 },
    { tag: "Improvisation", minutes: 6000, percent: 20 },
    { tag: "Ear Training", minutes: 5500, percent: 18 },
    { tag: "Transcription", minutes: 5000, percent: 15 },
    { tag: "Repertoire", minutes: 6500, percent: 22 },
    { tag: "Rhythm", minutes: 4000, percent: 12 },
  ],
};

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

const pieChartDataMock = {
  day: [
    { tag: "Scales", value: 40, fill: pieChartColors[0] },
    { tag: "Arpeggios", value: 30, fill: pieChartColors[1] },
    { tag: "Sight Reading", value: 20, fill: pieChartColors[2] },
    { tag: "Improvisation", value: 10, fill: pieChartColors[3] },
    { tag: "Ear Training", value: 15, fill: pieChartColors[4] },
    { tag: "Transcription", value: 12, fill: pieChartColors[5] },
    { tag: "Repertoire", value: 18, fill: pieChartColors[6] },
    { tag: "Rhythm", value: 8, fill: pieChartColors[7] },
  ],
  week: [
    { tag: "Scales", value: 200, fill: pieChartColors[0] },
    { tag: "Arpeggios", value: 180, fill: pieChartColors[1] },
    { tag: "Sight Reading", value: 120, fill: pieChartColors[2] },
    { tag: "Improvisation", value: 100, fill: pieChartColors[3] },
    { tag: "Ear Training", value: 90, fill: pieChartColors[4] },
    { tag: "Transcription", value: 80, fill: pieChartColors[5] },
    { tag: "Repertoire", value: 110, fill: pieChartColors[6] },
    { tag: "Rhythm", value: 60, fill: pieChartColors[7] },
  ],
  month: [
    { tag: "Scales", value: 800, fill: pieChartColors[0] },
    { tag: "Arpeggios", value: 700, fill: pieChartColors[1] },
    { tag: "Sight Reading", value: 600, fill: pieChartColors[2] },
    { tag: "Improvisation", value: 400, fill: pieChartColors[3] },
    { tag: "Ear Training", value: 350, fill: pieChartColors[4] },
    { tag: "Transcription", value: 300, fill: pieChartColors[5] },
    { tag: "Repertoire", value: 420, fill: pieChartColors[6] },
    { tag: "Rhythm", value: 250, fill: pieChartColors[7] },
  ],
  year: [
    { tag: "Scales", value: 9000, fill: pieChartColors[0] },
    { tag: "Arpeggios", value: 8000, fill: pieChartColors[1] },
    { tag: "Sight Reading", value: 7000, fill: pieChartColors[2] },
    { tag: "Improvisation", value: 6000, fill: pieChartColors[3] },
    { tag: "Ear Training", value: 5500, fill: pieChartColors[4] },
    { tag: "Transcription", value: 5000, fill: pieChartColors[5] },
    { tag: "Repertoire", value: 6500, fill: pieChartColors[6] },
    { tag: "Rhythm", value: 4000, fill: pieChartColors[7] },
  ],
};

// Mock tag options for dropdown
const tagOptions = [
  "All Tags",
  "Scales",
  "Arpeggios",
  "Sight Reading",
  "Improvisation",
  "Ear Training",
  "Transcription",
  "Repertoire",
  "Rhythm",
];

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
  options: string[];
  value: string;
  onChange: (tag: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = options.filter((tag) =>
    tag.toLowerCase().includes(search.toLowerCase())
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
                key={tag}
                className={`w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors ${
                  tag === value ? "bg-primary/10 font-semibold" : ""
                }`}
                onClick={() => {
                  onChange(tag);
                  setOpen(false);
                }}
                type="button"
              >
                {tag}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Mock API data and functions
const mockTags = [
  { id: 1, label: "Scales", color: "#60a5fa" },
  { id: 2, label: "Arpeggios", color: "#fbbf24" },
  { id: 3, label: "Sight Reading", color: "#34d399" },
  { id: 4, label: "Improvisation", color: "#f472b6" },
  { id: 5, label: "Ear Training", color: "#a78bfa" },
  { id: 6, label: "Transcription", color: "#f87171" },
  { id: 7, label: "Repertoire", color: "#facc15" },
  { id: 8, label: "Rhythm", color: "#38bdf8" },
];

type TimeRangeKey = "week" | "month" | "year";
type TaskInUseMock = {
  label: string;
  occurrence: number;
  duration: number;
  tags: string[];
  createdAt: string; // ISO date string
};

// Helper to get a date for a given week, month, or year bucket
function getDateForLabel(
  label: string,
  range: TimeRangeKey,
  baseDate: Date
): Date {
  if (range === "week") {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const idx = days.indexOf(label);
    return addDays(startOfWeek(baseDate, { weekStartsOn: 1 }), idx);
  }
  if (range === "month") {
    const weeks = ["W1", "W2", "W3", "W4"];
    const idx = weeks.indexOf(label);
    return addWeeks(startOfMonth(baseDate), idx);
  }
  if (range === "year") {
    const months = [
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
    ];
    const idx = months.indexOf(label);
    return addMonths(startOfYear(baseDate), idx);
  }
  return baseDate;
}

// Generate mock tasks-in-use with createdAt dates for the last 8 weeks, 6 months, 2 years
function generateMockTasksInUse(): TaskInUseMock[] {
  const now = new Date();
  const tasks: TaskInUseMock[] = [];
  // Weeks
  for (let w = 0; w < 8; w++) {
    const weekStart = subWeeks(startOfWeek(now, { weekStartsOn: 1 }), w);
    [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ].forEach((day, i) => {
      if (Math.random() > 0.6) return; // skip some days for realism
      const date = addDays(weekStart, i);
      tasks.push({
        label: day,
        occurrence: Math.floor(Math.random() * 8),
        duration: Math.floor(Math.random() * 60),
        tags: [mockTags[Math.floor(Math.random() * mockTags.length)].label],
        createdAt: date.toISOString(),
      });
    });
  }
  // Months
  for (let m = 0; m < 6; m++) {
    const monthStart = subMonths(startOfMonth(now), m);
    ["W1", "W2", "W3", "W4"].forEach((week, i) => {
      if (Math.random() > 0.5) return;
      const date = addWeeks(monthStart, i);
      tasks.push({
        label: week,
        occurrence: Math.floor(Math.random() * 20),
        duration: Math.floor(Math.random() * 200),
        tags: [mockTags[Math.floor(Math.random() * mockTags.length)].label],
        createdAt: date.toISOString(),
      });
    });
  }
  // Years
  for (let y = 0; y < 2; y++) {
    const yearStart = subYears(startOfYear(now), y);
    [
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
    ].forEach((month, i) => {
      if (Math.random() > 0.4) return;
      const date = addMonths(yearStart, i);
      tasks.push({
        label: month,
        occurrence: Math.floor(Math.random() * 50),
        duration: Math.floor(Math.random() * 500),
        tags: [mockTags[Math.floor(Math.random() * mockTags.length)].label],
        createdAt: date.toISOString(),
      });
    });
  }
  return tasks;
}

// Mock API functions
function fetchUserTags(): Promise<typeof mockTags> {
  return Promise.resolve(mockTags);
}
function fetchAllTasksInUse(): Promise<TaskInUseMock[]> {
  return Promise.resolve(generateMockTasksInUse());
}

const Growth: React.FC = () => {
  const [view, setView] = useState<ViewType>("MENU");
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>("week");
  const [selectedMetric, setSelectedMetric] = useState<Metric>("occurrence");
  const [selectedTotalRange, setSelectedTotalRange] =
    useState<TotalTimeRange>("week");
  const [selectedTag, setSelectedTag] = useState<string>("All Tags");
  const [userTags, setUserTags] = useState<typeof mockTags>([]);
  const [allTasksInUse, setAllTasksInUse] = useState<TaskInUseMock[]>([]);
  const [tasksInUse, setTasksInUse] = useState<TaskInUseMock[]>([]); // filtered for current window
  const [currentIndex, setCurrentIndex] = useState(0); // 0 = present, 1 = previous, etc.

  // Back button for subviews
  const handleBack = () => setView("MENU");

  // Get the data for the selected time range
  const currentRange = timeRanges.find((r) => r.key === selectedTimeRange)!;
  const chartTitle =
    selectedTimeRange === "week"
      ? "Chronological Stats (Week)"
      : selectedTimeRange === "month"
      ? "Chronological Stats (Month)"
      : "Chronological Stats (Year)";
  const chartDescription =
    selectedTimeRange === "week"
      ? "Stats for each day of the week"
      : selectedTimeRange === "month"
      ? "Stats for each week of the month"
      : "Stats for each month of the year";

  // Fetch tags and all tasks-in-use on mount
  useEffect(() => {
    fetchUserTags().then((tags) => setUserTags(tags));
    fetchAllTasksInUse().then((tasks) => setAllTasksInUse(tasks));
  }, []);

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
    let tagTotals = tagTotalsMock[selectedTotalRange as TimeRangeKey];
    let pieData = pieChartDataMock[selectedTotalRange as TimeRangeKey];
    // Map tag to color for indicator
    const tagColorMap: Record<string, string> = {};
    pieData.forEach((item) => {
      if (typeof item.tag === "string" && typeof item.fill === "string") {
        tagColorMap[item.tag] = item.fill;
      }
    });
    // Sort tagTotals by minutes descending
    tagTotals = [...tagTotals].sort((a, b) => b.minutes - a.minutes);
    // Sort pieData by value descending
    pieData = [...pieData].sort(
      (a, b) => (b.value as number) - (a.value as number)
    );
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
    // Map filtered data onto the full set of labels, filling missing with zeroes
    const currentLabels = fullLabels[selectedTimeRange];
    const dataByLabel = Object.fromEntries(
      filteredData.map((entry) => [entry.label, entry])
    );
    const chartData = currentLabels.map((label) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { tags: _unused, ...rest } = dataByLabel[label] || {};
      return dataByLabel[label] ? rest : { label, occurrence: 0, duration: 0 };
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
    let minIndex = 0,
      maxIndex = 0;
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
            options={["All Tags", ...userTags.map((t) => t.label)]}
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
            Duration (mins)
          </button>
        </div>
      </div>
    );
  }
  if (view === "GOALS") {
    return (
      <div className="w-[75vw] mx-auto">
        <div className="flex justify-start mb-2">
          <button
            onClick={handleBack}
            className="text-sm text-muted-foreground hover:underline"
          >
            &larr; Back
          </button>
        </div>
        <h1 className="text-2xl font-bold text-center mb-4">Goals</h1>
        <div>Coming soon...</div>
      </div>
    );
  }

  // Main menu view
  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Growth</h1>
      <div className="flex gap-6 mt-8">
        <div
          className="border border-border rounded-lg p-6 cursor-pointer flex-1 hover:bg-muted/50 transition-colors"
          onClick={() => setView("TOTAL")}
        >
          <h2 className="text-lg font-semibold mb-1">Total Stats</h2>
          <p className="text-muted-foreground">
            View your all-time stats and progress.
          </p>
        </div>
        <div
          className="border border-border rounded-lg p-6 cursor-pointer flex-1 hover:bg-muted/50 transition-colors"
          onClick={() => setView("CHRONOLOGICAL")}
        >
          <h2 className="text-lg font-semibold mb-1">Chronological Stats</h2>
          <p className="text-muted-foreground">See your stats over time.</p>
        </div>
        <div
          className="border border-border rounded-lg p-6 cursor-pointer flex-1 hover:bg-muted/50 transition-colors"
          onClick={() => setView("GOALS")}
        >
          <h2 className="text-lg font-semibold mb-1">Goals</h2>
          <p className="text-muted-foreground">
            Track your goals and achievements.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Growth;
