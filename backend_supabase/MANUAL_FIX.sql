-- MANUAL FIX: Run this in Supabase SQL Editor
-- Go to: https://supabase.com/dashboard/project/nfkhxezvesqbbetdsytn/sql

-- Step 1: Drop the foreign key constraint
ALTER TABLE student_auth DROP CONSTRAINT IF EXISTS student_auth_reg_no_fkey;

-- Step 2: Verify the table structure is correct
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'student_auth';

-- Step 3: Test insert (optional)
-- INSERT INTO student_auth (reg_no, email, password_hash) 
-- VALUES ('TEST123', 'test@test.com', 'dummy_hash');