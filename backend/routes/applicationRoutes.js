const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const { applyToJob } = require("../controllers/applicationController");

router.post("/jobs/:jobId/apply", protect, applyToJob);

module.exports = router;