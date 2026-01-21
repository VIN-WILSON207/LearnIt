-- USERS (simplified for sample data)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100),
  role VARCHAR(20),
  subscription_plan VARCHAR(20)
);

-- COURSES
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150),
  description TEXT,
  level VARCHAR(10),
  thumbnail_url TEXT
);

-- MEDIA
CREATE TABLE IF NOT EXISTS media (
  id SERIAL PRIMARY KEY,
  public_id TEXT NOT NULL,
  secure_url TEXT NOT NULL,
  resource_type VARCHAR(20),
  format VARCHAR(10),
  course_id INT REFERENCES courses(id),
  uploaded_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
