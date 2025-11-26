const router = require("express").Router();
const authController = require("../controllers/authController");

// STUDENT AUTH  ->  /api/auth/student/...
router.post("/student/register", authController.registerStudent);
router.post("/student/login", authController.loginStudent);

// TEACHER AUTH  ->  /api/auth/teacher/...
router.post("/teacher/register", authController.registerTeacher);
router.post("/teacher/login", authController.loginTeacher);

module.exports = router;
