const express = require("express");
const router = express.Router();

const { extractSkills } = require("../controllers/profileController");
const { protect } = require("../middleware/auth");
const { getProfile } = require("../controllers/profileController");
const { updateProfile } = require("../controllers/profileController");



router.patch("/", protect, updateProfile);
router.get("/", protect, getProfile);
router.post("/extract-skills", protect, extractSkills);

module.exports = router;