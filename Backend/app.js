require("dotenv").config();
const express = require("express");
const cors = require("cors");

const studentRoutes = require("./routes/studentRoutes");
const companyRoutes = require("./routes/companyRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser clients (no Origin header) and same-origin requests.
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  }
};

if (allowedOrigins.length === 0) {
  console.warn(
    "CORS_ORIGIN is not set. All origins are currently allowed. Set CORS_ORIGIN to a comma-separated allowlist in production."
  );
}

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/students", studentRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Placement Management System Backend Running");
});

module.exports = app;
