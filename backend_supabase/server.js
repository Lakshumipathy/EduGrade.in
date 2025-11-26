require("dotenv").config();

const express = require("express");
const cors = require("cors");

const studentRoutes = require("./src/routes/student");
const contributionRoutes = require("./src/routes/contributions");
const authRoutes = require("./src/routes/auth");
const uploadRoutes = require("./src/routes/upload");
const teacherRoutes = require("./src/routes/teacher");

const app = express();

app.use(cors());
app.use(express.json());

// MOUNT ROUTES PROPERLY
app.use("/api/student", studentRoutes);
app.use("/api/contributions", contributionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api", teacherRoutes);

app.get("/", (req, res) => {
  res.send("Backend running...");
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
