import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      unique: true, // Ensuring no duplicate company names
    },
    companyLogo: {
      type: String, // URL to the logo image
      default: "",
    },
    companyWebsite: {
      type: String, // Company website URL without validation condition
    },
    companyDescription: {
      type: String, // Short description about the company
    },
    companyIndustry: {
      type: String, // Type of industry (e.g., IT, Finance, Healthcare)
    },
    companySize: {
      type: String, // e.g., "1-10", "11-50", etc.
    },
    location: {
      type: String, // Physical address or location
    },
    contactEmail: {
      type: String,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid contact email address"],
    },
    contactPhone: {
      type: String, // Contact phone number for the company
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v); // 10-digit phone number validation
        },
        message: "Please provide a valid phone number",
      },
    },
    jobsPosted: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job", // Reference to the Job model to track jobs posted by the company
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Reference to the Recruiter who created the company details
    },
    status: {
      type: String,
      enum: ["active", "disabled"],
      default: "active", // Default status for a new company
    },
  },
  { timestamps: true }
);

const Company = mongoose.model("Company", companySchema);
export default Company;
