require("dotenv").config();
const supabase = require("./src/config/supabaseClient");

async function setupDatabase() {
  console.log("Setting up database tables...");
  
  try {
    // Test connection
    const { data, error } = await supabase.from('student_auth').select('count').limit(1);
    
    if (error && error.message.includes('does not exist')) {
      console.log("❌ Database tables don't exist!");
      console.log("\n📋 Please run these SQL commands in your Supabase SQL Editor:");
      console.log("\n-- Create student_auth table");
      console.log("CREATE TABLE IF NOT EXISTS student_auth (");
      console.log("  id SERIAL PRIMARY KEY,");
      console.log("  reg_no VARCHAR(20) UNIQUE NOT NULL,");
      console.log("  email VARCHAR(255) NOT NULL,");
      console.log("  password_hash VARCHAR(255) NOT NULL,");
      console.log("  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
      console.log(");");
      console.log("\n-- Create teacher_auth table");
      console.log("CREATE TABLE IF NOT EXISTS teacher_auth (");
      console.log("  id SERIAL PRIMARY KEY,");
      console.log("  name VARCHAR(255),");
      console.log("  email VARCHAR(255) UNIQUE NOT NULL,");
      console.log("  password_hash VARCHAR(255) NOT NULL,");
      console.log("  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
      console.log(");");
      console.log("\n🌐 Go to: https://supabase.com/dashboard/project/nfkhxezvesqbbetdsytn/sql");
    } else {
      console.log("✅ Database tables exist and are accessible!");
    }
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    console.log("\n🔧 Check your .env file:");
    console.log("SUPABASE_URL=", process.env.SUPABASE_URL ? "✅ Set" : "❌ Missing");
    console.log("SUPABASE_KEY=", process.env.SUPABASE_KEY ? "✅ Set" : "❌ Missing");
  }
}

setupDatabase();