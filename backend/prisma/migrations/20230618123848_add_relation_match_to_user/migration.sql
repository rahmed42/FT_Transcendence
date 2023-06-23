/*
  Warnings:

  - You are about to drop the column `achievements` on the `Stats` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `MatchHistory` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Stats" DROP COLUMN "achievements";

-- CreateIndex
CREATE UNIQUE INDEX "MatchHistory_userId_key" ON "MatchHistory"("userId");

-- AddForeignKey
ALTER TABLE "MatchHistory" ADD CONSTRAINT "MatchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
