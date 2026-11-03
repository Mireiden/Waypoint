-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "reported_user_id" INTEGER;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "fk_reported_user_id" FOREIGN KEY ("reported_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- Add check constraints
ALTER TABLE "reports" ADD CONSTRAINT "chk_reports_single_target"
CHECK(
    (destination_id IS NOT NULL)::int
    + (review_id IS NOT NULL)::int
    + (reported_user_id IS NOT NULL)::int
    = 1
); 