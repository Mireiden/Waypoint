-- DropForeignKey
ALTER TABLE "reports" DROP CONSTRAINT "fk_review_id";

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "fk_review_id" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
