/*
  Warnings:

  - You are about to drop the column `connected` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "connected",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'logout';
