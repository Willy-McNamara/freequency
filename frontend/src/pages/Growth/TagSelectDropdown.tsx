import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ChevronDownIcon, TagIcon } from "lucide-react";

interface TagSelectDropdownProps {
  options: { id: number; label: string; color?: string }[];
  value: string;
  onChange: (tag: string) => void;
  className?: string;
}

export const TagSelectDropdown: React.FC<TagSelectDropdownProps> = ({
  options,
  value,
  onChange,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = options.filter((tag) =>
    tag.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Button
        variant="outline"
        className={`flex items-center gap-2 min-w-[180px] justify-between ${className}`}
        onClick={() => setOpen(true)}
        type="button"
      >
        <span className="flex items-center gap-2">
          <TagIcon className="w-4 h-4" />
          {value}
        </span>
        <ChevronDownIcon className="w-4 h-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[350px]">
          <DialogHeader>
            <DialogTitle>Select Tag</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Search your tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-2"
          />
          <div className="max-h-60 overflow-y-auto space-y-1">
            {filtered.length === 0 && (
              <div className="text-muted-foreground text-sm py-2 px-1">
                No tags found
              </div>
            )}
            {filtered.map((tag) => (
              <button
                key={tag.id}
                className={`w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors ${
                  tag.label === value ? "bg-primary/10 font-semibold" : ""
                }`}
                onClick={() => {
                  onChange(tag.label);
                  setOpen(false);
                }}
                type="button"
              >
                {tag.label}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
