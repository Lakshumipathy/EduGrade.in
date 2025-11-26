# Study Smart Backend (Node.js + Express + Supabase)

## Overview
This backend accepts teacher dataset uploads (CSV/Excel), parses them and stores structured records into Supabase tables. Students query performance by providing `{ regNo, semester }` which searches across all uploaded datasets.

## Setup
1. Copy `.env.example` to `.env` and set values.
2. `npm install`
3. `npm run dev` (requires nodemon) or `npm start`

## Supabase Schema
See `migrations/schema.sql` for recommended tables.

## Endpoints
- `POST /api/upload` (multipart/form-data: file, datasetName, uploadedBy)
- `GET  /api/datasets`
- `POST /api/student/performance` JSON `{ regNo, semester }`
