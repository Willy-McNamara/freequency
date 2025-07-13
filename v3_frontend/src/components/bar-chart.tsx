"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Props for the chart
interface ChartBarLabelProps<T = Record<string, string | number>> {
  data: T[];
  xAxisKey: keyof T;
  yAxisKey: keyof T;
  title?: string;
  description?: string;
}

export function ChartBarLabel<T extends Record<string, string | number>>({
  data,
  xAxisKey,
  yAxisKey,
  title = "Bar Chart",
  description = "",
}: ChartBarLabelProps<T>) {
  console.log("[BarChart] Received data:", data);
  console.log("[BarChart] Data length:", data.length);

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p>No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey={xAxisKey as string}
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value: string) => value.slice(0, 3)}
              />
              <YAxis tickLine={false} tickMargin={10} axisLine={false} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  typeof value === "number" ? value.toFixed(1) : value,
                  name,
                ]}
              />
              <Bar
                dataKey={yAxisKey as string}
                fill="#8884d8"
                radius={[4, 4, 0, 0]}
              >
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
