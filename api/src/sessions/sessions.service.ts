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
  userIds: number[];
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

    // User filter (by userId)
    if (filters.userIds.length > 0) {
      whereConditions.musicianId = {
        in: filters.userIds,
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

    // Saved filter
    if (filters.saved) {
      // TODO: Implement proper saved sessions logic if/when a join table or model exists
      // For now, fallback to sessions created by the user (if userIds is set)
      if (filters.userIds.length > 0) {
        whereConditions.musicianId = filters.userIds[0];
      }
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
                id: true,
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
                id: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
        musician: {
          select: {
            id: true,
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
                    id: true,
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
          id: session.musician.id,
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
            id: gasUp.musician.id,
            displayName: gasUp.musician.displayName,
            avatarUrl: gasUp.musician.avatarUrl,
          },
        })),
        comments: session.comments.map((comment) => ({
          id: comment.id,
          text: comment.text,
          createdAt: comment.createdAt.toISOString(),
          musician: {
            id: comment.musician.id,
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
                id: taskInUse.taskDefinition.musician.id,
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
    const sessions = await this.prisma.session.findMany({
      take: 5,
      orderBy: { id: 'desc' },
      include: {
        gasUps: {
          include: {
            musician: {
              select: {
                id: true,
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
                id: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
        musician: {
          select: {
            id: true,
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
                    id: true,
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

    return sessions.map((session) => ({
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
        id: session.musician.id,
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
          id: gasUp.musician.id,
          displayName: gasUp.musician.displayName,
          avatarUrl: gasUp.musician.avatarUrl,
        },
      })),
      comments: session.comments.map((comment) => ({
        id: comment.id,
        text: comment.text,
        createdAt: comment.createdAt.toISOString(),
        musician: {
          id: comment.musician.id,
          displayName: comment.musician.displayName,
          avatarUrl: comment.musician.avatarUrl,
        },
      })),
      media:
        session.media.length > 0
          ? [
              {
                url: session.media[0].url,
                type: session.media[0].type,
              },
            ]
          : [],
      tasks: session.tasksInUse.map((taskInUse) => ({
        id: taskInUse.id,
        title: taskInUse.taskDefinition?.title || 'Session Task',
        timeSpent: taskInUse.duration,
        notes: taskInUse.notes,
        taskDefinition: {
          id: taskInUse.taskDefinition?.id || 0,
          title: taskInUse.taskDefinition?.title || 'Session Task',
          description: taskInUse.taskDefinition?.description || '',
          instrument:
            taskInUse.taskDefinition?.musician?.displayName || 'Unknown',
          user: taskInUse.taskDefinition?.musician || {
            id: 0,
            displayName: 'Unknown',
            avatarUrl: null,
          },
          tags: taskInUse.tags.map((tag) => ({
            id: tag.id,
            label: tag.label,
            color: tag.color,
          })),
          checklist: taskInUse.taskDefinition?.checklist || [],
          savedCount: taskInUse.taskDefinition?.savedCount || 0,
          usedCount: taskInUse.taskDefinition?.usedCount || 0,
        },
      })),
    }));
  }

  async getSessionsFromFollowedUsers(
    currentUserId: number,
    cursor?: string,
  ): Promise<{ sessions: NewFrontendSessionDTO[]; nextCursor?: string }> {
    const take = 10;

    // Get the IDs of users that the current user follows
    const followedUsers = await this.prisma.follow.findMany({
      where: { followerId: currentUserId },
      select: { followingId: true },
    });

    const followedUserIds = followedUsers.map((follow) => follow.followingId);

    // If user doesn't follow anyone, return empty result
    if (followedUserIds.length === 0) {
      return { sessions: [], nextCursor: undefined };
    }

    // Query sessions from followed users
    const sessions = await this.prisma.session.findMany({
      take: take + 1, // Take one extra to check if there are more
      cursor: cursor ? { id: parseInt(cursor) } : undefined,
      orderBy: { id: 'desc' },
      where: {
        musicianId: {
          in: followedUserIds,
        },
        isPublic: true, // Only public sessions
      },
      include: {
        gasUps: {
          include: {
            musician: {
              select: {
                id: true,
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
                id: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
        musician: {
          select: {
            id: true,
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
                    id: true,
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
          id: session.musician.id,
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
            id: gasUp.musician.id,
            displayName: gasUp.musician.displayName,
            avatarUrl: gasUp.musician.avatarUrl,
          },
        })),
        comments: session.comments.map((comment) => ({
          id: comment.id,
          text: comment.text,
          createdAt: comment.createdAt.toISOString(),
          musician: {
            id: comment.musician.id,
            displayName: comment.musician.displayName,
            avatarUrl: comment.musician.avatarUrl,
          },
        })),
        media:
          session.media.length > 0
            ? [
                {
                  url: session.media[0].url,
                  type: session.media[0].type,
                },
              ]
            : [],
        tasks: session.tasksInUse.map((taskInUse) => ({
          id: taskInUse.id,
          title: taskInUse.taskDefinition?.title || 'Session Task',
          timeSpent: taskInUse.duration,
          notes: taskInUse.notes,
          taskDefinition: {
            id: taskInUse.taskDefinition?.id || 0,
            title: taskInUse.taskDefinition?.title || 'Session Task',
            description: taskInUse.taskDefinition?.description || '',
            instrument:
              taskInUse.taskDefinition?.musician?.displayName || 'Unknown',
            user: taskInUse.taskDefinition?.musician || {
              id: 0,
              displayName: 'Unknown',
              avatarUrl: null,
            },
            tags: taskInUse.tags.map((tag) => ({
              id: tag.id,
              label: tag.label,
              color: tag.color,
            })),
            checklist: taskInUse.taskDefinition?.checklist || [],
            savedCount: taskInUse.taskDefinition?.savedCount || 0,
            usedCount: taskInUse.taskDefinition?.usedCount || 0,
          },
        })),
      }),
    );

    return { sessions: frontendSessionDto, nextCursor };
  }

  async getFollowedUserDisplayNames(currentUserId: number): Promise<string[]> {
    const followed = await this.prisma.follow.findMany({
      where: { followerId: currentUserId },
      select: { following: { select: { displayName: true } } },
    });
    return followed.map((f) => f.following.displayName);
  }

  async getFollowedUserIds(currentUserId: number): Promise<number[]> {
    const followed = await this.prisma.follow.findMany({
      where: { followerId: currentUserId },
      select: { followingId: true },
    });
    return followed.map((f) => f.followingId);
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
        // Find or create instrument tags by label
        const instrumentTags = await Promise.all(
          newSession.instruments.map(async (label) => {
            let tag = await prisma.tag.findUnique({
              where: { label },
            });
            if (!tag) {
              tag = await prisma.tag.create({
                data: { label },
              });
            }
            return tag;
          }),
        );

        // Find or create regular tags by label
        const regularTags = await Promise.all(
          newSession.tags.map(async (label) => {
            let tag = await prisma.tag.findUnique({
              where: { label },
            });
            if (!tag) {
              tag = await prisma.tag.create({
                data: { label },
              });
            }
            return tag;
          }),
        );

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
              connect: instrumentTags.map((tag) => ({ id: tag.id })),
            },
            tags: {
              connect: regularTags.map((tag) => ({ id: tag.id })),
            },
          },
          include: {
            musician: {
              select: { id: true, displayName: true, avatarUrl: true },
            },
            gasUps: {
              include: {
                musician: {
                  select: { id: true, displayName: true, avatarUrl: true },
                },
              },
            },
            comments: {
              include: {
                musician: {
                  select: { id: true, displayName: true, avatarUrl: true },
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

          // Find or create task tags by label
          let taskTagIds: number[] = [];
          if (task.tags && task.tags.length > 0) {
            const taskTags = await Promise.all(
              task.tags.map(async (label) => {
                let tag = await prisma.tag.findUnique({
                  where: { label },
                });
                if (!tag) {
                  tag = await prisma.tag.create({
                    data: { label },
                  });
                }
                return tag;
              }),
            );
            taskTagIds = taskTags.map((tag) => tag.id);
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
                taskTagIds.length > 0
                  ? {
                      connect: taskTagIds.map((id) => ({ id })),
                    }
                  : undefined,
            },
          });
        }

        // Create TaskInUse record for the session itself
        const sessionTaskDuration = newSession.duration - totalTaskTime;
        if (sessionTaskDuration > 0) {
          console.log('Creating session TaskInUse with tags:', newSession.tags);

          // Find or create session task tags by label
          let sessionTaskTagIds: number[] = [];
          if (newSession.tags && newSession.tags.length > 0) {
            const sessionTaskTags = await Promise.all(
              newSession.tags.map(async (label) => {
                let tag = await prisma.tag.findUnique({
                  where: { label },
                });
                if (!tag) {
                  tag = await prisma.tag.create({
                    data: { label },
                  });
                }
                return tag;
              }),
            );
            sessionTaskTagIds = sessionTaskTags.map((tag) => tag.id);
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
                sessionTaskTagIds.length > 0
                  ? {
                      connect: sessionTaskTagIds.map((id) => ({ id })),
                    }
                  : undefined,
            },
          });
        }

        // Update musician stats
        await prisma.musician.update({
          where: { id: newSession.musicianId },
          data: {
            totalPracticeSeconds: {
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
            id: newSession.musicianId,
            displayName: createdSession.musician.displayName,
            avatarUrl: createdSession.musician.avatarUrl,
          },
          tags: createdSession.tags.map((tag) => ({
            id: tag.id,
            label: tag.label,
            color: tag.color,
          })),
          gasUps: createdSession.gasUps.map((gasUp) => ({
            musician: {
              id: gasUp.musician.id,
              displayName: gasUp.musician.displayName,
              avatarUrl: gasUp.musician.avatarUrl,
            },
          })),
          comments: createdSession.comments.map((comment) => ({
            id: comment.id,
            text: comment.text,
            createdAt: comment.createdAt.toISOString(),
            musician: {
              id: comment.musician.id,
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
                id: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        });

        return createdComment;
      });

      // Return the comment in the expected CreatedCommentDto format
      return {
        id: createdComment.id,
        text: createdComment.text,
        createdAt: createdComment.createdAt,
        musicianId: createdComment.musicianId,
        sessionId: createdComment.sessionId,
        musician: {
          displayName: createdComment.musician.displayName,
          avatarUrl: createdComment.musician.avatarUrl,
        },
      };
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
                id: true,
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

      // Return the gas up in the expected CreatedGasUpDto format
      return {
        id: createdGasUp.id,
        musicianId: createdGasUp.musicianId,
        sessionId: createdGasUp.sessionId,
        musician: {
          displayName: createdGasUp.musician.displayName,
          avatarUrl: createdGasUp.musician.avatarUrl,
        },
      };
    } catch (error) {
      // Handle any errors during creation
      throw new Error(`Failed to gas up: ${error.message}`);
    }
  }
}
