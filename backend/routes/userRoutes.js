const express = require("express");
const router = express.Router();

const { getUserById } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");


router.get("/:id", protect, authorize("admin"), getUserById);

module.exports = router;