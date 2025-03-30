import Job from "../models/job.model.js";
import User from "../models/user.model.js";
import Company from "../models/company.model.js";

// Defining constants for statuses
const JOB_STATUS = {
  OPEN: "Open",
  DISABLED: "Disabled",
};

export const postJob = async (req, res) => {
  try {
    const { role } = req.user;
    const lowerRole = role.toLowerCase();
    const userId = req.user._id;

    // Allow only recruiters and admins to post jobs.
    if (lowerRole !== "recruiter" && lowerRole !== "admin") {
      return res.status(403).json({
        message: "You are not authorized to post jobs.",
        success: false,
      });
    }

    const {
      title,
      jobType,
      location,
      description,
      responsibilities,
      qualifications,
      salary,
      jobNiche,
      industry,
      companyName, // for display purposes
      position,
      companyId,   // Only relevant for admin or recruiter reference
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !jobType ||
      !location ||
      !description ||
      !responsibilities ||
      !qualifications ||
      !salary ||
      !companyName ||
      !jobNiche ||
      !industry ||
      !position
    ) {
      return res.status(400).json({
        message: "All required fields must be provided.",
        success: false,
      });
    }

    if (isNaN(salary) || salary <= 0) {
      return res.status(400).json({
        message: "Salary must be a positive number.",
        success: false,
      });
    }

    if (isNaN(position) || position <= 0) {
      return res.status(400).json({
        message: "Position must be a positive number.",
        success: false,
      });
    }

    let finalCompanyId;

    if (lowerRole === "recruiter") {
      // Recruiters can only post jobs for the company they registered.
      const company = await Company.findOne({ createdBy: userId });
      if (!company) {
        return res.status(400).json({
          message: "You have not registered a company yet.",
          success: false,
        });
      }
      // If a companyId is provided, it must match the recruiter’s own company
      if (companyId && companyId !== company._id.toString()) {
        return res.status(400).json({
          message: "Recruiters are only allowed to post jobs for their own company.",
          success: false,
        });
      }
      finalCompanyId = company._id;
    } else if (lowerRole === "admin") {
      // Admins must provide a valid companyId.
      if (!companyId) {
        return res.status(400).json({
          message: "Company ID is required when posting as an admin.",
          success: false,
        });
      }
      const company = await Company.findById(companyId);
      if (!company) {
        return res.status(400).json({
          message: "The provided company does not exist.",
          success: false,
        });
      }
      finalCompanyId = companyId;
    }

    const job = await Job.create({
      title,
      jobType,
      location,
      description,
      responsibilities,
      qualifications,
      salary,
      jobNiche,
      industry,
      position,
      companyName,
      postedBy: userId,
      company: finalCompanyId,
      status: JOB_STATUS.OPEN,
    });

    // Populate company details after job is created
    const populatedJob = await job.populate("company", "companyName companyLogo");

    return res.status(201).json({
      message: "Job created successfully.",
      job: populatedJob,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong.",
      success: false,
    });
  }
};







export const getAllJobs = async (req, res) => {
  try {
      const keyword = req.query.keyword || "";
      const query = {
          $or: [
              { title: { $regex: keyword, $options: "i" } },
              { description: { $regex: keyword, $options: "i" } },
          ]
      };
      const jobs = await Job.find(query)
          .populate({
              path: "company",
          })
          .populate('postedBy', 'fullname email') // Add recruiter details
          .sort({ createdAt: -1 });

      if (!jobs) {
          return res.status(404).json({
              message: "Jobs not found.",
              success: false,
          });
      }

      return res.status(200).json({
          jobs,
          success: true,
      });
  } catch (error) {
      console.log(error);
      return res.status(500).json({
          message: "Something went wrong.",
          success: false,
      });
  }
};



export const getJobById = async (req, res) => {
  try {
      const jobId = req.params.id;

      const job = await Job.findById(jobId)
          .populate({
              path: "applications",
              options: { sort: { createdAt: -1 } },
              populate: { path: "applicant" },
          })
          .populate('company', 'companyName companyLogo')
          .populate('postedBy', 'fullname email'); // Populate recruiter details

      if (!job) {
          return res.status(404).json({
              message: "Job not found.",
              success: false,
          });
      }

      return res.status(200).json({
          job,
          success: true,
      });
  } catch (error) {
      console.error(error);
      return res.status(500).json({
          message: "Something went wrong.",
          success: false,
      });
  }
};

