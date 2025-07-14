import {
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";

export interface TaskInUseMock {
  label: string;
  occurrence: number;
  duration: number;
  tags: string[];
  createdAt: string;
  sessionId: number;
}

export interface Goal {
  id: string;
  tag: string;
  type: "duration" | "frequency";
  target: number;
  timeFrame: "daily" | "weekly" | "monthly" | "annually";
  createdAt: string;
}

export function formatMinutes(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function calculateGoalProgress(
  goal: Goal,
  tasksInUse: TaskInUseMock[]
): number {
  const now = new Date();
  let periodStart: Date, periodEnd: Date;

  // Determine the current period based on goal timeFrame
  switch (goal.timeFrame) {
    case "daily":
      periodStart = startOfDay(now);
      periodEnd = endOfDay(now);
      break;
    case "weekly":
      periodStart = startOfWeek(now, { weekStartsOn: 1 });
      periodEnd = endOfWeek(now, { weekStartsOn: 1 });
      break;
    case "monthly":
      periodStart = startOfMonth(now);
      periodEnd = endOfMonth(now);
      break;
    case "annually":
      periodStart = startOfYear(now);
      periodEnd = endOfYear(now);
      break;
  }

  // Filter tasks within the current period
  const periodTasks = tasksInUse.filter((task) => {
    const taskDate = parseISO(task.createdAt);
    return isWithinInterval(taskDate, { start: periodStart, end: periodEnd });
  });

  // Filter by tag if goal is tag-specific
  const relevantTasks =
    goal.tag === "All Tags"
      ? periodTasks
      : periodTasks.filter((task) => task.tags.includes(goal.tag));

  // Calculate progress based on goal type
  if (goal.type === "duration") {
    const totalSeconds = relevantTasks.reduce(
      (sum, task) => sum + task.duration,
      0
    );
    const totalMinutes = Math.round(totalSeconds / 60);
    return Math.min(totalMinutes, goal.target);
  } else {
    const totalOccurrences = relevantTasks.reduce(
      (sum, task) => sum + task.occurrence,
      0
    );
    return Math.min(totalOccurrences, goal.target);
  }
}

export function formatGoalSummary(goal: Goal): string {
  const tagDisplay =
    goal.tag === "All Tags" ? "all tags" : goal.tag.toLowerCase();
  const typeDisplay = goal.type === "duration" ? "minutes" : "sessions";
  const timeFrameDisplay = goal.timeFrame.toLowerCase();

  return `${tagDisplay} | ${goal.target} ${typeDisplay} | ${timeFrameDisplay}`;
}
