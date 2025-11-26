const supabase = require("../config/supabaseClient");
const router = require("express").Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const studentController = require("../controllers/studentController");
const { submitAchievement, uploadToStorage } = require("../controllers/contributionController");

/* ---------------- STUDENT PERFORMANCE ---------------- */
router.post("/performance", studentController.getPerformance);

/* ---------------- SUBMIT ACHIEVEMENT ---------------- */
router.post("/achievement", upload.single("file"), submitAchievement);

/* ---------------- GET STUDENT ACHIEVEMENTS ---------------- */
router.get("/achievements/:regNo", async (req, res) => {
  const { regNo } = req.params;

  try {
    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .eq("student_id", regNo)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.json({ achievements: data });

  } catch (err) {
    console.error("FETCH ERROR:", err);
    return res.status(500).json({ error: "Failed to fetch achievements" });
  }
});

/* ---------------- DELETE ACHIEVEMENT ---------------- */
router.delete("/achievement/:id", async (req, res) => {
  try {
    const { error } = await supabase
      .from("achievements")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;
    res.json({ message: "Achievement deleted successfully" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Failed to delete achievement" });
  }
});

/* ---------------- UPDATE ACHIEVEMENT ---------------- */
router.put("/achievement/:id", upload.single("file"), async (req, res) => {
  try {
    const { type, date, content, location, universityName } = req.body;
    
    let updateData = {
      type,
      date,
      content,
      location,
      university_name: universityName || null
    };

    // If a new file is uploaded, update the file URL
    if (req.file) {
      const fileUrl = await uploadToStorage("achievements", req.file);
      updateData.file_name = fileUrl;
    }

    const { error } = await supabase
      .from("achievements")
      .update(updateData)
      .eq("id", req.params.id);

    if (error) throw error;
    res.json({ message: "Achievement updated successfully" });
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ error: "Failed to update achievement" });
  }
});

module.exports = router;
