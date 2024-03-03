/*
  Warnings:

  - You are about to drop the column `password` on the `Musician` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Musician" DROP COLUMN "password",
ADD COLUMN     "bio" VARCHAR(300),
ADD COLUMN     "instruments" TEXT[],
ALTER COLUMN "googleId" DROP NOT NULL,
ALTER COLUMN "totalSessions" SET DEFAULT 0,
ALTER COLUMN "totalPracticeMinutes" SET DEFAULT 0,
ALTER COLUMN "totalGasUps" SET DEFAULT 0,
ALTER COLUMN "longestStreak" SET DEFAULT 0,
ALTER COLUMN "currentStreak" SET DEFAULT 0;

-- CreateIndex
CREATE INDEX "Musician_id_email_idx" ON "Musician"("id", "email");
