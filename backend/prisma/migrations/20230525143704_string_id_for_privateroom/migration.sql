/*
  Warnings:

  - The primary key for the `PrivateRoom` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `PrivateRoom` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_privateRoomId_fkey";

-- DropForeignKey
ALTER TABLE "_PrivateRoomUser" DROP CONSTRAINT "_PrivateRoomUser_A_fkey";

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "privateRoomId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "PrivateRoom" DROP CONSTRAINT "PrivateRoom_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "PrivateRoom_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "PrivateRoom_id_seq";

-- AlterTable
ALTER TABLE "Room" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "Room_id_seq";

-- AlterTable
ALTER TABLE "_PrivateRoomUser" ALTER COLUMN "A" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PrivateRoom_id_key" ON "PrivateRoom"("id");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_privateRoomId_fkey" FOREIGN KEY ("privateRoomId") REFERENCES "PrivateRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PrivateRoomUser" ADD CONSTRAINT "_PrivateRoomUser_A_fkey" FOREIGN KEY ("A") REFERENCES "PrivateRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
