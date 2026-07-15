/*
  Warnings:

  - A unique constraint covering the columns `[verificationToken]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" TEXT[] DEFAULT ARRAY['USER']::TEXT[],
ADD COLUMN     "verificationToken" TEXT,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "users_verificationToken_key" ON "users"("verificationToken");
