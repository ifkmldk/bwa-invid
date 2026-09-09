/*
  Warnings:

  - You are about to drop the column `events` on the `invitations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "events" ADD COLUMN     "maps_url" TEXT,
ADD COLUMN     "sort_order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "time_end" TIMESTAMP(3),
ADD COLUMN     "time_start" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "gallery_photos" ADD COLUMN     "sort_order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "invitations" DROP COLUMN "events",
ADD COLUMN     "bride_father" TEXT,
ADD COLUMN     "bride_mother" TEXT,
ADD COLUMN     "bride_name" TEXT,
ADD COLUMN     "cover_image_url" TEXT,
ADD COLUMN     "groom_father" TEXT,
ADD COLUMN     "groom_mother" TEXT,
ADD COLUMN     "groom_name" TEXT;
