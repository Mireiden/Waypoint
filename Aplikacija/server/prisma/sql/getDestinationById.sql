-- @param {Int} $1:id
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
LEFT JOIN categories c ON c.id = d.category_id
LEFT JOIN reviews r ON r.destination_id = d.id
WHERE d.id = $1
GROUP BY d.id, c.id;
