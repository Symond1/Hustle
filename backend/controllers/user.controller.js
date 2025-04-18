import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import sendEmail from "../utils/sendEmail.js";
import getDataUri from "../utils/datauri.js";
import crypto from "crypto"; // Import crypto here
import Company from "../models/company.model.js"; 




// Seed Admin User
export const seedAdmin = async () => {
    try {
        const adminExists = await User.findOne({ email: "admin@example.com" });
        if (adminExists) {
            console.log("Admin user already exists");
            return;
        }
        const hashedPassword = await bcrypt.hash("securepassword", 10);
        const adminData = {
            fullname: "Admin User",
            email: "admin@example.com",
            phoneNumber: 1234567890,
            password: hashedPassword,  // Store hashed password
            role: "Admin",
            profile: {
                skills: [],
                resume: "",
                education: {},
                experience: {},
                gender: "Male",
                company: null
            },
            address: "Address",
            city: "CityName",
            state: "StateName",
            isVerified: true,
        };
        
        const admin = new User(adminData);
        await admin.save();
        console.log("Admin user seeded successfully");
    } catch (error) {
        console.error("Error seeding admin user:", error);
    }
};

// User Registration
export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role, address, city, state } = req.body;

        // Validate required fields
        if (!fullname || !email || !phoneNumber || !password || !role || !address || !city || !state) {
            return res.status(400).json({ message: "All fields are required.", success: false });
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email is already registered.", success: false });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        let userData = {
            fullname,
            email,
            phoneNumber,
            address,
            password: hashedPassword,
            role,
            city,
            state,
            profile: {
                skills: [],
                education: {},
                experience: {},
                gender: "",
                profilePhoto: "" // Default empty profile photo
            },
        };

        // Handle file upload (optional, default to "User_Uploads" folder)
        if (req.file) {
            const fileUri = getDataUri(req.file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content, { folder: "User_Uploads" });
            userData.profile.profilePhoto = cloudResponse.secure_url;
        }

        // Create a new user
        const newUser = await User.create(userData);

        res.status(201).json({
            message: "Account created successfully.",
            success: true,
            user: newUser,
        });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

// User Login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required.", success: false });
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password.", success: false });
        }

        // Check password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: "Invalid email or password.", success: false });
        }

        // Generate JWT token using the role from the database
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.SECRET_KEY,
            { expiresIn: "1h" }
        );

        res.status(200).cookie("token", token, {
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            httpOnly: true,
            sameSite: "strict",
        }).json({
            message: `Welcome back, ${user.fullname}!`,
            success: true,
            user,
            token,
        });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};


export const updateProfile = async (req, res) => {
    try {
        const {
            fullname,
            phoneNumber,
            skills,
            education,
            experience,
            company,
            gender,
            city,
            state,
            address, // Added address field
            dob,
            fileType,
        } = req.body;

        // Validate authenticated user
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found.", success: false });
        }

        // Update fields conditionally
        if (fullname) user.fullname = fullname;
        if (phoneNumber) {
            if (/^\d{10}$/.test(phoneNumber)) {
                user.phoneNumber = parseInt(phoneNumber, 10);
            } else {
                return res.status(400).json({ message: "Invalid phone number.", success: false });
            }
        }
        
        if (skills) user.profile.skills = skills.split(",").map(skill => skill.trim());
        if (address) user.address = address; // Update address field

        if (education) {
            try {
                const educationData = typeof education === "string" ? JSON.parse(education) : education;
                if (!Array.isArray(educationData)) {
                    return res.status(400).json({ message: "Education data must be an array.", success: false });
                }
                user.profile.education = educationData;
            } catch (err) {
                return res.status(400).json({ message: "Invalid education data format.", success: false });
            }
        }

        if (experience) {
            try {
                const experienceData = typeof experience === "string" ? JSON.parse(experience) : experience;
                if (!Array.isArray(experienceData)) {
                    return res.status(400).json({ message: "Experience data must be an array.", success: false });
                }
                user.profile.experience = experienceData;
            } catch (err) {
                return res.status(400).json({ message: "Invalid experience data format.", success: false });
            }
        }

        if (company) {
            const companyDoc = await Company.findOne({ companyName: company });
            if (!companyDoc) {
                return res.status(404).json({ message: "Company not found.", success: false });
            }
            user.profile.company = companyDoc._id;
        }

        if (gender) user.profile.gender = gender;
        if (city) user.city = city;
        if (state) user.state = state;

        if (dob) {
            const parsedDob = new Date(dob);
            if (parsedDob instanceof Date && !isNaN(parsedDob)) {
                user.profile.dob = parsedDob;
            } else {
                return res.status(400).json({ message: "Invalid date of birth.", success: false });
            }
        }

        // Handle file upload for profile photo or resume
        if (req.file) {
            const file = req.file;
            console.log("File details:", file);

            if (fileType && fileType.toLowerCase() === "profilephoto") {
                try {
                    const cloudResponse = await cloudinary.uploader.upload(file.path, { 
                        folder: "User_Profile_Photos",
                    });
                    user.profile.profilePhoto = cloudResponse.secure_url;
                } catch (error) {
                    return res.status(500).json({ message: "Error uploading profile photo.", success: false });
                }
            }

            if (fileType && fileType.toLowerCase() === "resume") {
                try {
                    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
                    const cloudResponse = await cloudinary.uploader.upload(dataUri, { 
                        folder: "User_Resumes",
                        resource_type: "raw",
                    });
                    user.profile.resume = cloudResponse.secure_url;
                    user.profile.resumeOriginalName = file.originalname;
                } catch (error) {
                    return res.status(500).json({ message: "Error uploading resume.", success: false });
                }
            }
        }

        // Save the updated user profile
        await user.save();

        return res.status(200).json({
            message: "Profile updated successfully.",
            success: true,
            user,
        });
    } catch (error) {
        return res.status(500).json({
            message: "An error occurred while updating the profile.",
            success: false,
        });
    }
};



