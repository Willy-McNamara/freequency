export class CreateSessionDto {
  title: string;
  notes: string;
  duration: string;
  isPublic: boolean;
  musicianId: string; // Assuming you provide the musicianId when creating a session
}

export class SessionDto {
  id: number;
  title: string;
  notes: string;
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
  duration: number;
  isPublic: boolean;
  takeId: string;
  createdAt: Date;
  musicianId: number;
  musicianDisplayname: string;
  gasUps: GasUpDto[];
  comments: CommentDto[];
}

export class GasUpDto {
  id: number;
  musicianId: number;
  sessionId: number;
  musicianProfilePhotoUrl: string; // New field
  musicianDisplayName: string; // New field
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
  musicianProfilePhotoUrl: string; // New field
  musicianDisplayName: string;
}

export class NewCommentDto {
  text: string;
  musicianId: number;
  sessionId: number;
}
