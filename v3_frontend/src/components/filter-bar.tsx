import * as React from "react";
import {
  ChevronDownIcon,
  UserIcon,
  MusicIcon,
  ListMusicIcon,
  TagIcon,
  BookmarkIcon,
  CheckIcon,
  // Container,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface FilterOption {
  id: string;
  label: string;
  checked: boolean;
}

export type FilterType =
  | "user"
  | "instrument"
  | "task"
  | "tag"
  | "saved"
  | "completed";

export interface FilterState {
  type: FilterType;
  isSelected: boolean;
  options?: FilterOption[];
}

export interface FilterBarProps {
  filters: FilterState[];
  onFilterChange: (
    filterType: FilterType,
    isSelected: boolean,
    options?: FilterOption[]
  ) => void;
  className?: string;
}

const filterConfig = {
  user: {
    label: "User",
    icon: <UserIcon className="w-6 h-6" />,
    hasDropdown: true,
  },
  instrument: {
    label: "Instrument",
    icon: <MusicIcon className="w-6 h-6" />,
    hasDropdown: true,
  },
  task: {
    label: "Task",
    icon: <ListMusicIcon className="w-6 h-6" />,
    hasDropdown: true,
  },
  tag: {
    label: "Tag",
    icon: <TagIcon className="w-6 h-6" />,
    hasDropdown: true,
  },
  saved: {
    label: "Saved",
    icon: <BookmarkIcon className="w-6 h-6" />,
    hasDropdown: false,
  },
  completed: {
    label: "Completed",
    icon: <CheckIcon className="w-6 h-6" />,
    hasDropdown: false,
  },
};

export function FilterBar({
  filters,
  onFilterChange,
  className,
}: FilterBarProps) {
  const [selectedFilter, setSelectedFilter] = React.useState<FilterType | null>(
    null
  );
  const [searchTerm, setSearchTerm] = React.useState("");
  const [localOptions, setLocalOptions] = React.useState<FilterOption[]>([]);

  const handleFilterClick = (filterType: FilterType) => {
    const config = filterConfig[filterType];
    if (config.hasDropdown) {
      setSelectedFilter(filterType);
      const currentFilter = filters.find((f) => f.type === filterType);
      setLocalOptions(currentFilter?.options || []);
      setSearchTerm("");
    } else {
      const currentFilter = filters.find((f) => f.type === filterType);
      onFilterChange(filterType, !currentFilter?.isSelected);
    }
  };

  const handleModalClose = () => {
    setSelectedFilter(null);
    setSearchTerm("");
  };

  const handleApplyFilters = () => {
    if (selectedFilter) {
      onFilterChange(selectedFilter, true, localOptions);
    }
    handleModalClose();
  };

  const filteredOptions = localOptions.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentFilterConfig = selectedFilter
    ? filterConfig[selectedFilter]
    : null;

  return (
    <div className={cn("flex items-center gap-[11px]", className)}>
      {filters.map((filter) => {
        const config = filterConfig[filter.type];
        return (
          <Button
            key={filter.type}
            variant={filter.isSelected ? "default" : "secondary"}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2 rounded-md h-auto",
              filter.isSelected
                ? "bg-primary text-primary-foreground"
                : "bg-slate-200"
            )}
            onClick={() => handleFilterClick(filter.type)}
          >
            {config.icon}
            {config.hasDropdown && <ChevronDownIcon className="w-6 h-6" />}
          </Button>
        );
      })}

      <Dialog open={selectedFilter !== null} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentFilterConfig?.label} Filter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
            />

            <div className="max-h-60 overflow-y-auto space-y-2">
              {/* Selected Items Section */}
              {filteredOptions.filter((option) => option.checked).length >
                0 && (
                <div className="space-y-2 pb-4 border-b">
                  <h4 className="text-sm font-semibold text-muted-foreground">
                    Selected
                  </h4>
                  {filteredOptions
                    .filter((option) => option.checked)
                    .map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`selected-${option.id}`}
                          checked={option.checked}
                          onCheckedChange={(checked: boolean) => {
                            setLocalOptions((prev) =>
                              prev.map((opt) =>
                                opt.id === option.id ? { ...opt, checked } : opt
                              )
                            );
                          }}
                        />
                        <label
                          htmlFor={`selected-${option.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                </div>
              )}

              {/* Quick filter options for user filter */}
              {selectedFilter === "user" && (
                <div className="space-y-2 pb-4 border-b">
                  <h4 className="text-sm font-semibold text-muted-foreground">
                    Common
                  </h4>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="quick-me"
                      checked={
                        localOptions.find((opt) => opt.id === "me")?.checked ||
                        false
                      }
                      onCheckedChange={(checked: boolean) => {
                        setLocalOptions((prev) => {
                          const existing = prev.find((opt) => opt.id === "me");
                          if (existing) {
                            return prev.map((opt) =>
                              opt.id === "me" ? { ...opt, checked } : opt
                            );
                          } else {
                            return [
                              ...prev,
                              { id: "me", label: "Me", checked },
                            ];
                          }
                        });
                      }}
                    />
                    <label htmlFor="quick-me" className="text-sm font-medium">
                      Me
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="quick-following"
                      checked={
                        localOptions.find((opt) => opt.id === "following")
                          ?.checked || false
                      }
                      onCheckedChange={(checked: boolean) => {
                        setLocalOptions((prev) => {
                          const existing = prev.find(
                            (opt) => opt.id === "following"
                          );
                          if (existing) {
                            return prev.map((opt) =>
                              opt.id === "following" ? { ...opt, checked } : opt
                            );
                          } else {
                            return [
                              ...prev,
                              {
                                id: "following",
                                label: "Following",
                                checked,
                              },
                            ];
                          }
                        });
                      }}
                    />
                    <label
                      htmlFor="quick-following"
                      className="text-sm font-medium"
                    >
                      Following
                    </label>
                  </div>
                </div>
              )}

              {/* Available Items Section */}
              {filteredOptions.filter((option) => !option.checked).length >
                0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground">
                    All
                  </h4>
                  {filteredOptions
                    .filter((option) => !option.checked)
                    .map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={option.id}
                          checked={option.checked}
                          onCheckedChange={(checked: boolean) => {
                            setLocalOptions((prev) =>
                              prev.map((opt) =>
                                opt.id === option.id ? { ...opt, checked } : opt
                              )
                            );
                          }}
                        />
                        <label
                          htmlFor={option.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleModalClose}>
                Cancel
              </Button>
              <Button onClick={handleApplyFilters}>Apply</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
