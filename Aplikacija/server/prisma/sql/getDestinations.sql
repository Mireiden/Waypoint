SELECT
  d.id,
  d.title,
  d.description,
  d.type,
  d.city,
  d.country,
  ST_AsGeoJSON(d.geometry)::jsonb AS geometry,
  json_build_object('id', c.id, 'name', c.name, 'icon', c.icon) AS category
FROM destinations d
LEFT JOIN categories c ON c.id = d.category_id
ORDER BY d.created_at DESC;
