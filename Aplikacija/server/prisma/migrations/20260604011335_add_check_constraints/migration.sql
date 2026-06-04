-- Add check constraints 
ALTER TABLE reviews
  ADD CONSTRAINT rating_range 
    CHECK (rating >= 1 AND rating <= 5);

ALTER TABLE reports
  ADD CONSTRAINT report_has_target
    CHECK (destination_id IS NOT NULL OR review_id IS NOT NULL);