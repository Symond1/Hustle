import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";  // Ensure the user is authenticated
import { getAdminJobs, getAllJobs, getJobById, postJob, disableJob, getApplicantsForJob } from "../controllers/job.controller.js";

const router = express.Router();

// Route to post a new job (Recruiter or Admin only)
router.route("/post").post(isAuthenticated(["recruiter"]), postJob);

// Route to get all open jobs (Job seekers can access this without authentication)
router.route("/get").get(getAllJobs);

// Route to get all jobs posted by the admin/recruiter (Requires authentication)
router.route("/getadminjobs").get(isAuthenticated(["recruiter","admin"]), getAdminJobs);

// Route to get a specific job by ID (Job seekers/recruiters can access this)
router.route("/get/:id").get(getJobById); // Job seekers can access this without authentication

// Route to disable a job (Admin or Recruiter can disable their own job posting)
router.route("/disable/:id").patch(isAuthenticated(["recruiter", "admin"]), disableJob);

// added by n to fetch jobs as per id
router.get("/:id/applicants",isAuthenticated, getApplicantsForJob);




export default router;
