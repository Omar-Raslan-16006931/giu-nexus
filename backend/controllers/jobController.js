const User = require("../models/User");

exports.getSavedJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("savedJobs");

    res.status(200).json({
      success: true,
      jobs: user.savedJobs
    });

  } catch (error) {
    next(error);
  }
};
