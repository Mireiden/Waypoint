/*
  Warnings:

  - You are about to drop the column `images` on the `destinations` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `reviews` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('image', 'video');

-- AlterTable
ALTER TABLE "destinations" DROP COLUMN "images";

-- AlterTable
ALTER TABLE "reviews" DROP COLUMN "images";

-- CreateTable
CREATE TABLE "media" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "destination_id" INTEGER,
    "review_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_public_id_key" ON "media"("public_id");

-- CreateIndex
CREATE INDEX "media_destination_id_idx" ON "media"("destination_id");

-- CreateIndex
CREATE INDEX "media_review_id_idx" ON "media"("review_id");

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "fk_destination_id" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "fk_review_id" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddCheckConstraint
ALTER TABLE "media" ADD CONSTRAINT "chk_media_one_owner"
CHECK(
  (destination_id IS NOT NULL)::int + (review_id IS NOT NULL)::int = 1
);