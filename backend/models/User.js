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

  savedJobs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobPost",
    },
  ],
  otpCode: String,
  otpExpire: Date,
  otpVerified: {
  type: Boolean,
  default: false,
  },


  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  tempResetToken: String,
  tempResetTokenExpire: Date,
  
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
}, {
  timestamps: true,
  versionKey: false
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
  
  const resetToken = crypto.randomBytes(20).toString("hex");

  
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

 
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  
  return resetToken;
};

userSchema.methods.toJSON = function () {

  const userObject = this.toObject();

  delete userObject.password;
  delete userObject.__v;

  delete userObject.otpCode;
  delete userObject.otpExpire;
  delete userObject.otpVerified;

  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpire;

  return userObject;
};

module.exports = mongoose.model("User", userSchema);
