import { ChartBarLabel } from "@/components/bar-chart";
import { ChartPieDonutActive } from "@/components/pie-chart";
import React, { useState } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const Growth: React.FC = () => {
  const [view, setView] = useState<ViewType>("MENU");
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>("week");
  const [selectedMetric, setSelectedMetric] = useState<Metric>("occurrence");
  const [selectedTotalRange, setSelectedTotalRange] =
    useState<TotalTimeRange>("week");

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

  if (view === "TOTAL") {
    let tagTotals = tagTotalsMock[selectedTotalRange];
    let pieData = pieChartDataMock[selectedTotalRange];
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
        <Button
          onClick={handleBack}
          variant="ghost"
          className="mb-4 text-sm text-muted-foreground"
        >
          &larr; Back
        </Button>
        <h1 className="text-2xl font-bold mb-2">Stats Totals</h1>
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
    return (
      <div className="w-[75vw]">
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
