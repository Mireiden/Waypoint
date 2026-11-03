-- @param {String} $1:type?
-- @param {Int}    $2:categoryId?
-- @param {String} $3:search?
-- @param {Float}  $4:minLng?
-- @param {Float}  $5:minLat?
-- @param {Float}  $6:maxLng?
-- @param {Float}  $7:maxLat?
-- @param {String} $8:sort
-- @param {Int}    $9:limit
SELECT
  d.id,
  d.title,
  d.description,
  d.type,
  d.city,
  d.country,
  ST_AsGeoJSON(d.geometry)::jsonb AS geometry,
  json_build_object('id', c.id, 'name', c.name, 'icon', c.icon) AS category,
  COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0)::float AS "avgRating",
  COUNT(r.id)::int AS "reviewCount"
FROM destinations d
INNER JOIN categories c ON c.id = d.category_id
LEFT JOIN reviews r ON r.destination_id = d.id
WHERE ($1::text  IS NULL OR d.type = $1::"DestinationType")
  AND ($2::int   IS NULL OR d.category_id = $2)
  AND ($3::text  IS NULL OR d.title ILIKE '%' || $3 || '%' OR d.city ILIKE '%' || $3 || '%')
  AND ($4::float IS NULL OR d.geometry && ST_MakeEnvelope($4, $5, $6, $7, 4326))
GROUP BY d.id, c.id
ORDER BY
  CASE WHEN $8 = 'rating'  THEN COALESCE(AVG(r.rating), 0) END DESC NULLS LAST,
  CASE WHEN $8 = 'popular' THEN COUNT(r.id)             END DESC NULLS LAST,
  d.created_at DESC
LIMIT $9;
