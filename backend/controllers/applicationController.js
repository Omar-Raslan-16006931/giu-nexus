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
// for recruiter to view applicants for a job
exports.getJobApplicants = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;
    const userId = req.user.id;

    
    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can view applicants",
      });
    }

    
    const job = await JobPost.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    
    if (job.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorised to view applicants for this job",
      });
    }

   
    const applications = await Application.find({ job: jobId })
      .populate("user", "name email skills");

    res.status(200).json({
      success: true,
      applications,
    });

  } catch (err) {
    next(err);
  }
};



// get all applications for admin only

exports.getAllApplications = async (req, res, next) => {
  try {
    
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin only",
      });
    }

    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    
    const applications = await Application.find()
      .skip(skip)
      .limit(limit)
      .select("-__v")
      .populate("user", "name email")
      .populate("job", "title company");

    
    const total = await Application.countDocuments();

    res.status(200).json({
      success: true,
      total,
      page,
      applications,
    });

  } catch (err) {
    next(err);
  }
};


// update application status by recruiter

exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const applicationId = req.params.id;
    const { status } = req.body;

    
    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can update applications",
      });
    }

    
    const allowedStatuses = ["pending", "shortlisted", "rejected"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    
    const application = await Application.findById(applicationId).populate("job");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    
    if (application.job.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorised to update this application",
      });
    }

    
    application.status = status;
    await application.save();

    res.status(200).json({
     success: true,
     application: {
     _id: application._id,
     status: application.status,
     },
    });

  } catch (err) {
    next(err);
  }
};

exports.getMyApplications = async (req, res, next) => {
  try {

    if (req.user.role !== "jobseeker") {
      return res.status(403).json({
        success: false,
        message: "Only job seekers can view their applications",
      });
    }

    const applications = await Application.find({
      user: req.user.id,
    })
      .select("_id status appliedAt job")
      .populate(
        "job",
        "_id title company type status"
      )
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      applications,
    });

  } catch (err) {
    next(err);
  }
};