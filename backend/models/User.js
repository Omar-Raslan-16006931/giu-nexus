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
    enum: ["jobSeeker","recruiter","admin"],
    default: "jobSeeker",
  },

  // only applies if role = recruiter
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// hash the password before saving the user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

   this.password = await bcrypt.hash(this.password, 10);
    next();
});


module.exports = mongoose.model("User", userSchema);
