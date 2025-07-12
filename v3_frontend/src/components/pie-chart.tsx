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
  title = "% of practice time by tag",
  description = "",
}: ChartPieDonutActiveProps) {
  console.log("[PieChart] Received data:", data);
  console.log("[PieChart] Data length:", data.length);

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
                label={({ name, percent }) =>
                  `${name} ${((percent || 0) * 100).toFixed(0)}%`
                }
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
                formatter={(value: number, name: string) => [
                  `${value} minutes`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
