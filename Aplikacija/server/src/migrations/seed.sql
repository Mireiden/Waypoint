-- Reset existing demo data and start from a clean state.
TRUNCATE TABLE
  reports,
  reviews,
  route_points,
  destinations,
  categories,
  users
RESTART IDENTITY CASCADE;

-- categories
INSERT INTO categories (id, name, description, icon) OVERRIDING SYSTEM VALUE VALUES
  (1, 'Hidden Gem', 'Mesta koja nisu previše poznata, ali vrede posete.', 'sparkles'),
  (2, 'Fishing', 'Ribolov i mirne vode za opuštanje.', 'fish'),
  (3, 'Gastro', 'Hrana, lokalni specijaliteti i dobra klopa.', 'utensils'),
  (4, 'Viewpoint', 'Vidikovci i panoramska mesta.', 'mountain'),
  (5, 'Nature', 'Priroda, šetnje i krajolici.', 'leaf');

-- users
INSERT INTO users (id, name, email, password_hash, avatar_url, role) OVERRIDING SYSTEM VALUE VALUES
  (1, 'Miloš Jovanović', 'milos.jovanovic@example.com', '$2b$10$demoHashMilosJovanovic', 'https://example.com/avatars/milos.jpg', 'user'),
  (2, 'Jelena Petrović', 'jelena.petrovic@example.com', '$2b$10$demoHashJelenaPetrovic', 'https://example.com/avatars/jelena.jpg', 'user'),
  (3, 'Nikola Stojanović', 'nikola.stojanovic@example.com', '$2b$10$demoHashNikolaStojanovic', 'https://example.com/avatars/nikola.jpg', 'admin');

-- destinations
INSERT INTO destinations (id, title, description, images, city, country, category_id, user_id, type, geometry) OVERRIDING SYSTEM VALUE VALUES
  (1, 'Vidikovac Molitva, Uvac', 'Panoramski pogled na meandre Uvca i jedno od najboljih mesta za fotografisanje.', ARRAY['uvac-molitva-1.jpg', 'uvac-molitva-2.jpg'], 'Sjenica', 'Srbija', 4, 1, 'point', ST_SetSRID(ST_MakePoint(20.472, 43.446), 4326)),
  (2, 'Restoran kod Zaječara', 'Mesto za domaću hranu i lokalne specijalitete u istočnoj Srbiji.', ARRAY['gastro-zajecar-1.jpg'], 'Zaječar', 'Srbija', 3, 2, 'point', ST_SetSRID(ST_MakePoint(22.268, 43.900), 4326)),
  (3, 'Liman na Dunavu, Novi Sad', 'Mirna zona pored vode pogodna za pecanje i laganu šetnju.', ARRAY['dunav-liman-1.jpg'], 'Novi Sad', 'Srbija', 2, 1, 'point', ST_SetSRID(ST_MakePoint(19.840, 45.250), 4326)),
  (4, 'Stara planina, Topli Do', 'Manje poznata planinska lokacija za ljubitelje prirode i pravih skrivenih mesta.', ARRAY['stara-planina-topli-do-1.jpg'], 'Pirot', 'Srbija', 1, 3, 'point', ST_SetSRID(ST_MakePoint(22.679, 43.364), 4326)),
  (5, 'Skadarlija, Beograd', 'Klasična beogradska gastronomska zona sa kafanama i starim šarmom.', ARRAY['skadarlija-1.jpg', 'skadarlija-2.jpg'], 'Beograd', 'Srbija', 3, 2, 'point', ST_SetSRID(ST_MakePoint(20.465, 44.817), 4326));