-- Create student_auth table
CREATE TABLE IF NOT EXISTS student_auth (
  id SERIAL PRIMARY KEY,
  reg_no VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create teacher_auth table
CREATE TABLE IF NOT EXISTS teacher_auth (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);