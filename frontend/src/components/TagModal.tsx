import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "./ui/dialog";
import { Badge } from "./badge";
import { Plus } from "lucide-react";
import { apiConfig } from "../config/api";
import { apiClient } from "../services/auth";
import { ALL_INSTRUMENTS } from "../types/instruments.types";
import { SecureInput } from "./ui/secure-form";

interface Tag {
  id: number;
  label: string;
  color?: string;
}

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTagSelected: (tag: Tag) => void;
}

export const TagModal: React.FC<TagModalProps> = ({
  isOpen,
  onClose,
  onTagSelected,
}) => {
  const [query, setQuery] = React.useState("");
  const [tags, setTags] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const MAX_LENGTH = 30;
  const ALLOWED_REGEX = /^[a-z0-9 _\-.,!?()'":;]+$/;

  const sanitizeInput = (input: string) => {
    // Only allow allowed characters
    return input.replace(/[^a-z0-9 _\-.,!?()'":;]/g, "");
  };

  const [inputError, setInputError] = React.useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toLowerCase();
    value = sanitizeInput(value);
    if (value.length > MAX_LENGTH) value = value.slice(0, MAX_LENGTH);
    setQuery(value);
    setInputError(null);
  };

  React.useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    apiClient
      .get<string[]>(apiConfig.endpoints.tags.all)
      .then((res) => {
        if (res.error) {
          throw new Error(res.error);
        }
        return res.data || [];
      })
      .then((data) => setTags(data))
      .catch(() => setTags([]))
      .finally(() => setLoading(false));
  }, [isOpen]);

  // Filter out instrument tags
  const instrumentLabels = ALL_INSTRUMENTS.map((i) => i.label.toLowerCase());
  const filteredTags = tags
    .filter((t) => !instrumentLabels.includes(t.toLowerCase()))
    .filter((t) => t.toLowerCase().includes(query.toLowerCase()));
  const tagExists = filteredTags.some(
    (t) => t.toLowerCase() === query.toLowerCase()
  );

  const handleCreateTag = async () => {
    if (!query.trim()) return;
    if (query.length > MAX_LENGTH) {
      setInputError(`Tag must be ${MAX_LENGTH} characters or less.`);
      return;
    }
    if (!ALLOWED_REGEX.test(query)) {
      setInputError("Tag contains invalid characters.");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const res = await apiClient.post<{
        id: number;
        label: string;
        color?: string;
      }>(apiConfig.endpoints.tags.create, { label: query.trim() });
      if (res.error) {
        throw new Error(res.error);
      }
      if (!res.data) {
        throw new Error("No data received from server");
      }
      const tag = res.data;
      onTagSelected(tag);
      onClose();
    } catch {
      setError("Could not create tag. Try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleSelectTag = async (label: string) => {
    // Try to fetch the tag object by label (simulate, since /tags/all-labels only returns labels)
    // In a real app, you might want to fetch by label or have /tags return full objects
    onTagSelected({ id: 0, label }); // id: 0 as placeholder
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add or Select Tag</DialogTitle>
          <DialogDescription>
            Search for an existing tag or create a new one.
          </DialogDescription>
        </DialogHeader>
        <SecureInput
          type="text"
          value={query}
          onChange={handleInputChange}
          className="w-full focus:outline-none focus:ring-2 focus:ring-ring mb-4"
          placeholder="Search or create tag"
          autoFocus
          maxLength={MAX_LENGTH}
        />
        {loading ? (
          <div className="text-center text-muted-foreground">
            Loading tags...
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto mb-2">
            {filteredTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleSelectTag(tag)}
                className="text-left px-3 py-2 rounded hover:bg-accent transition-colors"
              >
                <Badge variant="secondary">{tag}</Badge>
              </button>
            ))}
            {filteredTags.length === 0 && (
              <div className="text-muted-foreground text-sm">
                No tags found.
              </div>
            )}
          </div>
        )}
        {!tagExists && query.trim() && (
          <button
            type="button"
            onClick={handleCreateTag}
            disabled={creating}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {creating ? "Creating..." : `Create "${query.trim()}"`}
          </button>
        )}
        {inputError && (
          <div className="text-destructive text-sm mt-2">{inputError}</div>
        )}
        {error && <div className="text-destructive text-sm mt-2">{error}</div>}
        <DialogClose asChild>
          <button className="mt-4 w-full px-3 py-2 border border-border rounded-lg hover:bg-accent transition-colors">
            Cancel
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
