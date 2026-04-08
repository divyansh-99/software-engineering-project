const express = require("express");
const cors = require("cors");

const studentRoutes = require("./routes/studentRoutes");
const companyRoutes = require("./routes/companyRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/students", studentRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Placement Management System Backend Running");
});

module.exports = app;
