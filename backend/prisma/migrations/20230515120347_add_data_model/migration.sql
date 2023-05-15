-- CreateTable
CREATE TABLE "Data" (
    "code" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Data_code_key" ON "Data"("code");
