import * as React from "react";
import { Badge } from "./badge";
import { cn } from "../lib/utils";
import { X } from "lucide-react";

export interface PracticeTagListProps {
  tags: {
    id: string;
    label: string;
    variant?: React.ComponentProps<typeof Badge>["variant"];
  }[];
  className?: string;
  onAddTag?: () => void;
  onRemoveTag?: (id: string) => void;
}

export function PracticeTagList({
  tags,
  className,
  onAddTag,
  onRemoveTag,
}: PracticeTagListProps) {
  return (
    <div className="flex flex-col gap-2 items-start mt-4">
      <h3 className="font-bold text-base mb-1">Tags</h3>
      <div
        className={cn(
          "flex items-center flex-wrap gap-2 border-2 border-dashed border-zinc-400 rounded-xl p-3 min-w-[150px] w-full sm:min-w-[250px] sm:w-auto",
          className
        )}
      >
        <button type="button" onClick={onAddTag} className="focus:outline-none">
          <Badge
            variant="secondary"
            className="mb-1 cursor-pointer select-none max-h-[1.2rem] p-0"
          >
            + add
          </Badge>
        </button>
        {tags.map((tag) => (
          <span key={tag.id} className="relative group">
            <Badge
              variant={tag.variant}
              className="mb-1 max-h-[1.2rem] flex items-center px-2.5"
            >
              <span>{tag.label}</span>
              {onRemoveTag && (
                <button
                  type="button"
                  onClick={() => onRemoveTag(tag.id)}
                  className="ml-1 p-0 bg-transparent border-none outline-none focus:outline-none flex items-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ pointerEvents: "auto" }}
                  aria-label={`Remove tag ${tag.label}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </Badge>
          </span>
        ))}
      </div>
    </div>
  );
}
