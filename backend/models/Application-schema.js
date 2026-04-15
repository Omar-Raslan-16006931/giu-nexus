const moogoose = require('mongoose');

const applicationSchema = new moogose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "JobPost", 
        required: true,
    },
    coverLetter: {
        type: String,
    },
    status: {
        type: String,
        enum: ["pending", "shortlisted", "rejected"],
        default: "pending",
    },
    appliedAt: {
        type: Date,
        default: Date.now,
    },
});

// prevent duplicate applications 
  applicationSchema.index(
  { user: 1, job: 1 },
  { unique: true }
);


module.exports = mongoose.model("Application", applicationSchema);