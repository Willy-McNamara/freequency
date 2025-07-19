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
        if (filters.userIds.length > 0) {
            whereConditions.musicianId = {
                in: filters.userIds,
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
            if (filters.userIds.length > 0) {
                whereConditions.musicianId = filters.userIds[0];
            }
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
                                id: true,
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
                                id: true,
                                displayName: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
                musician: {
                    select: {
                        id: true,
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
                tasksInUse: {
                    include: {
                        taskDefinition: {
                            include: {
                                musician: {
                                    select: {
                                        id: true,
                                        displayName: true,
                                        avatarUrl: true,
                                    },
                                },
                            },
                        },
                        tags: {
                            select: {
                                id: true,
                                label: true,
                                color: true,
                            },
                        },
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
            musician: {
                id: session.musician.id,
                displayName: session.musician.displayName,
                avatarUrl: session.musician.avatarUrl,
            },
            tags: session.tags.map((tag) => ({
                id: tag.id,
                label: tag.label,
                color: tag.color,
            })),
            gasUps: session.gasUps.map((gasUp) => ({
                musician: {
                    id: gasUp.musician.id,
                    displayName: gasUp.musician.displayName,
                    avatarUrl: gasUp.musician.avatarUrl,
                },
            })),
            comments: session.comments.map((comment) => ({
                id: comment.id,
                text: comment.text,
                createdAt: comment.createdAt.toISOString(),
                musician: {
                    id: comment.musician.id,
                    displayName: comment.musician.displayName,
                    avatarUrl: comment.musician.avatarUrl,
                },
            })),
            media: session.media ?? [],
            tasks: session.tasksInUse
                .filter((taskInUse) => !taskInUse.isSessionTask && taskInUse.taskDefinition)
                .map((taskInUse) => ({
                id: taskInUse.id,
                title: taskInUse.taskDefinition.title,
                notes: taskInUse.notes,
                timeSpent: taskInUse.duration,
                taskDefinition: {
                    id: taskInUse.taskDefinition.id,
                    title: taskInUse.taskDefinition.title,
                    description: taskInUse.taskDefinition.description,
                    instrument: taskInUse.taskDefinition.musician.displayName,
                    user: {
                        id: taskInUse.taskDefinition.musician.id,
                        displayName: taskInUse.taskDefinition.musician.displayName,
                        avatarUrl: taskInUse.taskDefinition.musician.avatarUrl,
                    },
                    tags: taskInUse.tags.map((tag) => ({
                        id: tag.id,
                        label: tag.label,
                        color: tag.color,
                    })),
                    checklist: taskInUse.checklistCompletions,
                    savedCount: 0,
                    usedCount: 0,
                },
            })),
        }));
        return {
            sessions: frontendSessionDto,
            nextCursor,
        };
    }
    async getFiveSessions() {
        const sessions = await this.prisma.session.findMany({
            take: 5,
            orderBy: { id: 'desc' },
            include: {
                gasUps: {
                    include: {
                        musician: {
                            select: {
                                id: true,
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
                                id: true,
                                displayName: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
                musician: {
                    select: {
                        id: true,
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
                tasksInUse: {
                    include: {
                        taskDefinition: {
                            include: {
                                musician: {
                                    select: {
                                        id: true,
                                        displayName: true,
                                        avatarUrl: true,
                                    },
                                },
                            },
                        },
                        tags: {
                            select: {
                                id: true,
                                label: true,
                                color: true,
                            },
                        },
                    },
                },
            },
        });
        return sessions.map((session) => ({
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
            musician: {
                id: session.musician.id,
                displayName: session.musician.displayName,
                avatarUrl: session.musician.avatarUrl,
            },
            tags: session.tags.map((tag) => ({
                id: tag.id,
                label: tag.label,
                color: tag.color,
            })),
            gasUps: session.gasUps.map((gasUp) => ({
                musician: {
                    id: gasUp.musician.id,
                    displayName: gasUp.musician.displayName,
                    avatarUrl: gasUp.musician.avatarUrl,
                },
            })),
            comments: session.comments.map((comment) => ({
                id: comment.id,
                text: comment.text,
                createdAt: comment.createdAt.toISOString(),
                musician: {
                    id: comment.musician.id,
                    displayName: comment.musician.displayName,
                    avatarUrl: comment.musician.avatarUrl,
                },
            })),
            media: session.media.length > 0
                ? [
                    {
                        url: session.media[0].url,
                        type: session.media[0].type,
                    },
                ]
                : [],
            tasks: session.tasksInUse.map((taskInUse) => ({
                id: taskInUse.id,
                title: taskInUse.taskDefinition?.title || 'Session Task',
                timeSpent: taskInUse.duration,
                notes: taskInUse.notes,
                taskDefinition: {
                    id: taskInUse.taskDefinition?.id || 0,
                    title: taskInUse.taskDefinition?.title || 'Session Task',
                    description: taskInUse.taskDefinition?.description || '',
                    instrument: taskInUse.taskDefinition?.musician?.displayName || 'Unknown',
                    user: taskInUse.taskDefinition?.musician || {
                        id: 0,
                        displayName: 'Unknown',
                        avatarUrl: null,
                    },
                    tags: taskInUse.tags.map((tag) => ({
                        id: tag.id,
                        label: tag.label,
                        color: tag.color,
                    })),
                    checklist: taskInUse.taskDefinition?.checklist || [],
                    savedCount: taskInUse.taskDefinition?.savedCount || 0,
                    usedCount: taskInUse.taskDefinition?.usedCount || 0,
                },
            })),
        }));
    }
    async getSessionsFromFollowedUsers(currentUserId, cursor) {
        const take = 10;
        const followedUsers = await this.prisma.follow.findMany({
            where: { followerId: currentUserId },
            select: { followingId: true },
        });
        const followedUserIds = followedUsers.map((follow) => follow.followingId);
        if (followedUserIds.length === 0) {
            return { sessions: [], nextCursor: undefined };
        }
        const sessions = await this.prisma.session.findMany({
            take: take + 1,
            cursor: cursor ? { id: parseInt(cursor) } : undefined,
            orderBy: { id: 'desc' },
            where: {
                musicianId: {
                    in: followedUserIds,
                },
                isPublic: true,
            },
            include: {
                gasUps: {
                    include: {
                        musician: {
                            select: {
                                id: true,
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
                                id: true,
                                displayName: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
                musician: {
                    select: {
                        id: true,
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
                tasksInUse: {
                    include: {
                        taskDefinition: {
                            include: {
                                musician: {
                                    select: {
                                        id: true,
                                        displayName: true,
                                        avatarUrl: true,
                                    },
                                },
                            },
                        },
                        tags: {
                            select: {
                                id: true,
                                label: true,
                                color: true,
                            },
                        },
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
            musician: {
                id: session.musician.id,
                displayName: session.musician.displayName,
                avatarUrl: session.musician.avatarUrl,
            },
            tags: session.tags.map((tag) => ({
                id: tag.id,
                label: tag.label,
                color: tag.color,
            })),
            gasUps: session.gasUps.map((gasUp) => ({
                musician: {
                    id: gasUp.musician.id,
                    displayName: gasUp.musician.displayName,
                    avatarUrl: gasUp.musician.avatarUrl,
                },
            })),
            comments: session.comments.map((comment) => ({
                id: comment.id,
                text: comment.text,
                createdAt: comment.createdAt.toISOString(),
                musician: {
                    id: comment.musician.id,
                    displayName: comment.musician.displayName,
                    avatarUrl: comment.musician.avatarUrl,
                },
            })),
            media: session.media.length > 0
                ? [
                    {
                        url: session.media[0].url,
                        type: session.media[0].type,
                    },
                ]
                : [],
            tasks: session.tasksInUse.map((taskInUse) => ({
                id: taskInUse.id,
                title: taskInUse.taskDefinition?.title || 'Session Task',
                timeSpent: taskInUse.duration,
                notes: taskInUse.notes,
                taskDefinition: {
                    id: taskInUse.taskDefinition?.id || 0,
                    title: taskInUse.taskDefinition?.title || 'Session Task',
                    description: taskInUse.taskDefinition?.description || '',
                    instrument: taskInUse.taskDefinition?.musician?.displayName || 'Unknown',
                    user: taskInUse.taskDefinition?.musician || {
                        id: 0,
                        displayName: 'Unknown',
                        avatarUrl: null,
                    },
                    tags: taskInUse.tags.map((tag) => ({
                        id: tag.id,
                        label: tag.label,
                        color: tag.color,
                    })),
                    checklist: taskInUse.taskDefinition?.checklist || [],
                    savedCount: taskInUse.taskDefinition?.savedCount || 0,
                    usedCount: taskInUse.taskDefinition?.usedCount || 0,
                },
            })),
        }));
        return { sessions: frontendSessionDto, nextCursor };
    }
    async getFollowedUserDisplayNames(currentUserId) {
        const followed = await this.prisma.follow.findMany({
            where: { followerId: currentUserId },
            select: { following: { select: { displayName: true } } },
        });
        return followed.map((f) => f.following.displayName);
    }
    async getFollowedUserIds(currentUserId) {
        const followed = await this.prisma.follow.findMany({
            where: { followerId: currentUserId },
            select: { followingId: true },
        });
        return followed.map((f) => f.followingId);
    }
    async createSession(newSession) {
        try {
            const createdSession = await this.prisma.$transaction(async (prisma) => {
                const instrumentTags = await Promise.all(newSession.instruments.map(async (label) => {
                    let tag = await prisma.tag.findUnique({
                        where: { label },
                    });
                    if (!tag) {
                        tag = await prisma.tag.create({
                            data: { label },
                        });
                    }
                    return tag;
                }));
                const regularTags = await Promise.all(newSession.tags.map(async (label) => {
                    let tag = await prisma.tag.findUnique({
                        where: { label },
                    });
                    if (!tag) {
                        tag = await prisma.tag.create({
                            data: { label },
                        });
                    }
                    return tag;
                }));
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
                            connect: instrumentTags.map((tag) => ({ id: tag.id })),
                        },
                        tags: {
                            connect: regularTags.map((tag) => ({ id: tag.id })),
                        },
                    },
                    include: {
                        musician: {
                            select: { id: true, displayName: true, avatarUrl: true },
                        },
                        gasUps: {
                            include: {
                                musician: {
                                    select: { id: true, displayName: true, avatarUrl: true },
                                },
                            },
                        },
                        comments: {
                            include: {
                                musician: {
                                    select: { id: true, displayName: true, avatarUrl: true },
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
                    let taskTagIds = [];
                    if (task.tags && task.tags.length > 0) {
                        const taskTags = await Promise.all(task.tags.map(async (label) => {
                            let tag = await prisma.tag.findUnique({
                                where: { label },
                            });
                            if (!tag) {
                                tag = await prisma.tag.create({
                                    data: { label },
                                });
                            }
                            return tag;
                        }));
                        taskTagIds = taskTags.map((tag) => tag.id);
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
                            tags: taskTagIds.length > 0
                                ? {
                                    connect: taskTagIds.map((id) => ({ id })),
                                }
                                : undefined,
                        },
                    });
                }
                const sessionTaskDuration = newSession.duration - totalTaskTime;
                if (sessionTaskDuration > 0) {
                    console.log('Creating session TaskInUse with tags:', newSession.tags);
                    let sessionTaskTagIds = [];
                    if (newSession.tags && newSession.tags.length > 0) {
                        const sessionTaskTags = await Promise.all(newSession.tags.map(async (label) => {
                            let tag = await prisma.tag.findUnique({
                                where: { label },
                            });
                            if (!tag) {
                                tag = await prisma.tag.create({
                                    data: { label },
                                });
                            }
                            return tag;
                        }));
                        sessionTaskTagIds = sessionTaskTags.map((tag) => tag.id);
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
                            tags: sessionTaskTagIds.length > 0
                                ? {
                                    connect: sessionTaskTagIds.map((id) => ({ id })),
                                }
                                : undefined,
                        },
                    });
                }
                await prisma.musician.update({
                    where: { id: newSession.musicianId },
                    data: {
                        totalPracticeSeconds: {
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
                        id: newSession.musicianId,
                        displayName: createdSession.musician.displayName,
                        avatarUrl: createdSession.musician.avatarUrl,
                    },
                    tags: createdSession.tags.map((tag) => ({
                        id: tag.id,
                        label: tag.label,
                        color: tag.color,
                    })),
                    gasUps: createdSession.gasUps.map((gasUp) => ({
                        musician: {
                            id: gasUp.musician.id,
                            displayName: gasUp.musician.displayName,
                            avatarUrl: gasUp.musician.avatarUrl,
                        },
                    })),
                    comments: createdSession.comments.map((comment) => ({
                        id: comment.id,
                        text: comment.text,
                        createdAt: comment.createdAt.toISOString(),
                        musician: {
                            id: comment.musician.id,
                            displayName: comment.musician.displayName,
                            avatarUrl: comment.musician.avatarUrl,
                        },
                    })),
                    media: createdSession.media ?? [],
                    tasks: [],
                };
                return frontendSession;
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
                                avatarUrl: true,
                            },
                        },
                    },
                });
                return createdComment;
            });
            return createdComment;
        }
        catch (error) {
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
                                avatarUrl: true,
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
                        totalGasUpsReceived: {
                            increment: 1,
                        },
                    },
                });
                return createdGasUp;
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