-- CreateTable
CREATE TABLE "User" (
    "token" TEXT NOT NULL,
    "jwtToken" TEXT NOT NULL DEFAULT '',
    "id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "large_pic" TEXT NOT NULL,
    "medium_pic" TEXT NOT NULL,
    "small_pic" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "two_fa" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Authenticator" (
    "checked" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "Data" (
    "code" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Room" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT,
    "type" TEXT NOT NULL DEFAULT 'PUBLIC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerLogin" TEXT NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrivateRoom" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrivateRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "senderLogin" TEXT NOT NULL,
    "roomId" INTEGER,
    "privateRoomId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BlockedUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_RoomUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_RoomInvitedUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_RoomAdministrator" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_RoomBannedUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_RoomMutedUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_PrivateRoomUser" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");

-- CreateIndex
CREATE UNIQUE INDEX "Authenticator_checked_key" ON "Authenticator"("checked");

-- CreateIndex
CREATE UNIQUE INDEX "Data_code_key" ON "Data"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Room_name_key" ON "Room"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PrivateRoom_id_key" ON "PrivateRoom"("id");

-- CreateIndex
CREATE UNIQUE INDEX "_BlockedUser_AB_unique" ON "_BlockedUser"("A", "B");

-- CreateIndex
CREATE INDEX "_BlockedUser_B_index" ON "_BlockedUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RoomUser_AB_unique" ON "_RoomUser"("A", "B");

-- CreateIndex
CREATE INDEX "_RoomUser_B_index" ON "_RoomUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RoomInvitedUser_AB_unique" ON "_RoomInvitedUser"("A", "B");

-- CreateIndex
CREATE INDEX "_RoomInvitedUser_B_index" ON "_RoomInvitedUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RoomAdministrator_AB_unique" ON "_RoomAdministrator"("A", "B");

-- CreateIndex
CREATE INDEX "_RoomAdministrator_B_index" ON "_RoomAdministrator"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RoomBannedUser_AB_unique" ON "_RoomBannedUser"("A", "B");

-- CreateIndex
CREATE INDEX "_RoomBannedUser_B_index" ON "_RoomBannedUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RoomMutedUser_AB_unique" ON "_RoomMutedUser"("A", "B");

-- CreateIndex
CREATE INDEX "_RoomMutedUser_B_index" ON "_RoomMutedUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PrivateRoomUser_AB_unique" ON "_PrivateRoomUser"("A", "B");

-- CreateIndex
CREATE INDEX "_PrivateRoomUser_B_index" ON "_PrivateRoomUser"("B");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_ownerLogin_fkey" FOREIGN KEY ("ownerLogin") REFERENCES "User"("login") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderLogin_fkey" FOREIGN KEY ("senderLogin") REFERENCES "User"("login") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_privateRoomId_fkey" FOREIGN KEY ("privateRoomId") REFERENCES "PrivateRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlockedUser" ADD CONSTRAINT "_BlockedUser_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlockedUser" ADD CONSTRAINT "_BlockedUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomUser" ADD CONSTRAINT "_RoomUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomUser" ADD CONSTRAINT "_RoomUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomInvitedUser" ADD CONSTRAINT "_RoomInvitedUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomInvitedUser" ADD CONSTRAINT "_RoomInvitedUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomAdministrator" ADD CONSTRAINT "_RoomAdministrator_A_fkey" FOREIGN KEY ("A") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomAdministrator" ADD CONSTRAINT "_RoomAdministrator_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomBannedUser" ADD CONSTRAINT "_RoomBannedUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomBannedUser" ADD CONSTRAINT "_RoomBannedUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomMutedUser" ADD CONSTRAINT "_RoomMutedUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomMutedUser" ADD CONSTRAINT "_RoomMutedUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PrivateRoomUser" ADD CONSTRAINT "_PrivateRoomUser_A_fkey" FOREIGN KEY ("A") REFERENCES "PrivateRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PrivateRoomUser" ADD CONSTRAINT "_PrivateRoomUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
