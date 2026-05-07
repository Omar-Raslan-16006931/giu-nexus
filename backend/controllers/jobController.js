const JobPost = require("../models/jobPost-schema");
const hf = require("../services/hfService");
const User = require("../models/User");
const mongoose = require("mongoose");

exports.createJob = async (req, res, next) => {
  try {
   
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "recruiter") {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can create jobs",
      });
    }

    if (user.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Your account is pending approval . Wait for admin approval before posting jobs.",
      });
    }

    const {
      title,
      company,
      description,
      requirements,
      location,
      type,
      salary,
      totalSlots,
    } = req.body;

    
    if (
      !title ||
      !company ||
      !description ||
      !requirements ||
      !location ||
      !type
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    
    let category = "Other";

    try {
      const result = await hf.zeroShotClassification({
        model: "facebook/bart-large-mnli",
        inputs: description,
        parameters: {
          candidate_labels: [
            "Frontend",
            "Backend",
            "AI/ML",
            "DevOps",
            "Data Engineering",
            "Other",
          ],
        },
      });

      

      
      if (Array.isArray(result) && result.length > 0) {
        category = result[0].label || "Other";
      }

    } catch (err) {
      console.log("AI classification failed:", err.message);
      
    }

    
    const job = await JobPost.create({
      title,
      company,
      description,
      requirements,
      location,
      type,
      salary,
      totalSlots: totalSlots || 1,
      category,
      status: "open",
      createdBy: user._id,
    });

   
    res.status(201).json({
      success: true,
      job,
    });

  } catch (err) {
    next(err);
  }
};

exports.getRecommendedJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    const jobs = await JobPost.find({ status: "open" });

    
    const studentText = user.skills?.length
      ? user.skills.join(", ")
      : "general";

    const jobTexts = jobs.map(job =>
      `${job.title} ${job.requirements.join(", ")}`
    );

    let embeddings;

    try {
      embeddings = await hf.featureExtraction({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        inputs: [studentText, ...jobTexts],
      });
    } catch (err) {
      console.error("HF embeddings failed:", err.message);

     
      return res.status(200).json({
        success: true,
        jobs,
        message: "HF failed, returning all jobs",
      });
    }

    
    function cosineSimilarity(vecA, vecB) {
      const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
      const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
      const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
      return dot / (magA * magB);
    }

    const studentVec = embeddings[0];

    const scoredJobs = jobs.map((job, index) => {
      const jobVec = embeddings[index + 1];
      const score = cosineSimilarity(studentVec, jobVec);

      return {
        job,
        score,
      };
    });

    
    scoredJobs.sort((a, b) => b.score - a.score);

    res.status(200).json({
      success: true,
      jobs: scoredJobs.map(item => item.job),
    });

  } catch (err) {
    next(err);
  }
};



exports.getJobs = async (req, res, next) => {
  try {
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // build filter
    const filter = {};

    
    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.type) {
      filter.type = req.query.type;
    }

    if (req.query.location) {
      filter.location = req.query.location;
    }

    
    if (req.query.keyword) {
      filter.$or = [
        { title: { $regex: req.query.keyword, $options: "i" } },
        { description: { $regex: req.query.keyword, $options: "i" } },
      ];
    }

    
    const jobs = await JobPost.find(filter)
      .sort({ createdAt: -1 }) 
      .skip(skip)
      .limit(limit);

    
    const total = await JobPost.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      page,
      jobs,
    });

  } catch (err) {
    next(err);
  }
};

exports.getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;

    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    
    const job = await JobPost.findById(id)
      .populate("createdBy", "-_id name email");
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }
    const jobResponse = {
     _id: job._id,
     title: job.title,
     description: job.description,
     requirements: job.requirements,
     category: job.category,
     status: job.status,
     createdBy: job.createdBy,
    };


    
    res.status(200).json({
      success: true,
      job: jobResponse,
    });

  } catch (err) {
    next(err);
  }
};


exports.updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    
    const job = await JobPost.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    
    if (job.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorised to edit this job",
      });
    }

    
    const allowedFields = [
      "title",
      "company",
      "description",
      "requirements",
      "location",
      "type",
      "salary",
      "totalSlots",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        job[field] = req.body[field];
      }
    });

    
    if (req.body.description) {
      let category = "Other";

      try {
        const result = await hf.zeroShotClassification({
          model: "facebook/bart-large-mnli",
          inputs: req.body.description,
          parameters: {
            candidate_labels: [
              "Frontend",
              "Backend",
              "AI/ML",
              "DevOps",
              "Data Engineering",
              "Other",
            ],
          },
        });

        if (Array.isArray(result) && result.length > 0) {
          const top = result[0];

          if (top.score >= 0.4 && top.label !== "Other") {
            category = top.label;
          }
        }

      } catch (err) {
        console.log("AI classification failed:", err.message);
      }

      job.category = category;
    }

   
    await job.save();

   
    const jobResponse = {
      _id: job._id,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      category: job.category,
      status: job.status,
    };

    res.status(200).json({
      success: true,
      job: jobResponse,
    });

  } catch (err) {
    next(err);
  }
};

exports.deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;

   
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    
    const job = await JobPost.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    
    const isAdmin = req.user.role === "admin";
    const isOwner = job.createdBy.toString() === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "Not authorised to delete this job",
      });
    }

    
    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: "Job deleted",
    });

  } catch (err) {
    next(err);
  }
};

exports.toggleSaveJob = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const jobId = req.params.id;

    
    if (req.user.role !== "jobseeker") {
      return res.status(403).json({
        success: false,
        message: "Only job seekers can save jobs",
      });
    }

    
    const job = await JobPost.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    
    if (job.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "Cannot save a closed job",
      });
    }

    
    const user = await User.findById(userId);

    
    const alreadySaved = user.savedJobs.some(
      (id) => id.toString() === jobId
   );

    
    if (alreadySaved) {
      user.savedJobs = user.savedJobs.filter(
        (id) => id.toString() !== jobId
      );

      await user.save();

      return res.status(200).json({
        success: true,
        message: "Job removed from saved",
        saved: false,
      });
    }

    
    user.savedJobs.push(jobId);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Job saved",
      saved: true,
    });

  } catch (err) {
    next(err);
  }
};
