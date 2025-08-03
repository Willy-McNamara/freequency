export type MediaItem = {
  id: number;
  musicianId: number;
  url: string;
  type: MediaType;
  displayName?: string;
};

export type MediaType = 'audio' | 'video' | 'image';

export type FrontendMedia = {
  url: string;
  type: string;
  displayName?: string;
};
