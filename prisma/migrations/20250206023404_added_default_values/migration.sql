-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "isDeleted" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "isDeleted" SET DEFAULT false;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "isActive" SET DEFAULT true,
ALTER COLUMN "isDeleted" SET DEFAULT false;
