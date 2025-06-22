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
};
exports.SessionsService = SessionsService;
exports.SessionsService = SessionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SessionsService);
//# sourceMappingURL=sessions.service.js.map