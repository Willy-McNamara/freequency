export declare class CreateMusicianDto {
    googleId: string;
    displayName: string;
    givenName: string;
    familyName: string;
    email: string;
    profilePictureUrl: string | null;
}
export declare class MusicianJwtDto {
    id: number;
    email: string;
    displayName: string;
}
export declare class MusicianDto {
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
    totalGasUpsReceived: number;
    longestStreak: number;
    currentStreak: number;
    createdAt: Date;
    comments?: CommentDto[];
    sessions?: SessionDto[];
}
export declare class MusicianFrontendDTO {
    id: number;
    displayName: string;
    bio: string;
    instruments: string[];
    profilePictureUrl: string | null;
    totalSessions: number;
    totalPracticeMinutes: number;
    totalGasUpsGiven: number;
    totalGasUpsReceived: number;
    longestStreak: number;
    currentStreak: number;
    createdAt: Date;
}
export declare class MusicianUpdateDto {
    id: number;
    updatedDisplayName: string;
    updatedBio: string;
    updatedInstruments: string[];
}
export declare class SessionDto {
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
export declare class GasUpDto {
    id: number;
    musicianId: number;
    sessionId: number;
}
export declare class CreatedGasUpDto {
    musician: {
        displayName: string;
        profilePictureUrl: string;
    };
    id: number;
    musicianId: number;
    sessionId: number;
}
export declare class CreatedCommentDto {
    id: number;
    text: string;
    createdAt: Date;
    musicianId: number;
    sessionId: number;
    musician: {
        displayName: string;
        profilePictureUrl: string;
    };
}
export declare class CommentDto {
    id: number;
    text: string;
    createdAt: Date;
    musicianId: number;
    sessionId: number;
}
