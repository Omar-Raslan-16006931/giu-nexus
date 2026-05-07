const express = require("express");
const router = express.Router();
const { changePassword } = require("../controllers/profileController");
const { extractSkills } = require("../controllers/profileController");
const { protect } = require("../middleware/auth");
const { getProfile } = require("../controllers/profileController");
const { updateProfile } = require("../controllers/profileController");


router.get("/", protect, getProfile);
router.patch("/", protect, updateProfile);
router.patch("/change-password", protect, changePassword);
router.post("/extract-skills", protect, extractSkills);

module.exports = router;