/*
  Warnings:

  - Added the required column `musicianDisplayName` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `musicianProfilePhotoUrl` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `musicianDisplayName` to the `GasUp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `musicianProfilePhotoUrl` to the `GasUp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "musicianDisplayName" TEXT NOT NULL,
ADD COLUMN     "musicianProfilePhotoUrl" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "GasUp" ADD COLUMN     "musicianDisplayName" TEXT NOT NULL,
ADD COLUMN     "musicianProfilePhotoUrl" TEXT NOT NULL;
