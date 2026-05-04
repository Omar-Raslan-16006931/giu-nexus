const User = require("../models/User");
const mongoose = require("mongoose");


exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select("_id name email role status");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });

  } catch (err) {
    next(err);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const allowed = ["approved", "rejected", "pending"];
    if (!allowed.includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (user.role !== "recruiter") {
     return res.status(400).json({
     success: false,
     message: "Only recruiters have status",
    });
    }
    
    user.status = status;
    await user.save();

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        status: user.status,
      },
    });

  } catch (err) {
    next(err);
  }
};


exports.deleteUser = async (req, res, next) => {
  try {
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    
    await user.deleteOne();

    // 4. response
    res.status(200).json({
      success: true,
      message: "User deleted",
    });

  } catch (err) {
    next(err);
  }
};