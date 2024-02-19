import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CommentDto,
  CreateSessionDto,
  FrontendSessionDto,
  GasUpDto,
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
        musician: { select: { username: true } },
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
        musicianUsername: session.musician.username,
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
    }));
  }

  async createSession(req: CreateSessionDto): Promise<SessionDto> {
    const prisma = this.prisma;

    try {
      // Create a new session in the database
      const createdSession = await prisma.session.create({
        data: {
          title: req.title,
          notes: req.notes,
          duration: Number(req.duration),
          isPublic: req.isPublic,
          takeId: uuidv4(),
          musician: {
            connect: { id: Number(req.musicianId) },
          },
        },
        include: {
          musician: { select: { username: true } },
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

      return sessionDto;
    } catch (error) {
      // Handle any errors during creation
      throw new Error(`Failed to create session: ${error.message}`);
    }
  }
}
