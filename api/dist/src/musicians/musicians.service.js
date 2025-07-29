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
    async getMusicianById(id, currentUserId) {
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
        let isFollowing = false;
        let followerCount = 0;
        let followingCount = 0;
        if (currentUserId && currentUserId !== id) {
            const [followStatus, followCounts] = await Promise.all([
                this.getFollowStatus(currentUserId, id),
                this.getFollowCounts(id),
            ]);
            isFollowing = followStatus.isFollowing;
            followerCount = followCounts.followerCount;
            followingCount = followCounts.followingCount;
        }
        else if (currentUserId === id) {
            const followCounts = await this.getFollowCounts(id);
            followerCount = followCounts.followerCount;
            followingCount = followCounts.followingCount;
        }
        return {
            id: musician.id,
            displayName: musician.displayName,
            bio: musician.bio ? musician.bio : '',
            instruments: musician.instruments,
            profilePictureUrl: musician.avatarUrl,
            totalSessions: musician.totalSessions,
            totalPracticeSeconds: musician.totalPracticeSeconds,
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
            isFollowing,
            followerCount,
            followingCount,
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
        const baseDisplayName = createMusicianDto.displayName;
        let displayName = baseDisplayName;
        let suffix = 1;
        let createdMusician;
        while (true) {
            try {
                createdMusician = await prisma.musician.create({
                    data: {
                        googleId: createMusicianDto.googleId,
                        displayName: displayName,
                        givenName: createMusicianDto.givenName,
                        familyName: createMusicianDto.familyName,
                        email: createMusicianDto.email,
                        avatarUrl: createMusicianDto.profilePictureUrl,
                        bio: 'A place for you to describe yourself as a musician :)',
                        totalSessions: 0,
                        totalPracticeSeconds: 0,
                        totalGasUpsGiven: 0,
                        totalGasUpsReceived: 0,
                    },
                    include: {
                        instruments: true,
                    },
                });
                break;
            }
            catch (error) {
                if (error.code === 'P2002' &&
                    error.meta &&
                    error.meta.target &&
                    error.meta.target.includes('displayName')) {
                    displayName = `${baseDisplayName} ${suffix}`;
                    suffix++;
                }
                else {
                    throw new Error(`Failed to create musician: ${error.message}`);
                }
            }
        }
        const musicianDto = {
            id: createdMusician.id,
            googleId: createdMusician.googleId ? createdMusician.googleId : null,
            displayName: createdMusician.displayName,
            email: createdMusician.email,
            bio: createdMusician.bio ? createdMusician.bio : '',
            instruments: createdMusician.instruments.map((tag) => tag.label),
            profilePictureUrl: createdMusician.avatarUrl,
            totalSessions: createdMusician.totalSessions,
            totalPracticeSeconds: createdMusician.totalPracticeSeconds,
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
    async findOrCreateMusician(loginInfo) {
        const email = loginInfo.email;
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
    async updateProfile(musicianId, profileUpdateDto) {
        try {
            const updatedMusician = await this.prisma.musician.update({
                where: { id: musicianId },
                data: {
                    displayName: profileUpdateDto.displayName,
                    bio: profileUpdateDto.bio,
                    instruments: {
                        set: [],
                        connect: profileUpdateDto.instruments.map((instrument) => ({
                            label: instrument.label,
                        })),
                    },
                },
                include: {
                    instruments: true,
                },
            });
            const goals = await this.prisma.goal.findMany({
                where: { musicianId },
                orderBy: { createdAt: 'asc' },
            });
            return {
                id: updatedMusician.id,
                displayName: updatedMusician.displayName,
                bio: updatedMusician.bio ? updatedMusician.bio : '',
                instruments: updatedMusician.instruments,
                profilePictureUrl: updatedMusician.avatarUrl,
                totalSessions: updatedMusician.totalSessions,
                totalPracticeSeconds: updatedMusician.totalPracticeSeconds,
                totalGasUpsGiven: updatedMusician.totalGasUpsGiven,
                totalGasUpsReceived: updatedMusician.totalGasUpsReceived,
                createdAt: updatedMusician.createdAt,
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
        catch (error) {
            console.error('Error updating musician profile:', error);
            throw new Error(`Failed to update musician profile: ${error.message}`);
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
            totalPracticeSeconds: musician.totalPracticeSeconds,
            totalGasUpsGiven: musician.totalGasUpsGiven,
            totalGasUpsReceived: musician.totalGasUpsReceived,
            createdAt: musician.createdAt,
            goals: [],
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
    async getAllIdNames() {
        const musicians = await this.prisma.musician.findMany({
            select: { id: true, displayName: true },
            orderBy: { displayName: 'asc' },
        });
        return musicians;
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
    async updateGoalForMusician(musicianId, goalId, goalDto) {
        const updated = await this.prisma.goal.update({
            where: {
                id: goalId,
                musicianId,
            },
            data: {
                tag: goalDto.tag,
                type: goalDto.type,
                target: goalDto.target,
                timeFrame: goalDto.timeFrame,
            },
        });
        return {
            id: updated.id,
            musicianId: updated.musicianId,
            tag: updated.tag,
            type: updated.type,
            target: updated.target,
            timeFrame: updated.timeFrame,
            createdAt: updated.createdAt,
        };
    }
    async followMusician(followerId, followingId) {
        if (followerId === followingId) {
            throw new Error('Cannot follow yourself');
        }
        const [follower, following] = await Promise.all([
            this.prisma.musician.findUnique({ where: { id: followerId } }),
            this.prisma.musician.findUnique({ where: { id: followingId } }),
        ]);
        if (!follower || !following) {
            throw new Error('Musician not found');
        }
        const existingFollow = await this.prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });
        if (existingFollow) {
            throw new Error('Already following this musician');
        }
        await this.prisma.follow.create({
            data: {
                followerId,
                followingId,
            },
        });
    }
    async unfollowMusician(followerId, followingId) {
        if (followerId === followingId) {
            throw new Error('Cannot unfollow yourself');
        }
        await this.prisma.follow.deleteMany({
            where: {
                followerId,
                followingId,
            },
        });
    }
    async getFollowStatus(followerId, followingId) {
        if (followerId === followingId) {
            return { isFollowing: false };
        }
        const follow = await this.prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });
        return { isFollowing: !!follow };
    }
    async getFollowCounts(musicianId) {
        const [followerCount, followingCount] = await Promise.all([
            this.prisma.follow.count({
                where: { followingId: musicianId },
            }),
            this.prisma.follow.count({
                where: { followerId: musicianId },
            }),
        ]);
        return { followerCount, followingCount };
    }
};
exports.MusiciansService = MusiciansService;
exports.MusiciansService = MusiciansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MusiciansService);
//# sourceMappingURL=musicians.service.js.map