import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateMusicianDto,
  MusicianDto,
  MusicianFrontendDTO,
  MusicianJwtDto,
  MusicianUpdateDto,
  GoalDto,
} from './dto/musician.dto';
import { format } from 'path';

@Injectable()
export class MusiciansService {
  constructor(private prisma: PrismaService) {}

  async getMusicianById(id: number): Promise<MusicianFrontendDTO | null> {
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

    // Map and return DTO
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

    try {
      // Create a new musician in the database
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
        totalPracticeMinutes: createdMusician.totalPracticeMinutes,
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
    } catch (error) {
      // Handle any errors during creation
      throw new Error(`Failed to create musician: ${error.message}`);
    }
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

  formatMusicianForFrontend(musician: any): MusicianFrontendDTO {
    const musicianDto: MusicianFrontendDTO = {
      id: musician.id,
      displayName: musician.displayName,
      bio: musician.bio ? musician.bio : '',
      instruments: musician.instruments || [], // Already TagDTO[] from Prisma
      profilePictureUrl: musician.avatarUrl,
      totalSessions: musician.totalSessions,
      totalPracticeMinutes: musician.totalPracticeMinutes,
      totalGasUpsGiven: musician.totalGasUpsGiven,
      totalGasUpsReceived: musician.totalGasUpsReceived,
      createdAt: musician.createdAt,
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
}
