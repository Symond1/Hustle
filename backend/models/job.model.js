import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  jobType: {
    type: String,
    required: true,
    enum: ["Full-time", "Part-time", "Contract", "Internship"], // Predefined job types
  },
  location: {
    type: String,
    required: true,
  },
  position: {
    type: Number,
    required: true
  },
  companyName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  responsibilities: {
    type: String,
    required: true,
  },
  qualifications: {
    type: String,
    required: true,
  },
  salary: {
    type: Number, // Salary as a number
    required: true,
  },
  jobNiche: {
    type: String,
    required: true,
  },
  jobPostedOn: {
    type: Date,
    default: Date.now,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  jobSeekerApplied: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
    },
  ],
  applications: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application", // Reference to the Application model
    },
  ],
  applicationStatus: {
    type: String,
    enum: ["Applied", "In Progress", "Rejected"],
    default: "Applied",
  },
  status: {
    type: String,
    enum: ["Open", "Closed", "In Progress", "Disabled"],
    default: "Open",
  },
  industry: {
    type: String, // Added industry field
  },
}, { timestamps: true });

const Job = mongoose.model("Job", jobSchema);
export default Job;
