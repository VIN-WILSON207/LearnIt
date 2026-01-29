/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Plan` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "levelId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Plan_name_key" ON "Plan"("name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE SET NULL ON UPDATE CASCADE;
