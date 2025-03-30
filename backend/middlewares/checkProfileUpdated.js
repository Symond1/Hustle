import User from "../models/user.model.js"; // Import the User model

export const checkProfileUpdated = async (req, res, next) => {
  try {
    // Ensure that the user is authenticated (token middleware should have set req.user)
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    // Fetch the latest user data from the database
    const freshUser = await User.findById(req.user._id);
    if (!freshUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Only enforce the checks for jobseekers
    if (freshUser.role.toLowerCase() === "jobseeker") {
      const profile = freshUser.profile;

      // Log profile for debugging
      console.log("Profile in checkProfileUpdated middleware:", profile);

      // Ensure profile exists and is an object
      if (!profile || typeof profile !== "object") {
        return res.status(400).json({
          message: "Please update your profile before applying for jobs.",
        });
      }

      // Check for skills: must be a non-empty array with at least one non-empty string
      if (
        !Array.isArray(profile.skills) ||
        profile.skills.length === 0 ||
        !profile.skills.some(
          (skill) => typeof skill === "string" && skill.trim().length > 0
        )
      ) {
        return res.status(400).json({
          message:
            "Please update your skills in your profile before applying for jobs.",
        });
      }

      // Check for resume: must be a non-empty string
      if (
        !profile.resume ||
        typeof profile.resume !== "string" ||
        profile.resume.trim() === ""
      ) {
        return res.status(400).json({
          message: "Please upload your resume before applying for jobs.",
        });
      }

      // Enhanced education check:
      // Ensure education is an array with at least one entry that has a non-empty 'degree'
      if (
        !Array.isArray(profile.education) ||
        profile.education.length === 0 ||
        !profile.education.some(
          (edu) =>
            edu.degree &&
            typeof edu.degree === "string" &&
            edu.degree.trim() !== ""
        )
      ) {
        return res.status(400).json({
          message:
            "Please update your education details in your profile before applying for jobs.",
        });
      }

      // Check for gender: must be a non-empty string
      if (
        !profile.gender ||
        typeof profile.gender !== "string" ||
        profile.gender.trim() === ""
      ) {
        return res.status(400).json({
          message:
            "Please update your gender in your profile before applying for jobs.",
        });
      }
    }

    // If all checks pass, proceed to the next middleware or controller.
    next();
  } catch (error) {
    console.error("Error in checkProfileUpdated middleware:", error);
    return res.status(500).json({
      message: "Server error. Please try again.",
    });
  }
};
