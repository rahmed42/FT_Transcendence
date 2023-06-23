-- AlterTable
ALTER TABLE "MatchHistory" ADD COLUMN     "opponentName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "opponentScore" INTEGER NOT NULL DEFAULT 0;
