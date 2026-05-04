const express = require("express");
const router = express.Router();

const {updateJob, createJob,getJobs , getJobById} = require("../controllers/jobController");
const { protect, authorize } = require("../middleware/auth");
const { getRecommendedJobs } = require("../controllers/jobController");
router.get("/:id", getJobById);
router.get("/", getJobs);
router.get("/recommended", protect, getRecommendedJobs);
router.post("/", protect, authorize("recruiter"), createJob);
router.patch("/:id", protect, authorize("recruiter"), updateJob);
module.exports = router;