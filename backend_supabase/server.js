require("dotenv").config();

const express = require("express");
const cors = require("cors");

const studentRoutes = require("./src/routes/student");
const contributionRoutes = require("./src/routes/contributions");
const authRoutes = require("./src/routes/auth");
const uploadRoutes = require("./src/routes/upload");
const teacherRoutes = require("./src/routes/teacher");

const app = express();

// --- FIX 1: CORS Configuration ---
// Allow requests from your local development environment and your Vercel production domain
app.use(cors({
  origin: [
    "http://localhost:5173", // Your local frontend dev port
    "https://edu-grade-in.vercel.app" // YOUR LIVE VERCEL URL
  ],
  credentials: true
}));

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

// --- FIX 2: Port Configuration ---
// Use the port assigned by the hosting service (process.env.PORT) or fallback to 4000 locally.
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));