// Get all jobs posted by the admin/Recruiter
export const getAdminJobs = async (req, res) => {
  try {
    const { role, _id } = req.user;

    let query = {};

    if (role.toLowerCase() === "admin") {
      query = {};
    } else if (role.toLowerCase() === "recruiter") {
      query = { postedBy: _id };
    }

    const jobs = await Job.find(query).populate("company").sort({ createdAt: -1 });

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({
        message: "No jobs found.",
        success: false,
      });
    }

    return res.status(200).json({
      jobs,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong.",
      success: false,
    });
  }
};

// Disable a job
// Disable a job
export const disableJob = async (req, res) => {
  try {
    if (
      req.user?.role?.toLowerCase() !== "recruiter" &&
      req.user?.role?.toLowerCase() !== "admin"
    ) {
      return res.status(403).json({
        message: "Only admin or recruiters can disable jobs.",
        success: false,
      });
    }

    // Build query: only update if job is "Open".
    // Recruiters can only disable their own jobs.
    let query = { _id: req.params.id, status: "Open" };
    if (req.user.role.toLowerCase() === "recruiter") {
      query.postedBy = req.user._id;
    }

    const job = await Job.findOneAndUpdate(
      query,
      { status: "Disabled" },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({
        message: "Job not found or access denied.",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Job has been disabled.",
      job,
      success: true,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "An error occurred while disabling the job.",
      success: false,
    });
  }
};


// Enable a job
export const enableJob = async (req, res) => {
  try {
    if (
      req.user?.role?.toLowerCase() !== "recruiter" &&
      req.user?.role?.toLowerCase() !== "admin"
    ) {
      return res.status(403).json({
        message: "Only admin or recruiters can enable jobs.",
        success: false,
      });
    }

    // Recruiters can only enable their own jobs.
    let query = { _id: req.params.id, status: "Disabled" };
    if (req.user.role.toLowerCase() === "recruiter") {
      query.postedBy = req.user._id;
    }

    const job = await Job.findOneAndUpdate(
      query,
      { status: "Open" },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({
        message: "Job not found or is already active.",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Job has been enabled.",
      job,
      success: true,
    });
  } catch (error) {
    console.error("Error in enableJob:", error);
    return res.status(500).json({
      message: "An error occurred while enabling the job.",
      success: false,
      error: error.message,
    });
  }
};




 export const getApplicantsForJob = async (req, res) => {
  try {
      const { id } = req.params; 
      const job = await Job.findById(id).populate({
          path: "applications",
          populate: {
              path: "applicant",
              select: "fullname email phoneNumber profile createdAt",
          },
      });

      if (!job) {
          return res.status(404).json({ success: false, message: "Job not found" });
      }

      return res.status(200).json({
          success: true,
          applications: job.applications,
      });
  } catch (error) {
      console.error("Error fetching job applicants:", error);
      return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Updating a job 

export const updateJob = async (req, res) => {
  try {
    const { id } = req.params; // Get job ID from route parameters
    const updateData = req.body; // Data to update

    // Define allowed fields for update (all fields used during postJob)
    const allowedFields = [
      "title",
      "jobType",
      "location",
      "description",
      "responsibilities",
      "qualifications",
      "salary",
      "jobNiche",
      "industry",
      "position",
    ];

    // Filter updateData to only include allowed fields with non-undefined values
    const filteredData = Object.keys(updateData).reduce((acc, key) => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        acc[key] = updateData[key];
      }
      return acc;
    }, {});

    // Ensure there is at least one field to update
    if (Object.keys(filteredData).length === 0) {
      return res.status(400).json({
        message: "No valid data provided to update.",
      });
    }

    // Build query:
    // - For recruiters, allow update only if they originally posted the job.
    // - Admins can update any job.
    let query = { _id: id };
    if (req.user.role.toLowerCase() === "recruiter") {
      query.postedBy = req.user._id;
    }

    // Update the job using findOneAndUpdate with the filtered update data
    const updatedJob = await Job.findOneAndUpdate(
      query,
      { $set: filteredData },
      { new: true, runValidators: true }
    );

    // If no job is found, either the ID is wrong or the recruiter is not authorized
    if (!updatedJob) {
      return res.status(404).json({
        message: "Job not found or access denied.",
      });
    }

    return res.status(200).json({
      message: "Job updated successfully.",
      job: updatedJob,
    });
  } catch (error) {
    console.error("Error updating job:", error);
    return res.status(500).json({
      message: "Error updating job.",
      error: error.message,
    });
  }
};
