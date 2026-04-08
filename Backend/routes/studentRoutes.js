const express = require("express");
const router = express.Router();

const {
registerStudent,
loginStudent,
applyJob,
getEligibleJobs,
getAppliedJobs
} = require("../controllers/studentController");

router.post("/register", registerStudent);
router.post("/login", loginStudent);
router.post("/apply-job", applyJob);

router.get("/eligible-jobs/:student_id", getEligibleJobs);
router.get("/applied-jobs/:student_id", getAppliedJobs);

module.exports = router;