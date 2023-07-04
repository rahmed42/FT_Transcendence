-- AlterTable
ALTER TABLE "User" ADD COLUMN     "gameTypeInvitation" TEXT NOT NULL DEFAULT 'undefined',
ADD COLUMN     "loginGameInvitation" TEXT NOT NULL DEFAULT 'undefined';
