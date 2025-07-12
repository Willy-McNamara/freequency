import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CommentDto,
  CreateSessionDto,
  FrontendSessionDto,
  GasUpDto,
  NewCommentDto,
  NewFrontendSessionDTO,
  NewGasUpDto,
  SessionDto,
} from './dto/session.dto';
import { v4 as uuidv4 } from 'uuid';
import {
  CreatedCommentDto,
  CreatedGasUpDto,
} from 'src/musicians/dto/musician.dto';
import { Prisma } from '@prisma/client';

interface SessionFilters {
  users: string[];
  instruments: string[];
  tags: string[];
  saved: boolean;
}

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async getSessionsWithFilters(
    filters: SessionFilters,
    cursor?: string,
  ): Promise<{ sessions: NewFrontendSessionDTO[]; nextCursor?: string }> {
    const take = 10;

    // Build where conditions based on filters
    const whereConditions: Prisma.SessionWhereInput = {};

    // User filter
    if (filters.users.length > 0) {
      whereConditions.musician = {
        displayName: {
          in: filters.users,
        },
      };
    }

    // Instrument filter
    if (filters.instruments.length > 0) {
      whereConditions.instruments = {
        some: {
          label: {
            in: filters.instruments,
          },
        },
      };
    }

    // Tag filter
    if (filters.tags.length > 0) {
      whereConditions.tags = {
        some: {
          label: {
            in: filters.tags,
          },
        },
      };
    }

    // Saved filter (sessions with gasUps)
    if (filters.saved) {
      whereConditions.gasUps = {
        some: {},
      };
    }

    // Query sessions with filters and pagination
    const sessions = await this.prisma.session.findMany({
      take: take + 1, // Take one extra to check if there are more
      cursor: cursor ? { id: parseInt(cursor) } : undefined,
      orderBy: { id: 'desc' },
      where: whereConditions,
      include: {
        gasUps: {
          include: {
            musician: {
              select: {
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
        comments: {
          include: {
            musician: {
              select: {
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
        musician: {
          select: {
            displayName: true,
            avatarUrl: true,
          },
        },
        media: {
          select: {
            url: true,
            type: true,
          },
        },
        tags: {
          select: {
            id: true,
            label: true,
            color: true,
          },
        },
        instruments: {
          select: {
            id: true,
            label: true,
            color: true,
          },
        },
        tasksInUse: {
          include: {
            taskDefinition: {
              include: {
                musician: {
                  select: {
                    displayName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
            tags: {
              select: {
                id: true,
                label: true,
                color: true,
              },
            },
          },
        },
      },
    });

    // Check if there are more sessions
    const hasMore = sessions.length > take;
    const sessionsToReturn = hasMore ? sessions.slice(0, take) : sessions;
    const nextCursor = hasMore
      ? sessionsToReturn[sessionsToReturn.length - 1].id.toString()
      : undefined;

    // Map the database sessions to NewFrontendSessionDTO objects
    const frontendSessionDto: NewFrontendSessionDTO[] = sessionsToReturn.map(
      (session) => ({
        id: session.id,
        title: session.title,
        notes: session.notes,
        instruments: session.instruments.map((tag) => ({
          id: tag.id,
          label: tag.label,
          color: tag.color,
        })),
        duration: session.duration,
        isPublic: session.isPublic,
        createdAt: session.createdAt.toISOString(),
        musician: {
          displayName: session.musician.displayName,
          avatarUrl: session.musician.avatarUrl,
        },
        tags: session.tags.map((tag) => ({
          id: tag.id,
          label: tag.label,
          color: tag.color,
        })),
        gasUps: session.gasUps.map((gasUp) => ({
          musician: {
            displayName: gasUp.musician.displayName,
            avatarUrl: gasUp.musician.avatarUrl,
          },
        })),
        comments: session.comments.map((comment) => ({
          id: comment.id,
          text: comment.text,
          createdAt: comment.createdAt.toISOString(),
          musician: {
            displayName: comment.musician.displayName,
            avatarUrl: comment.musician.avatarUrl,
          },
        })),
        media: session.media ?? [],
        tasks: session.tasksInUse
          .filter(
            (taskInUse) => !taskInUse.isSessionTask && taskInUse.taskDefinition,
          )
          .map((taskInUse) => ({
            id: taskInUse.id,
            title: taskInUse.taskDefinition.title,
            notes: taskInUse.notes,
            timeSpent: taskInUse.duration,
            taskDefinition: {
              id: taskInUse.taskDefinition.id,
              title: taskInUse.taskDefinition.title,
              description: taskInUse.taskDefinition.description,
              instrument: taskInUse.taskDefinition.musician.displayName, // Using musician name as instrument for now
              user: {
                displayName: taskInUse.taskDefinition.musician.displayName,
                avatarUrl: taskInUse.taskDefinition.musician.avatarUrl,
              },
              tags: taskInUse.tags.map((tag) => ({
                id: tag.id,
                label: tag.label,
                color: tag.color,
              })),
              checklist: taskInUse.checklistCompletions,
              savedCount: 0, // TODO: Add these fields to TaskDefinition model
              usedCount: 0,
            },
          })),
      }),
    );

    return {
      sessions: frontendSessionDto,
      nextCursor,
    };
  }

  async getFiveSessions(): Promise<NewFrontendSessionDTO[]> {
    const result = await this.getSessionsWithFilters({
      users: [],
      instruments: [],
      tags: [],
      saved: false,
    });
    return result.sessions;
  }

  // async getSessionsChunk(cursorId?: number): Promise<FrontendSessionDto[]> {
  //   const prisma = this.prisma;
  //   const skip = 1;
  //   const take = 5;

  //   // Easier for typescript if you include the query directly in the method (not modularized out as a variable)
  //   const sessions = await prisma.session.findMany({
  //     take,
  //     skip,
  //     orderBy: { id: 'desc' },
  //     cursor: {
  //       id: cursorId,
  //     },
  //     include: {
  //       gasUps: {
  //         include: {
  //           musician: {
  //             select: {
  //               displayName: true,
  //               profilePictureUrl: true,
  //             },
  //           },
  //         },
  //       },
  //       comments: {
  //         include: {
  //           musician: {
  //             select: {
  //               displayName: true,
  //               profilePictureUrl: true,
  //             },
  //           },
  //         },
  //       },
  //       musician: {
  //         select: {
  //           displayName: true,
  //           profilePictureUrl: true,
  //         },
  //       },
  //       media: {
  //         select: {
  //           url: true,
  //           type: true,
  //         },
  //       },
  //     },
  //   });

  //   // Map the database sessions to SessionWithDetailsDto objects
  //   const frontendSessions: FrontendSessionDto[] = sessions.map((session) => ({
  //     id: session.id,
  //     title: session.title,
  //     notes: session.notes,
  //     instruments: session.instruments,
  //     duration: session.duration,
  //     isPublic: session.isPublic,
  //     takeId: session.takeId,
  //     createdAt: session.createdAt,
  //     musicianId: session.musicianId,
  //     musicianDisplayname: session.musician.displayName,
  //     musicianProfilePictureUrl: session.musician.profilePictureUrl,
  //     gasUps: session.gasUps,
  //     comments: session.comments,
  //     media: session.media ? session.media : null,
  //   }));

  //   return frontendSessions;
  // }

  async createSession(
    newSession: CreateSessionDto,
  ): Promise<NewFrontendSessionDTO> {
    try {
      // $transactions enforce atomicity. so if any db operation fails, the entire transaction is rolled back
      const createdSession = await this.prisma.$transaction(async (prisma) => {
        // Create a new session in the database
        const createdSession = await prisma.session.create({
          data: {
            title: newSession.title,
            notes: newSession.notes,
            duration: newSession.duration,
            isPublic: newSession.isPublic,
            musician: {
              connect: { id: newSession.musicianId },
            },
            instruments: {
              connect: newSession.instruments.map((id) => ({ id })),
            },
            tags: {
              connect: newSession.tags.map((id) => ({ id })),
            },
          },
          include: {
            musician: {
              select: { displayName: true, avatarUrl: true },
            },
            gasUps: {
              include: {
                musician: {
                  select: { displayName: true, avatarUrl: true },
                },
              },
            },
            comments: {
              include: {
                musician: {
                  select: { displayName: true, avatarUrl: true },
                },
              },
            },
            media: {
              select: { url: true, type: true },
            },
            tags: true,
            instruments: true,
          },
        });

        // Calculate total time spent on tasks
        const totalTaskTime = newSession.tasks.reduce(
          (sum, task) => sum + task.timeSpent,
          0,
        );

        // Create TaskInUse records for each task
        for (const task of newSession.tasks) {
          console.log('Creating TaskInUse for task:', task);
          console.log('Task tags:', task.tags);

          // Validate that all tags exist before trying to connect them
          if (task.tags && task.tags.length > 0) {
            const existingTags = await prisma.tag.findMany({
              where: { id: { in: task.tags } },
            });
            console.log('Found existing tags:', existingTags);

            if (existingTags.length !== task.tags.length) {
              console.log(
                'Warning: Some tags not found. Expected:',
                task.tags.length,
                'Found:',
                existingTags.length,
              );
              // Only use tags that exist
              task.tags = existingTags.map((tag) => tag.id);
            }
          }

          await prisma.taskInUse.create({
            data: {
              duration: task.timeSpent,
              notes: task.notes,
              isSessionTask: false,
              checklistCompletions: task.checklist
                .filter((item) => item.checked)
                .map((item) => item.item),
              taskDefinition: {
                connect: { id: task.id },
              },
              musician: {
                connect: { id: newSession.musicianId },
              },
              session: {
                connect: { id: createdSession.id },
              },
              tags:
                task.tags && task.tags.length > 0
                  ? {
                      connect: task.tags.map((id) => ({ id })),
                    }
                  : undefined,
            },
          });
        }

        // Create TaskInUse record for the session itself
        const sessionTaskDuration = newSession.duration - totalTaskTime;
        if (sessionTaskDuration > 0) {
          console.log('Creating session TaskInUse with tags:', newSession.tags);

          // Validate session tags
          let sessionTags = newSession.tags;
          if (sessionTags && sessionTags.length > 0) {
            const existingSessionTags = await prisma.tag.findMany({
              where: { id: { in: sessionTags } },
            });
            console.log('Found existing session tags:', existingSessionTags);

            if (existingSessionTags.length !== sessionTags.length) {
              console.log(
                'Warning: Some session tags not found. Expected:',
                sessionTags.length,
                'Found:',
                existingSessionTags.length,
              );
              sessionTags = existingSessionTags.map((tag) => tag.id);
            }
          }

          await prisma.taskInUse.create({
            data: {
              duration: sessionTaskDuration,
              notes: newSession.notes,
              isSessionTask: true,
              checklistCompletions: [],
              // No taskDefinitionId for session tasks
              musician: {
                connect: { id: newSession.musicianId },
              },
              session: {
                connect: { id: createdSession.id },
              },
              tags:
                sessionTags && sessionTags.length > 0
                  ? {
                      connect: sessionTags.map((id) => ({ id })),
                    }
                  : undefined,
            },
          });
        }

        // Update musician stats
        await prisma.musician.update({
          where: { id: newSession.musicianId },
          data: {
            totalPracticeMinutes: {
              increment: newSession.duration,
            },
            totalSessions: {
              increment: 1,
            },
          },
        });

        // Map to NewFrontendSessionDTO
        const frontendSession: NewFrontendSessionDTO = {
          id: createdSession.id,
          title: createdSession.title,
          notes: createdSession.notes,
          instruments: createdSession.instruments.map((tag) => ({
            id: tag.id,
            label: tag.label,
            color: tag.color,
          })),
          duration: createdSession.duration,
          isPublic: createdSession.isPublic,
          createdAt: createdSession.createdAt.toISOString(),
          musician: {
            displayName: createdSession.musician.displayName,
            avatarUrl: createdSession.musician.avatarUrl,
          },
          tags: createdSession.tags.map((tag) => ({
            id: tag.id,
            label: tag.label,
            color: tag.color,
          })),
          gasUps: createdSession.gasUps,
          comments: createdSession.comments.map((comment) => ({
            id: comment.id,
            text: comment.text,
            createdAt: comment.createdAt.toISOString(),
            musician: {
              displayName: comment.musician.displayName,
              avatarUrl: comment.musician.avatarUrl,
            },
          })),
          media: createdSession.media ?? [],
          tasks: [],
        };
        return frontendSession;
      });
      return createdSession;
    } catch (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }
  }

  async addComment(newComment: NewCommentDto): Promise<CreatedCommentDto> {
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
                avatarUrl: true,
              },
            },
          },
        });

        return createdComment;
      });
      return createdComment;
    } catch (error) {
      // Handle any errors during creation
      throw new Error(`Failed to add comment: ${error.message}`);
    }
  }

  async addGasUp(newGasUp: NewGasUpDto): Promise<CreatedGasUpDto> {
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
                avatarUrl: true,
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
            totalGasUpsReceived: {
              increment: 1,
            },
          },
        });

        return createdGasUp;
      });
      return createdGasUp;
    } catch (error) {
      // Handle any errors during creation
      throw new Error(`Failed to gas up: ${error.message}`);
    }
  }
}
