const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/projects", require("./routes/projects"));
app.use("/api/sessions", require("./routes/sessions"));
app.use("/api/document-types", require("./routes/documentTypes"));
app.use("/api/inspections", require("./routes/inspections"));
app.use("/api/dashboard", require("./routes/dashboard"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`ToolBox API running on http://localhost:${PORT}`);
});

module.exports = app;
