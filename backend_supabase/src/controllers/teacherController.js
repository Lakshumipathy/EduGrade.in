const supabase = require("../config/supabaseClient");

/* ------------------ GET ALL ACHIEVEMENTS ------------------ */
exports.getAllAchievements = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.json({ achievements: data });
  } catch (err) {
    console.error("GET ALL ACHIEVEMENTS ERROR:", err);
    return res.status(500).json({ error: "Could not fetch achievements" });
  }
};

/* ------------------ GET ALL RESEARCH / INTERNSHIP ------------------ */
exports.getAllResearchInternship = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("student_research_internship")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.json({ submissions: data });
  } catch (err) {
    console.error("GET ALL RESEARCH INTERNSHIP ERROR:", err);
    return res.status(500).json({ error: "Could not fetch submissions" });
  }
};
