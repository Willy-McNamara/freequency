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
            displayName: musician.displayName,
            bio: musician.bio ? musician.bio : '',
            instruments: musician.instruments,
            profilePictureUrl: musician.profilePictureUrl,
            totalSessions: musician.totalSessions,
            totalPracticeMinutes: musician.totalPracticeMinutes,
            totalGasUpsGiven: musician.totalGasUpsGiven,
            totalGasUpsRecieved: musician.totalGasUpsRecieved,
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
                    displayName: createMusicianDto.displayName,
                    givenName: createMusicianDto.givenName,
                    familyName: createMusicianDto.familyName,
                    email: createMusicianDto.email,
                    profilePictureUrl: createMusicianDto.profilePictureUrl,
                    bio: 'Tell us about yourself as a musician! Eventually other users may be able to see your profile :)',
                    instruments: ["Singin'"],
                    totalSessions: 0,
                    totalPracticeMinutes: 0,
                    totalGasUpsGiven: 0,
                    totalGasUpsRecieved: 0,
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
                googleId: createdMusician.googleId ? createdMusician.googleId : null,
                displayName: createdMusician.displayName,
                email: createdMusician.email,
                bio: createdMusician.bio ? createdMusician.bio : '',
                instruments: createdMusician.instruments,
                profilePictureUrl: createdMusician.profilePictureUrl,
                totalSessions: createdMusician.totalSessions,
                totalPracticeMinutes: createdMusician.totalPracticeMinutes,
                totalGasUpsGiven: createdMusician.totalGasUpsGiven,
                totalGasUpsRecieved: createdMusician.totalGasUpsRecieved,
                longestStreak: createdMusician.longestStreak,
                currentStreak: createdMusician.currentStreak,
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
            });
            if (musician) {
                console.log('found musician!', musician);
                return this.formatMusicianForJwt(musician);
            }
            else {
                console.log('new user! creating musician with this info:', loginInfo);
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
                    instruments: { set: musicianUpdateDto.updatedInstruments },
                },
            });
            const formattedUpdatedMusician = this.formatMusicianForFrontend(updatedMusician);
            console.log('musician successfully updated!', formattedUpdatedMusician);
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
            instruments: musician.instruments,
            profilePictureUrl: musician.profilePictureUrl,
            totalSessions: musician.totalSessions,
            totalPracticeMinutes: musician.totalPracticeMinutes,
            totalGasUpsGiven: musician.totalGasUpsGiven,
            totalGasUpsRecieved: musician.totalGasUpsRecieved,
            longestStreak: musician.longestStreak,
            currentStreak: musician.currentStreak,
            createdAt: musician.createdAt,
        };
        return musicianDto;
    }
};
exports.MusiciansService = MusiciansService;
exports.MusiciansService = MusiciansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MusiciansService);
//# sourceMappingURL=musicians.service.js.map