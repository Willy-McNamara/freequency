import React from "react";
import { ChartPieDonutActive } from "@/components/pie-chart";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TotalStatsViewProps {
  onBack: () => void;
  selectedTotalRange: "day" | "week" | "month" | "year";
  onRangeChange: (range: "day" | "week" | "month" | "year") => void;
  tagTotals: Array<{
    tag: string;
    minutes: number;
    seconds: number;
    percent: number;
  }>;
  pieData: Array<{
    tag: string;
    value: number;
    fill: string;
  }>;
  tagColorMap: Record<string, string>;
  formatMinutes: (seconds: number) => string;
  totalTimeRanges: ReadonlyArray<{
    readonly key: "day" | "week" | "month" | "year";
    readonly label: string;
  }>;
}

export const TotalStatsView: React.FC<TotalStatsViewProps> = ({
  onBack,
  selectedTotalRange,
  onRangeChange,
  tagTotals,
  pieData,
  tagColorMap,
  formatMinutes,
  totalTimeRanges,
}) => {
  return (
    <div className="w-[70vw] mx-auto">
      <div className="flex justify-start mb-2">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-sm text-muted-foreground"
        >
          &larr; Back
        </Button>
      </div>
      <h1 className="text-2xl font-bold text-center mb-4">Total Stats</h1>
      {/* Time range buttons */}
      <div className="flex justify-center gap-3 mb-4">
        {totalTimeRanges.map((range) => (
          <Button
            key={range.key}
            onClick={() => onRangeChange(range.key)}
            variant={selectedTotalRange === range.key ? "default" : "outline"}
            className={
              selectedTotalRange === range.key ? "font-semibold" : "font-normal"
            }
          >
            {range.label}
          </Button>
        ))}
      </div>
      {/* Pie Chart */}
      <div className="flex justify-center mb-8">
        {pieData.length > 0 ? (
          <ChartPieDonutActive data={pieData} />
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p>No practice data available for the selected time period.</p>
          </div>
        )}
      </div>
      {/* Tag breakdown cards */}
      <div className="flex flex-col gap-4">
        {tagTotals.length > 0 ? (
          tagTotals.map((tag) => (
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
                    Total: {formatMinutes(tag.seconds)}
                  </CardDescription>
                </div>
              </div>
              <div className="text-xl font-bold text-primary">
                {tag.percent}%
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-4">
            <p>No practice data available for the selected time period.</p>
          </div>
        )}
      </div>
    </div>
  );
};
