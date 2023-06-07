/*
  Warnings:

  - You are about to drop the column `ownerLogin` on the `Room` table. All the data in the column will be lost.
  - Added the required column `ownerId` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_ownerLogin_fkey";

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "ownerLogin",
ADD COLUMN     "ownerId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
