require("dotenv").config();

const express = require("express");
const cors = require("cors");

const studentRoutes = require("./src/routes/student");
const contributionRoutes = require("./src/routes/contributions");
const authRoutes = require("./src/routes/auth");
const uploadRoutes = require("./src/routes/upload");
const teacherRoutes = require("./src/routes/teacher");

const app = express();

// Performance optimizations
app.use(express.json({ limit: '10mb' }));
app.set('trust proxy', 1);

// Request timeout middleware
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    res.status(408).json({ error: 'Request timeout' });
  });
  next();
});

// --- FIX 1: CORS Configuration ---
// Allow all origins for debugging
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// Performance monitoring
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) { // Log slow requests (>1s)
      console.log(`SLOW: ${req.method} ${req.path} - ${duration}ms`);
    }
  });
  next();
});

// MOUNT ROUTES PROPERLY
app.use("/api/student", studentRoutes);
app.use("/api/contributions", contributionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api", teacherRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Backend running...", timestamp: new Date().toISOString() });
});

app.get("/test", (req, res) => {
  res.json({ message: "Test endpoint working", timestamp: new Date().toISOString() });
});

app.post("/test-post", (req, res) => {
  res.json({ message: "POST test working", body: req.body, timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// --- FIX 2: Port Configuration ---
// Use the port assigned by the hosting service (process.env.PORT) or fallback to 4001 locally.
const PORT = process.env.PORT || 4001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));