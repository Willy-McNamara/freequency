export type TagDTO = {
  id: number;
  label: string;
  color?: string | null;
};

export type TaskDTO = {
  id: number;
  title: string;
  description: string;
  instrument: string;
  user: {
    id: number;
    displayName: string;
    avatarUrl: string | null;
  };
  tags: TagDTO[];
  checklist: string[];
  savedCount: number;
  usedCount: number;
  parentTask?: {
    id: number;
    title: string;
    description: string;
    instrument: string;
    user: {
      id: number;
      displayName: string;
      avatarUrl: string | null;
    };
    tags: TagDTO[];
    checklist: string[];
    savedCount: number;
    usedCount: number;
  } | null;
};

export type CreateTaskDto = {
  title: string;
  description: string;
  instrument: string;
  checklist: string[];
  tags: string[];
  musicianId?: number; // Optional for now, will be set from auth context later
  parentTaskId?: number; // Optional parent task ID for "Make it your own" functionality
};

export type UpdateTaskDto = {
  id: number;
  title?: string;
  description?: string;
  instrument?: string;
  checklist?: string[];
  tags?: string[];
};
