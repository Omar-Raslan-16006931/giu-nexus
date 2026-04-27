const User = require("../models/User");
const sendEmail = require("../services/emailService");
const crypto = require("crypto");


exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

   
    const resetToken = user.getResetPasswordToken();

    await user.save();

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    const message = `You requested a password reset.\n\nUse this link:\n${resetUrl}\n\nThis link expires in 10 minutes.`;

    await sendEmail({
      to: user.email,
      subject: "Password Reset",
      text: message,
    });

    res.status(200).json({
      success: true,
      message: "Email sent",
    });

  } catch (err) {
    next(err);
  }
};



exports.resetPassword = async (req, res, next) => {
  try {
    
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      const error = new Error("Invalid or expired token");
      error.statusCode = 400;
      return next(error);
    }

    
    user.password = req.body.password;

  
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });

  } catch (err) {
    next(err);
  }
};