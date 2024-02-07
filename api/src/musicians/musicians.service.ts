import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateMusicianDto,
  MusicianDto,
  MusicianFrontendDTO,
} from "./dto/musician.dto";

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

  async createMusician(
    createMusicianDto: CreateMusicianDto
  ): Promise<MusicianDto> {
    const prisma = this.prisma;

    try {
      // Create a new musician in the database
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

      // Map the created musician to the DTO
      const musicianDto: MusicianDto = {
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
    } catch (error) {
      // Handle any errors during creation
      throw new Error(`Failed to create musician: ${error.message}`);
    }
  }
}
