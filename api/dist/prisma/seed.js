"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function seedDatabase() {
    try {
        const musician1 = await prisma.musician.create({
            data: {
                googleId: "google_id_1",
                username: "user1",
                email: "user1@example.com",
                password: "password1",
                totalSessions: 1,
                totalPracticeMinutes: 60,
                totalGasUps: 0,
                longestStreak: 1,
                currentStreak: 1,
            },
        });
        const musician2 = await prisma.musician.create({
            data: {
                googleId: "google_id_2",
                username: "user2",
                email: "user2@example.com",
                password: "password2",
                totalSessions: 1,
                totalPracticeMinutes: 75,
                totalGasUps: 0,
                longestStreak: 1,
                currentStreak: 1,
            },
        });
        const session1 = await prisma.session.create({
            data: {
                title: "Session 1",
                notes: "This is session 1",
                duration: 60,
                isPublic: true,
                takeId: "take_1",
                musicianId: musician1.id,
            },
        });
        const session2 = await prisma.session.create({
            data: {
                title: "Session 2",
                notes: "This is session 2",
                duration: 45,
                isPublic: false,
                takeId: "take_2",
                musicianId: musician2.id,
            },
        });
        const session3 = await prisma.session.create({
            data: {
                title: "Session 3",
                notes: "This is session 3",
                duration: 30,
                isPublic: false,
                takeId: "take_3",
                musicianId: musician2.id,
            },
        });
        await prisma.gasUp.create({
            data: {
                musicianId: musician2.id,
                sessionId: session1.id,
            },
        });
        await prisma.gasUp.create({
            data: {
                musicianId: musician1.id,
                sessionId: session2.id,
            },
        });
        await prisma.comment.create({
            data: {
                text: "Great session!",
                musicianId: musician1.id,
                sessionId: session1.id,
            },
        });
        await prisma.comment.create({
            data: {
                text: "Keep it up!",
                musicianId: musician2.id,
                sessionId: session2.id,
            },
        });
        await prisma.comment.create({
            data: {
                text: `Let's gooo!`,
                musicianId: musician2.id,
                sessionId: session3.id,
            },
        });
        console.log("Database seeded successfully!");
    }
    catch (error) {
        console.error("Error seeding database:", error);
    }
    finally {
        await prisma.$disconnect();
    }
}
seedDatabase();
//# sourceMappingURL=seed.js.map