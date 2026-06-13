-- @param {Int} $1:id
SELECT
  id,
  title,
  description,
  type,
  city,
  country,
  ST_AsGeoJSON(geometry)::jsonb AS geometry
FROM destinations
WHERE id = $1;