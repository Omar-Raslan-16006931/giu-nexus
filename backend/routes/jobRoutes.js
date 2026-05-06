const express = require("express");
const router = express.Router();

const { getSavedJobs } = require("../controllers/jobController");

// temporarily without middleware if not ready yet
router.get("/saved", getSavedJobs);

module.exports = router;
