require("dotenv").config();
const supabase = require("./src/config/supabaseClient");

async function fixAuthTable() {
  console.log("Fixing student_auth table foreign key constraint...");
  
  try {
    // This will show us the current table structure
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Drop the foreign key constraint if it exists
        ALTER TABLE student_auth DROP CONSTRAINT IF EXISTS student_auth_reg_no_fkey;
        
        -- Recreate the table without foreign key constraint
        DROP TABLE IF EXISTS student_auth_new;
        CREATE TABLE student_auth_new (
          id SERIAL PRIMARY KEY,
          reg_no VARCHAR(20) UNIQUE NOT NULL,
          email VARCHAR(255) NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Copy existing data if any
        INSERT INTO student_auth_new (reg_no, email, password_hash, created_at)
        SELECT reg_no, email, password_hash, created_at FROM student_auth;
        
        -- Replace the old table
        DROP TABLE student_auth;
        ALTER TABLE student_auth_new RENAME TO student_auth;
      `
    });
    
    if (error) {
      console.error("❌ SQL execution failed:", error);
    } else {
      console.log("✅ Fixed student_auth table!");
    }
    
  } catch (err) {
    console.error("❌ Fix failed:", err);
    console.log("\n🔧 Manual fix needed:");
    console.log("Go to Supabase SQL Editor and run:");
    console.log("ALTER TABLE student_auth DROP CONSTRAINT IF EXISTS student_auth_reg_no_fkey;");
  }
}

fixAuthTable();