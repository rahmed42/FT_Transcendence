/*
  Warnings:

  - You are about to drop the `Athenticator` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Athenticator";

-- CreateTable
CREATE TABLE "Authenticator" (
    "checked" BOOLEAN NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Authenticator_checked_key" ON "Authenticator"("checked");
