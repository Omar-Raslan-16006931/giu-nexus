const User = require("../models/User");
const sendEmail = require("../services/emailService");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role   
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};


// FORGOT PASSWORD

exports.forgotPassword = async (req, res, next) => {
  try {

    const user = await User.findOne({
      email: req.body.email,
    });

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "OTP has been sent",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    
    user.otpCode = otp;
    user.otpExpire = Date.now() + 5 * 60 * 1000;
    user.otpVerified = false;

    const resetToken = user.getResetPasswordToken();
    
    user.tempResetToken = resetToken;
    user.tempResetTokenExpire = Date.now() + 5 * 60 * 1000;
    
    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

    await user.save({
      validateBeforeSave: false,
    });

    const message = `
Your OTP code is: ${otp}

After verifying OTP, use this token:

${resetToken}

Reset password here:

${resetUrl}

This OTP and link expire in 5 minutes.
`;

    sendEmail({
      to: user.email,
      subject: "Password Reset OTP",
      text: message,
    }).catch((error) => {
      console.error("Failed to send password reset email:", error);
    });

    
    return res.status(200).json({
      success: true,
      message:
        "OTP has been sent",
    });

  } catch (err) {
    next(err);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {

    const email = req.body.email?.trim().toLowerCase();

    const otpCode = String(
      req.body.otpCode
    ).trim();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (
      user.otpCode !== otpCode ||
      user.otpExpire < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    user.otpVerified = true;

    await user.save({
      validateBeforeSave: false,
    });
    const resetToken = user.tempResetToken;

    res.status(200).json({
      success: true,
      message: "OTP verified",
      resetToken,
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

    
    if (!user.otpVerified) {
      return res.status(403).json({
        success: false,
        message: "OTP verification required",
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

    
    user.otpCode = undefined;
    user.otpExpire = undefined;
    user.otpVerified = false;
    
    
    user.tempResetToken = undefined;
    user.tempResetTokenExpire = undefined;

    await user.save();

    
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      token,
      user,
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

   
    const token = generateToken(user);

    
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

// LOGIN 

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        profilePicture: user.profilePicture,
        skills: user.skills,
      },
    });

  } catch (err) {
    next(err);
  }
};

//LOGOUT
const { addToBlacklist } = require("../utils/tokenBlacklist");

exports.logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      addToBlacklist(token);
    }

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    next(err);
  }
};