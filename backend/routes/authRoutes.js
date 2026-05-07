const express = require("express");
const router = express.Router();

const { register, login,logout,forgotPassword,resetPassword,verifyOtp} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", protect, logout);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/verify-otp", authLimiter, verifyOtp);
router.post("/reset-password/:token", authLimiter, resetPassword);


module.exports = router;