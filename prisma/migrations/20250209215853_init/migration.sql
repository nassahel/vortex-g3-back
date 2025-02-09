/*
  Warnings:

  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "profileImage" TEXT,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "dni" DROP NOT NULL,
ALTER COLUMN "birthday" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "image";
