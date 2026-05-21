const User = require("../models/User");
const mongoose = require("mongoose");
const JobPost = require("../models/jobPost-schema");
const Application = require("../models/Application-schema");


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


exports.getAdminStats = async (req, res, next) => {
  try {

    // USERS BY ROLE
    const users = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    const usersByRole = {
      jobSeeker: 0,
      recruiter: 0,
      admin: 0,
    };

    users.forEach((item) => {

      if (item._id === "jobseeker") {
        usersByRole.jobSeeker = item.count;
      }

      if (item._id === "recruiter") {
        usersByRole.recruiter = item.count;
      }

      if (item._id === "admin") {
        usersByRole.admin = item.count;
      }

    });



    // JOBS BY STATUS
    const jobs = await JobPost.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const jobsByStatus = {};

    jobs.forEach((item) => {
      jobsByStatus[item._id] = item.count;
    });



    // APPLICATIONS BY STATUS
    const applications = await Application.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const appsByStatus = {
      pending: 0,
      shortlisted: 0,
      rejected: 0,
    };

    applications.forEach((item) => {

      if (item._id === "pending") {
        appsByStatus.pending = item.count;
      }

      if (item._id === "shortlisted") {
        appsByStatus.shortlisted = item.count;
      }

      if (item._id === "rejected") {
        appsByStatus.rejected = item.count;
      }

    });



    // TOP JOBS
    const topJobsRaw = await Application.aggregate([

      {
        $group: {
          _id: "$job",
          applicationCount: { $sum: 1 },
        },
      },

      {
        $sort: {
          applicationCount: -1,
        },
      },

      {
        $limit: 3,
      },

      {
        $lookup: {
          from: "jobposts",
          localField: "_id",
          foreignField: "_id",
          as: "job",
        },
      },

      {
        $unwind: "$job",
      },

      {
        $project: {
          _id: "$job._id",
          title: "$job.title",
          company: "$job.company",
          applicationCount: 1,
        },
      },

    ]);
    
  const applicationsPerWeek = await Application.aggregate([
  {
    $group: {

      _id: {
        year: { $year: "$appliedAt" },
        week: { $week: "$appliedAt" },
      },

      count: {
        $sum: 1,
      },

      firstDate: {
        $min: "$appliedAt",
      },

      lastDate: {
        $max: "$appliedAt",
      },

    },
  },
  {
    $sort: {
      firstDate: 1,
    },
  },
  {
    $limit: 4,
  },
  {
    $project: {
      _id: 0,
      "date range": {
        $concat: [
          {
            $dateToString: {
              format: "%d/%m",
              date: "$firstDate",
            },
          },
          " - ",
          {
            $dateToString: {
              format: "%d/%m",
              date: "$lastDate",
            },
          },

        ],
      },
      count: 1,
     },
    },
   ]);

    res.status(200).json({
      success: true,

      stats: {
        usersByRole,
        jobsByStatus,
        appsByStatus,
        topJobs: topJobsRaw,
        applicationsPerWeek,
      },

    });

  } catch (err) {
    next(err);
  }
};


exports.getUsers = async (req, res, next) => {
  try {
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    
    const filter = {};

    if (req.query.role) {
      filter.role = req.query.role;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    
    const users = await User.find(filter)
      .select("_id name email role status createdAt") // important: only needed fields
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    
    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      page,
      users,
    });

  } catch (err) {
    next(err);
  }
};
