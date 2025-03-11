import Job from "../models/job.model.js";
import User from "../models/user.model.js";

// Defining constants for statuses
const JOB_STATUS = {
  OPEN: "Open",
  DISABLED: "Disabled",
};

// Recruiter can post a job
export const postJob = async (req, res) => {
  try {
    const { role } = req.user;

    if (role.toLowerCase() !== "recruiter") {
      return res.status(403).json({
        message: "You are not authorized to post jobs.",
        success: false,
      });
    }

    const {
      title, jobType, location, description, responsibilities,
      qualifications, salary, jobNiche, industry, companyId, companyName, position   
    } = req.body;

    const userId = req.user._id;

    // Validate required fields
    if (!title || !jobType || !location || !description || 
        !responsibilities || !qualifications || !salary || !companyName || !jobNiche || !industry || !position ) {
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
      company: companyId,  // Only pass companyId, not companyName
      status: JOB_STATUS.OPEN,
    });

    // Populate company after job is created
    const populatedJob = await job.populate('company', 'companyName companyLogo');

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
export const disableJob = async (req, res) => {
  try {
    const { role, _id } = req.user;
    const jobId = req.params.id;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Job not found.",
        success: false,
      });
    }

    if (job.status === JOB_STATUS.DISABLED) {
      return res.status(400).json({
        message: "Job is already disabled.",
        success: false,
      });
    }

    if (
      role.toLowerCase() !== "admin" && 
      job.postedBy.toString() !== _id.toString()
    ) {
      return res.status(403).json({
        message: "Unauthorized access.",
        success: false,
      });
    }

    job.status = JOB_STATUS.DISABLED;
    await job.save();

    return res.status(200).json({
      message: "Job disabled successfully.",
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

 //added by N for applicants for job by id
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
