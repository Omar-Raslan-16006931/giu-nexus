const mongoose = require("mongoose");
const jobPostSchema = new mongoose.Schema({
   
    

    title: {
        type: String,
        required: true,
    },
    company: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    requirements: {
        type: [String],
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["full-time", "part-time", "internship"],
        required: true,
        lowercase: true,
    },

    salary: {
        type: Number,
    },

    category: {
        type: String,
    },

    totalSlots: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["open", "closed"],
        default: "open",
        lowercase: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
},{
  timestamps: true,
  versionKey: false
});
module.exports = mongoose.model("JobPost", jobPostSchema);