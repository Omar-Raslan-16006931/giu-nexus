const express = require("express");
const router = express.Router();
const { updateUserStatus } = require("../controllers/userController");
const { getUserById } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");
const { deleteUser } = require("../controllers/userController");


router.patch("/:id/status", protect, authorize("admin"), updateUserStatus);
router.get("/:id", protect, authorize("admin"), getUserById);
router.delete("/:id", protect, authorize("admin"), deleteUser);

module.exports = router;