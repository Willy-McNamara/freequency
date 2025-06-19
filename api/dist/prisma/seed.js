"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    await prisma.gasUp.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.media.deleteMany();
    await prisma.taskInUse.deleteMany();
    await prisma.taskDefinition.deleteMany();
    await prisma.session.deleteMany();
    await prisma.musician.deleteMany();
    await prisma.tag.deleteMany();
    const pianoTag = await prisma.tag.create({
        data: { label: 'Piano', color: '#FFD700' },
    });
    const guitarTag = await prisma.tag.create({
        data: { label: 'Guitar', color: '#ADFF2F' },
    });
    const drumsTag = await prisma.tag.create({
        data: { label: 'Drums', color: '#FF4500' },
    });
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
    await prisma.media.create({
        data: {
            musicianId: musician.id,
            url: 'https://via.placeholder.com/600',
            type: 'image',
            sessionId: session.id,
        },
    });
    await prisma.comment.create({
        data: {
            text: 'Awesome practice session!',
            musicianId: musician.id,
            sessionId: session.id,
        },
    });
    await prisma.gasUp.create({
        data: {
            musicianId: musician.id,
            sessionId: session.id,
        },
    });
    const musician2 = await prisma.musician.create({
        data: {
            googleId: 'fake-google-id-2',
            displayName: 'Jane Smith',
            givenName: 'Jane',
            familyName: 'Smith',
            email: 'jane.smith@example.com',
            bio: 'Loves rock and pop.',
            avatarUrl: 'https://via.placeholder.com/150/0000FF/808080',
            totalSessions: 5,
            totalPracticeMinutes: 300,
            totalGasUpsGiven: 3,
            totalGasUpsReceived: 4,
            instruments: {
                connect: [{ id: pianoTag.id }, { id: drumsTag.id }],
            },
        },
    });
    const session2 = await prisma.session.create({
        data: {
            title: 'Evening Jam',
            notes: 'Practiced new jazz standards.',
            duration: 45,
            isPublic: false,
            musicianId: musician2.id,
            tags: {
                connect: [{ id: guitarTag.id }],
            },
            instruments: {
                connect: [{ id: guitarTag.id }, { id: drumsTag.id }],
            },
        },
    });
    const taskDef2 = await prisma.taskDefinition.create({
        data: {
            title: 'Master "Blue Bossa"',
            musicianId: musician2.id,
            description: 'Work on improvisation and comping.',
            checklist: ['Learn melody', 'Practice comping', 'Solo over changes'],
            savedCount: 2,
            usedCount: 1,
        },
    });
    await prisma.taskInUse.create({
        data: {
            duration: 25,
            notes: 'Solid comping today.',
            isSessionTask: true,
            checklistCompletions: ['Practice comping'],
            taskDefinitionId: taskDef2.id,
            musicianId: musician2.id,
            sessionId: session2.id,
            tags: {
                connect: [{ id: drumsTag.id }],
            },
        },
    });
    await prisma.media.create({
        data: {
            musicianId: musician2.id,
            url: 'https://via.placeholder.com/600/0000FF/808080',
            type: 'image',
            sessionId: session2.id,
        },
    });
    await prisma.comment.create({
        data: {
            text: 'Great groove!',
            musicianId: musician2.id,
            sessionId: session2.id,
        },
    });
    await prisma.gasUp.create({
        data: {
            musicianId: musician2.id,
            sessionId: session2.id,
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
//# sourceMappingURL=seed.js.map