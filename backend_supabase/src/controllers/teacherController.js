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

/* ------------------ GET DATASETS ------------------ */
exports.getDatasets = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("students")
      .select("semester")
      .not("semester", "is", null);

    if (error) throw error;

    // Group by semester and count students
    const semesterCounts = {};
    data.forEach(row => {
      const sem = row.semester;
      semesterCounts[sem] = (semesterCounts[sem] || 0) + 1;
    });

    const datasets = Object.entries(semesterCounts).map(([semester, count]) => ({
      semester,
      studentCount: count
    }));

    return res.json({ datasets });
  } catch (err) {
    console.error("GET DATASETS ERROR:", err);
    return res.status(500).json({ error: "Could not fetch datasets" });
  }
};

/* ------------------ DELETE DATASET ------------------ */
exports.deleteDataset = async (req, res) => {
  try {
    const { semester } = req.params;

    const { error } = await supabase
      .from("students")
      .delete()
      .eq("semester", semester);

    if (error) throw error;

    return res.json({ message: `Dataset for semester ${semester} deleted successfully` });
  } catch (err) {
    console.error("DELETE DATASET ERROR:", err);
    return res.status(500).json({ error: "Could not delete dataset" });
  }
};
