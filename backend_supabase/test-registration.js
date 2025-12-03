require("dotenv").config();
const supabase = require("./src/config/supabaseClient");
const bcrypt = require("bcryptjs");

async function testRegistration() {
  console.log("Testing student registration...");
  
  const testData = {
    regNo: "TEST" + Date.now(),
    email: "test" + Date.now() + "@test.com",
    password: "test123"
  };
  
  try {
    // Check if student already exists
    const { data: existing } = await supabase
      .from("student_auth")
      .select("reg_no")
      .eq("reg_no", testData.regNo);
    
    console.log("Existing check result:", existing);
    
    // Hash password
    const hash = await bcrypt.hash(testData.password, 10);
    console.log("Password hashed successfully");
    
    // Insert new student
    const { data, error } = await supabase
      .from("student_auth")
      .insert({
        reg_no: testData.regNo,
        email: testData.email,
        password_hash: hash,
      });
    
    if (error) {
      console.error("❌ Registration failed:", error);
    } else {
      console.log("✅ Registration successful!");
      console.log("Test data:", testData);
    }
    
  } catch (err) {
    console.error("❌ Test failed:", err);
  }
}

testRegistration();