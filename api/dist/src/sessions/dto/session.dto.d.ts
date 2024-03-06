export declare class CreateSessionDto {
    title: string;
    notes: string;
    duration: string;
    isPublic: boolean;
    musicianId: string;
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
export declare class FrontendSessionDto {
    id: number;
    title: string;
    notes: string;
    duration: number;
    isPublic: boolean;
    takeId: string;
    createdAt: Date;
    musicianId: number;
    musicianDisplayname: string;
    musicianProfilePictureUrl: string;
    gasUps: GasUpDto[];
    comments: CommentDto[];
}
export declare class GasUpDto {
    id: number;
    musicianId: number;
    sessionId: number;
}
export declare class NewGasUpDto {
    gasserId: number;
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
export declare class NewCommentDto {
    text: string;
    musicianId: number;
    sessionId: number;
}
