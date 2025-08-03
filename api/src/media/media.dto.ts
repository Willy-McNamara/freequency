export type MediaItem = {
  id: number;
  musicianId: number;
  url: string;
  type: MediaType;
  displayName?: string;
  thumbnailUrl?: string;
};

export type MediaType = 'audio' | 'video' | 'image';

export type FrontendMedia = {
  url: string;
  type: string;
  displayName?: string;
  thumbnailUrl?: string;
};
