export declare class CreateMusicianDto {
    googleId: string;
    username: string;
    email: string;
    password: string;
    profilePictureUrl: string;
}
export declare class MusicianDto {
    id: number;
    googleId: string;
    username: string;
    email: string;
    password: string;
    profilePictureUrl: string;
    totalSessions: number;
    totalPracticeMinutes: number;
    totalGasUps: number;
    longestStreak: number;
    currentStreak: number;
    createdAt: Date;
    comments: CommentDto[];
    sessions: SessionDto[];
}
export declare class MusicianFrontendDTO {
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
}
export declare class SessionDto {
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
export declare class GasUpDto {
    id: number;
    musicianId: number;
    sessionId: number;
}
export declare class CommentDto {
    id: number;
    text: string;
    createdAt: Date;
    musicianId: number;
    sessionId: number;
}
