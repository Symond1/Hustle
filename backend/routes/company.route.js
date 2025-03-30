import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js"; // Import the updated isAuthenticated middleware
import {getCompany,getCompanyById,registerCompany,updateCompany, disableCompany,activateCompany} from "../controllers/company.controller.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

// Route to register a new company (Recruiters only)
router.route("/register").post(isAuthenticated(["recruiter"]), registerCompany); // Only recruiters can register a company


router.route("/getcompany").get(getCompany);

router.route("/get").get(getCompany); // Both recruiters and admins can view companies

// Route to get a company by its ID (Anyone can view)
router.route("/get/:id").get(getCompanyById); // Anyone can view a company by ID

// Route to update company details (Recruiters or Admin only)
router.route("/update/:id").put(isAuthenticated(["recruiter", "admin"]), singleUpload, updateCompany); // Both recruiters and admins can update company details

// Route to disable a company (Recruiters or Admin only)
router.route("/disable/:id").put(isAuthenticated(["recruiter", "admin"]), disableCompany); // Both recruiters and admins can disable a company

router.put("/activate/:id",isAuthenticated(["admin"]), activateCompany)

export default router;
