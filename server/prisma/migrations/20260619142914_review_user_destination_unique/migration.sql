/*
  Warnings:

  - A unique constraint covering the columns `[user_id,destination_id]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "reviews_user_id_destination_id_key" ON "reviews"("user_id", "destination_id");
