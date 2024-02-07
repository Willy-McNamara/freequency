export declare class CreateSessionDto {
    title: string;
    notes: string;
    duration: number;
    isPublic: boolean;
    takeId: string;
    musicianId: number;
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
export declare class FrontendSessionDtos {
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
