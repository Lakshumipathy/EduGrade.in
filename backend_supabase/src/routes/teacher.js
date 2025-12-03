const router = require("express").Router();
const teacherController = require("../controllers/teacherController");

// Get all achievements
router.get("/teacher/achievements", teacherController.getAllAchievements);

// Get all research & internship submissions
router.get(
  "/teacher/research-internship",
  teacherController.getAllResearchInternship
);

// Dataset management routes
router.get("/datasets", teacherController.getDatasets);
router.delete("/datasets/:semester", teacherController.deleteDataset);

module.exports = router;
