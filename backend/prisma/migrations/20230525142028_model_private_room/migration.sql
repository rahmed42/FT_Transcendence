/*
  Warnings:

  - You are about to drop the column `isPrivate` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `recipientId` on the `Message` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_recipientId_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "isPrivate",
DROP COLUMN "recipientId",
ADD COLUMN     "privateRoomId" INTEGER;

-- CreateTable
CREATE TABLE "PrivateRoom" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrivateRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PrivateRoomUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PrivateRoomUser_AB_unique" ON "_PrivateRoomUser"("A", "B");

-- CreateIndex
CREATE INDEX "_PrivateRoomUser_B_index" ON "_PrivateRoomUser"("B");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_privateRoomId_fkey" FOREIGN KEY ("privateRoomId") REFERENCES "PrivateRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PrivateRoomUser" ADD CONSTRAINT "_PrivateRoomUser_A_fkey" FOREIGN KEY ("A") REFERENCES "PrivateRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PrivateRoomUser" ADD CONSTRAINT "_PrivateRoomUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
