import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateMusicianDto,
  MusicianDto,
  MusicianFrontendDTO,
  MusicianJwtDto,
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
      profilePictureUrl: musician.profilePictureUrl,
      totalSessions: musician.totalSessions,
      totalPracticeMinutes: musician.totalPracticeMinutes,
      totalGasUps: musician.totalGasUps,
      longestStreak: musician.longestStreak,
      currentStreak: musician.currentStreak,
      createdAt: musician.createdAt,
    };
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
          profilePictureUrl: createMusicianDto.profilePictureUrl,
          bio: 'Tell us about yourself as a musician! Eventually other users may be able to see your profile :)',
          instruments: ["Singin'"],
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

      // Map the created musician to the DTO
      const musicianDto: MusicianDto = {
        id: createdMusician.id,
        googleId: createdMusician.googleId ? createdMusician.googleId : null,
        displayName: createdMusician.displayName,
        email: createdMusician.email,
        bio: createdMusician.bio ? createdMusician.bio : '',
        instruments: createdMusician.instruments,
        profilePictureUrl: createdMusician.profilePictureUrl,
        totalSessions: createdMusician.totalSessions,
        totalPracticeMinutes: createdMusician.totalPracticeMinutes,
        totalGasUps: createdMusician.totalGasUps,
        longestStreak: createdMusician.longestStreak,
        currentStreak: createdMusician.currentStreak,
        createdAt: createdMusician.createdAt,
        comments: [],
        sessions: [],
        givenName: '',
        familyName: '',
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
      });
      if (musician) {
        console.log('found musician!', musician);
        return this.formatMusicianForJwt(musician);
      } else {
        console.log('new user! creating musician with this info:', loginInfo);
        // create and return
        return this.formatMusicianForJwt(await this.createMusician(loginInfo));
      }
    } catch (error) {
      // not sure what to do for the user in this scenario.. probably a modal of some kind. maybe i can
      // set that up via react router?
      throw new Error(`Failed to find or create musician: ${error.message}`);
    }
  }

  formatMusicianForJwt(musician: MusicianDto): MusicianJwtDto {
    // Implement a method to format a musician for the frontend
    return {
      id: musician.id,
      email: musician.email,
      displayName: musician.displayName,
    };
  }
}
