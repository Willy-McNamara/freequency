import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CommentDto,
  CreateSessionDto,
  FrontendSessionDto,
  GasUpDto,
  NewCommentDto,
  NewGasUpDto,
  SessionDto,
} from './dto/session.dto';
import { v4 as uuidv4 } from 'uuid';
import {
  FrontendCommentDto,
  FrontendGasUpDto,
} from 'src/musicians/dto/musician.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async getFiveSessions(): Promise<FrontendSessionDto[]> {
    const prisma = this.prisma;

    const take = 5;

    // Query all sessions from the database, includes musician.displayName, and displayName + photo for gasUps and comments
    const sessions = await prisma.session.findMany({
      take: take,
      orderBy: { id: 'desc' },
      include: {
        gasUps: {
          include: {
            musician: {
              select: {
                displayName: true,
                profilePictureUrl: true,
              },
            },
          },
        },
        comments: {
          include: {
            musician: {
              select: {
                displayName: true,
                profilePictureUrl: true,
              },
            },
          },
        },
        musician: {
          select: {
            displayName: true,
            profilePictureUrl: true,
          },
        },
      },
    });

    // Map the database sessions to SessionWithDetailsDto objects
    const frontendSessionDto: FrontendSessionDto[] = sessions.map(
      (session) => ({
        id: session.id,
        title: session.title,
        notes: session.notes,
        instruments: session.instruments,
        duration: session.duration,
        isPublic: session.isPublic,
        takeId: session.takeId,
        createdAt: session.createdAt,
        musicianId: session.musicianId,
        musicianDisplayname: session.musician.displayName,
        musicianProfilePictureUrl: session.musician.profilePictureUrl,
        gasUps: session.gasUps,
        comments: session.comments,
      }),
    );

    return frontendSessionDto;
  }

  async getSessionsChunk(cursorId?: number): Promise<FrontendSessionDto[]> {
    const prisma = this.prisma;
    const skip = 1;
    const take = 5;

    // Easier for typescript if you include the query directly in the method (not modularized out as a variable)
    const sessions = await prisma.session.findMany({
      take,
      skip,
      orderBy: { id: 'desc' },
      cursor: {
        id: cursorId,
      },
      include: {
        gasUps: {
          include: {
            musician: {
              select: {
                displayName: true,
                profilePictureUrl: true,
              },
            },
          },
        },
        comments: {
          include: {
            musician: {
              select: {
                displayName: true,
                profilePictureUrl: true,
              },
            },
          },
        },
        musician: {
          select: {
            displayName: true,
            profilePictureUrl: true,
          },
        },
      },
    });

    // Map the database sessions to SessionWithDetailsDto objects
    const frontendSessions: FrontendSessionDto[] = sessions.map((session) => ({
      id: session.id,
      title: session.title,
      notes: session.notes,
      instruments: session.instruments,
      duration: session.duration,
      isPublic: session.isPublic,
      takeId: session.takeId,
      createdAt: session.createdAt,
      musicianId: session.musicianId,
      musicianDisplayname: session.musician.displayName,
      musicianProfilePictureUrl: session.musician.profilePictureUrl,
      gasUps: session.gasUps,
      comments: session.comments,
    }));

    return frontendSessions;
  }

  async createSession(
    newSession: CreateSessionDto,
  ): Promise<FrontendSessionDto> {
    const prisma = this.prisma;

    try {
      // $transactions enforce atomicity. so if any db operation fails, the entire transaction is rolled back
      const createdSession = await prisma.$transaction(async (prisma) => {
        // Create a new session in the database
        const createdSession = await prisma.session.create({
          data: {
            title: newSession.title,
            notes: newSession.notes,
            instruments: newSession.instruments,
            duration: Number(newSession.duration),
            isPublic: newSession.isPublic,
            takeId: uuidv4(),
            musician: {
              connect: { id: Number(newSession.musicianId) },
            },
          },
          include: {
            musician: {
              select: { displayName: true, profilePictureUrl: true },
            },
          },
        });

        // Map the created session to the SessionDto
        const frontendSessionDto: FrontendSessionDto = {
          id: createdSession.id,
          title: createdSession.title,
          notes: createdSession.notes,
          instruments: createdSession.instruments,
          duration: createdSession.duration,
          isPublic: createdSession.isPublic,
          takeId: createdSession.takeId,
          createdAt: createdSession.createdAt,
          musicianId: createdSession.musicianId,
          musicianDisplayname: createdSession.musician.displayName,
          musicianProfilePictureUrl: createdSession.musician.profilePictureUrl,
          gasUps: [],
          comments: [],
        };

        await prisma.musician.update({
          where: { id: frontendSessionDto.musicianId },
          data: {
            totalPracticeMinutes: {
              increment: frontendSessionDto.duration,
            },
            totalSessions: {
              increment: 1,
            },
          },
        });

        return frontendSessionDto;
      });
      return createdSession;
    } catch (error) {
      // Handle any errors during creation
      throw new Error(`Failed to create session: ${error.message}`);
    }
  }

  async addComment(newComment: NewCommentDto): Promise<FrontendCommentDto> {
    const prisma = this.prisma;

    try {
      // $transactions enforce atomicity. so if any db operation fails, the entire transaction is rolled back
      const createdComment = await prisma.$transaction(async (prisma) => {
        const createdComment = await prisma.comment.create({
          data: {
            text: newComment.text,
            musician: {
              connect: { id: newComment.musicianId },
            },
            session: {
              connect: { id: newComment.sessionId },
            },
          },
          include: {
            musician: {
              select: {
                displayName: true,
                profilePictureUrl: true,
              },
            },
          },
        });

        // Map the created comment to the CommentDto
        const commentDto: FrontendCommentDto = {
          id: createdComment.id,
          text: createdComment.text,
          createdAt: createdComment.createdAt,
          musicianId: createdComment.musicianId,
          sessionId: createdComment.sessionId,
          musicianDisplayName: createdComment.musician.displayName, // seeing lint here, i think it's the IDE not recognizing the most recent migration..
          musicianProfilePhotoUrl: createdComment.musician.profilePictureUrl,
        };
        console.log('comment created! here is comment:', commentDto);
        return commentDto;
      });
      return createdComment;
    } catch (error) {
      // Handle any errors during creation
      console.log('error adding comment:', error);
      throw new Error(`Failed to add comment: ${error.message}`);
    }
  }

  async addGasUp(newGasUp: NewGasUpDto): Promise<FrontendGasUpDto> {
    const prisma = this.prisma;

    try {
      // $transactions enforce atomicity. so if any db operation fails, the entire transaction is rolled back
      const createdGasUp = await prisma.$transaction(async (prisma) => {
        const createdGasUp = await prisma.gasUp.create({
          data: {
            musician: {
              connect: { id: newGasUp.gasserId },
            },
            session: {
              connect: { id: newGasUp.sessionId },
            },
          },
          include: {
            musician: {
              select: {
                displayName: true,
                profilePictureUrl: true,
              },
            },
          },
        });

        // update the gassersUppers stats
        await prisma.musician.update({
          where: { id: newGasUp.gasserId },
          data: {
            totalGasUpsGiven: {
              increment: 1,
            },
          },
        });
        // update stats for the musician recieving the gas up
        await prisma.musician.update({
          where: { id: newGasUp.musicianId },
          data: {
            // Update fields as needed
            // Assuming you want to increment the totalGasUps field
            totalGasUpsRecieved: {
              increment: 1,
            },
          },
        });

        //format FrontendGasUpDto
        const innerCreatedGasUp: FrontendGasUpDto = {
          id: createdGasUp.id,
          musicianId: createdGasUp.musicianId,
          sessionId: createdGasUp.sessionId,
          musicianProfilePhotoUrl: createdGasUp.musician.profilePictureUrl,
          musicianDisplayName: createdGasUp.musician.displayName,
        };

        // update gas recievers stats
        return innerCreatedGasUp;
      });
      return createdGasUp;
    } catch (error) {
      // Handle any errors during creation
      throw new Error(`Failed to gas up: ${error.message}`);
    }
  }
}
