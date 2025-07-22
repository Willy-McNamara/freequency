import React from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskInUseMock } from "./utils";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";

interface GrowthMenuViewProps {
  allTasksInUse: TaskInUseMock[];
  goals: Array<{ id: string }>;
  onViewChange: (view: "MENU" | "TOTAL" | "CHRONOLOGICAL" | "GOALS") => void;
  formatMinutes: (seconds: number) => string;
}

export const GrowthMenuView: React.FC<GrowthMenuViewProps> = ({
  allTasksInUse,
  goals,
  onViewChange,
  formatMinutes,
}) => {
  // Calculate unique sessions by counting distinct sessionIds
  const uniqueSessions = new Set(allTasksInUse.map((task) => task.sessionId))
    .size;

  return (
    <Container size="lg" className="w-full px-4 sm:px-6 lg:px-8">
      <Section>
        <h1 className="text-2xl font-bold text-center mb-4">Growth</h1>
        <p className="text-center text-muted-foreground">
          Track your practice over time.
        </p>
      </Section>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 text-center flex flex-col items-center justify-between">
          <CardTitle className="text-lg font-semibold mb-2">
            Total Practice Time
          </CardTitle>
          <p className="text-4xl font-bold text-primary mb-2">
            {formatMinutes(
              allTasksInUse.reduce((sum, task) => sum + task.duration, 0)
            )}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Across all sessions
          </p>
          <Button onClick={() => onViewChange("TOTAL")} className="mt-auto">
            View Totals
          </Button>
        </Card>
        <Card className="p-6 text-center flex flex-col items-center justify-between">
          <CardTitle className="text-lg font-semibold mb-2">
            Total Sessions
          </CardTitle>
          <p className="text-4xl font-bold text-primary mb-2">
            {uniqueSessions}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            For the selected period
          </p>
          <Button
            onClick={() => onViewChange("CHRONOLOGICAL")}
            className="mt-auto"
          >
            View Chronological
          </Button>
        </Card>
        <Card className="p-6 text-center flex flex-col items-center justify-between">
          <CardTitle className="text-lg font-semibold mb-2">
            Active Goals
          </CardTitle>
          <p className="text-4xl font-bold text-primary mb-2">{goals.length}</p>
          <p className="text-sm text-muted-foreground mb-4">
            Set for your practice
          </p>
          <Button onClick={() => onViewChange("GOALS")} className="mt-auto">
            Manage Goals
          </Button>
        </Card>
      </div>
    </Container>
  );
};
