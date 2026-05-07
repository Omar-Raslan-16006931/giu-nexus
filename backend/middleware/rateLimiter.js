const rateLimit = require("express-rate-limit");

exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins

  max: 10,

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },

  standardHeaders: true,
  legacyHeaders: false,

  statusCode: 429,
});