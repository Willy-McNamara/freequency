/*
  Warnings:

  - You are about to drop the column `totalGasUps` on the `Musician` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Musician" DROP COLUMN "totalGasUps",
ADD COLUMN     "totalGasUpsGiven" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalGasUpsRecieved" INTEGER NOT NULL DEFAULT 0;
