import { Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "../lib/utils";

export interface PracticeTaskListProps {
  tasks: { id: string; title: string }[];
  onAddNew?: () => void;
  onEditTask?: (id: string) => void;
  onDeleteTask?: (id: string) => void;
  className?: string;
}

export function PracticeTaskList({
  tasks,
  onAddNew,
  onEditTask,
  onDeleteTask,
  className,
}: PracticeTaskListProps) {
  return (
    <div className="flex flex-col gap-2 items-start mt-4">
      <h3 className="font-bold text-base mb-1">Tasks</h3>
      <div
        className={cn(
          "flex flex-col gap-2 border-2 border-dotted border-zinc-400 rounded-xl p-3 w-full min-w-[200px]",
          className
        )}
      >
        <button
          type="button"
          onClick={onAddNew}
          className={
            "flex items-center justify-between w-full px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          }
        >
          <span>Add new task</span>
          <Plus className="w-4 h-4 ml-2" />
        </button>
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between w-full px-4 py-2 rounded-md bg-background hover:bg-accent text-foreground font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border border-muted/50"
          >
            <button
              type="button"
              onClick={() => onEditTask?.(task.id)}
              className="flex-1 text-left truncate focus:outline-none bg-transparent border-none"
              style={{ minWidth: 0 }}
            >
              {task.title}
            </button>
            <button
              type="button"
              onClick={() => onEditTask?.(task.id)}
              className="ml-2 p-1 rounded hover:bg-muted focus:outline-none"
              aria-label="Edit task"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDeleteTask?.(task.id)}
              className="ml-1 p-1 rounded hover:bg-destructive/10 focus:outline-none"
              aria-label="Delete task"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
