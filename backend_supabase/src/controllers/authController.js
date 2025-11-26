const supabase = require("../config/supabaseClient");
const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 10;

/* ---------- STUDENT REGISTER ---------- */
async function registerStudent(req, res) {
  try {
    const { regNo, email, password } = req.body;

    if (!regNo || !email || !password) {
      return res.status(400).json({ error: "regNo, email and password are required" });
    }

    // Student must exist in main students dataset
    const { data: studentRows } = await supabase
      .from("students")
      .select("reg_no")
      .eq("reg_no", regNo);

    if (!studentRows || studentRows.length === 0) {
      return res.status(404).json({ error: "Student register number not found" });
    }

    // Check duplicate
    const { data: existingRows } = await supabase
      .from("student_auth")
      .select("reg_no")
      .eq("reg_no", regNo);

    if (existingRows && existingRows.length > 0) {
      return res.status(400).json({ error: "Account already exists for this register number" });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    const { error: insertErr } = await supabase.from("student_auth").insert({
      reg_no: regNo,
      email,
      password_hash: hash,
    });

    if (insertErr) {
      return res.status(500).json({ error: "Failed to create student account" });
    }

    return res.json({ message: "Student registered successfully", regNo, email });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}

/* ---------- STUDENT LOGIN ---------- */
async function loginStudent(req, res) {
  try {
    const { regNo, password } = req.body;

    if (!regNo || !password) {
      return res.status(400).json({ error: "regNo and password are required" });
    }

    console.log("Login attempt for regNo:", regNo);

    const { data: rows } = await supabase
      .from("student_auth")
      .select("*")
      .eq("reg_no", regNo);

    console.log("Found student_auth rows:", rows?.length || 0);

    if (!rows || rows.length === 0) {
      return res.status(400).json({ error: "Invalid register number or password. Please register first if you haven't already." });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);

    if (!ok) {
      return res.status(400).json({ error: "Invalid register number or password" });
    }

    return res.json({
      role: "student",
      regNo: user.reg_no,
      email: user.email,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/* ---------- TEACHER REGISTER ---------- */
async function registerTeacher(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const { data: existingRows } = await supabase
      .from("teacher_auth")
      .select("email")
      .eq("email", email);

    if (existingRows && existingRows.length > 0) {
      return res.status(400).json({ error: "Account already exists for this email" });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    const { error: insertErr } = await supabase.from("teacher_auth").insert({
      name,
      email,
      password_hash: hash,
    });

    if (insertErr) {
      return res.status(500).json({ error: "Failed to create teacher account" });
    }

    return res.json({ message: "Teacher registered successfully", email });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}

/* ---------- TEACHER LOGIN ---------- */
async function loginTeacher(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const { data: rows } = await supabase
      .from("teacher_auth")
      .select("*")
      .eq("email", email);

    if (!rows || rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);

    if (!ok) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    return res.json({
      role: "teacher",
      email: user.email,
      name: user.name,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  registerStudent,
  loginStudent,
  registerTeacher,
  loginTeacher,
};
