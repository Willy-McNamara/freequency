import React from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Badge } from "./badge";
import { cn } from "../lib/utils";
import { TagModal } from "./TagModal";
import { Button } from "./ui/button";
import { InstrumentModal } from "./InstrumentModal";
import { ALL_INSTRUMENTS } from "../types/instruments.types";

export interface CreateTaskData {
  title: string;
  description: string;
  instrument: string;
  tags: string[];
  checklist: string[];
}

export interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: CreateTaskData) => void;
  initialData?: CreateTaskData;
  isModifying?: boolean;
  className?: string;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isModifying = false,
  className,
}: CreateTaskModalProps) {
  const [formData, setFormData] = React.useState<CreateTaskData>({
    title: "",
    description: "",
    instrument: "",
    tags: [],
    checklist: [],
  });

  const [newChecklistItem, setNewChecklistItem] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [tagModalOpen, setTagModalOpen] = React.useState(false);
  const [instrumentModalOpen, setInstrumentModalOpen] = React.useState(false);

  // Initialize form data when modal opens or initialData changes
  React.useEffect(() => {
    if (isOpen && initialData) {
      setFormData(initialData);
    } else if (isOpen && !initialData) {
      setFormData({
        title: "",
        description: "",
        instrument: "",
        tags: [],
        checklist: [],
      });
    }
  }, [isOpen, initialData]);

  const handleInputChange = (
    field: keyof CreateTaskData,
    value: string | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange(
      "tags",
      formData.tags.filter((tag) => tag !== tagToRemove)
    );
  };

  const addChecklistItem = () => {
    if (
      newChecklistItem.trim() &&
      !formData.checklist.includes(newChecklistItem.trim())
    ) {
      handleInputChange("checklist", [
        ...formData.checklist,
        newChecklistItem.trim(),
      ]);
      setNewChecklistItem("");
    }
  };

  const removeChecklistItem = (itemToRemove: string) => {
    handleInputChange(
      "checklist",
      formData.checklist.filter((item) => item !== itemToRemove)
    );
  };

  const handleTagSelected = (tag: { id: number; label: string }) => {
    if (!formData.tags.includes(tag.label)) {
      handleInputChange("tags", [...formData.tags, tag.label]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.instrument.trim()
    ) {
      alert(
        "Please fill in all required fields (title, description, and instrument)"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Mock API call
      console.log(
        isModifying ? "Modifying task:" : "Creating new task:",
        formData
      );
      // Mock API call: POST /api/tasks or PUT /api/tasks/:id
      // await fetch('/api/tasks', {
      //   method: isModifying ? 'PUT' : 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error("Error creating/modifying task:", error);
      alert("Failed to create/modify task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      instrument: "",
      tags: [],
      checklist: [],
    });
    setNewChecklistItem("");
    setIsSubmitting(false);
    setTagModalOpen(false);
    setInstrumentModalOpen(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={cn(
          // Responsive padding and max width for modal
          "bg-background border border-border rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 md:p-6",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 md:pb-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground text-left">
            {isModifying ? "Modify Task" : "Create New Task"}
          </h2>
          <Button
            type="button"
            onClick={handleClose}
            variant="outline"
            size="icon"
            className="rounded-lg"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="pt-4 md:pt-6 space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-foreground mb-2 text-left"
            >
              Task Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-left"
              placeholder="Enter task title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-foreground mb-2 text-left"
            >
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none text-left"
              placeholder="Describe what this task involves"
              required
            />
          </div>

          {/* Instrument */}
          <div>
            <label
              htmlFor="instrument"
              className="block text-sm font-medium text-foreground mb-2 text-left"
            >
              Instrument *
            </label>
            <div className="flex items-center gap-2 mb-2 min-h-[32px]">
              {formData.instrument ? (
                <Badge
                  variant="default"
                  className="h-5 px-3 py-2 rounded-md !hover:bg-none !hover:bg-transparent"
                >
                  {formData.instrument}
                </Badge>
              ) : null}
              <button
                type="button"
                onClick={() => setInstrumentModalOpen(true)}
                className="text-xs underline text-muted-foreground hover:text-foreground"
              >
                {formData.instrument ? "Change" : "Select"}
                {/* Hidden input for browser validation */}
                <input
                  type="text"
                  value={formData.instrument}
                  required
                  tabIndex={-1}
                  autoComplete="off"
                  style={{ opacity: 0, width: "1px" }}
                  onChange={() => {}}
                />
              </button>
            </div>
            <InstrumentModal
              isOpen={instrumentModalOpen}
              onClose={() => setInstrumentModalOpen(false)}
              onInstrumentSelected={(inst) => {
                handleInputChange("instrument", inst.label);
                setInstrumentModalOpen(false);
                // Remove any previous instrument from tags, then add the new one if not present
                const instrumentLabels = ALL_INSTRUMENTS.map(
                  (i: { id: number; label: string }) => i.label
                );
                const nonInstrumentTags = formData.tags.filter(
                  (tag) => !instrumentLabels.includes(tag)
                );
                if (!nonInstrumentTags.includes(inst.label)) {
                  handleInputChange("tags", [...nonInstrumentTags, inst.label]);
                } else {
                  handleInputChange("tags", nonInstrumentTags);
                }
              }}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 text-left">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3 items-center">
              <button
                type="button"
                onClick={() => setTagModalOpen(true)}
                className="focus:outline-none"
              >
                <Badge
                  variant="secondary"
                  className="max-h-[1.2rem] flex items-center px-2.5 cursor-pointer select-none"
                >
                  + add
                </Badge>
              </button>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const instrumentLabels = ALL_INSTRUMENTS.map(
                      (i: { id: number; label: string }) => i.label
                    );
                    const instrumentTag = formData.tags.find((tag) =>
                      instrumentLabels.includes(tag)
                    );
                    const regularTags = formData.tags.filter(
                      (tag) => !instrumentLabels.includes(tag)
                    );
                    return [
                      instrumentTag && (
                        <span key={instrumentTag} className="relative group">
                          <Badge
                            variant="default"
                            className="mb-1 max-h-[1.2rem] flex items-center px-2.5"
                          >
                            <span>{instrumentTag}</span>
                          </Badge>
                        </span>
                      ),
                      ...regularTags.map((tag) => (
                        <span key={tag} className="relative group">
                          <Badge
                            variant="secondary"
                            className="mb-1 max-h-[1.2rem] flex items-center px-2.5"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-1 p-0 bg-transparent border-none outline-none focus:outline-none flex items-center"
                              style={{ pointerEvents: "auto" }}
                              aria-label={`Remove tag ${tag}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        </span>
                      )),
                    ];
                  })()}
                </div>
              )}
            </div>
            <TagModal
              isOpen={tagModalOpen}
              onClose={() => setTagModalOpen(false)}
              onTagSelected={handleTagSelected}
            />
          </div>

          {/* Checklist */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 text-left">
              Checklist
            </label>
            <div className="flex flex-row flex-nowrap gap-2 mb-3">
              <input
                type="text"
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addChecklistItem())
                }
                className="flex-1 min-w-0 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-left"
                placeholder="Add a checklist item"
              />
              <button
                type="button"
                onClick={addChecklistItem}
                className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {formData.checklist.length > 0 && (
              <div className="space-y-2">
                {formData.checklist.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-row items-center gap-3 p-3 bg-muted/30 rounded-lg w-full min-w-0"
                  >
                    <div className="w-5 h-5 rounded border-2 border-muted-foreground/30 flex-shrink-0"></div>
                    <span className="flex-1 min-w-0 text-sm text-foreground text-left break-words truncate">
                      {item}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeChecklistItem(item)}
                      className="p-1 hover:bg-accent rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? isModifying
                  ? "Modifying..."
                  : "Creating..."
                : isModifying
                ? "Modify Task"
                : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
