-- groups and counts unresolved reports by target type

-- @param {String} $1:status

SELECT
  CASE
    WHEN destination_id   IS NOT NULL THEN 'destination'
    WHEN review_id        IS NOT NULL THEN 'review'
    WHEN reported_user_id IS NOT NULL THEN 'user'
  END                                                   AS type,
  COALESCE(destination_id, review_id, reported_user_id) AS id,
  COUNT(*)::int                                         AS count,
  MAX(created_at)                                       AS latest
FROM reports
WHERE status = $1
GROUP BY 1, 2; 
-- ordinals used because "id" would group by report id instead of coalesce