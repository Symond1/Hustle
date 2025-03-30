import Application from "../models/application.model.js";
import Job from "../models/job.model.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Middleware to authenticate the user (example: JWT Authentication)
export const authenticate = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      ignoreExpiration: false,
    });
    req.user = decoded;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const applyJob = async (req, res) => {
  try {
    // Step 1: Verify that the user is logged in and has a role
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        message: "Please log in to apply for a job.",
        success: false,
      });
    }

    // Step 2: Ensure the user has the 'jobSeeker' role
    if (req.user.role.toLowerCase() !== "jobseeker") {
      return res.status(403).json({
        message:
          "Only job seekers can apply for jobs. Please log in as a job seeker.",
        success: false,
      });
    }

    const userId = req.user._id;
    const jobId = req.params.id;

    console.log("Job ID:", jobId);
    console.log("User ID:", userId);

    if (!jobId) {
      return res.status(400).json({
        message: "Job ID is required.",
        success: false,
      });
    }

    // Validate the job ID format
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        message: "Invalid job ID format.",
        success: false,
      });
    }

    // Check if the user has already applied for the job
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: userId,
    });
    if (existingApplication) {
      return res.status(400).json({
        message: "You have already applied for this job.",
        success: false,
      });
    }

    // Verify the job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        message: "Job not found.",
        success: false,
      });
    }

    // Fetch the latest job seeker profile
    const jobSeeker = await User.findById(userId);
    if (!jobSeeker) {
      return res.status(404).json({
        message: "Job seeker profile not found.",
        success: false,
      });
    }

    console.log(
      "Job Seeker Profile:",
      JSON.stringify(jobSeeker.profile, null, 2)
    );

    // Instead of treating education as a simple string, extract qualification
    // from the first education entry’s degree if available.
    const qualification =
      jobSeeker.profile.education &&
      Array.isArray(jobSeeker.profile.education) &&
      jobSeeker.profile.education.length > 0 &&
      jobSeeker.profile.education[0].degree &&
      jobSeeker.profile.education[0].degree.trim() !== ""
        ? jobSeeker.profile.education[0].degree
        : "fresher";

    const experienceStatus =
      jobSeeker.profile.experience &&
      Array.isArray(jobSeeker.profile.experience) &&
      jobSeeker.profile.experience.length > 0
        ? "experienced"
        : "fresher";

    // Create a new application for the job.
    const newApplication = await Application.create({
      job: jobId,
      applicant: userId,
      status: "pending", // Default status is 'pending'
      experienceStatus, // Based on work experience
      qualification, // Qualification extracted from education or "fresher" if not provided
    });

    // Link the new application to the job document.
    job.applications.push(newApplication._id);
    await job.save();

    return res.status(201).json({
      message: "Job applied successfully.",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error.",
      success: false,
    });
  }
};



// ... (rest of your code remains unchanged)





// Get all the jobs that a user has applied to
export const getAppliedJobs = async (req, res) => {
    try {
        const userId = req.user._id; // Get the user ID from the authenticated user

        // Find all applications made by the user
        const applications = await Application.find({ applicant: userId })
            .sort({ createdAt: -1 })
            .populate({
                path: "job",
                options: { sort: { createdAt: -1 } },
                populate: {
                    path: "company",
                    options: { sort: { createdAt: -1 } },
                },
            });

        if (!applications.length) {
            return res.status(404).json({
                message: "No applications found.",
                success: false,
            });
        }

        // Include the status of each application and other related fields
        const applicationsWithStatus = applications.map(application => ({
            job: application.job,
            status: application.status, // Application status (e.g., pending, accepted)
            applicantResume: application.applicantResume, // Resume info (if stored)
            createdAt: application.createdAt,
            experienceStatus: application.experienceStatus, // "experienced" or "fresher"
        }));

        return res.status(200).json({
            applications: applicationsWithStatus,
            success: true,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error. Please try again.",
            success: false,
        });
    }
};

// Get all applicants for a specific job
export const getApplicants = async (req, res) => {
    try {
        const jobId = req.params.id;

        // Find the job and populate applicants
        const job = await Job.findById(jobId).populate({
            path: "applications",  // Assuming "applications" is the correct field name
            options: { sort: { createdAt: -1 } },
            populate: {
                path: "applicant",  // Populate applicant details
            },
        });

        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false,
            });
        }

        return res.status(200).json({
            applicants: job.applications,
            success: true,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error. Please try again.",
            success: false,
        });
    }
};

// Recruiter: Update the Application Status
export const updateStatus = async (req, res) => {
    try {
        const { status } = req.body; // Status to be updated (e.g., pending, accepted, rejected)
        const applicationId = req.params.id; // Application ID from URL params

        // Only allow Recruiters and Admins to update the status
        if (!req.user || (req.user.role !== "admin" && req.user.role !== "recruiter")) {
            return res.status(403).json({
                message: "Access denied. Only recruiters and admins can update application status.",
                success: false,
            });
        }

        if (!status) {
            return res.status(400).json({
                message: "Status is required.",
                success: false,
            });
        }

        const validStatuses = ["pending", "accepted", "rejected"];
        if (typeof status !== 'string' || !validStatuses.includes(status.toLowerCase())) {
            return res.status(400).json({
                message: "Invalid status value.",
                success: false,
            });
        }

        // Find the application by application ID
        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({
                message: "Application not found.",
                success: false,
            });
        }

        // Update the application status
        application.status = status.toLowerCase(); // Status will be "pending", "accepted", or "rejected"
        await application.save();

        return res.status(200).json({
            message: "Status updated successfully.",
            success: true,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error. Please try again.",
            success: false,
        });
    }
};
