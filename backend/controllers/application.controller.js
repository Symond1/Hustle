import Application from "../models/application.model.js";
import Job from "../models/job.model.js";
import jwt from 'jsonwebtoken';  // Added missing import
import mongoose from "mongoose"; // Added mongoose for ObjectId validation

// Middleware to authenticate the user (example: JWT Authentication)
export const authenticate = (req, res, next) => {
    try {
        const token = req.cookies.token; // assuming you're using cookies for JWT
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: false });
        req.user = decoded; // Attach user data to the request
        next();
    } catch (err) {
        console.error(err);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export const applyJob = async (req, res) => {
    try {
        // Step 1: Check if the user is logged in
        if (!req.user || !req.user.role) {
            return res.status(401).json({
                message: "Please log in to apply for a job.",
                success: false
            });
        }

        // Step 2: Check if the user has the 'jobSeeker' role
        if (req.user.role.toLowerCase() !== "jobseeker") {
            return res.status(403).json({
                message: "Only job seekers can apply for jobs. Please log in as a job seeker.",
                success: false
            });
        }

        const userId = req.user._id;  // User ID from JWT
        const jobId = req.params.id;   // Job ID from request params

        console.log("Job ID:", jobId);
        console.log("User ID:", userId);

        if (!jobId) {
            return res.status(400).json({
                message: "Job ID is required.",
                success: false
            });
        }

        // Step 3: Check if the job ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({
                message: "Invalid job ID format.",
                success: false
            });
        }

        // Step 4: Check if the user has already applied for the job
        const existingApplication = await Application.findOne({ job: jobId, applicant: userId });
        if (existingApplication) {
            return res.status(400).json({
                message: "You have already applied for this job.",
                success: false
            });
        }

        // Step 5: Check if the job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        // Step 6: Create a new application for the job
        const newApplication = await Application.create({
            job: jobId,
            applicant: userId,  // Assigning the logged-in user as the applicant
            status: 'pending',   // Default status is 'pending'
        });

        // Step 7: Link the new application to the job
        job.applications.push(newApplication._id);
        await job.save();

        return res.status(201).json({
            message: "Job applied successfully.",
            success: true
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error.",
            success: false
        });
    }
};



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
            applicantResume: application.applicantResume, // Resume info (assuming you store this)
            createdAt: application.createdAt,
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
