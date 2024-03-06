export class CreateMusicianDto {
  googleId: string;
  displayName: string;
  givenName: string;
  familyName: string;
  email: string;
  profilePictureUrl: string | null;
}

export class MusicianJwtDto {
  id: number;
  email: string;
  displayName: string;
}

export class MusicianDto {
  id: number;
  googleId: string | null;
  displayName: string;
  givenName: string;
  familyName: string;
  email: string;
  bio: string | null;
  instruments: string[];
  profilePictureUrl: string | null;
  totalSessions: number;
  totalPracticeMinutes: number;
  totalGasUpsGiven: number;
  totalGasUpsRecieved: number;
  longestStreak: number;
  currentStreak: number;
  createdAt: Date;
  comments?: CommentDto[];
  sessions?: SessionDto[];
}

// remove password, sessions, comments for frontend
export class MusicianFrontendDTO {
  id: number;
  displayName: string;
  bio: string;
  instruments: string[];
  profilePictureUrl: string | null;
  totalSessions: number;
  totalPracticeMinutes: number;
  totalGasUpsGiven: number;
  totalGasUpsRecieved: number;
  longestStreak: number;
  currentStreak: number;
  createdAt: Date;
}

export class MusicianUpdateDto {
  id: number;
  updatedDisplayName: string;
  updatedBio: string;
  updatedInstruments: string[];
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

export class GasUpDto {
  id: number;
  musicianId: number;
  sessionId: number;
}

export class FrontendGasUpDto {
  id: number;
  musicianId: number;
  sessionId: number;
  musicianProfilePhotoUrl: string; // New field
  musicianDisplayName: string; // New field
}

export class CommentDto {
  id: number;
  text: string;
  createdAt: Date;
  musicianId: number;
  sessionId: number;
}

export class FrontendCommentDto {
  id: number;
  text: string;
  createdAt: Date;
  musicianId: number;
  sessionId: number;
  musicianProfilePhotoUrl: string; // New field
  musicianDisplayName: string;
}
