const express = require("express");
const router = express.Router();

const { createJob } = require("../controllers/jobController");
const { protect, authorize } = require("../middleware/auth");

router.post("/", protect, authorize("recruiter"), createJob);

module.exports = router;