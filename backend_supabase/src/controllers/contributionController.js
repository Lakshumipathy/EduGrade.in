const supabase = require("../config/supabaseClient");

/* ------------------ UPLOAD FILE ------------------ */
async function uploadToStorage(bucket, file) {
  const ext = file.originalname.split(".").pop();
  const fileName = `${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
    });

  if (error) throw error;

  const { data: url } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return url.publicUrl;
}

exports.uploadToStorage = uploadToStorage;

/* ------------------ SUBMIT ACHIEVEMENT ------------------ */
exports.submitAchievement = async (req, res) => {
  try {
    const { regNo, type, date, content, location, universityName } = req.body;

    if (!req.file) return res.status(400).json({ error: "File required" });

    const fileUrl = await uploadToStorage("achievements", req.file);

    const { error } = await supabase.from("achievements").insert([
      {
        student_id: regNo,
        type,
        date,
        content,
        location,
        university_name: universityName || null,
        file_name: fileUrl,
        submitted_date: new Date().toISOString(),
      },
    ]);

    if (error) throw error;

    res.json({ message: "Achievement submitted successfully" });

  } catch (err) {
    console.error("ACHIEVEMENT SUBMIT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ------------------ SUBMIT INTERNSHIP ------------------ */
exports.submitResearchInternship = async (req, res) => {
  try {
    const { regNo, type, date, title, organization } = req.body;

    if (!req.file) return res.status(400).json({ error: "File required" });

    const fileUrl = await uploadToStorage("research_internship", req.file);

    const { error } = await supabase.from("internship_submissions").insert([
      {
        student_id: regNo,
        type,
        date,
        title,
        organization,
        file_name: fileUrl,
        submitted_date: new Date().toISOString(),
      },
    ]);

    if (error) throw error;

    res.json({ message: "Internship/Research submitted successfully" });

  } catch (err) {
    console.error("INTERNSHIP SUBMIT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
