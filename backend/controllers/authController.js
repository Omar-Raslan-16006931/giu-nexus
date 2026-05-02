const User = require("../models/User");
const sendEmail = require("../services/emailService");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};


// FORGOT PASSWORD

exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const resetToken = user.getResetPasswordToken();

    
    await user.save({ validateBeforeSave: false });

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


// RESET PASSWORD

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
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

   
    if (!req.body.password || req.body.password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      message: "Password reset successful",
    });

  } catch (err) {
    next(err);
  }
};


// REGISTER

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    
    

    normalizedRole = role.toLowerCase();
    const allowedRoles = ["jobseeker", "recruiter"];
    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    
    let status = "approved";
    if (normalizedRole === "recruiter") {
      status = "pending";
    }

    const user = await User.create({
      name,
      email,
      password,
      role: normalizedRole,
      status,
    });

   
    const token = generateToken(user._id);

    
    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });

  } catch (err) {
    next(err);
  }
};