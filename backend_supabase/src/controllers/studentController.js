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
  const resourceMap = {
    "MA23111": {
      youtube: {
        label: "YouTube lecture",
        url: "https://www.youtube.com/watch?v=L3LMbpZIKhQ&list=PLBlnK6fEyqRhqJPDXcvYlLfXPh37L89g3"
      },
      notes: {
        label: "Concept notes",
        url: "https://www.khanacademy.org/computing/computer-science/algorithms"
      },
      practice: {
        label: "Practice problems",
        url: "https://brilliant.org/courses/discrete-mathematics/"
      }
    },
    "AL23311": {
      youtube: {
        label: "YouTube lecture",
        url: "https://www.youtube.com/watch?v=PPLop4L2eGk&list=PLLssT5z_DsK-h9vYZkQkYNWcItqhlRJLN"
      },
      notes: {
        label: "Concept notes",
        url: "https://www.coursera.org/learn/machine-learning"
      },
      practice: {
        label: "Practice problems",
        url: "https://www.kaggle.com/learn"
      }
    },
    "CS23411": {
      youtube: {
        label: "YouTube lecture",
        url: "https://www.youtube.com/watch?v=HXV3zeQKqGY&list=PLrjkTql3jnm-CLxHftqLgkrZbM8fUt0vn"
      },
      notes: {
        label: "Concept notes",
        url: "https://www.w3schools.com/sql/"
      },
      practice: {
        label: "Practice problems",
        url: "https://sqlbolt.com/"
      }
    },
    "CS23312": {
      youtube: {
        label: "YouTube lecture",
        url: "https://www.youtube.com/watch?v=xk4_1vDrzzo&list=PLsyeobzWxl7pe_IiTfNyr55kwJPWbgxB5"
      },
      notes: {
        label: "Concept notes",
        url: "https://docs.oracle.com/javase/tutorial/"
      },
      practice: {
        label: "Practice problems",
        url: "https://www.codecademy.com/learn/learn-java"
      }
    },
    "EC23331": {
      youtube: {
        label: "YouTube lecture",
        url: "https://www.youtube.com/watch?v=M0mx8S05v60&list=PLBlnK6fEyqRjMH3mWf6kwqiTbT798eAOm"
      },
      notes: {
        label: "Concept notes",
        url: "https://www.tutorialspoint.com/digital_circuits/index.htm"
      },
      practice: {
        label: "Practice problems",
        url: "https://circuitverse.org/"
      }
    }
  };

  const defaultResources = {
    youtube: {
      label: "YouTube lecture",
      url: "https://www.khanacademy.org/"
    },
    notes: {
      label: "Concept notes",
      url: "https://ocw.mit.edu/"
    },
    practice: {
      label: "Practice problems",
      url: "https://www.edx.org/"
    }
  };

  const resources = resourceMap[code] || defaultResources;
  
  return [
    {
      label: resources.youtube.label,
      url: resources.youtube.url,
      type: "video"
    },
    {
      label: resources.notes.label,
      url: resources.notes.url,
      type: "notes"
    },
    {
      label: resources.practice.label,
      url: resources.practice.url,
      type: "practice"
    }
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
