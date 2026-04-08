const express = require("express");
const router = express.Router();

const {
  registerAdmin,
  loginAdmin,
  getAllStudents,
  getAllJobs,
  getAllApplications,
  updateApplicationStatus,
  getPlacementStats
} = require("../controllers/adminController");

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/students", getAllStudents);
router.get("/jobs", getAllJobs);
router.get("/applications", getAllApplications);

router.put("/update-status", updateApplicationStatus);
router.get("/stats", getPlacementStats);
router.get("/jobs", getAllJobs);

module.exports = router;
