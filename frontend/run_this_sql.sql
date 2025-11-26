-- Run this in Supabase SQL Editor

CREATE TABLE research_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  register_number TEXT NOT NULL,
  department TEXT NOT NULL,
  semester TEXT NOT NULL,
  research_title TEXT NOT NULL,
  research_domain TEXT NOT NULL,
  publication_type TEXT NOT NULL,
  publisher_name TEXT NOT NULL,
  doi_link TEXT NOT NULL,
  abstract TEXT NOT NULL,
  date_of_publication DATE NOT NULL,
  mentor_name TEXT NOT NULL,
  organization TEXT NOT NULL,
  file_url TEXT,
  submitted_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE internship_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  register_number TEXT NOT NULL,
  department TEXT NOT NULL,
  semester TEXT NOT NULL,
  company_name TEXT NOT NULL,
  role TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration TEXT NOT NULL,
  internship_type TEXT NOT NULL,
  supervisor_name TEXT NOT NULL,
  description TEXT NOT NULL,
  skills TEXT[] NOT NULL,
  certificate_url TEXT,
  project_details TEXT,
  submitted_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);