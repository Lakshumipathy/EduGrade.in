const router = require("express").Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const { uploadDataset } = require("../controllers/uploadController");

router.post("/", upload.single("file"), uploadDataset);

module.exports = router;
