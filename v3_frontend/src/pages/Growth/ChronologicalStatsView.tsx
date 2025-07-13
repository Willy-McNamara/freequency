import React from "react";
import { ChartBarLabel } from "@/components/bar-chart";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { TagSelectDropdown } from "./TagSelectDropdown";

interface ChartDataItem extends Record<string, string | number> {
  label: string;
  occurrence: number;
  duration: number;
}

interface ChronologicalStatsViewProps {
  onBack: () => void;
  selectedTag: string;
  onTagChange: (tag: string) => void;
  userTags: Array<{ id: number; label: string; color?: string }>;
  selectedTimeRange: "week" | "month" | "year";
  onTimeRangeChange: (range: "week" | "month" | "year") => void;
  currentIndex: number;
  onCurrentIndexChange: (index: number) => void;
  selectedMetric: "occurrence" | "duration";
  onMetricChange: (metric: "occurrence" | "duration") => void;
  chartData: ChartDataItem[];
  chartTitle: string;
  chartDescription: string;
  periodLabel: string;
  canGoBack: boolean;
  canGoForward: boolean;
  timeRanges: ReadonlyArray<{
    readonly key: "week" | "month" | "year";
    readonly label: string;
    readonly data: Array<{
      label: string;
      occurrence: number;
      duration: number;
    }>;
  }>;
}

export const ChronologicalStatsView: React.FC<ChronologicalStatsViewProps> = ({
  onBack,
  selectedTag,
  onTagChange,
  userTags,
  selectedTimeRange,
  onTimeRangeChange,
  currentIndex,
  onCurrentIndexChange,
  selectedMetric,
  onMetricChange,
  chartData,
  chartTitle,
  chartDescription,
  periodLabel,
  canGoBack,
  canGoForward,
  timeRanges,
}) => {
  return (
    <div className="w-[75vw]">
      <div className="flex justify-start mb-2">
        <button
          onClick={onBack}
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
          onChange={onTagChange}
        />
      </div>
      {/* Time navigation */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <button
          className="p-2 rounded-full border disabled:opacity-50"
          onClick={() => onCurrentIndexChange(currentIndex + 1)}
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
          onClick={() => onCurrentIndexChange(Math.max(currentIndex - 1, 0))}
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
              onTimeRangeChange(range.key);
              onCurrentIndexChange(0);
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
          onClick={() => onMetricChange("occurrence")}
          className={`px-4 py-2 rounded-md border transition-colors duration-150 focus:outline-none ${
            selectedMetric === "occurrence"
              ? "border-primary bg-muted font-semibold"
              : "border-border bg-background font-normal hover:bg-muted/50"
          }`}
        >
          Occurrences
        </button>
        <button
          onClick={() => onMetricChange("duration")}
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
};
