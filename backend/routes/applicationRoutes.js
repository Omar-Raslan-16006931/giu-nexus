const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const { applyToJob ,getJobApplicants} = require("../controllers/applicationController");

router.post("/jobs/:jobId/apply", protect, applyToJob);
router.get("/jobs/:jobId/applicants",protect,getJobApplicants);



module.exports = router;