//logout

export const logout = async (req, res) => {
    try {
        // Clearing the JWT token from cookies
        res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        // Optionally, you can also clear any other session data or cache-related data here
        // For example, if you store user data in the session or in a store like Redis, clear it as well.
        
        // Sending a response indicating successful logout
        return res.status(200).json({
            message: "Logged out successfully.",
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Logout failed. Please try again.",
            success: false
        });
    }
};


// forgotPassword controller

// Forgot Password Controller
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found!", success: false });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        user.passwordResetToken = hashedToken;
        user.passwordResetExpires = Date.now() + 3600000; // Token valid for 1 hour
        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL}token=${resetToken}`;
        const emailContent = `
          <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f9f9f9;
                    margin: 0;
                    padding: 0;
                }
                .email-container {
                    max-width: 600px;
                    margin: 30px auto;
                    background-color: #ffffff;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .header {
                    background-color: #4CAF50;
                    color: #ffffff;
                    padding: 20px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 20px;
                }
                .content h3 {
                    color: #4CAF50;
                    font-size: 20px;
                }
                .content p {
                    font-size: 16px;
                }
                .content a {
                    display: inline-block;
                    background-color: #4CAF50;
                    color: #ffffff;
                    text-decoration: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    font-weight: bold;
                }
                .footer {
                    background-color: #f1f1f1;
                    color: #666;
                    text-align: center;
                    padding: 15px;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <h1>Hustle</h1>
                </div>
                <div class="content">
                    <h3>Reset Your Password</h3>
                    <p>Oh, do not worry! Hustle is always with you. Click the link below to reset your password:</p>
                    <a href="${resetUrl}">Reset Password</a>
                    <p>If you did not request this, please ignore this email. Your password will remain unchanged.</p>
                </div>
                <div class="footer">
                    <p>Need more help? <a href="mailto:support@hustle.com">Contact Support</a></p>
                    <p>&copy; ${new Date().getFullYear()} Hustle. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;

        await sendEmail({
            to: user.email,
            subject: "Password Reset Request",
            html: emailContent,
        });

        res.status(200).json({
            message: "Password reset link has been sent to your email!",
            success: true,
        });
    } catch (error) {
        console.error("Error during forgotPassword:", error);
        res.status(500).json({ message: "Server error", success: false });
    }
};

// Reset Password Controller
export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token", success: false });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user.password = hashedPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save();

        res.status(200).json({
            message: "Password has been updated successfully.",
            success: true,
        });
    } catch (error) {
        console.error("Error during resetPassword:", error);
        res.status(500).json({ message: "Server error", success: false });
    }
};




// Update Password
export const updatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        const userId = req.user._id; // Middleware authentication
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found.", success: false });
        }

        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: "Incorrect old password.", success: false });
        }

        // Password strength validation (at least 8 characters, contains letters and numbers)
        const passwordStrengthRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!passwordStrengthRegex.test(newPassword)) {
            return res.status(400).json({ message: "New password must be at least 8 characters long and contain both letters and numbers.", success: false });
        }

        // Prevent password reuse (ensure new password isn't the same as old)
        if (oldPassword === newPassword) {
            return res.status(400).json({ message: "New password cannot be the same as the old password.", success: false });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        await user.save();

        res.status(200).json({
            message: "Password updated successfully.",
            success: true,
        });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};


export const disableUser = async (req, res) => {
  try {
    const userIdToDisable = req.params.id;
    const currentUser = req.user;
    
    // Allow admin to disable any user.
    // Non-admins (jobseeker or recruiter) can only disable their own account.
    if (
      currentUser.role.toLowerCase() !== "admin" &&
      currentUser._id.toString() !== userIdToDisable
    ) {
      return res.status(403).json({
        message: "Unauthorized: You can only disable your own account.",
        success: false,
      });
    }
    
    // Find and update the user only if their status is "Active"
    const user = await User.findOneAndUpdate(
      { _id: userIdToDisable, status: "Active" },
      { status: "Inactive" },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found or already disabled.",
        success: false,
      });
    }

    return res.status(200).json({
      message: "User disabled successfully.",
      user,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      success: false,
    });
  }
};



