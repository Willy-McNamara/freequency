import * as React from "react";
import {
  ChevronDown,
  ChevronRight,
  Guitar,
  Piano,
  Drum,
  Music,
  ArrowRight,
} from "lucide-react";
import { Badge } from "./badge";
import { ALL_INSTRUMENTS } from "../types/instruments.types";
import { cn } from "../lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { RichTextRenderer } from "./rich-text";
import { TaskTagList } from "./TaskTagList";

export interface Task {
  id: number;
  title: string;
  description: string;
  instrument: string;
  user: {
    displayName: string;
    avatarUrl?: string;
  };
  tags: {
    id: number;
    label: string;
    color?: string;
  }[];
  checklist: string[];
  savedCount: number;
  usedCount: number;
  isSaved?: boolean;
}

export interface TaskListItemProps {
  task: Task;
  className?: string;
  onTaskClick?: (taskId: number) => void;
  onViewDetails?: (taskId: number) => void;
  hasActiveSession?: boolean;
  onUseInCurrentSession?: (task: Task) => void;
}

const getInstrumentIcon = (instrument: string) => {
  const lowerInstrument = instrument.toLowerCase();
  if (lowerInstrument.includes("guitar")) return Guitar;
  if (lowerInstrument.includes("piano") || lowerInstrument.includes("keyboard"))
    return Piano;
  if (lowerInstrument.includes("drum")) return Drum;
  return Music; // Default icon
};

export function TaskListItem({
  task,
  className,
  onTaskClick,
  onViewDetails,
  hasActiveSession,
  onUseInCurrentSession,
}: TaskListItemProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const InstrumentIcon = getInstrumentIcon(task.instrument);

  const handleTaskClick = () => {
    setIsExpanded(!isExpanded);
    onTaskClick?.(task.id);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails?.(task.id);
  };

  // Debug logging
  React.useEffect(() => {
    console.log("TaskListItem render - task:", task);
    console.log("Task tags:", task.tags);
    console.log(
      "ALL_INSTRUMENTS labels:",
      ALL_INSTRUMENTS.map((i) => i.label.toLowerCase())
    );
  }, [task]);

  return (
    <div
      className={cn(
        "border border-border rounded-lg bg-card hover:bg-accent/50 transition-all duration-300 ease-in-out cursor-pointer overflow-hidden",
        className
      )}
      onClick={handleTaskClick}
    >
      {/* Collapsed View - Always visible */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Instrument Icon */}
          <div className="flex-shrink-0">
            <InstrumentIcon className="w-5 h-5 text-muted-foreground" />
          </div>

          {/* Task Title */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate">
              {task.title}
            </h3>
          </div>
        </div>

        {/* Right side - User and expand indicator */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* User */}
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              {task.user.avatarUrl ? (
                <AvatarImage
                  src={task.user.avatarUrl}
                  alt={task.user.displayName}
                />
              ) : null}
              <AvatarFallback>
                {task.user.displayName?.[0] || "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground truncate max-w-[100px]">
              {task.user.displayName}
            </span>
          </div>

          {/* Expand/Collapse Indicator */}
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-300" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform duration-300" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded View - Animated drawer */}
      <div
        className={cn(
          "border-t border-border overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="p-4 space-y-3 text-left">
          {/* Title */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1 text-left">
              Title
            </h4>
            <p className="text-sm text-foreground leading-relaxed text-left">
              {task.title}
            </p>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1 text-left">
              Description
            </h4>
            <RichTextRenderer
              content={task.description}
              maxLength={300}
              maxLines={4}
              className="font-['Inter',Helvetica] text-foreground text-sm font-normal leading-6"
            />
          </div>

          {/* Tags */}
          <h4 className="text-sm font-medium text-muted-foreground mb-1 text-left">
            Tags
          </h4>
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-start mt-2">
              <TaskTagList tags={task.tags.map((t) => t.label)} />
            </div>
          )}

          {/* Stats and View Details Row */}
          <div className="flex flex-row gap-2 items-center justify-between pt-2">
            {/* Stats */}
            <div className="flex flex-row flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground justify-start">
              <span>Saved {task.savedCount} times</span>
              <span>Used {task.usedCount} times</span>
            </div>

            {/* View Details Button */}
            <div className="flex justify-end gap-2">
              <Button
                onClick={handleViewDetails}
                variant="outline"
                className="flex items-center gap-2 text-foreground"
              >
                View Details
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Use in current session Button - always centered in its own row */}
          {hasActiveSession && onUseInCurrentSession && (
            <div className="flex justify-center mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUseInCurrentSession(task);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors min-w-150"
              >
                Use in current session
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
