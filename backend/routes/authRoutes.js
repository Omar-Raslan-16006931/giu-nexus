const express = require("express");
const router = express.Router();

const {login,logout, register ,forgotPassword, resetPassword } = require("../controllers/authController");

// forgot password
router.post("/forgot-password", forgotPassword);

// reset password
router.post("/reset-password/:token", resetPassword);

// register
router.post("/register", register);

// login
router.post("/login", login);

// logout

const { protect } = require("../middleware/auth");

router.post("/logout", protect, logout);

module.exports = router;