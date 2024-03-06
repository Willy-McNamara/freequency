/*
  Warnings:

  - You are about to drop the column `musicianDisplayName` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `musicianProfilePhotoUrl` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `musicianDisplayName` on the `GasUp` table. All the data in the column will be lost.
  - You are about to drop the column `musicianProfilePhotoUrl` on the `GasUp` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "musicianDisplayName",
DROP COLUMN "musicianProfilePhotoUrl";

-- AlterTable
ALTER TABLE "GasUp" DROP COLUMN "musicianDisplayName",
DROP COLUMN "musicianProfilePhotoUrl";
