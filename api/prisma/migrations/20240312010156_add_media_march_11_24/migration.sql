/*
  Warnings:

  - You are about to drop the column `totalGasUpsRecieved` on the `Musician` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Musician" DROP COLUMN "totalGasUpsRecieved",
ADD COLUMN     "totalGasUpsReceived" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Media" (
    "id" SERIAL NOT NULL,
    "musicianId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sessionId" INTEGER,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Media_sessionId_key" ON "Media"("sessionId");

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_musicianId_fkey" FOREIGN KEY ("musicianId") REFERENCES "Musician"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;
