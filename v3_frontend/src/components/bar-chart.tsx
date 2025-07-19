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

import { Container } from "@/components/layout/Container";

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
  // Log each entry's xAxis and yAxis value and type
  console.log("[BarChart] Data for current view:", data);
  data.forEach((entry, idx) => {
    console.log(
      `[BarChart] Entry #${idx}:`,
      entry,
      "xAxis:",
      entry[String(xAxisKey)],
      "yAxis:",
      entry[String(yAxisKey)],
      "yAxis type:",
      typeof entry[String(yAxisKey)]
    );
  });

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
    <Container size="lg" className="w-full">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-center">{title}</CardTitle>
          <CardDescription className="text-center">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-0 pb-6">
          <div className="w-full min-w-[300px] max-w-full h-[350px]">
            <ResponsiveContainer width="99%" height="100%">
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
                <YAxis
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  width={0}
                />
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
    </Container>
  );
}
