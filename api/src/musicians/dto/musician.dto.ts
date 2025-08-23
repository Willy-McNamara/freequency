import { IsString, IsArray, IsNumber, IsEnum } from 'class-validator';

export class TagDTO {
  id: number;
  label: string;
  color?: string | null;
  createdAt: Date;
}

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
  totalPracticeSeconds: number;
  totalGasUpsGiven: number;
  totalGasUpsReceived: number;
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
  instruments: TagDTO[];
  profilePictureUrl: string | null;
  totalSessions: number;
  totalPracticeSeconds: number;
  totalGasUpsGiven: number;
  totalGasUpsReceived: number;
  createdAt: Date;
  goals: GoalDto[];
  isFollowing?: boolean;
  followerCount?: number;
  followingCount?: number;
}

export class MusicianUpdateDto {
  id: number;
  updatedDisplayName: string;
  updatedBio: string;
  updatedInstruments: string[];
}

export class ProfileUpdateDto {
  @IsString()
  displayName: string;

  @IsString()
  bio: string;

  @IsArray()
  @IsString({ each: true })
  instruments: string[]; // Accept instrument labels, not IDs
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

export class GasUpDto {
  id: number;
  musicianId: number;
  sessionId: number;
}

export class CreatedGasUpDto {
  musician: {
    displayName: string;
    avatarUrl: string | null;
  };
  id: number;
  musicianId: number;
  sessionId: number;
}

export class CreatedCommentDto {
  id: number;
  text: string;
  createdAt: Date;
  musicianId: number;
  sessionId: number;
  musician: {
    displayName: string;
    avatarUrl: string | null;
  };
}

export class CommentDto {
  id: number;
  text: string;
  createdAt: Date;
  musicianId: number;
  sessionId: number;
}

export class GoalDto {
  id?: number;
  musicianId?: number;
  @IsString()
  tag: string;
  @IsEnum(['duration', 'frequency'])
  type: 'duration' | 'frequency';
  @IsNumber()
  target: number;
  @IsEnum(['daily', 'weekly', 'monthly', 'annually'])
  timeFrame: 'daily' | 'weekly' | 'monthly' | 'annually';
  createdAt?: Date;
}

export class FollowDto {
  id: number;
  followerId: number;
  followingId: number;
  createdAt: Date;
}

export class FollowStatusDto {
  isFollowing: boolean;
  followerCount: number;
  followingCount: number;
}
