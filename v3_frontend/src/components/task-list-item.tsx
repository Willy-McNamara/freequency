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
import { cn } from "../lib/utils";
import { Button } from "@/components/ui/button";

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
            {task.user.avatarUrl && (
              <img
                src={task.user.avatarUrl}
                alt={task.user.displayName}
                className="w-6 h-6 rounded-full object-cover"
              />
            )}
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
          {/* Description */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1 text-left">
              Description
            </h4>
            <p className="text-sm text-foreground leading-relaxed text-left">
              {task.description}
            </p>
          </div>

          {/* Tags */}
          {task.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 text-left">
                Tags
              </h4>
              <div className="flex flex-wrap gap-2 justify-start">
                {/* Always show instrument tag first */}
                <Badge
                  variant="default"
                  className="!hover:bg-none !hover:bg-transparent"
                >
                  {task.instrument}
                </Badge>

                {/* Show other tags */}
                {task.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="!hover:bg-none !hover:bg-transparent"
                  >
                    {tag.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex gap-4 text-sm text-muted-foreground justify-start">
            <span>Saved {task.savedCount} times</span>
            <span>Used {task.usedCount} times</span>
          </div>

          {/* View Details and Use in Session Buttons */}
          <div className="flex justify-end pt-2 gap-2">
            <Button
              onClick={handleViewDetails}
              variant="outline"
              className="flex items-center gap-2 text-foreground"
            >
              View Details
              <ArrowRight className="w-4 h-4" />
            </Button>
            {hasActiveSession && onUseInCurrentSession && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUseInCurrentSession(task);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Use in current session
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
