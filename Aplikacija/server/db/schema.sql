--users
CREATE TABLE users (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(255),
  role VARCHAR(10) NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin')),
  created_at TIMESTAMP DEFAULT now()
);

--categories--
CREATE TABLE categories(
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(200),
  icon VARCHAR(100)
);

--destinations--
CREATE TABLE destinations (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  images TEXT[],
  category_id INTEGER,
  user_id INTEGER,
  type VARCHAR(10) NOT NULL CHECK (type IN ('point', 'route')),
  geometry geometry(Geometry, 4326),
  created_at TIMESTAMP DEFAULT now()
);

ALTER TABLE destinations
  ADD CONSTRAINT fk_category
  FOREIGN KEY(category_id)
  REFERENCES categories(id),
  
  ADD CONSTRAINT fk_user
  FOREIGN KEY(user_id)
  REFERENCES users(id)
  ON DELETE CASCADE;


-- route-point junction table--
CREATE TABLE route_points(
  route_id INTEGER,
  point_id INTEGER,
  position INTEGER NOT NULL,
  PRIMARY KEY (route_id, point_id)
);

ALTER TABLE route_points
  ADD CONSTRAINT fk_route_id 
  FOREIGN KEY(route_id) 
  REFERENCES destinations(id),
  
  ADD CONSTRAINT fk_point_id 
  FOREIGN KEY(point_id) 
  REFERENCES destinations(id);

--reviews--
CREATE TABLE reviews (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  rating INTEGER NOT NULL CHECK(rating >=1 AND rating <=5),
  comment TEXT,
  images TEXT[],
  user_id INTEGER NOT NULL,
  destination_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

ALTER TABLE reviews
  ADD CONSTRAINT fk_user_id 
  FOREIGN KEY(user_id) 
  REFERENCES users(id)
  ON DELETE CASCADE,
  
  ADD CONSTRAINT fk_destination_id 
  FOREIGN KEY(destination_id) 
  REFERENCES destinations(id)
  ON DELETE CASCADE;


--reports--
CREATE TABLE reports(
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  reason VARCHAR(255),
  note TEXT,
  user_id INTEGER NOT NULL,
  destination_id INTEGER,
  review_id INTEGER,
  status VARCHAR(20) CHECK(status IN('pending', 'approved', 'declined')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now()
);

ALTER TABLE reports
  ADD CONSTRAINT fk_user_id 
  FOREIGN KEY(user_id) 
  REFERENCES users(id)
  ON DELETE CASCADE,
   
  ADD CONSTRAINT fk_destination_id 
  FOREIGN KEY(destination_id) 
  REFERENCES destinations(id)
  ON DELETE CASCADE,
  
  ADD CONSTRAINT fk_review_id 
  FOREIGN KEY(review_id) 
  REFERENCES reviews(id)
  ON DELETE SET NULL;

--indexes for frequent queries--
CREATE INDEX idx_destinations_user ON destinations(user_id);
CREATE INDEX idx_reviews_destination ON reviews(destination_id);
CREATE INDEX idx_destinations_geometry ON destinations USING GIST(geometry);



