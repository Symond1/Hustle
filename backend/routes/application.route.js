import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { applyJob, getApplicants, getAppliedJobs, updateStatus } from "../controllers/application.controller.js";

const router = express.Router();

// Route to apply for a job (Job Seeker only)
router.route("/apply/:id").post(isAuthenticated(["jobseeker"]), applyJob); // Only job seekers can apply

// Route to get all jobs applied by the authenticated user (Job Seeker only)
router.route("/applied").get(isAuthenticated(["jobseeker"]), getAppliedJobs); // Only job seekers can get their applied jobs

// Route to get all applicants for a specific job (Admin or Recruiter only)
router.route("/:id/applicants").get(isAuthenticated(["recruiter", "admin"]), getApplicants); // Admin and Recruiters can view applicants for a job

// Route to update the application status (Admin or Recruiter only)
router.route("/status/:id/update").post(isAuthenticated(["recruiter", "admin"]), updateStatus); // Admin and Recruiters can update status

export default router;
