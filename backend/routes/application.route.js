import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { applyJob, getApplicants, getAppliedJobs, updateStatus } from "../controllers/application.controller.js";
import { checkProfileUpdated } from "../middlewares/checkProfileUpdated.js";


const router = express.Router();

// Route to apply for a job (Job Seeker only)
// This route will first check if the jobseeker's profile has been updated (skills, resume, education) before allowing them to apply.
router.route("/apply/:id").post(isAuthenticated(["jobseeker"]), checkProfileUpdated, applyJob);

// Route to get all jobs applied by the authenticated user (Job Seeker only)
router.route("/applied").get(isAuthenticated(["jobseeker"]), getAppliedJobs);

// Route to get all applicants for a specific job (Admin or Recruiter only)
router.route("/:id/applicants").get(isAuthenticated(["recruiter", "admin"]), getApplicants);

// Route to update the application status (Admin or Recruiter only)
router.route("/status/:id/update").post(isAuthenticated(["recruiter", "admin"]), updateStatus);

export default router;
