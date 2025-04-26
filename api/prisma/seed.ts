import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create Tags first (so we can assign them later)
  const pianoTag = await prisma.tag.create({
    data: { label: 'Piano', color: '#FFD700' },
  });
  const guitarTag = await prisma.tag.create({
    data: { label: 'Guitar', color: '#ADFF2F' },
  });
  const drumsTag = await prisma.tag.create({
    data: { label: 'Drums', color: '#FF4500' },
  });

  // Create a Musician
  const musician = await prisma.musician.create({
    data: {
      googleId: 'fake-google-id-1',
      displayName: 'John Doe',
      givenName: 'John',
      familyName: 'Doe',
      email: 'john.doe@example.com',
      bio: 'Passionate musician exploring jazz and classical.',
      avatarUrl: 'https://via.placeholder.com/150',
      totalSessions: 8,
      totalPracticeMinutes: 450,
      totalGasUpsGiven: 6,
      totalGasUpsReceived: 7,
      instruments: {
        connect: [{ id: pianoTag.id }, { id: guitarTag.id }],
      },
    },
  });

  // Create a Session
  const session = await prisma.session.create({
    data: {
      title: 'Morning Practice',
      notes: 'Worked on scales and arpeggios.',
      duration: 60,
      isPublic: true,
      musicianId: musician.id,
      tags: {
        connect: [{ id: pianoTag.id }],
      },
      instruments: {
        connect: [{ id: pianoTag.id }, { id: guitarTag.id }],
      },
    },
  });

  // Create a TaskDefinition
  const taskDef = await prisma.taskDefinition.create({
    data: {
      title: 'Learn "Autumn Leaves"',
      musicianId: musician.id,
      description: 'Practice the song with different chord voicings.',
      checklist: ['Learn melody', 'Learn chords', 'Practice improvisation'],
      savedCount: 3,
      usedCount: 2,
    },
  });

  // Create a TaskInUse
  await prisma.taskInUse.create({
    data: {
      duration: 30,
      notes: 'Good progress on the melody today.',
      isSessionTask: true,
      checklistCompletions: ['Learn melody'],
      taskDefinitionId: taskDef.id,
      musicianId: musician.id,
      sessionId: session.id,
      tags: {
        connect: [{ id: guitarTag.id }],
      },
    },
  });

  // Create some Media
  await prisma.media.create({
    data: {
      musicianId: musician.id,
      url: 'https://via.placeholder.com/600',
      type: 'image',
      sessionId: session.id,
    },
  });

  // Create a Comment
  await prisma.comment.create({
    data: {
      text: 'Awesome practice session!',
      musicianId: musician.id,
      sessionId: session.id,
    },
  });

  // Create a GasUp
  await prisma.gasUp.create({
    data: {
      musicianId: musician.id,
      sessionId: session.id,
    },
  });
}

main()
  .then(async () => {
    console.log('Database seeded 🌱');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
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
