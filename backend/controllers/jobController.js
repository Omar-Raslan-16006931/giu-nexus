const JobPost = require("../models/jobPost-schema");
const hf = require("../services/hfService");
const User = require("../models/User");

exports.createJob = async (req, res, next) => {
  try {
    const {
      title,
      description,
      requirements,
      company,
      location,
      type,
      totalSlots,
    } = req.body;

    if (!title || !description || !company || !location || !type || !totalSlots) {
      const error = new Error("Missing required fields");
      error.statusCode = 400;
      return next(error);
    }

    let category = "Other";

    try {
      const result = await hf.zeroShotClassification({
        model: "facebook/bart-large-mnli",
        inputs: description,
        parameters: {
          candidate_labels: [
            "Frontend Development",
            "Backend Development",
            "Artificial Intelligence",
            "DevOps Engineering",
            "Data Engineering",
            "Other",
          ],
        },
      });

     
      if (Array.isArray(result) && result.length > 0 && result[0].label) {
        category = result[0].label;
      } else if (result.labels && result.labels.length > 0) {
        category = result.labels[0];
      }

    } catch (err) {
      console.error("HF classification failed:", err.message);
    }

    const job = await JobPost.create({
      title,
      description,
      requirements: requirements || [],
      company,
      location,
      type: type.toLowerCase(),
      totalSlots,
      createdBy: req.user.id,
      category,
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