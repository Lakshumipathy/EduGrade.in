const router = require("express").Router();
const { getPerformance } = require("../controllers/studentController");

router.post("/performance", getPerformance);

module.exports = router;
