import { PopularInstrument } from './instruments.types';

export type MusicianFrontendDTO = {
  id: number;
  displayName: string;
  bio: string;
  instruments: PopularInstrument[];
  profilePictureUrl: string | null;
  totalSessions: number;
  totalPracticeMinutes: number;
  totalGasUpsGiven: number;
  totalGasUpsRecieved: number;
  longestStreak: number;
  currentStreak: number;
  createdAt: Date;
};
