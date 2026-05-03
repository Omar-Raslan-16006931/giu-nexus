const User = require("../models/User");
const hf = require("../services/hfService");

exports.extractSkills = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    //  handle empty bio
    if (!user.bio || user.bio.trim() === "") {
      return res.status(200).json({
        success: true,
        skills: user.skills || [],
        message: "No bio provided",
      });
    }

    let cleanSkills = user.skills || [];

    try {
      const result = await hf.tokenClassification({
        model: "dslim/bert-base-NER",
        inputs: user.bio,
      });

      // 
      const rawSkills = result
        .filter(item =>
          item.entity_group === "ORG" ||
          item.entity_group === "MISC"
        )
        .map(item => item.word);

      // 
      let merged = [];
      let current = "";

      for (let word of rawSkills) {
        if (word.startsWith("##")) {
          current += word.replace("##", "");
        } else {
          if (current) merged.push(current);
          current = word;
        }
      }
      if (current) merged.push(current);

      const noiseWords = ["face"]; 

      cleanSkills = [...new Set(
        merged
          .map(s => s.replace(/[^\w\s]/g, "").trim())
          .filter(s =>
            s.length > 2 &&                         
            !noiseWords.includes(s.toLowerCase())   
          )
      )];

      
      user.skills = cleanSkills;
      await user.save();

    } catch (err) {
      console.error("HF skill extraction failed:", err.message);
    
    }

    res.status(200).json({
      success: true,
      skills: cleanSkills,
    });

  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
   
    
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        skills: user.skills,
        profilePicture: user.profilePicture,
        role: user.role,
        status: user.status,
     },
   });

  } catch (err) {
    next(err);
  }
};