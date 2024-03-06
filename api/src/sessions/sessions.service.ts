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

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async getAllSessions(): Promise<FrontendSessionDto[]> {
    const prisma = this.prisma;

    // Query all sessions from the database
    const sessions = await prisma.session.findMany({
      include: {
        musician: { select: { displayName: true } },
        gasUps: true,
        comments: true,
      },
    });

    // Map the database sessions to SessionWithDetailsDto objects
    const frontendSessionDto: FrontendSessionDto[] = sessions.map(
      (session) => ({
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
      }),
    );

    return frontendSessionDto;
  }

  private mapGasUps(gasUps: GasUpDto[]): GasUpDto[] {
    // Map gasUps to GasUpDto objects
    return gasUps.map((gasUp) => ({
      id: gasUp.id,
      musicianId: gasUp.musicianId,
      sessionId: gasUp.sessionId,
      musicianProfilePhotoUrl: gasUp.musicianProfilePhotoUrl,
      musicianDisplayName: gasUp.musicianDisplayName,
    }));
  }

  private mapComments(comments: CommentDto[]): CommentDto[] {
    // Map comments to CommentDto objects
    return comments.map((comment) => ({
      id: comment.id,
      text: comment.text,
      createdAt: comment.createdAt,
      musicianId: comment.musicianId,
      sessionId: comment.sessionId,
      musicianDisplayName: comment.musicianDisplayName,
      musicianProfilePhotoUrl: comment.musicianProfilePhotoUrl,
    }));
  }

  async createSession(newSession: CreateSessionDto): Promise<SessionDto> {
    const prisma = this.prisma;

    try {
      // Create a new session in the database
      const createdSession = await prisma.session.create({
        data: {
          title: newSession.title,
          notes: newSession.notes,
          duration: Number(newSession.duration),
          isPublic: newSession.isPublic,
          takeId: uuidv4(),
          musician: {
            connect: { id: Number(newSession.musicianId) },
          },
        },
        include: {
          musician: { select: { displayName: true } },
        },
      });

      // Map the created session to the SessionDto
      const sessionDto: SessionDto = {
        id: createdSession.id,
        title: createdSession.title,
        notes: createdSession.notes,
        duration: createdSession.duration,
        isPublic: createdSession.isPublic,
        takeId: createdSession.takeId,
        createdAt: createdSession.createdAt,
        musicianId: createdSession.musicianId,
        gasUps: [], // Assuming it's a new session, initialize as empty array
        comments: [], // Assuming it's a new session, initialize as empty array
      };

      // TO DO: update musician's totalSessions and totalPracticeMinutes

      return sessionDto;
    } catch (error) {
      // Handle any errors during creation
      throw new Error(`Failed to create session: ${error.message}`);
    }
  }

  async addComment(newComment: NewCommentDto): Promise<CommentDto> {
    const prisma = this.prisma;

    try {
      // $transactions enforce atomicity. so if any db operation fails, the entire transaction is rolled back
      const createdGasUp = await prisma.$transaction(async (prisma) => {
        const musician = await prisma.musician.findUnique({
          where: { id: newComment.musicianId },
          select: { displayName: true, profilePictureUrl: true },
        });

        const createdComment = await prisma.comment.create({
          data: {
            text: newComment.text,
            musicianProfilePhotoUrl: musician.profilePictureUrl,
            musicianDisplayName: musician.displayName,
            musician: {
              connect: { id: newComment.musicianId },
            },
            session: {
              connect: { id: newComment.sessionId },
            },
          },
        } as any); // added as any for a short term fix on a more complicated typescript error..

        // Map the created comment to the CommentDto
        const commentDto: CommentDto = {
          id: createdComment.id,
          text: createdComment.text,
          createdAt: createdComment.createdAt,
          musicianId: createdComment.musicianId,
          sessionId: createdComment.sessionId,
          musicianDisplayName: createdComment.musicianDisplayName, // seeing lint here, i think it's the IDE not recognizing the most recent migration..
          musicianProfilePhotoUrl: createdComment.musicianProfilePhotoUrl,
        };
        console.log('comment created! here is comment:', commentDto);
        return commentDto;
      });
      return createdGasUp;
    } catch (error) {
      // Handle any errors during creation
      console.log('error adding comment:', error);
      throw new Error(`Failed to add comment: ${error.message}`);
    }
  }

  async addGasUp(newGasUp: NewGasUpDto): Promise<GasUpDto> {
    const prisma = this.prisma;

    try {
      // $transactions enforce atomicity. so if any db operation fails, the entire transaction is rolled back
      const createdGasUp = await prisma.$transaction(async (prisma) => {
        // update the gassersUppers stats and return their needed metadata
        const updatedGasserUpper = await prisma.musician.update({
          where: { id: newGasUp.gasserId },
          data: {
            totalGasUpsGiven: {
              increment: 1,
            },
          },
          select: { displayName: true, profilePictureUrl: true },
        });

        const innerCreatedGasUp = await prisma.gasUp.create({
          data: {
            musicianProfilePhotoUrl: updatedGasserUpper.profilePictureUrl,
            musicianDisplayName: updatedGasserUpper.displayName,
            musician: {
              connect: { id: newGasUp.gasserId },
            },
            session: {
              connect: { id: newGasUp.sessionId },
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
