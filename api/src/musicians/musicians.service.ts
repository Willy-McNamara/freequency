import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateMusicianDto,
  MusicianDto,
  MusicianFrontendDTO,
  MusicianJwtDto,
  MusicianUpdateDto,
  GoalDto,
  ProfileUpdateDto,
} from './dto/musician.dto';
import { format } from 'path';

@Injectable()
export class MusiciansService {
  constructor(private prisma: PrismaService) {}

  async getMusicianById(
    id: number,
    currentUserId?: number,
  ): Promise<MusicianFrontendDTO | null> {
    const prisma = this.prisma;

    // Use prisma musician query to get a musician by ID from the database
    const musician = await prisma.musician.findUnique({
      where: { id },
      include: {
        instruments: true,
      },
    });

    if (!musician) {
      return null; // Return null if musician is not found
    }

    // Fetch goals for the musician
    const goals = await this.prisma.goal.findMany({
      where: { musicianId: id },
      orderBy: { createdAt: 'asc' },
    });

    // Get follow status and counts if current user is provided
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
    } else if (currentUserId === id) {
      // If viewing own profile, just get counts
      const followCounts = await this.getFollowCounts(id);
      followerCount = followCounts.followerCount;
      followingCount = followCounts.followingCount;
    }

    // Map and return DTO
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

