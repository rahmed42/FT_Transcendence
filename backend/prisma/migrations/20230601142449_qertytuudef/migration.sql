/*
  Warnings:

  - You are about to drop the column `two_fa_authenticate` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "two_fa_authenticate",
ADD COLUMN     "isLogged" BOOLEAN NOT NULL DEFAULT false;
