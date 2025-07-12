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
let SessionsService = class SessionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSessionsWithFilters(filters, cursor) {
        const take = 10;
        const whereConditions = {};
        if (filters.users.length > 0) {
            whereConditions.musician = {
                displayName: {
                    in: filters.users,
                },
            };
        }
        if (filters.instruments.length > 0) {
            whereConditions.instruments = {
                some: {
                    label: {
                        in: filters.instruments,
                    },
                },
            };
        }
        if (filters.tags.length > 0) {
            whereConditions.tags = {
                some: {
                    label: {
                        in: filters.tags,
                    },
                },
            };
        }
        if (filters.saved) {
            whereConditions.gasUps = {
                some: {},
            };
        }
        const sessions = await this.prisma.session.findMany({
            take: take + 1,
            cursor: cursor ? { id: parseInt(cursor) } : undefined,
            orderBy: { id: 'desc' },
            where: whereConditions,
            include: {
                gasUps: {
                    include: {
                        musician: {
                            select: {
                                displayName: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
                comments: {
                    include: {
                        musician: {
                            select: {
                                displayName: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
                musician: {
                    select: {
                        displayName: true,
                        avatarUrl: true,
                    },
                },
                media: {
                    select: {
                        url: true,
                        type: true,
                    },
                },
                tags: {
                    select: {
                        id: true,
                        label: true,
                        color: true,
                    },
                },
                instruments: {
                    select: {
                        id: true,
                        label: true,
                        color: true,
                    },
                },
            },
        });
        const hasMore = sessions.length > take;
        const sessionsToReturn = hasMore ? sessions.slice(0, take) : sessions;
        const nextCursor = hasMore
            ? sessionsToReturn[sessionsToReturn.length - 1].id.toString()
            : undefined;
        const frontendSessionDto = sessionsToReturn.map((session) => ({
            id: session.id,
            title: session.title,
            notes: session.notes,
            instruments: session.instruments.map((tag) => ({
                id: tag.id,
                label: tag.label,
                color: tag.color,
            })),
            duration: session.duration,
            isPublic: session.isPublic,
            createdAt: session.createdAt.toISOString(),
            musicianId: session.musicianId,
            musician: {
                displayName: session.musician.displayName,
                avatarUrl: session.musician.avatarUrl,
            },
            tags: session.tags.map((tag) => ({
                id: tag.id,
                label: tag.label,
                color: tag.color,
            })),
            gasUps: session.gasUps,
            comments: session.comments,
            media: session.media ?? null,
        }));
        return {
            sessions: frontendSessionDto,
            nextCursor,
        };
    }
    async getFiveSessions() {
        const result = await this.getSessionsWithFilters({
            users: [],
            instruments: [],
            tags: [],
            saved: false,
        });
        return result.sessions;
    }
    async createSession(newSession) {
        try {
            const createdSession = await this.prisma.$transaction(async (prisma) => {
                const createdSession = await prisma.session.create({
                    data: {
                        title: newSession.title,
                        notes: newSession.notes,
                        duration: newSession.duration,
                        isPublic: newSession.isPublic,
                        musician: {
                            connect: { id: newSession.musicianId },
                        },
                        instruments: {
                            connect: newSession.instruments.map((id) => ({ id })),
                        },
                        tags: {
                            connect: newSession.tags.map((id) => ({ id })),
                        },
                    },
                    include: {
                        musician: {
                            select: { displayName: true, avatarUrl: true },
                        },
                        gasUps: {
                            include: {
                                musician: {
                                    select: { displayName: true, avatarUrl: true },
                                },
                            },
                        },
                        comments: {
                            include: {
                                musician: {
                                    select: { displayName: true, avatarUrl: true },
                                },
                            },
                        },
                        media: {
                            select: { url: true, type: true },
                        },
                        tags: true,
                        instruments: true,
                    },
                });
                const totalTaskTime = newSession.tasks.reduce((sum, task) => sum + task.timeSpent, 0);
                for (const task of newSession.tasks) {
                    console.log('Creating TaskInUse for task:', task);
                    console.log('Task tags:', task.tags);
                    if (task.tags && task.tags.length > 0) {
                        const existingTags = await prisma.tag.findMany({
                            where: { id: { in: task.tags } },
                        });
                        console.log('Found existing tags:', existingTags);
                        if (existingTags.length !== task.tags.length) {
                            console.log('Warning: Some tags not found. Expected:', task.tags.length, 'Found:', existingTags.length);
                            task.tags = existingTags.map((tag) => tag.id);
                        }
                    }
                    await prisma.taskInUse.create({
                        data: {
                            duration: task.timeSpent,
                            notes: task.notes,
                            isSessionTask: false,
                            checklistCompletions: task.checklist
                                .filter((item) => item.checked)
                                .map((item) => item.item),
                            taskDefinition: {
                                connect: { id: task.id },
                            },
                            musician: {
                                connect: { id: newSession.musicianId },
                            },
                            session: {
                                connect: { id: createdSession.id },
                            },
                            tags: task.tags && task.tags.length > 0
                                ? {
                                    connect: task.tags.map((id) => ({ id })),
                                }
                                : undefined,
                        },
                    });
                }
                const sessionTaskDuration = newSession.duration - totalTaskTime;
                if (sessionTaskDuration > 0) {
                    console.log('Creating session TaskInUse with tags:', newSession.tags);
                    let sessionTags = newSession.tags;
                    if (sessionTags && sessionTags.length > 0) {
                        const existingSessionTags = await prisma.tag.findMany({
                            where: { id: { in: sessionTags } },
                        });
                        console.log('Found existing session tags:', existingSessionTags);
                        if (existingSessionTags.length !== sessionTags.length) {
                            console.log('Warning: Some session tags not found. Expected:', sessionTags.length, 'Found:', existingSessionTags.length);
                            sessionTags = existingSessionTags.map((tag) => tag.id);
                        }
                    }
                    await prisma.taskInUse.create({
                        data: {
                            duration: sessionTaskDuration,
                            notes: newSession.notes,
                            isSessionTask: true,
                            checklistCompletions: [],
                            musician: {
                                connect: { id: newSession.musicianId },
                            },
                            session: {
                                connect: { id: createdSession.id },
                            },
                            tags: sessionTags && sessionTags.length > 0
                                ? {
                                    connect: sessionTags.map((id) => ({ id })),
                                }
                                : undefined,
                        },
                    });
                }
                await prisma.musician.update({
                    where: { id: newSession.musicianId },
                    data: {
                        totalPracticeMinutes: {
                            increment: newSession.duration,
                        },
                        totalSessions: {
                            increment: 1,
                        },
                    },
                });
                const frontendSession = {
                    id: createdSession.id,
                    title: createdSession.title,
                    notes: createdSession.notes,
                    instruments: createdSession.instruments.map((tag) => ({
                        id: tag.id,
                        label: tag.label,
                        color: tag.color,
                    })),
                    duration: createdSession.duration,
                    isPublic: createdSession.isPublic,
                    createdAt: createdSession.createdAt.toISOString(),
                    musician: {
                        displayName: createdSession.musician.displayName,
                        avatarUrl: createdSession.musician.avatarUrl,
                    },
                    tags: createdSession.tags.map((tag) => ({
                        id: tag.id,
                        label: tag.label,
                        color: tag.color,
                    })),
                    gasUps: createdSession.gasUps,
                    comments: createdSession.comments,
                    media: createdSession.media ?? [],
                };
                return frontendSession;
            });
            return createdSession;
        }
        catch (error) {
            throw new Error(`Failed to create session: ${error.message}`);
        }
    }
};
exports.SessionsService = SessionsService;
exports.SessionsService = SessionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SessionsService);
//# sourceMappingURL=sessions.service.js.map