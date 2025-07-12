import { Plus, Pencil } from "lucide-react";
import { cn } from "../lib/utils";

export interface PracticeTaskListProps {
  tasks: { id: string; title: string }[];
  onAddNew?: () => void;
  onEditTask?: (id: string) => void;
  className?: string;
}

export function PracticeTaskList({
  tasks,
  onAddNew,
  onEditTask,
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
          <button
            key={task.id}
            type="button"
            onClick={() => onEditTask?.(task.id)}
            className={
              "flex items-center justify-between w-full px-4 py-2 rounded-md bg-background hover:bg-accent text-foreground font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border border-muted/50"
            }
          >
            <span className="truncate text-left">{task.title}</span>
            <Pencil className="w-4 h-4 ml-2" />
          </button>
        ))}
      </div>
    </div>
  );
}
