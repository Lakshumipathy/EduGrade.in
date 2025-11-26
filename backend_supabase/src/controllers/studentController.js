// src/controllers/studentController.js
const supabase = require("../config/supabaseClient");

/**
 * Subject code → readable name
 * (You can change these anytime; it will automatically reflect everywhere)
 */
const SUBJECT_LABELS = {
  MA23111: "Discrete Maths",
  AL23311: "Artificial Intelligence",
  CS23411: "Database Management System",
  CS23312: "Object Oriented Programming",
  EC23331: "Digital Principles and Computer Organisation",
};



/**
 * Build 2–3 useful links per subject.
 * They’re all valid URLs (YouTube + general web resources).
 */
function buildResources(code, name) {
  const base = `${name}`.trim();

  return [
    {
      label: "YouTube lecture",
      url:
        "https://www.youtube.com/results?search_query=" +
        encodeURIComponent(base + " lecture"),
    },
    {
      label: "Concept notes",
      url:
        "https://www.google.com/search?q=" +
        encodeURIComponent(base + " notes tutorial"),
    },
    {
      label: "Practice problems",
      url:
        "https://www.google.com/search?q=" +
        encodeURIComponent(base + " practice problems"),
    },
  ];
}

exports.getPerformance = async (req, res) => {
  try {
    const { regNo, semester } = req.body;

    if (!regNo || !semester) {
      return res
        .status(400)
        .json({ error: "regNo and semester are required" });
    }

    // 1) Fetch student row
    const { data: student, error } = await supabase
      .from("students")
      .select("reg_no, name, semester, data")
      .eq("reg_no", regNo)
      .eq("semester", semester)
      .single();

    if (error || !student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const raw = student.data || {};



    // 2) Build subject-wise performance
    const subjectPerformance = Object.entries(raw)
      .filter(([key]) => key !== "failed" && key !== "absent")
      .map(([code, value]) => {
        const total = Number(value) || 0;
        const name = SUBJECT_LABELS[code] || "Unknown Subject"; // fallback if name missing
        const percentage = (total / 50) * 100;

        let status = total >= 25 ? "Strong" : "Weak";

        return {
          code,
          name,
          total,
          percentage: Number(percentage.toFixed(1)),
          status,
        };
      });

    const totalSubjects = subjectPerformance.length;
    const totalMarksObtained = subjectPerformance.reduce(
      (sum, s) => sum + s.total,
      0
    );
    const overallPercentage = totalSubjects
      ? Number(((totalMarksObtained / (totalSubjects * 50)) * 100).toFixed(1))
      : 0;

    // 3) Weak subjects (for the plan)
    const weakSubjects = subjectPerformance
      .filter(s => s.total < 25)   // < 25 is weak
      .map(s => ({
        code: s.code,
        name: s.name,
        plan: `Spend 1 hour daily revising concepts and practicing problems of ${s.name}.`,
        links: buildResources(s.code, s.name)
      }));




    const getSubjectSpecificPlan = (code, name, total) => {
      // Generate plan based on department code
      const dept = code.substring(0, 2);
      
      const deptPlans = {
        'MA': 'Focus on mathematical concepts, practice problem-solving, and work on theoretical understanding.',
        'CS': 'Practice coding problems, work on algorithms, and strengthen programming fundamentals.',
        'AL': 'Study AI algorithms, machine learning concepts, and work on practical implementations.',
        'EC': 'Focus on circuit analysis, digital systems, and electronic component understanding.',
        'IT': 'Work on system design, database concepts, and information technology applications.',
        'EE': 'Study electrical circuits, power systems, and electrical engineering principles.',
        'ME': 'Focus on mechanical systems, thermodynamics, and engineering mechanics.',
        'CE': 'Study structural analysis, construction materials, and civil engineering principles.'
      };
      
      const basePlan = deptPlans[dept] || 'Focus on core concepts and practice problems regularly.';
      return `Dedicate 2 hours daily to ${name}. ${basePlan}`;
    };

    const improvementPlan = weakSubjects.map(subj => {
      const links = buildResources(subj.code, subj.name);
      
      return {
        subjectCode: subj.code,
        subjectName: subj.name,
        plan: getSubjectSpecificPlan(subj.code, subj.name, subj.total),
        links
      };
    });

    // 5) Send final response
    return res.json({
      student: {
        reg_no: student.reg_no,
        name: student.name,
        semester: student.semester,
      },
      subjects: subjectPerformance,
      totalSubjects,
      overallPercentage,
      weakSubjects,
      improvementPlan,
    });
  } catch (err) {
    console.error("PERFORMANCE ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
