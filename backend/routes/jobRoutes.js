const express = require("express");
const router = express.Router();
const { createJob, getRecommendedJobs } = require("../controllers/jobController");
const { applyToJob, getApplicants } = require("../controllers/applicationController");
const { protect, authorize } = require("../middleware/auth");

//other routes
router.get("/recommended", protect, authorize("jobSeeker"), getRecommendedJobs);
router.post("/", protect, authorize("recruiter"), createJob);

// yassin shahin routes 
router.post("/:jobId/apply", protect, authorize("jobSeeker"), applyToJob);
router.get("/:jobId/applicants", protect, authorize("recruiter"), getApplicants);

module.exports = router;