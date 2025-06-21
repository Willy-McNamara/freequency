import * as React from "react";
import { Badge } from "./badge";
import { cn } from "../lib/utils";

export interface PracticeTagListProps {
  tags: {
    id: string;
    label: string;
    variant?: React.ComponentProps<typeof Badge>["variant"];
  }[];
  className?: string;
  onAddTag?: () => void;
}

export function PracticeTagList({
  tags,
  className,
  onAddTag,
}: PracticeTagListProps) {
  return (
    <div className="flex flex-col gap-2 items-start mt-4">
      <h3 className="font-bold text-base mb-1">Tags</h3>
      <div
        className={cn(
          "flex flex-wrap gap-2 border-2 border-dashed border-zinc-400 rounded-xl p-3 min-w-[150px] w-full sm:min-w-[250px] sm:w-auto",
          className
        )}
      >
        <button type="button" onClick={onAddTag} className="focus:outline-none">
          <Badge
            variant="secondary"
            className="mb-1 cursor-pointer select-none"
          >
            + add
          </Badge>
        </button>
        {tags.map((tag) => (
          <Badge key={tag.id} variant={tag.variant} className="mb-1">
            {tag.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}
