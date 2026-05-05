const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const { applyToJob ,getJobApplicants,getAllApplications} = require("../controllers/applicationController");

router.post("/jobs/:jobId/apply", protect, applyToJob);
router.get("/jobs/:jobId/applicants",protect,getJobApplicants);
router.get("/applications", protect, getAllApplications);


module.exports = router;