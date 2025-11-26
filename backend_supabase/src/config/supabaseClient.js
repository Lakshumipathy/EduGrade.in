require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_KEY;

if (!url || !key) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_KEY in environment");
}

const supabase = createClient(url, key);

module.exports = supabase;
