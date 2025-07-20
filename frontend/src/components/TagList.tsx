import * as React from "react";
import { Badge } from "./badge";
import { X } from "lucide-react";
import { ALL_INSTRUMENTS } from "../types/instruments.types";

export interface TaskTagListProps {
  tags: string[];
  className?: string;
  onRemoveTag?: (tag: string) => void;
}

export const TagList: React.FC<TaskTagListProps> = ({
  tags,
  className,
  onRemoveTag,
}) => {
  const instrumentLabels = ALL_INSTRUMENTS.map((i) => i.label);
  const instrumentTag = tags.find((tag) => instrumentLabels.includes(tag));
  const regularTags = tags.filter((tag) => !instrumentLabels.includes(tag));

  return (
    <div className={"flex flex-wrap gap-2 " + (className || "")}>
      {instrumentTag && (
        <span key={instrumentTag} className="relative group">
          <Badge
            variant="default"
            className="mb-1 max-h-[1.2rem] flex items-center px-2.5"
          >
            <span>{instrumentTag}</span>
          </Badge>
        </span>
      )}
      {regularTags.map((tag) => (
        <span key={tag} className="relative group">
          <Badge
            variant="secondary"
            className="mb-1 max-h-[1.2rem] flex items-center px-2.5"
          >
            <span>{tag}</span>
            {onRemoveTag && (
              <button
                type="button"
                onClick={() => onRemoveTag(tag)}
                className="ml-1 p-0 bg-transparent border-none outline-none focus:outline-none flex items-center"
                style={{ pointerEvents: "auto" }}
                aria-label={`Remove tag ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </Badge>
        </span>
      ))}
    </div>
  );
};
