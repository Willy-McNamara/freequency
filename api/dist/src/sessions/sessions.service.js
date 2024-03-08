"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const uuid_1 = require("uuid");
let SessionsService = class SessionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getFiveSessions() {
        const prisma = this.prisma;
        const take = 5;
        const sessions = await prisma.session.findMany({
            take: take,
            orderBy: { id: 'desc' },
            include: {
                gasUps: {
                    include: {
                        musician: {
                            select: {
                                displayName: true,
                                profilePictureUrl: true,
                            },
                        },
                    },
                },
                comments: {
                    include: {
                        musician: {
                            select: {
                                displayName: true,
                                profilePictureUrl: true,
                            },
                        },
                    },
                },
                musician: {
                    select: {
                        displayName: true,
                        profilePictureUrl: true,
                    },
                },
            },
        });
        const frontendSessionDto = sessions.map((session) => ({
            id: session.id,
            title: session.title,
            notes: session.notes,
            duration: session.duration,
            isPublic: session.isPublic,
            takeId: session.takeId,
            createdAt: session.createdAt,
            musicianId: session.musicianId,
            musicianDisplayname: session.musician.displayName,
            musicianProfilePictureUrl: session.musician.profilePictureUrl,
            gasUps: session.gasUps,
            comments: session.comments,
        }));
        return frontendSessionDto;
    }
    async getSessionsChunk(cursorId) {
        const prisma = this.prisma;
        const pageSize = 10;
        const skip = 1;
        const take = pageSize;
        const sessions = await prisma.session.findMany({
            take,
            skip,
            orderBy: { id: 'desc' },
            cursor: {
                id: cursorId,
            },
            include: {
                gasUps: {
                    include: {
                        musician: {
                            select: {
                                displayName: true,
                                profilePictureUrl: true,
                            },
                        },
                    },
                },
                comments: {
                    include: {
                        musician: {
                            select: {
                                displayName: true,
                                profilePictureUrl: true,
                            },
                        },
                    },
                },
                musician: {
                    select: {
                        displayName: true,
                        profilePictureUrl: true,
                    },
                },
            },
        });
        const frontendSessions = sessions.map((session) => ({
            id: session.id,
            title: session.title,
            notes: session.notes,
            duration: session.duration,
            isPublic: session.isPublic,
            takeId: session.takeId,
            createdAt: session.createdAt,
            musicianId: session.musicianId,
            musicianDisplayname: session.musician.displayName,
            musicianProfilePictureUrl: session.musician.profilePictureUrl,
            gasUps: session.gasUps,
            comments: session.comments,
        }));
        return frontendSessions;
    }
    async createSession(newSession) {
        const prisma = this.prisma;
        try {
            const createdSession = await prisma.$transaction(async (prisma) => {
                const createdSession = await prisma.session.create({
                    data: {
                        title: newSession.title,
                        notes: newSession.notes,
                        duration: Number(newSession.duration),
                        isPublic: newSession.isPublic,
                        takeId: (0, uuid_1.v4)(),
                        musician: {
                            connect: { id: Number(newSession.musicianId) },
                        },
                    },
                    include: {
                        musician: {
                            select: { displayName: true, profilePictureUrl: true },
                        },
                    },
                });
                const frontendSessionDto = {
                    id: createdSession.id,
                    title: createdSession.title,
                    notes: createdSession.notes,
                    duration: createdSession.duration,
                    isPublic: createdSession.isPublic,
                    takeId: createdSession.takeId,
                    createdAt: createdSession.createdAt,
                    musicianId: createdSession.musicianId,
                    musicianDisplayname: createdSession.musician.displayName,
                    musicianProfilePictureUrl: createdSession.musician.profilePictureUrl,
                    gasUps: [],
                    comments: [],
                };
                await prisma.musician.update({
                    where: { id: frontendSessionDto.musicianId },
                    data: {
                        totalPracticeMinutes: {
                            increment: frontendSessionDto.duration,
                        },
                        totalSessions: {
                            increment: 1,
                        },
                    },
                });
                return frontendSessionDto;
            });
            return createdSession;
        }
        catch (error) {
            throw new Error(`Failed to create session: ${error.message}`);
        }
    }
    async addComment(newComment) {
        const prisma = this.prisma;
        try {
            const createdComment = await prisma.$transaction(async (prisma) => {
                const createdComment = await prisma.comment.create({
                    data: {
                        text: newComment.text,
                        musician: {
                            connect: { id: newComment.musicianId },
                        },
                        session: {
                            connect: { id: newComment.sessionId },
                        },
                    },
                    include: {
                        musician: {
                            select: {
                                displayName: true,
                                profilePictureUrl: true,
                            },
                        },
                    },
                });
                const commentDto = {
                    id: createdComment.id,
                    text: createdComment.text,
                    createdAt: createdComment.createdAt,
                    musicianId: createdComment.musicianId,
                    sessionId: createdComment.sessionId,
                    musicianDisplayName: createdComment.musician.displayName,
                    musicianProfilePhotoUrl: createdComment.musician.profilePictureUrl,
                };
                console.log('comment created! here is comment:', commentDto);
                return commentDto;
            });
            return createdComment;
        }
        catch (error) {
            console.log('error adding comment:', error);
            throw new Error(`Failed to add comment: ${error.message}`);
        }
    }
    async addGasUp(newGasUp) {
        const prisma = this.prisma;
        try {
            const createdGasUp = await prisma.$transaction(async (prisma) => {
                const createdGasUp = await prisma.gasUp.create({
                    data: {
                        musician: {
                            connect: { id: newGasUp.gasserId },
                        },
                        session: {
                            connect: { id: newGasUp.sessionId },
                        },
                    },
                    include: {
                        musician: {
                            select: {
                                displayName: true,
                                profilePictureUrl: true,
                            },
                        },
                    },
                });
                await prisma.musician.update({
                    where: { id: newGasUp.gasserId },
                    data: {
                        totalGasUpsGiven: {
                            increment: 1,
                        },
                    },
                });
                await prisma.musician.update({
                    where: { id: newGasUp.musicianId },
                    data: {
                        totalGasUpsRecieved: {
                            increment: 1,
                        },
                    },
                });
                const innerCreatedGasUp = {
                    id: createdGasUp.id,
                    musicianId: createdGasUp.musicianId,
                    sessionId: createdGasUp.sessionId,
                    musicianProfilePhotoUrl: createdGasUp.musician.profilePictureUrl,
                    musicianDisplayName: createdGasUp.musician.displayName,
                };
                return innerCreatedGasUp;
            });
            return createdGasUp;
        }
        catch (error) {
            throw new Error(`Failed to gas up: ${error.message}`);
        }
    }
};
exports.SessionsService = SessionsService;
exports.SessionsService = SessionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SessionsService);
//# sourceMappingURL=sessions.service.js.map