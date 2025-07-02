"use client";

import { TrendingUp } from "lucide-react";
import { Pie, PieChart, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A donut chart with an active sector";

// Accept data, dataKey, nameKey, title, description as props
interface PieChartDataItem {
  [key: string]: string | number | undefined;
  fill?: string;
}
interface ChartPieDonutActiveProps {
  data: PieChartDataItem[];
  dataKey?: string;
  nameKey?: string;
  title?: string;
  description?: string;
  activeTag?: string | null;
}

export function ChartPieDonutActive({
  data,
  dataKey = "value",
  nameKey = "tag",
  title = "Pie Chart - Donut Active",
  description = "",
  activeTag = null,
}: ChartPieDonutActiveProps) {
  // Generate chartConfig dynamically for each tag
  const chartConfig: ChartConfig = {
    [dataKey]: { label: title },
    ...Object.fromEntries(
      data.map((item) => [
        item[nameKey],
        { label: item[nameKey], color: item.fill },
      ])
    ),
  };

  // Find the index of the active tag
  const activeIndex = activeTag
    ? data.findIndex((item) => item[nameKey] === activeTag)
    : undefined;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              innerRadius={60}
              strokeWidth={5}
              startAngle={90}
              endAngle={-270}
              {...(typeof activeIndex === "number" && activeIndex >= 0
                ? { activeIndex }
                : {})}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <Sector {...props} outerRadius={outerRadius + 10} />
              )}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}
