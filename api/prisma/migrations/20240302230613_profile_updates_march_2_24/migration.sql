/*
  Warnings:

  - You are about to drop the column `username` on the `Musician` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[displayName]` on the table `Musician` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `displayName` to the `Musician` table without a default value. This is not possible if the table is not empty.
  - Added the required column `familyName` to the `Musician` table without a default value. This is not possible if the table is not empty.
  - Added the required column `givenName` to the `Musician` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Musician_username_key";

-- AlterTable
ALTER TABLE "Musician" DROP COLUMN "username",
ADD COLUMN     "displayName" TEXT NOT NULL,
ADD COLUMN     "familyName" TEXT NOT NULL,
ADD COLUMN     "givenName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Musician_displayName_key" ON "Musician"("displayName");
