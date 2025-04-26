"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
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
            instruments: ['Piano', 'Guitar'],
            duration: 60,
            isPublic: true,
            musicianId: musician.id,
            tags: {
                connect: [{ id: pianoTag.id }],
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