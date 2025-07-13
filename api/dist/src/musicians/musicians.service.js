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
exports.MusiciansService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MusiciansService = class MusiciansService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMusicianById(id) {
        const prisma = this.prisma;
        const musician = await prisma.musician.findUnique({
            where: { id },
            include: {
                instruments: true,
            },
        });
        if (!musician) {
            return null;
        }
        const goals = await this.prisma.goal.findMany({
            where: { musicianId: id },
            orderBy: { createdAt: 'asc' },
        });
        return {
            id: musician.id,
            displayName: musician.displayName,
            bio: musician.bio ? musician.bio : '',
            instruments: musician.instruments,
            profilePictureUrl: musician.avatarUrl,
            totalSessions: musician.totalSessions,
            totalPracticeMinutes: musician.totalPracticeMinutes,
            totalGasUpsGiven: musician.totalGasUpsGiven,
            totalGasUpsReceived: musician.totalGasUpsReceived,
            createdAt: musician.createdAt,
            goals: goals.map((g) => ({
                id: g.id,
                musicianId: g.musicianId,
                tag: g.tag,
                type: g.type,
                target: g.target,
                timeFrame: g.timeFrame,
                createdAt: g.createdAt,
            })),
        };
    }
    async getGoalsForMusician(musicianId) {
        const goals = await this.prisma.goal.findMany({
            where: { musicianId },
            orderBy: { createdAt: 'asc' },
        });
        return goals.map((g) => ({
            id: g.id,
            musicianId: g.musicianId,
            tag: g.tag,
            type: g.type,
            target: g.target,
            timeFrame: g.timeFrame,
            createdAt: g.createdAt,
        }));
    }
    async createMusician(createMusicianDto) {
        const prisma = this.prisma;
        try {
            const createdMusician = await prisma.musician.create({
                data: {
                    googleId: createMusicianDto.googleId,
                    displayName: createMusicianDto.displayName,
                    givenName: createMusicianDto.givenName,
                    familyName: createMusicianDto.familyName,
                    email: createMusicianDto.email,
                    avatarUrl: createMusicianDto.profilePictureUrl,
                    bio: 'Tell us about yourself as a musician! Eventually other users may be able to see your profile :)',
                    totalSessions: 0,
                    totalPracticeMinutes: 0,
                    totalGasUpsGiven: 0,
                    totalGasUpsReceived: 0,
                },
                include: {
                    instruments: true,
                },
            });
            const musicianDto = {
                id: createdMusician.id,
                googleId: createdMusician.googleId ? createdMusician.googleId : null,
                displayName: createdMusician.displayName,
                email: createdMusician.email,
                bio: createdMusician.bio ? createdMusician.bio : '',
                instruments: createdMusician.instruments.map((tag) => tag.label),
                profilePictureUrl: createdMusician.avatarUrl,
                totalSessions: createdMusician.totalSessions,
                totalPracticeMinutes: createdMusician.totalPracticeMinutes,
                totalGasUpsGiven: createdMusician.totalGasUpsGiven,
                totalGasUpsReceived: createdMusician.totalGasUpsReceived,
                longestStreak: 0,
                currentStreak: 0,
                createdAt: createdMusician.createdAt,
                comments: [],
                sessions: [],
                givenName: createdMusician.givenName || '',
                familyName: createdMusician.familyName || '',
            };
            return musicianDto;
        }
        catch (error) {
            throw new Error(`Failed to create musician: ${error.message}`);
        }
    }
    async findOrCreateMusician(loginInfo) {
        let email = loginInfo.email;
        try {
            const musician = await this.prisma.musician.findUnique({
                where: { email },
                include: {
                    instruments: true,
                },
            });
            if (musician) {
                return this.formatMusicianForJwt(musician);
            }
            else {
                return this.formatMusicianForJwt(await this.createMusician(loginInfo));
            }
        }
        catch (error) {
            throw new Error(`Failed to find or create musician: ${error.message}`);
        }
    }
    formatMusicianForJwt(musician) {
        return {
            id: musician.id,
            email: musician.email,
            displayName: musician.displayName,
        };
    }
    async updateMusician(musicianUpdateDto) {
        try {
            const updatedMusician = await this.prisma.musician.update({
                where: { id: musicianUpdateDto.id },
                data: {
                    displayName: musicianUpdateDto.updatedDisplayName,
                    bio: musicianUpdateDto.updatedBio,
                },
                include: {
                    instruments: true,
                },
            });
            const formattedUpdatedMusician = this.formatMusicianForFrontend(updatedMusician);
            return formattedUpdatedMusician;
        }
        catch (error) {
            console.error('Error updating musician:', error);
            throw new Error(`Failed to update musician: ${error.message}`);
        }
    }
    formatMusicianForFrontend(musician) {
        const musicianDto = {
            id: musician.id,
            displayName: musician.displayName,
            bio: musician.bio ? musician.bio : '',
            instruments: musician.instruments || [],
            profilePictureUrl: musician.avatarUrl,
            totalSessions: musician.totalSessions,
            totalPracticeMinutes: musician.totalPracticeMinutes,
            totalGasUpsGiven: musician.totalGasUpsGiven,
            totalGasUpsReceived: musician.totalGasUpsReceived,
            createdAt: musician.createdAt,
        };
        return musicianDto;
    }
    async getAllDisplayNames() {
        const musicians = await this.prisma.musician.findMany({
            select: { displayName: true },
            orderBy: { displayName: 'asc' },
        });
        return musicians.map((m) => m.displayName);
    }
    async createGoalForMusician(musicianId, goalDto) {
        const created = await this.prisma.goal.create({
            data: {
                musicianId,
                tag: goalDto.tag,
                type: goalDto.type,
                target: goalDto.target,
                timeFrame: goalDto.timeFrame,
            },
        });
        return {
            id: created.id,
            musicianId: created.musicianId,
            tag: created.tag,
            type: created.type,
            target: created.target,
            timeFrame: created.timeFrame,
            createdAt: created.createdAt,
        };
    }
    async deleteGoalForMusician(musicianId, goalId) {
        await this.prisma.goal.delete({
            where: {
                id: goalId,
                musicianId,
            },
        });
    }
};
exports.MusiciansService = MusiciansService;
exports.MusiciansService = MusiciansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MusiciansService);
//# sourceMappingURL=musicians.service.js.map