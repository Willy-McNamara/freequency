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
  const [isSaved, setIsSaved] = React.useState(false);

  const handleToggleSave = async () => {
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);

    // Mock API call
    try {
      if (newSavedState) {
        console.log(`Saving task ${task.id} to user's saved tasks`);
        // Mock API call: POST /api/tasks/${task.id}/save
      } else {
        console.log(`Removing task ${task.id} from user's saved tasks`);
        // Mock API call: DELETE /api/tasks/${task.id}/save
      }
    } catch (error) {
      console.error("Error toggling task save state:", error);
      // Revert state on error
      setIsSaved(!newSavedState);
    }
  };

  const handleModifyTask = () => {
    console.log("Modify button clicked for task:", task);
    onModifyTask?.(task);
  };

  return (
    <div
      className={cn(
        "flex flex-col w-full max-w-full min-w-[320px] px-4 sm:px-6 lg:px-8 mx-auto",
        className
      )}
    >
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex items-center gap-2 text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Task Library
        </Button>
      </div>

      {/* Single Task Section */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
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
            <Badge variant="default" className="text-sm">
              {task.instrument}
            </Badge>
            {task.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-sm">
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
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                >
                  <div className="w-5 h-5 rounded border-2 border-muted-foreground/30 flex-shrink-0"></div>
                  <span className="flex-1 text-sm text-foreground text-left">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats and Buttons */}
        <div className="flex items-center justify-between">
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

          <div className="flex items-center gap-2">
            {/* Modify Button */}
            <Button
              onClick={handleModifyTask}
              variant="outline"
              className="flex items-center gap-2 text-foreground"
            >
              <Edit className="w-4 h-4" />
              Make it your own
            </Button>

            {/* Archive Button */}
            <Button
              onClick={handleToggleSave}
              variant={isSaved ? "default" : "outline"}
              className={cn(
                "flex items-center gap-2 font-medium text-foreground",
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
      <div className="flex gap-3">
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
