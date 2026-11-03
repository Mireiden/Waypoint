--@param {Int} $1:routeId
SELECT
    d.id,
    d.title,
    d.description,
    ST_AsGeoJSON(d.geometry)::jsonb AS geometry
FROM route_points rp
JOIN destinations d ON d.id = rp.point_id
WHERE rp.route_id = $1
ORDER BY d.id;