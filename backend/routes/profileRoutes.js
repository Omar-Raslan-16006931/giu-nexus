const express = require("express");
const router = express.Router();

const { extractSkills } = require("../controllers/profileController");
const { protect } = require("../middleware/auth");

router.post("/extract-skills", protect, extractSkills);

module.exports = router;