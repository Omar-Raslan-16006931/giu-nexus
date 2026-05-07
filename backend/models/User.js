const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,    
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  profilePicture: {
    type: String,
    default: "https://www.pngall.com/wp-content/uploads/5/Profile-PNG-High-Quality-Image.png",
    },  
  bio: {
    type: String,
    default: "",
  },
  skills: {
    type: [String],
    default: [],
  },
  role: {
    type:String,
    enum: ["jobseeker","recruiter","admin"],
    default: "jobseeker",
    lowercase: true,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  // only applies if role = recruiter

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    lowercase: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// hash the password before saving the user
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

const crypto = require("crypto");

userSchema.methods.getResetPasswordToken = function () {
  // generate raw token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // hash token and store
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // set expiry 10 mins
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  // return raw token
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
