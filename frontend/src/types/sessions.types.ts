export type FrontendSessionDto = {
  id: number;
  title: string;
  notes: string;
  duration: number;
  isPublic: boolean;
  takeId: string;
  createdAt: Date;
  musicianId: number;
  musicianUsername: string;
  gasUps: GasUpDto[];
  comments: CommentDto[];
};

export type GasUpDto = {
  id: number;
  musicianId: number;
  sessionId: number;
};

export type CommentDto = {
  id: number;
  text: string;
  createdAt: Date;
  musicianId: number;
  sessionId: number;
};
