/*
  Warnings:

  - You are about to drop the column `position` on the `route_points` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "route_points_route_id_position_key";

-- AlterTable
ALTER TABLE "route_points" DROP COLUMN "position";
