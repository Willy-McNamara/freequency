import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create some Tags
  const tags = await prisma.tag.createMany({
    data: [
      { label: 'Piano', color: '#FF5733' },
      { label: 'Sight Reading', color: '#33FF57' },
      { label: 'Scales', color: '#3357FF' },
      { label: 'Guitar', color: '#FF33A8' },
    ],
  });

  const allTags = await prisma.tag.findMany();

  // Create Musicians
  const musicians = await prisma.musician.createMany({
    data: [
      {
        displayName: 'John Doe',
        givenName: 'John',
        familyName: 'Doe',
        email: 'john@example.com',
      },
      {
        displayName: 'Jane Smith',
        givenName: 'Jane',
        familyName: 'Smith',
        email: 'jane@example.com',
      },
    ],
  });

  const allMusicians = await prisma.musician.findMany();

  // Create Sessions
  const sessions = await Promise.all(
    allMusicians.map((musician) =>
      prisma.session.create({
        data: {
          title: 'Practice Session',
          notes: 'Worked on sight reading and scales.',
          instruments: ['Piano', 'Guitar'],
          duration: 90,
          isPublic: true,
          musicianId: musician.id,
          tags: {
            connect: allTags.map((tag) => ({ id: tag.id })),
          },
        },
      }),
    ),
  );

  // Create TaskDefinitions
  const taskDefinitions = await Promise.all(
    allMusicians.map((musician) =>
      prisma.taskDefinition.create({
        data: {
          title: 'Daily Warmup',
          musicianId: musician.id,
          description: 'Finger exercises and scales',
          checklist: ['Stretch', 'Major scales', 'Minor scales'],
          savedCount: 10,
          usedCount: 5,
        },
      }),
    ),
  );

  // Create TasksInUse
  await Promise.all(
    sessions.map((session) =>
      prisma.taskInUse.create({
        data: {
          duration: 45,
          notes: 'Good progress today.',
          isSessionTask: true,
          checklistCompletions: ['Stretch', 'Major scales'],
          sessionId: session.id,
          musicianId: session.musicianId,
          taskDefinitionId: taskDefinitions[0].id,
          tags: {
            connect: allTags.slice(0, 2).map((tag) => ({ id: tag.id })),
          },
        },
      }),
    ),
  );

  // Create Media
  await Promise.all(
    allMusicians.map((musician) =>
      prisma.media.create({
        data: {
          musicianId: musician.id,
          url: 'https://example.com/video.mp4',
          type: 'video',
        },
      }),
    ),
  );

  // Create GasUps
  await Promise.all(
    sessions.map((session) =>
      prisma.gasUp.create({
        data: {
          musicianId: session.musicianId,
          sessionId: session.id,
        },
      }),
    ),
  );

  // Create Comments
  await Promise.all(
    sessions.map((session) =>
      prisma.comment.create({
        data: {
          text: 'Awesome session!',
          musicianId: session.musicianId,
          sessionId: session.id,
        },
      }),
    ),
  );

  console.log('Database seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// async function seedDatabase() {
//   try {
//     // Create musicians
//     const musician1 = await prisma.musician.create({
//       data: {
//         googleId: 'google_id_1',
//         username: 'user1',
//         email: 'user1@example.com',
//         password: 'password1',
//         totalSessions: 1,
//         totalPracticeMinutes: 60,
//         totalGasUps: 0,
//         longestStreak: 1,
//         currentStreak: 1,
//       },
//     });

//     const musician2 = await prisma.musician.create({
//       data: {
//         googleId: 'google_id_2',
//         username: 'user2',
//         email: 'user2@example.com',
//         password: 'password2',
//         totalSessions: 1,
//         totalPracticeMinutes: 75,
//         totalGasUps: 0,
//         longestStreak: 1,
//         currentStreak: 1,
//       },
//     });

//     // Create sessions
//     const session1 = await prisma.session.create({
//       data: {
//         title: 'Session 1',
//         notes: 'This is session 1',
//         duration: 60,
//         isPublic: true,
//         takeId: 'take_1',
//         musicianId: musician1.id,
//       },
//     });

//     const session2 = await prisma.session.create({
//       data: {
//         title: 'Session 2',
//         notes: 'This is session 2',
//         duration: 45,
//         isPublic: false,
//         takeId: 'take_2',
//         musicianId: musician2.id,
//       },
//     });

//     const session3 = await prisma.session.create({
//       data: {
//         title: 'Session 3',
//         notes: 'This is session 3',
//         duration: 30,
//         isPublic: false,
//         takeId: 'take_3',
//         musicianId: musician2.id,
//       },
//     });

//     // Create gas-ups
//     await prisma.gasUp.create({
//       data: {
//         musicianId: musician2.id,
//         sessionId: session1.id,
//       },
//     });

//     await prisma.gasUp.create({
//       data: {
//         musicianId: musician1.id,
//         sessionId: session2.id,
//       },
//     });

//     // Create comments
//     await prisma.comment.create({
//       data: {
//         text: 'Great session!',
//         musicianId: musician1.id,
//         sessionId: session1.id,
//       },
//     });

//     await prisma.comment.create({
//       data: {
//         text: 'Keep it up!',
//         musicianId: musician2.id,
//         sessionId: session2.id,
//       },
//     });

//     await prisma.comment.create({
//       data: {
//         text: `Let's gooo!`,
//         musicianId: musician2.id,
//         sessionId: session3.id,
//       },
//     });

//     console.log('Database seeded successfully!');
//   } catch (error) {
//     console.error('Error seeding database:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// seedDatabase();
