import Company from "../models/company.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import stream from "stream";


// Middleware to check roles (case-insensitive)
const checkRole = (role) => (req, res, next) => {
  if (req.user?.role?.toLowerCase() !== role.toLowerCase()) {
    return res.status(403).json({
      message: `Access denied. Only ${role}s can perform this action.`,
      success: false,
    });
  }
  next();
};


export const registerCompany = async (req, res) => { 
  try {
    const {
      companyName,
      companyWebsite,
      companyDescription,
      companyIndustry,
      companySize,
      location,
      contactEmail,
      contactPhone,
    } = req.body;

    const companyLogo = req.file; // Accessing the uploaded file via multer

    // Validate mandatory fields
    if (!companyName || companyName.trim() === "") {
      return res.status(400).json({
        message: "Company name is required and cannot be empty.",
      });
    }

    if (
      !companyWebsite ||
      !/^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,6}\/?$/.test(companyWebsite)
    ) {
      return res.status(400).json({
        message: "Please provide a valid URL for the company website.",
      });
    }

    if (!contactEmail || !/^\S+@\S+\.\S+$/.test(contactEmail)) {
      return res.status(400).json({
        message: "Please provide a valid contact email address.",
      });
    }

    if (!contactPhone || !/^\d{10}$/.test(contactPhone)) {
      return res.status(400).json({
        message: "Please provide a valid 10-digit contact phone number.",
      });
    }

    // Fetch recruiter ID from the authenticated user's session
    const recruiterId = req.user._id;

    // Check if the recruiter already created a company
    const existingCompany = await Company.findOne({ createdBy: recruiterId });
    if (existingCompany) {
      return res.status(400).json({
        message: "You have already registered a company.",
      });
    }

    // Check if a company with the same name already exists
    const duplicateCompany = await Company.findOne({ companyName });
    if (duplicateCompany) {
      return res.status(400).json({
        message: `A company with the name '${companyName}' already exists.`,
      });
    }

    // Cloudinary logic for companyLogo (if provided)
    let companyLogoUrl = "";
    if (companyLogo) {
      const bufferStream = new stream.PassThrough();
      bufferStream.end(companyLogo.buffer);

      const uploadStream = cloudinary.v2.uploader.upload_stream({
        folder: "company_logos", // Cloudinary folder for storing company logos
        resource_type: "image", // Define resource type for image uploads
        public_id: `company_${Date.now()}`, // Unique public ID
      });

      await new Promise((resolve, reject) => {
        bufferStream.pipe(uploadStream)
          .on("finish", (result) => {
            companyLogoUrl = result.secure_url;
            resolve();
          })
          .on("error", (error) => reject(error));
      });
    }

    // Create a new company
    const newCompany = new Company({
      companyName,
      companyWebsite,
      companyDescription,
      companyIndustry,
      companySize,
      location,
      contactEmail,
      contactPhone,
      companyLogo: companyLogoUrl, // The URL after successful upload
      createdBy: recruiterId,
    });

    await newCompany.save();

    res.status(201).json({
      message: "Company registered successfully.",
      company: newCompany,
    });
  } catch (error) {
    console.error("Error in registerCompany:", error);

    // Handle duplicate company name errors
    if (error.code === 11000 && error.keyPattern && error.keyPattern.companyName) {
      return res.status(400).json({
        message: "A company with the same name already exists.",
      });
    }

    res.status(500).json({
      message: "Error registering company.",
      error: error.message,
    });
  }
};

export const getCompany = async (req, res) => {
  try {
    const userRole = req.user?.role?.toLowerCase() || "visitor";  // Default to "visitor" if no user
    const userId = req.user?._id;

    let company;

    if (userRole === "recruiter") {
      company = await Company.findOne({ createdBy: userId });  // Recruiters get their own company
    } else {
      company = await Company.find();  // Admins, Jobseekers, and Visitors get all companies
    }

    if (!company || (Array.isArray(company) && company.length === 0)) {
      return res.status(404).json({
        message: "No companies found.",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Companies retrieved successfully.",
      company: Array.isArray(company)
        ? company.map(comp => ({
            name: comp.companyName,
            ...comp._doc, // Spread all properties
          }))
        : { name: company.companyName, ...company._doc },
    });

  } catch (error) {
    console.error("Error fetching company:", error);
    res.status(500).json({
      message: "Error fetching company.",
      error: error.message,
    });
  }
};
export const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company || company.status === "disabled") {
      return res.status(404).json({
        message: "Company not found or has been disabled.",
        success: false,
      });
    }

    return res.status(200).json({
      company,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching company by ID:", error);
    return res.status(500).json({
      message: "An error occurred while fetching the company details.",
      success: false,
      error: error.message,
    });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params; // Get the company ID from the route params
    const updateData = req.body; // Get the update data from the request body

    // Ensure the request body has data to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: "No data provided to update.",
      });
    }

    // Find and update the company
    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      { $set: updateData }, // Update only the provided fields
      { new: true, runValidators: true } // Return the updated document and run validation
    );

    // If no company was found with the given ID
    if (!updatedCompany) {
      return res.status(404).json({
        message: "Company not found.",
      });
    }

    // Return the updated company
    return res.status(200).json({
      message: "Company updated successfully.",
      data: updatedCompany,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating company.",
      error: error.message,
    });
  }
};


// Disable a company
export const disableCompany = async (req, res) => {
  try {
    if (
      req.user?.role?.toLowerCase() !== "recruiter" &&
      req.user?.role?.toLowerCase() !== "admin"
    ) {
      return res.status(403).json({
        message: "Only admin or recruiters can disable companies.",
        success: false,
      });
    }

    const company = await Company.findOneAndUpdate(
      { _id: req.params.id, status: "active" },
      { status: "disabled" },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({
        message: "Company not found or access denied.",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Company has been disabled.",
      company,
      success: true,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "An error occurred while disabling the company.",
      success: false,
    });
  }
};
