const User = require("../models/User");
const hf = require("../services/hfService");
const bcrypt = require("bcrypt");


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


exports.updateProfile = async (req, res, next) => {
  try {
    const { name, bio } = req.body || {};

    if (
      Object.keys(req.body || {}).length === 0 &&
      !req.file
    ) {
      return res.status(400).json({
        success: false,
        message: "No fields provided to update",
      });
    }

    const updates = {};

    if (name !== undefined) updates.name = name;
    if (bio !== undefined) updates.bio = bio;

   
    if (req.file) {
      updates.profilePicture =
        `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      {
        returnDocument: "after",
        runValidators: true,
      }
    ).select("-password -__v");

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


exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both currentPassword and newPassword are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    
    user.password = newPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });

  } catch (err) {
    next(err);
  }
};