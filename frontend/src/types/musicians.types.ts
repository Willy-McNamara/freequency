export type MusicianFrontendDTO = {
  id: number;
  googleId: string;
  username: string;
  email: string;
  profilePictureUrl: string;
  totalSessions: number;
  totalPracticeMinutes: number;
  totalGasUps: number;
  longestStreak: number;
  currentStreak: number;
  createdAt: Date;
};
