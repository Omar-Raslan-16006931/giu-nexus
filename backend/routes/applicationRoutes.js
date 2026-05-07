const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const { getMyApplications,updateApplicationStatus,applyToJob ,getJobApplicants,getAllApplications} = require("../controllers/applicationController");

router.get("/my",protect,getMyApplications);
router.get("/", protect, getAllApplications);
router.patch("/:id/status",protect,updateApplicationStatus);
router.post("/jobs/:jobId/apply", protect,applyToJob);
router.get("/jobs/:jobId/applicants",protect,getJobApplicants);


module.exports = router;