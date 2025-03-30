import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";  // Ensure the user is authenticated
import { 
  getAdminJobs, 
  getAllJobs, 
  getJobById, 
  postJob, 
  disableJob, 
  enableJob, 
  updateJob,  // Import the updateJob controller
  getApplicantsForJob 
} from "../controllers/job.controller.js";

const router = express.Router();

// Route to post a new job (Recruiter or Admin only)
router.route("/post").post(isAuthenticated(["recruiter"]), postJob);

// Route to get all open jobs (Job seekers can access this without authentication)
router.route("/get").get(getAllJobs);

// Route to get all jobs posted by the admin/recruiter (Requires authentication)
router.route("/getadminjobs").get(isAuthenticated(["recruiter", "admin"]), getAdminJobs);

// Route to get a specific job by ID (Job seekers/recruiters can access this)
router.route("/get/:id").get(getJobById);

// Route to update a job posting (Allowed for both Admin and Recruiter)
router.route("/update/:id").patch(isAuthenticated(["recruiter", "admin"]), updateJob);

// Route to disable a job (Admin or Recruiter can disable their own job posting)
router.route("/disable/:id").patch(isAuthenticated(["recruiter", "admin"]), disableJob);

// Route to enable a job (Admin or Recruiter can enable their own job posting)
router.route("/enable/:id").patch(isAuthenticated(["recruiter", "admin"]), enableJob);

// Added route to fetch job applicants by job ID
router.get("/:id/applicants", isAuthenticated, getApplicantsForJob);

export default router;
