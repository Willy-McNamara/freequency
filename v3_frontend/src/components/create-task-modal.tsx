import * as React from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Badge } from "./badge";
import { cn } from "../lib/utils";
import { TagModal } from "./TagModal";

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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={cn(
          "bg-background border border-border rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground text-left">
            {isModifying ? "Modify Task" : "Create New Task"}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
            <select
              id="instrument"
              value={formData.instrument}
              onChange={(e) => handleInputChange("instrument", e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-left"
              required
            >
              <option value="">Select an instrument</option>
              <option value="Guitar">Guitar</option>
              <option value="Piano">Piano</option>
              <option value="Drums">Drums</option>
              <option value="Bass">Bass</option>
              <option value="Violin">Violin</option>
              <option value="Saxophone">Saxophone</option>
              <option value="Trumpet">Trumpet</option>
              <option value="Flute">Flute</option>
              <option value="Clarinet">Clarinet</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 text-left">
              Tags
            </label>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setTagModalOpen(true)}
                className="focus:outline-none"
              >
                <Badge
                  variant="secondary"
                  className="mb-1 cursor-pointer select-none"
                >
                  + add
                </Badge>
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
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
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addChecklistItem())
                }
                className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-left"
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
                    className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="w-5 h-5 rounded border-2 border-muted-foreground/30 flex-shrink-0"></div>
                    <span className="flex-1 text-sm text-foreground text-left">
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
          <div className="flex gap-3 pt-4 border-t border-border">
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
