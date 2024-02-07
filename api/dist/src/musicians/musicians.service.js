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
        });
        if (!musician) {
            return null;
        }
        return {
            id: musician.id,
            googleId: musician.googleId,
            username: musician.username,
            email: musician.email,
            profilePictureUrl: musician.profilePictureUrl,
            totalSessions: musician.totalSessions,
            totalPracticeMinutes: musician.totalPracticeMinutes,
            totalGasUps: musician.totalGasUps,
            longestStreak: musician.longestStreak,
            currentStreak: musician.currentStreak,
            createdAt: musician.createdAt,
        };
    }
    async createMusician(createMusicianDto) {
        const prisma = this.prisma;
        try {
            const createdMusician = await prisma.musician.create({
                data: {
                    googleId: createMusicianDto.googleId,
                    username: createMusicianDto.username,
                    email: createMusicianDto.email,
                    password: createMusicianDto.password,
                    profilePictureUrl: createMusicianDto.profilePictureUrl,
                    totalSessions: 0,
                    totalPracticeMinutes: 0,
                    totalGasUps: 0,
                    longestStreak: 0,
                    currentStreak: 0,
                    comments: {
                        create: [],
                    },
                    sessions: {
                        create: [],
                    },
                },
            });
            const musicianDto = {
                id: createdMusician.id,
                googleId: createdMusician.googleId,
                username: createdMusician.username,
                email: createdMusician.email,
                password: createdMusician.password,
                profilePictureUrl: createdMusician.profilePictureUrl,
                totalSessions: createdMusician.totalSessions,
                totalPracticeMinutes: createdMusician.totalPracticeMinutes,
                totalGasUps: createdMusician.totalGasUps,
                longestStreak: createdMusician.longestStreak,
                currentStreak: createdMusician.currentStreak,
                createdAt: createdMusician.createdAt,
                comments: [],
                sessions: [],
            };
            return musicianDto;
        }
        catch (error) {
            throw new Error(`Failed to create musician: ${error.message}`);
        }
    }
};
exports.MusiciansService = MusiciansService;
exports.MusiciansService = MusiciansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MusiciansService);
//# sourceMappingURL=musicians.service.js.map