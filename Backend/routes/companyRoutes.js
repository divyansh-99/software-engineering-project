const express = require("express");
const router = express.Router();

const {
  registerCompany,
  loginCompany,
  postJob,
  getCompanyJobs,
  getCompanyApplications,
  updateCompanyApplicationStatus
} = require("../controllers/companyController");

router.post("/register", registerCompany);
router.post("/login", loginCompany);
router.post("/post-job", postJob);
router.get("/jobs/:company_id", getCompanyJobs);
router.get("/applications/:company_id", getCompanyApplications);
router.put("/applications/status", updateCompanyApplicationStatus);

module.exports = router;
