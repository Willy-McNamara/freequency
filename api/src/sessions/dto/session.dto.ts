import { FrontendMedia, MediaItem } from 'src/media/media.dto';

export class CreateSessionDto {
  title: string;
  notes: string;
  instruments: string[];
  tags: string[];
  duration: number;
  isPublic: boolean;
  musicianId: number;
  tasks: TaskInUseDto[];
}

export interface TaskInUseDto {
  id: number; // task definition ID
  title: string;
  notes: string;
  timeSpent: number;
  checklist: Array<{ item: string; checked: boolean }>;
  tags: string[]; // task-specific tags
}

export class SessionDto {
  id: number;
  title: string;
  notes: string;
  instruments: string[];
  duration: number;
  isPublic: boolean;
  takeId: string;
  createdAt: Date;
  musicianId: number;
  gasUps: GasUpDto[];
  comments: CommentDto[];
}

export class FrontendSessionDto {
  id: number;
  title: string;
  notes: string;
  instruments: string[];
  duration: number;
  isPublic: boolean;
  createdAt: Date;
  musicianId: number;
  musicianDisplayname: string;
  musicianProfilePictureUrl: string;
  gasUps: GasUpDto[];
  comments: CommentDto[];
  media: FrontendMedia | null;
}

export type TagDTO = {
  id: number;
  label: string;
  color?: string | null;
};

export type NewFrontendSessionDTO = {
  id: number;
  title: string;
  notes: string;
  instruments: TagDTO[];
  duration: number;
  isPublic: boolean;
  createdAt: string; // or Date, depending if you serialize dates
  musician: {
    id: number;
    displayName: string;
    avatarUrl: string | null;
  };
  media: {
    url: string;
    type: string;
    displayName?: string;
    thumbnailUrl?: string;
  }[];
  tags: TagDTO[];
  gasUps: {
    musician: {
      id: number;
      displayName: string;
      avatarUrl: string | null;
    };
  }[];
  comments: {
    id: number;
    text: string;
    createdAt: string;
    musician: {
      id: number;
      displayName: string;
      avatarUrl: string | null;
    };
  }[];
  tasks: {
    id: number;
    title: string;
    notes: string;
    timeSpent: number;
    taskDefinition: {
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
    };
  }[];
};

export class GasUpDto {
  id: number;
  musicianId: number;
  sessionId: number;
}

export class NewGasUpDto {
  gasserId: number; // the one doing the gassing up
  musicianId: number; // the one getting gassed up
  sessionId: number;
}

export class CommentDto {
  id: number;
  text: string;
  createdAt: Date;
  musicianId: number;
  sessionId: number;
}

export class NewCommentDto {
  text: string;
  musicianId: number;
  sessionId: number;
}

export type AudioPayload = {
  size: number; // file.size
  type: string; // file.type
  checksum: string;
  musicianId: number;
};

// Generic file upload payload for all media types
export type FileUploadPayload = {
  size: number;
  type: string;
  musicianId: number;
  checksum?: string;
};

export type CreateSessionResponse = {
  newSession: FrontendSessionDto;
  newMedia: MediaItem;
  signedUrl: string;
};
