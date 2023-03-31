/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `conversations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "conversations" DROP COLUMN "deleted_at",
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;
