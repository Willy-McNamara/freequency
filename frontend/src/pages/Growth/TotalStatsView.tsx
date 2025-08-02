import React from "react";
import { ChartPieDonutActive } from "@/components/pie-chart";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
  // Navigation props
  currentIndex: number;
  onCurrentIndexChange: (index: number) => void;
  periodLabel: string;
  canGoBack: boolean;
  canGoForward: boolean;
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
  currentIndex,
  onCurrentIndexChange,
  periodLabel,
  canGoBack,
  canGoForward,
}) => {
  return (
    <Container size="lg" className="w-full px-4 sm:px-6 lg:px-8">
      <Section>
        <div className="flex justify-start mb-2">
          <Button
            onClick={onBack}
            variant="outline"
            className="text-sm text-muted-foreground"
          >
            &larr; Back
          </Button>
        </div>
      </Section>
      <h1 className="text-2xl font-bold text-center mb-4">Total Stats</h1>
      {/* Time navigation */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Button
          className={cn(
            "p-2 rounded-full border",
            !canGoBack &&
              "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed hover:bg-gray-200 hover:text-gray-400 hover:border-gray-300"
          )}
          onClick={() => onCurrentIndexChange(currentIndex + 1)}
          disabled={!canGoBack}
          aria-label="Previous"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </Button>
        <span className="font-semibold text-base min-w-[120px] text-center">
          {periodLabel}
        </span>
        <Button
          className={cn(
            "p-2 rounded-full border",
            !canGoForward &&
              "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed hover:bg-gray-200 hover:text-gray-400 hover:border-gray-300"
          )}
          onClick={() => onCurrentIndexChange(Math.max(currentIndex - 1, 0))}
          disabled={!canGoForward}
          aria-label="Next"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </Button>
      </div>
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
            <p></p>
          </div>
        )}
      </div>
    </Container>
  );
};