  async getGoalsForMusician(musicianId: number): Promise<GoalDto[]> {
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

  async createMusician(
    createMusicianDto: CreateMusicianDto,
  ): Promise<MusicianDto> {
    const prisma = this.prisma;

    let baseDisplayName = createMusicianDto.displayName;
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
            bio: 'Tell us about yourself as a musician! Eventually other users may be able to see your profile :)',
            totalSessions: 0,
            totalPracticeSeconds: 0,
            totalGasUpsGiven: 0,
            totalGasUpsReceived: 0,
          },
          include: {
            instruments: true,
          },
        });
        break; // Success
      } catch (error) {
        // If the error is a unique constraint violation on displayName, try a new one
        if (
          error.code === 'P2002' &&
          error.meta &&
          error.meta.target &&
          error.meta.target.includes('displayName')
        ) {
          displayName = `${baseDisplayName} ${suffix}`;
          suffix++;
        } else {
          // Other errors, rethrow
          throw new Error(`Failed to create musician: ${error.message}`);
        }
      }
    }

    // Map the created musician to the DTO
    const musicianDto: MusicianDto = {
      id: createdMusician.id,
      googleId: createdMusician.googleId ? createdMusician.googleId : null,
      displayName: createdMusician.displayName,
      email: createdMusician.email,
      bio: createdMusician.bio ? createdMusician.bio : '',
      instruments: createdMusician.instruments.map((tag) => tag.label), // Convert Tag objects to strings
      profilePictureUrl: createdMusician.avatarUrl,
      totalSessions: createdMusician.totalSessions,
      totalPracticeSeconds: createdMusician.totalPracticeSeconds,
      totalGasUpsGiven: createdMusician.totalGasUpsGiven,
      totalGasUpsReceived: createdMusician.totalGasUpsReceived,
      longestStreak: 0, // Not in schema, default to 0
      currentStreak: 0, // Not in schema, default to 0
      createdAt: createdMusician.createdAt,
      comments: [],
      sessions: [],
      givenName: createdMusician.givenName || '',
      familyName: createdMusician.familyName || '',
    };

    return musicianDto;
  }

  async findOrCreateMusician(
    loginInfo: CreateMusicianDto,
  ): Promise<MusicianJwtDto> {
    // Implement a findOrCreate method for musicians
    // try to find musician by email
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
      } else {
        // create and return
        return this.formatMusicianForJwt(await this.createMusician(loginInfo));
      }
    } catch (error) {
      // not sure what to do for the user in this scenario.. probably a modal of some kind. maybe i can
      // set that up via react router?
      throw new Error(`Failed to find or create musician: ${error.message}`);
    }
  }

  formatMusicianForJwt(musician: any): MusicianJwtDto {
    // Implement a method to format a musician for the frontend
    return {
      id: musician.id,
      email: musician.email,
      displayName: musician.displayName,
    };
  }

  async updateMusician(
    musicianUpdateDto: MusicianUpdateDto,
  ): Promise<MusicianFrontendDTO> {
    try {
      const updatedMusician = await this.prisma.musician.update({
        where: { id: musicianUpdateDto.id },
        data: {
          displayName: musicianUpdateDto.updatedDisplayName,
          bio: musicianUpdateDto.updatedBio,
          // Note: instruments relationship would need to be handled differently
          // For now, we'll skip instruments update
        },
        include: {
          instruments: true,
        },
      });

      const formattedUpdatedMusician: MusicianFrontendDTO =
        this.formatMusicianForFrontend(updatedMusician);

      return formattedUpdatedMusician;
    } catch (error) {
      console.error('Error updating musician:', error);
      throw new Error(`Failed to update musician: ${error.message}`);
    }
  }

  async updateProfile(
    musicianId: number,
    profileUpdateDto: ProfileUpdateDto,
  ): Promise<MusicianFrontendDTO> {
    try {
      const updatedMusician = await this.prisma.musician.update({
        where: { id: musicianId },
        data: {
          displayName: profileUpdateDto.displayName,
          bio: profileUpdateDto.bio,
          // Update instruments by disconnecting all and connecting new ones
          instruments: {
            set: [], // Clear existing instruments
            connect: profileUpdateDto.instruments.map((instrument) => ({
              label: instrument.label,
            })),
          },
        },
        include: {
          instruments: true,
        },
      });

      // Fetch goals for the musician
      const goals = await this.prisma.goal.findMany({
        where: { musicianId },
        orderBy: { createdAt: 'asc' },
      });

      // Return the updated musician in MusicianFrontendDTO format
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
    } catch (error) {
      console.error('Error updating musician profile:', error);
      throw new Error(`Failed to update musician profile: ${error.message}`);
    }
  }

  formatMusicianForFrontend(musician: any): MusicianFrontendDTO {
    const musicianDto: MusicianFrontendDTO = {
      id: musician.id,
      displayName: musician.displayName,
      bio: musician.bio ? musician.bio : '',
      instruments: musician.instruments || [], // Already TagDTO[] from Prisma
      profilePictureUrl: musician.avatarUrl,
      totalSessions: musician.totalSessions,
      totalPracticeSeconds: musician.totalPracticeSeconds,
      totalGasUpsGiven: musician.totalGasUpsGiven,
      totalGasUpsReceived: musician.totalGasUpsReceived,
      createdAt: musician.createdAt,
      goals: [], // Add empty goals array for now
    };

    return musicianDto;
  }

  async getAllDisplayNames(): Promise<string[]> {
    const musicians = await this.prisma.musician.findMany({
      select: { displayName: true },
      orderBy: { displayName: 'asc' },
    });
    return musicians.map((m) => m.displayName);
  }

  async getAllIdNames(): Promise<{ id: number; displayName: string }[]> {
    const musicians = await this.prisma.musician.findMany({
      select: { id: true, displayName: true },
      orderBy: { displayName: 'asc' },
    });
    return musicians;
  }

  async createGoalForMusician(
    musicianId: number,
    goalDto: GoalDto,
  ): Promise<GoalDto> {
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

  async deleteGoalForMusician(
    musicianId: number,
    goalId: number,
  ): Promise<void> {
    await this.prisma.goal.delete({
      where: {
        id: goalId,
        musicianId,
      },
    });
  }

  async followMusician(followerId: number, followingId: number): Promise<void> {
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }

    // Check if both musicians exist
    const [follower, following] = await Promise.all([
      this.prisma.musician.findUnique({ where: { id: followerId } }),
      this.prisma.musician.findUnique({ where: { id: followingId } }),
    ]);

    if (!follower || !following) {
      throw new Error('Musician not found');
    }

    // Check if already following
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

    // Create follow relationship
    await this.prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });
  }

  async unfollowMusician(
    followerId: number,
    followingId: number,
  ): Promise<void> {
    if (followerId === followingId) {
      throw new Error('Cannot unfollow yourself');
    }

    // Delete follow relationship
    await this.prisma.follow.deleteMany({
      where: {
        followerId,
        followingId,
      },
    });
  }

  async getFollowStatus(
    followerId: number,
    followingId: number,
  ): Promise<{ isFollowing: boolean }> {
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

  async getFollowCounts(
    musicianId: number,
  ): Promise<{ followerCount: number; followingCount: number }> {
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
}
