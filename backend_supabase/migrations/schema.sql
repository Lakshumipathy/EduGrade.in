-- Run these SQL commands in Supabase SQL editor (or via psql)
create table datasets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  uploaded_by text,
  uploaded_at timestamptz default now()
);

create table students (
  id uuid primary key default gen_random_uuid(),
  dataset_id uuid references datasets(id) on delete cascade,
  reg_no text not null,
  name text,
  semester integer,
  data jsonb -- full record per student including subjects/marks
);

create index on students (reg_no);
create index on students (semester);
