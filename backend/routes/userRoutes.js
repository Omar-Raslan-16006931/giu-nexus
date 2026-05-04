const express = require("express");
const router = express.Router();
const { updateUserStatus } = require("../controllers/userController");
const { getUserById } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");

router.patch("/:id/status", protect, authorize("admin"), updateUserStatus);
router.get("/:id", protect, authorize("admin"), getUserById);

module.exports = router;