const JobPost = require("../models/jobPost-schema");
const hf = require("../services/hfService");


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

      if (Array.isArray(result) && result.length > 0) {
        category = result[0].label;
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