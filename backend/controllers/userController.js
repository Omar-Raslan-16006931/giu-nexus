const User = require("../models/User");

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