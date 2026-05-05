const Application = require("../models/Application-schema");
const JobPost = require("../models/jobPost-schema");

exports.applyToJob = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const jobId = req.params.jobId;
    
    if (req.user.role !== "jobseeker") {
      return res.status(403).json({
        success: false,
        message: "Only job seekers can apply",
      });
    }

    const job = await JobPost.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const existing = await Application.findOne({
      user: userId,
      job: jobId,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You have already applied to this job",
      });
    }

    
    const application = await Application.create({
      user: userId,
      job: jobId,
      coverLetter: req.body.coverLetter || "",
    });

    res.status(201).json({
      success: true,
      application,
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already applied to this job",
      });
    }

    next(err);
  }
};
