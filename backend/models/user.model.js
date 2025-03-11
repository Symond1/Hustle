import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
    bio: { type: String },
    skills: [{ type: String }],
    resume: { 
        type: String, 
    },
    resumeOriginalName: { type: String },
    education: { type: String },
    experience: { type: String },
    gender: { type: String },
    dob: { type: Date }, 
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },
    profilePhoto: { type: String, default: "" },
});

const userSchema = new mongoose.Schema(
    {
        fullname: {
            type: String,
            required: true,
            validate: {
                validator: function (v) {
                    return /^[a-zA-Z\s]+$/.test(v); // Allows only letters and spaces
                },
                message: "Fullname must not contain numbers or special characters.",
            },
        },
        email: {
            type: String,
            required: true,
            unique: true,
            match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
        },
        phoneNumber: {
            type: Number,
            required: true,
            validate: {
                validator: function (v) {
                    return /^\d{10}$/.test(v); // Example validation for 10-digit phone numbers
                },
                message: "Please provide a valid phone number",
            },
        },
        password: {
            type: String,
            required: true,
            minlength: [8, "Password must be at least 8 characters long"],
        },
        role: {
            type: String,
            enum: ["Jobseeker", "Recruiter", "Admin"],
            required: true,
            default: "Jobseeker",
        },
        profile: profileSchema, // Embedded profile schema
        address: { type: String },
        city: {
            type: String,
            validate: {
                validator: function (v) {
                    return /^[a-zA-Z\s]+$/.test(v); // Allows only letters and spaces
                },
                message: "City must not contain numbers or special characters.",
            },
        },
        state: {
            type: String,
            validate: {
                validator: function (v) {
                    return /^[a-zA-Z\s]+$/.test(v); // Allows only letters and spaces
                },
                message: "State must not contain numbers or special characters.",
            },
        },
        isVerified: { type: Boolean, default: false },
        
        // Adding password reset fields for future functionality
        passwordResetToken: { type: String },
        passwordResetExpires: { type: Date },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
