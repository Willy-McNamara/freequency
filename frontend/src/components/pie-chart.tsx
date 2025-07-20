"use client";

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const description = "A donut chart with an active sector";

// Accept data, dataKey, nameKey, title, description as props
interface PieChartDataItem {
  [key: string]: string | number | undefined;
  fill?: string;
  tag?: string;
}
interface ChartPieDonutActiveProps {
  data: PieChartDataItem[];
  dataKey?: string;
  nameKey?: string;
  title?: string;
  description?: string;
  activeTag?: string | null;
}

// Helper function to format minutes from seconds
function formatMinutesFromSeconds(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m`;
}

export function ChartPieDonutActive({
  data,
  dataKey = "value",
  title = "% of practice time by tag",
  description = "",
}: ChartPieDonutActiveProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="flex flex-col border-0 shadow-none">
        <CardHeader className="items-center pb-0">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="mx-auto w-full min-w-[300px] max-w-[500px] h-[300px] flex items-center justify-center text-muted-foreground">
            <p>No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col border-0 shadow-none">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div className="mx-auto w-full min-w-[300px] max-w-[500px] h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={false}
                outerRadius={120}
                innerRadius={60}
                fill="#8884d8"
                dataKey={dataKey}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill || "#8884d8"} />
                ))}
              </Pie>
              <Tooltip
                formatter={(
                  value: number,
                  name: string,
                  props: { payload?: PieChartDataItem }
                ) => [
                  formatMinutesFromSeconds(value),
                  props.payload?.tag || name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
