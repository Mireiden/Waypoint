-- @param {String} $1:title
-- @param {String} $2:description?
-- @param {String} $3:type
-- @param {Json}   $4:geometry
-- @param {String} $5:city?
-- @param {String} $6:country?
-- @param {Int}    $7:userId
-- @param {Int}    $8:categoryId
INSERT INTO destinations (
  title,
  description,
  type,
  geometry,
  city,
  country,
  user_id,
  category_id
) VALUES (
  $1,
  $2,
  $3::"DestinationType",
  ST_SetSRID(ST_GeomFromGeoJSON($4), 4326),
  $5,
  $6,
  $7,
  $8
)
RETURNING id, title, description, type,
          ST_AsGeoJSON(geometry)::jsonb AS geometry,
          city, country, category_id AS "categoryId", created_at AS "createdAt";
