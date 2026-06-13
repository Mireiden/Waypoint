/*
  Warnings:

  - A unique constraint covering the columns `[route_id,position]` on the table `route_points` will be added. If there are existing duplicate values, this will fail.
  - Made the column `user_id` on table `destinations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `category_id` on table `destinations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `geometry` on table `destinations` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "route_points" DROP CONSTRAINT "fk_point_id";

-- DropForeignKey
ALTER TABLE "route_points" DROP CONSTRAINT "fk_route_id";

-- AlterTable
ALTER TABLE "destinations" ALTER COLUMN "user_id" SET NOT NULL,
ALTER COLUMN "category_id" SET NOT NULL,
ALTER COLUMN "geometry" SET NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "reports" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "reviews" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6);

-- CreateIndex
CREATE UNIQUE INDEX "route_points_route_id_position_key" ON "route_points"("route_id", "position");

-- AddForeignKey
ALTER TABLE "route_points" ADD CONSTRAINT "fk_route_id" FOREIGN KEY ("route_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "route_points" ADD CONSTRAINT "fk_point_id" FOREIGN KEY ("point_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
