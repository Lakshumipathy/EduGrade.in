-- Run this SQL in Supabase to create auth tables

CREATE TABLE student_auth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reg_no TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE teacher_auth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS for auth tables
ALTER TABLE student_auth DISABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_auth DISABLE ROW LEVEL SECURITY;