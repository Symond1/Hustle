import React, { useState } from "react";
import Navbar from "./shared/Navbar";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Contact, Mail, Pen, Trash } from "lucide-react";
import { Badge } from "./ui/badge";
import AppliedJobTable from "./AppliedJobTable";
import { Label } from "./ui/label";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import useGetAppliedJobs from "@/hooks/useGetAppliedJobs";
import axios from "axios";
import { logout } from "@/redux/authSlice"; // Assuming a logout action exists

const Profile = () => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const { user } = useSelector((store) => store.auth);
    const { allAppliedJobs } = useSelector((store) => store.job);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useGetAppliedJobs();

    if (!user) {
        return <div className="text-center py-10 text-gray-500">Loading...</div>;
    }

    const userRole = user?.role?.toLowerCase();

    const handleDeleteAccount = async () => {
        try {
            const response = await axios.patch(
                "/api/v1/disable-account",
                {},
                { withCredentials: true }
            );
            if (response.data.success) {
                dispatch(logout());
                navigate("/login");
            } else {
                console.error("Failed to disable account:", response.data.message);
            }
        } catch (error) {
            console.error("Error disabling account:", error);
        }
    };

    // Fallback functions to ensure education and experience are arrays
    const educationArray = Array.isArray(user?.profile?.education)
        ? user.profile.education
        : [];
    const experienceArray = Array.isArray(user?.profile?.experience)
        ? user.profile.experience
        : [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
            <Navbar />
            <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl my-8 p-8 transition-transform hover:scale-[1.01]">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-28 w-28 shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <AvatarImage
                                src={user?.profile?.profilePhoto || "/logos/logo11.png"}
                                alt="avatar"
                                className="rounded-full object-cover"
                            />
                        </Avatar>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">
                                {user?.fullname}
                            </h1>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Button
                            // Navigate to the update profile page when clicked
                            onClick={() => navigate("/UpdateProfileDialog")}
                            className="text-gray-600 hover:bg-gray-200 hover:text-gray-800 p-2 rounded-lg transition-colors duration-200"
                            variant="outline"
                        >
                            <Pen className="h-5 w-5" />
                        </Button>
                        <Button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="text-red-600 hover:bg-red-100 hover:text-red-800 p-2 rounded-lg transition-colors duration-200"
                            variant="outline"
                        >
                            <Trash className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                <div className="border-t border-gray-200 my-6"></div>

                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-gray-700">
                        <Mail className="text-gray-500" />
                        <span>{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                        <Contact className="text-gray-500" />
                        <span>{user?.phoneNumber || "Add your phone number"}</span>
                    </div>
                </div>

                <div className="border-t border-gray-200 my-6"></div>

                {/* Conditional rendering for Recruiter vs. Jobseeker */}
                {user?.profile && (
                    <>
                        {userRole === "recruiter" ? (
                            <div className="grid grid-cols-2 gap-6">
                                <div className="text-gray-700">
                                    <strong>Gender:</strong>{" "}
                                    {user?.profile?.gender || "Add your gender"}
                                </div>
                                <div className="text-gray-700">
                                    <strong>City:</strong> {user?.city || "Add your city"}
                                </div>
                                <div className="text-gray-700">
                                    <strong>State:</strong> {user?.state || "Add your state"}
                                </div>
                                <div className="text-gray-700">
                                    <strong>Address:</strong> {user?.address || "Add your address"}
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-6">
                                <div className="text-gray-700">
                                    <strong>Education:</strong>
                                    {educationArray.length > 0 ? (
                                        <ul className="list-disc ml-5 mt-2">
                                            {educationArray.map((edu, index) => (
                                                <li key={index} className="mb-1">
                                                    {edu.degree} {edu.fieldOfStudy}{" "}
                                                    {edu.startDate
                                                        ? new Date(edu.startDate).toLocaleDateString()
                                                        : "Add Your"} -{" "}
                                                    {edu.endDate
                                                        ? new Date(edu.endDate).toLocaleDateString()
                                                        : "Education Qualification"}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        " Add your education"
                                    )}
                                </div>
                                <div className="text-gray-700">
                                    <strong>Experience:</strong>
                                    {experienceArray.length > 0 ? (
                                        <ul className="list-disc ml-5 mt-2">
                                            {experienceArray.map((exp, index) => (
                                                <li key={index} className="mb-1">
                                                    {exp.role} {exp.companyName}{" "}
                                                    {exp.startDate
                                                        ? new Date(exp.startDate).toLocaleDateString()
                                                        : "Add Your"}{" "}
                                                    {exp.endDate
                                                        ? new Date(exp.endDate).toLocaleDateString()
                                                        : "Experience"}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        " Add your experience"
                                    )}
                                </div>
                                <div className="text-gray-700">
                                    <strong>Gender:</strong> {user?.profile?.gender || "Add your gender"}
                                </div>
                                <div className="text-gray-700">
                                    <strong>Date of Birth:</strong>{" "}
                                    {user?.profile?.dob
                                        ? new Date(user.profile.dob).toLocaleDateString()
                                        : "Add your date of birth"}
                                </div>
                                <div className="text-gray-700">
                                    <strong>City:</strong> {user?.city || "Add your city"}
                                </div>
                                <div className="text-gray-700">
                                    <strong>State:</strong> {user?.state || "Add your state"}
                                </div>
                                <div className="text-gray-700">
                                    <strong>Address:</strong> {user?.address || "Add your address"}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Jobseeker-specific sections */}
                {userRole === "jobseeker" && (
                    <>
                        <div className="border-t border-gray-200 my-6"></div>

                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label className="text-md font-bold">Resume</Label>
                            {user?.profile?.resume ? (
                                <a
                                    target="blank"
                                    href={user.profile.resume}
                                    className="text-blue-500 w-full hover:underline"
                                >
                                    Download Resume
                                </a>
                            ) : (
                                <span className="text-gray-500">Add your resume</span>
                            )}
                        </div>

                        {/* New Skills Section */}
                        <div className="border-t border-gray-200 my-6"></div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label className="text-md font-bold">Skills</Label>
                            {user?.profile?.skills && user.profile.skills.length > 0 ? (
                                <ul className="list-disc ml-5 mt-2">
                                    {user.profile.skills.map((skill, index) => (
                                        <li key={index}>{skill}</li>
                                    ))}
                                </ul>
                            ) : (
                                <span className="text-gray-500">Add your skills</span>
                            )}
                        </div>

                        <div className="border-t border-gray-200 my-6"></div>

                        <AppliedJobTable jobs={allAppliedJobs} />
                    </>
                )}
            </div>

            {/* Disable Confirmation Popup */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Are you sure you want to disable your account?
                        </h3>
                        <p className="text-gray-600 mt-2">
                            This action cannot be undone. All your data will be permanently disabled.
                        </p>
                        <div className="flex justify-end gap-4 mt-4">
                            <Button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="text-gray-600 hover:bg-gray-200"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDeleteAccount}
                                className="bg-red-600 text-white hover:bg-red-700"
                            >
                                Disable
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
