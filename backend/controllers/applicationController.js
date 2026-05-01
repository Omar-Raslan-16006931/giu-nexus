const Application = require("../models/Application-schema");
const JobPost = require("../models/JobPost-schema");

// POST /api/v1/jobs/:jobId/apply  — Job Seeker only
exports.applyToJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;

    const job = await JobPost.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const application = await Application.create({
      user: req.user._id,
      job: jobId,
      coverLetter: coverLetter || "",
    });

    return res.status(201).json({
      success: true,
      application: {
        _id: application._id,
        user: application.user,
        job: application.job,
        status: application.status,
        appliedAt: application.appliedAt,
      },
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

// GET /api/v1/jobs/:jobId/applicants  — Recruiter only (must own the job)
exports.getApplicants = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await JobPost.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorised to view applicants for this job",
      });
    }

    const applications = await Application.find({ job: jobId }).populate(
      "user",
      "_id name email skills profilePicture"
    );

    return res.status(200).json({
      success: true,
      applications,
    });
  } catch (err) {
    next(err);
  }
};