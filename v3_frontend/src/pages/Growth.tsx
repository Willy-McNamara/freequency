import { ChartBarLabel } from "@/components/bar-chart";
import React, { useState } from "react";

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

type TimeRange = (typeof timeRanges)[number]["key"];

type Metric = "occurrence" | "duration";

const Growth: React.FC = () => {
  const [view, setView] = useState<ViewType>("MENU");
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>("week");
  const [selectedMetric, setSelectedMetric] = useState<Metric>("occurrence");

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

  if (view === "CHRONOLOGICAL") {
    return (
      <div>
        <button
          onClick={handleBack}
          className="mb-4 text-sm text-muted-foreground hover:underline"
        >
          &larr; Back
        </button>
        <h1 className="text-2xl font-bold mb-2">Chronological Stats</h1>
        {/* Time range buttons */}
        <div className="flex justify-center gap-3 mb-4">
          {timeRanges.map((range) => (
            <button
              key={range.key}
              onClick={() => setSelectedTimeRange(range.key)}
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
          data={currentRange.data}
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
  if (view === "TOTAL") {
    return (
      <div>
        <button
          onClick={handleBack}
          className="mb-4 text-sm text-muted-foreground hover:underline"
        >
          &larr; Back
        </button>
        <h1 className="text-2xl font-bold mb-2">Total Stats</h1>
        <div>Coming soon...</div>
      </div>
    );
  }
  if (view === "GOALS") {
    return (
      <div>
        <button
          onClick={handleBack}
          className="mb-4 text-sm text-muted-foreground hover:underline"
        >
          &larr; Back
        </button>
        <h1 className="text-2xl font-bold mb-2">Goals</h1>
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
