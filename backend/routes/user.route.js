import express from "express";
import { register, login, logout, forgotPassword, updateProfile, deleteAccount, updatePassword, resetPassword } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

// Route for user registration
router.route("/register").post(singleUpload, register);

// Route for user login
router.route("/login").post(login);

// Route to update user profile (protected by authentication)
router.post("/updateProfile", isAuthenticated(["Jobseeker", "Recruiter", "Admin"]), singleUpload, updateProfile);

// Route to logout
router.route("/logout").get(logout);

// Route to update password (protected by authentication)
router.route("/profile/password").post(isAuthenticated, updatePassword);

// Forgot Password Route
router.post("/forgot-password", forgotPassword);

// Password Reset Route (Add this new route)
router.post("/reset-password", resetPassword);  // Reset password route

// Route to delete user account (protected by authentication)
router.route("/profile").delete(isAuthenticated, deleteAccount);

export default router;
