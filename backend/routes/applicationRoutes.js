const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const { updateApplicationStatus,applyToJob ,getJobApplicants,getAllApplications} = require("../controllers/applicationController");

router.get("/applications", protect, getAllApplications);
router.patch("/applications/:id/status",protect,updateApplicationStatus);
router.post("/jobs/:jobId/apply", protect,applyToJob);
router.get("/jobs/:jobId/applicants",protect,getJobApplicants);

module.exports = router;