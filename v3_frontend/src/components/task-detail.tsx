import * as React from "react";
import {
  ArrowLeft,
  User,
  Bookmark,
  Play,
  BookmarkIcon,
  Edit,
} from "lucide-react";
import { Badge } from "./badge";
import { cn } from "../lib/utils";
import { Task } from "./task-list-item";
import { Button } from "./ui/button";
import { Section } from "./layout/Section";
import { apiConfig } from "../config/api";

async function saveTask(taskId: number) {
  return fetch(`${apiConfig.endpoints.tasks}/${taskId}/save`, {
    method: "POST",
    credentials: "include",
  });
}
async function unsaveTask(taskId: number) {
  return fetch(`${apiConfig.endpoints.tasks}/${taskId}/save`, {
    method: "DELETE",
    credentials: "include",
  });
}

export interface TaskDetailProps {
  task: Task;
  onBack: () => void;
  onModifyTask?: (task: Task) => void;
  className?: string;
  hasActiveSession?: boolean;
  onUseInCurrentSession?: (task: Task) => void;
}

export function TaskDetail({
  task,
  onBack,
  onModifyTask,
  className,
  hasActiveSession,
  onUseInCurrentSession,
}: TaskDetailProps) {
  const [isSaved, setIsSaved] = React.useState(task.isSaved ?? false);

  React.useEffect(() => {
    setIsSaved(task.isSaved ?? false);
  }, [task.isSaved, task.id]);

  const handleToggleSave = async () => {
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);
    try {
      if (newSavedState) {
        await saveTask(task.id);
      } else {
        await unsaveTask(task.id);
      }
    } catch (error) {
      setIsSaved(!newSavedState);
      // Optionally show error to user
    }
  };

  const handleModifyTask = () => {
    console.log("Modify button clicked for task:", task);
    onModifyTask?.(task);
  };

  return (
    <div
      className={cn(
        "flex flex-col w-full max-w-full min-w-[320px] px-4 sm:px-6 lg:px-8 mx-auto mb-8",
        className
      )}
    >
      {/* Header with back button */}
      <Section>
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex items-center gap-2 text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Task Library
          </Button>
        </div>
      </Section>

      {/* Single Task Section */}
      <div className="bg-card border border-border rounded-lg p-4 md:p-6 mb-6">
        {/* Task Title and Creator */}
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">{task.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>by {task.user.displayName}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-muted-foreground leading-relaxed mb-6 text-left">
          {task.description}
        </p>

        {/* Tags */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2 text-left">
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="default"
              className="text-sm !hover:bg-none !hover:bg-transparent"
            >
              {task.instrument}
            </Badge>
            {task.tags
              .filter(
                (tag) =>
                  tag.label.toLowerCase() !== task.instrument.toLowerCase()
              )
              .map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="text-sm !hover:bg-none !hover:bg-transparent"
                >
                  {tag.label}
                </Badge>
              ))}
          </div>
        </div>

        {/* Checklist */}
        {task.checklist && task.checklist.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 text-left">
              Checklist
            </h3>
            <div className="space-y-2">
              {task.checklist.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-row items-center gap-3 p-3 bg-muted/30 rounded-lg w-full min-w-0"
                >
                  <div className="w-5 h-5 rounded border-2 border-muted-foreground/30 flex-shrink-0"></div>
                  <span className="flex-1 min-w-0 text-sm text-foreground text-left break-words truncate">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats and Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4" />
              <span>Saved {task.savedCount} times</span>
            </div>
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              <span>Used {task.usedCount} times</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            {/* Modify Button */}
            <Button
              onClick={handleModifyTask}
              variant="outline"
              className="flex items-center gap-2 text-foreground w-full sm:w-auto"
            >
              <Edit className="w-4 h-4" />
              Make it your own
            </Button>

            {/* Archive Button */}
            <Button
              onClick={handleToggleSave}
              variant={isSaved ? "default" : "outline"}
              className={cn(
                "flex items-center gap-2 font-medium text-foreground w-full sm:w-auto",
                isSaved
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border border-border"
              )}
            >
              <BookmarkIcon className="w-4 h-4" />
              {isSaved ? "Saved" : "Save"}
            </Button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {hasActiveSession && onUseInCurrentSession ? (
          <button
            className="flex-1 bg-primary text-primary-foreground px-4 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            onClick={() => onUseInCurrentSession(task)}
          >
            Use in current session
          </button>
        ) : (
          <button className="flex-1 bg-primary text-primary-foreground px-4 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Start Practice Session
          </button>
        )}
      </div>
    </div>
  );
}
