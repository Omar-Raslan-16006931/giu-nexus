const express = require("express");
const router = express.Router();

const {updateJob,deleteJob, createJob,getJobs,getJobById,getRecommendedJobs,toggleSaveJob,getSavedJobs,getMyJobs} = require("../controllers/jobController");
const { protect, authorize } = require("../middleware/auth");


router.get("/", getJobs);
router.get("/recommended", protect, getRecommendedJobs);
router.get("/saved", protect, getSavedJobs);
router.get("/my-jobs", protect, authorize("recruiter"), getMyJobs);
router.post("/", protect, authorize("recruiter"), createJob);
router.get("/:id", getJobById);
router.patch("/:id", protect, authorize("recruiter"), updateJob);
router.delete("/:id", protect, authorize("recruiter", "admin"), deleteJob);
router.post("/:id/save", protect, toggleSaveJob);

module.exports = router;