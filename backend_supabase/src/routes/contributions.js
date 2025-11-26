const router = require("express").Router();
const supabase = require("../config/supabaseClient");

/* =====================================================
   GET MONTH-WISE ACHIEVEMENT COUNTS
   ===================================================== */
router.get("/achievements", async (req, res) => {
  const { regNo, year } = req.query;

  if (!regNo || !year) {
    return res.status(400).json({ error: "regNo and year are required" });
  }

  try {
    const { data, error } = await supabase
      .from("achievements")
      .select("id, created_at")
      .eq("student_id", regNo);

    if (error) throw error;

    // Prepare monthly stats
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(0, i).toLocaleString("en-US", { month: "short" }),
      count: 0,
    }));

    data.forEach((a) => {
      const d = new Date(a.created_at);
      if (d.getFullYear() == year) {
        months[d.getMonth()].count += 1;
      }
    });

    return res.json({ monthly: months });
  } catch (err) {
    console.error("Achievement Stats Error:", err);
    return res.status(500).json({ error: "Failed to load achievement stats" });
  }
});

/* =====================================================
   GET MONTH-WISE RESEARCH + INTERNSHIP COUNTS
   ===================================================== */
router.get("/research-internship", async (req, res) => {
  const { regNo, year } = req.query;

  try {
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(0, i).toLocaleString("en-US", { month: "short" }),
      researchCount: 0,
      internshipCount: 0,
    }));

    // Fetch research submissions
    const { data: research, error: rErr } = await supabase
      .from("research_submissions")
      .select("created_at")
      .eq("student_id", regNo);

    if (rErr) console.log("Research error:", rErr);

    research?.forEach((row) => {
      const d = new Date(row.created_at);
      if (d.getFullYear() == year) months[d.getMonth()].researchCount += 1;
    });

    // Fetch internship submissions
    const { data: intern, error: iErr } = await supabase
      .from("internship_submissions")
      .select("created_at")
      .eq("student_id", regNo);

    if (iErr) console.log("Internship error:", iErr);

    intern?.forEach((row) => {
      const d = new Date(row.created_at);
      if (d.getFullYear() == year) months[d.getMonth()].internshipCount += 1;
    });

    return res.json({ monthly: months });
  } catch (err) {
    console.error("Research/Internship Stats Error:", err);
    return res
      .status(500)
      .json({ error: "Failed to load research & internship stats" });
  }
});

module.exports = router;
