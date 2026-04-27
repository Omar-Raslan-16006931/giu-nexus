const express = require("express");
const router = express.Router();

const { forgotPassword, resetPassword } = require("../controllers/authController");

// forgot password
router.post("/forgot-password", forgotPassword);

// reset password
router.post("/reset-password/:token", resetPassword);

module.exports = router;