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
    async getAllSessions() {
        const prisma = this.prisma;
        const sessions = await prisma.session.findMany({
            include: {
                musician: { select: { displayName: true } },
                gasUps: true,
                comments: true,
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
            gasUps: this.mapGasUps(session.gasUps),
            comments: this.mapComments(session.comments),
        }));
        return frontendSessionDto;
    }
    mapGasUps(gasUps) {
        return gasUps.map((gasUp) => ({
            id: gasUp.id,
            musicianId: gasUp.musicianId,
            sessionId: gasUp.sessionId,
        }));
    }
    mapComments(comments) {
        return comments.map((comment) => ({
            id: comment.id,
            text: comment.text,
            createdAt: comment.createdAt,
            musicianId: comment.musicianId,
            sessionId: comment.sessionId,
        }));
    }
    async createSession(req) {
        const prisma = this.prisma;
        try {
            const createdSession = await prisma.session.create({
                data: {
                    title: req.title,
                    notes: req.notes,
                    duration: Number(req.duration),
                    isPublic: req.isPublic,
                    takeId: (0, uuid_1.v4)(),
                    musician: {
                        connect: { id: Number(req.musicianId) },
                    },
                },
                include: {
                    musician: { select: { displayName: true } },
                },
            });
            const sessionDto = {
                id: createdSession.id,
                title: createdSession.title,
                notes: createdSession.notes,
                duration: createdSession.duration,
                isPublic: createdSession.isPublic,
                takeId: createdSession.takeId,
                createdAt: createdSession.createdAt,
                musicianId: createdSession.musicianId,
                gasUps: [],
                comments: [],
            };
            return sessionDto;
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