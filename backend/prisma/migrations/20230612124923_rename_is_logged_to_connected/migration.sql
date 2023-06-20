/*
  Warnings:

  - You are about to drop the column `isLogged` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "isLogged",
ADD COLUMN     "connected" BOOLEAN NOT NULL DEFAULT false;
