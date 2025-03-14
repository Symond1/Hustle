import React, { useState } from "react";
import Navbar from "./shared/Navbar";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Contact, Mail, Pen, Trash } from "lucide-react";
import { Badge } from "./ui/badge";
import AppliedJobTable from "./AppliedJobTable";
import UpdateProfileDialog from "./UpdateProfileDialog";
import { Label } from "./ui/label";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import useGetAppliedJobs from "@/hooks/useGetAppliedJobs";
import axios from "axios";
import { logout } from "@/redux/authSlice"; // Assuming a logout action exists

const Profile = () => {
    const [open, setOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // State for delete confirmation popup
    const { user } = useSelector((store) => store.auth);
    const { allAppliedJobs } = useSelector((store) => store.job);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useGetAppliedJobs();

    if (!user) {
        return <div className="text-center py-10 text-gray-500">Loading...</div>;
    }

    const userRole = user?.role?.toLowerCase(); // Case-insensitive role check

    const handleDeleteAccount = async () => {
        try {
            const response = await axios.delete("/api/v1/profile", {
                withCredentials: true, // Include cookies for authentication
            });
            if (response.data.success) {
                dispatch(logout()); // Dispatch logout action
                navigate("/login"); // Redirect to login or home page
            } else {
                console.error("Failed to delete account:", response.data.message);
            }
        } catch (error) {
            console.error("Error deleting account:", error);
        }
    };

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
                            <h1 className="text-3xl font-bold text-gray-800">{user?.fullname}</h1>
                            <p className="text-gray-600 text-sm mt-1 italic">
                                {user?.profile?.bio || "Bio not available"}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Button
                            onClick={() => setOpen(true)}
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
                        <span>{user?.phoneNumber || "Phone number not provided"}</span>
                    </div>
                </div>

                <div className="border-t border-gray-200 my-6"></div>

                {user?.profile && (
                    <div className="grid grid-cols-2 gap-6">
                        <div className="text-gray-700">
                            <strong>Education:</strong> {user?.profile?.education || "Not provided"}
                        </div>
                        <div className="text-gray-700">
                            <strong>Experience:</strong> {user?.profile?.experience || "Not provided"}
                        </div>
                        <div className="text-gray-700">
                            <strong>Gender:</strong> {user?.profile?.gender || "Not provided"}
                        </div>
                        
                        <div className="text-gray-700">
                            <strong>Date of Birth:</strong> {user?.profile?.dob ? new Date(user.profile.dob).toLocaleDateString() : "Not provided"}
                        </div>
                        <div className="text-gray-700">
                            <strong>City:</strong> {user?.city || "Not provided"}
                        </div>
                        <div className="text-gray-700">
                            <strong>State:</strong> {user?.state || "Not provided"}
                        </div>
                    </div>
                )}

                <div className="border-t border-gray-200 my-6"></div>

                <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                        {user?.profile?.skills.length ? (
                            user?.profile?.skills.map((item, index) => (
                                <Badge
                                    key={index}
                                    className="bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors duration-200"
                                >
                                    {item}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-gray-600">NA</span>
                        )}
                    </div>
                </div>

                {userRole === "jobseeker" && (
                    <>
                        <div className="border-t border-gray-200 my-6"></div>

                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label className="text-md font-bold">Resume</Label>
                            {user?.profile?.resume ? (
                                <a
                                    target="blank"
                                    href={user?.profile?.resume}
                                    className="text-blue-500 w-full hover:underline"
                                >
                                    Download Resume
                                </a>
                            ) : (
                                <span className="text-gray-500">No resume available</span>
                            )}
                        </div>

                        <div className="border-t border-gray-200 my-6"></div>

                        <AppliedJobTable jobs={allAppliedJobs} />
                    </>
                )}
            </div>

            {/* Delete Confirmation Popup */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Are you sure you want to delete your account?
                        </h3>
                        <p className="text-gray-600 mt-2">
                            This action cannot be undone. All your data will be permanently deleted.
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
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <UpdateProfileDialog open={open} setOpen={setOpen} />
        </div>
    );
};

export default Profile;
