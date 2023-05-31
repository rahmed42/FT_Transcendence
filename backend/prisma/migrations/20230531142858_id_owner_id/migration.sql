-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_id_fkey";

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
