-- CreateTable
CREATE TABLE "Athenticator" (
    "check" BOOLEAN NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Athenticator_check_key" ON "Athenticator"("check");
