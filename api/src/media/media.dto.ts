export type MediaItem = {
  id: number;
  musicianId: number;
  url: string;
  type: MediaType;
};

export type MediaType = 'audio' | 'video';

export type FrontendMedia = {
  url: string;
  type: string;
};
