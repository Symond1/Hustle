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

    // Access the file uploaded via multer
    const companyLogo = req.file;

    // Validate mandatory fields
    if (!companyName || companyName.trim() === "") {
      return res.status(400).json({
        message: "Company name is required and cannot be empty.",
      });
    }

    if (
      !companyWebsite ||
      !/^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,6}(\/.*)?$/.test(companyWebsite)
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
      // Create a stream from the file buffer
      const bufferStream = new stream.PassThrough();
      bufferStream.end(companyLogo.buffer);

      // Wrap the Cloudinary upload in a promise with a callback
      await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.v2.uploader.upload_stream(
          {
            folder: "company_logos",
            resource_type: "image",
            public_id: `company_${Date.now()}`,
          },
          (error, result) => {
            if (error) return reject(error);
            companyLogoUrl = result.secure_url;
            resolve();
          }
        );
        bufferStream.pipe(uploadStream);
      });
    }

    // Create a new company instance
    const newCompany = new Company({
      companyName,
      companyWebsite,
      companyDescription,
      companyIndustry,
      companySize,
      location,
      contactEmail,
      contactPhone,
      companyLogo: companyLogoUrl, // The URL after successful upload (empty string if no logo)
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
    // Check if the user is logged in
    if (!req.user) {
      // Not logged in: show all companies (both active and disabled)
      const companies = await Company.find();
      if (!companies || companies.length === 0) {
        return res.status(404).json({
          message: "No companies found.",
          success: false,
        });
      }
      return res.status(200).json({
        message: "Companies retrieved successfully.",
        company: companies.map(comp => ({
          ...comp._doc,
          name: comp.companyName,
        })),
      });
    }
    
    // User is logged in, extract and normalize role
    const userRole = req.user.role.toLowerCase();
    const userId = req.user._id;
    let companies;

    if (userRole === "recruiter") {
      // Recruiters get only the company they created (regardless of status)
      const company = await Company.findOne({ createdBy: userId });
      if (!company) {
        return res.status(404).json({
          message: "No company found for the recruiter.",
          success: false,
        });
      }
      return res.status(200).json({
        message: "Company retrieved successfully.",
        company: { name: company.companyName, ...company._doc },
      });
    } else if (userRole === "admin") {
      // Admins see all companies (active and disabled)
      companies = await Company.find();
      if (!companies || companies.length === 0) {
        return res.status(404).json({
          message: "No companies found.",
          success: false,
        });
      }
      companies = companies.map(comp => ({
        ...comp._doc,
        name: comp.companyName,
        tag: "admin", // Optional tag for admin view
      }));
    } else if (userRole === "jobseeker") {
      // Jobseekers see only active companies
      companies = await Company.find({ status: "active" });
      if (!companies || companies.length === 0) {
        return res.status(404).json({
          message: "No active companies found.",
          success: false,
        });
      }
      companies = companies.map(comp => ({
        ...comp._doc,
        name: comp.companyName,
      }));
    } else {
      // Fallback: if an unexpected role is encountered, treat as not logged in (all companies)
      companies = await Company.find();
      if (!companies || companies.length === 0) {
        return res.status(404).json({
          message: "No companies found.",
          success: false,
        });
      }
      companies = companies.map(comp => ({
        ...comp._doc,
        name: comp.companyName,
      }));
    }

    return res.status(200).json({
      message: "Companies retrieved successfully.",
      company: companies,
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

    // Define the fields you allow to update, matching your schema
    const allowedFields = [
      'companyName',
      'companyWebsite',
      'companyDescription',
      'companyIndustry',
      'companySize',
      'location',
      'contactEmail',
      'contactPhone'
    ];
    
    // Filter out any keys that are not allowed or have undefined values
    const filteredData = Object.keys(updateData).reduce((acc, key) => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        acc[key] = updateData[key];
      }
      return acc;
    }, {});

    // Check if a new logo file is provided in the request (via multer)
    if (req.file) {
      let companyLogoUrl;
      const bufferStream = new stream.PassThrough();
      bufferStream.end(req.file.buffer);

      // Upload the file to Cloudinary
      const uploadStream = cloudinary.v2.uploader.upload_stream({
        folder: "company_logos", // Cloudinary folder for storing company logos
        resource_type: "image",
        public_id: `company_${Date.now()}`, // Unique public ID
      });

      companyLogoUrl = await new Promise((resolve, reject) => {
        bufferStream.pipe(uploadStream)
          .on("finish", (result) => resolve(result.secure_url))
          .on("error", (error) => reject(error));
      });

      // Include the logo URL in the filtered update data
      filteredData.companyLogo = companyLogoUrl;
    }

    // Ensure there is data to update
    if (Object.keys(filteredData).length === 0) {
      return res.status(400).json({
        message: "No valid data provided to update.",
      });
    }

    // Find and update the company document
    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      { $set: filteredData }, // Only update allowed fields
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

// Activate a company (only the single built-in admi

export const activateCompany = async (req, res) => {
  try {
    console.log("activateCompany - req.user:", req.user);

    if (!req.user) {
      return res.status(403).json({
        message: "Authentication required.",
        success: false,
      });
    }

    // Check that the user has the admin role (email check removed)
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admins can activate companies.",
        success: false,
      });
    }

    // Find and update the company only if it's currently disabled
    const company = await Company.findOneAndUpdate(
      { _id: req.params.id, status: "disabled" },
      { status: "active" },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({
        message: "Company not found or is already active.",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Company has been activated.",
      company,
      success: true,
    });
  } catch (error) {
    console.error("Error in activateCompany:", error);
    return res.status(500).json({
      message: "An error occurred while activating the company.",
      success: false,
      error: error.message,
    });
  }
};
