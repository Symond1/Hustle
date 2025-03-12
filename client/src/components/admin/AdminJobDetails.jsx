import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { JOB_API_END_POINT } from "@/utils/constant";
import Navbar from "../shared/Navbar";
import Footer from "../shared/Footer";

const AdminJobDetails = () => {
    const { jobId } = useParams(); // Get job ID from URL
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchJobDetails = async () => {
            try {
                const response = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`);
                setJob(response.data.job);
            } catch (err) {
                setError("Failed to fetch job details.");
            } finally {
                setLoading(false);
            }
        };

        fetchJobDetails();
    }, [jobId]);

    if (loading) return <p className="text-center text-lg font-semibold mt-5">Loading job details...</p>;
    if (error) return <p className="text-red-500 text-center mt-5">{error}</p>;

    return (
        <>

        <Navbar/>

        <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{job.title}</h2>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-gray-600"><strong>Company:</strong> {job.company?.companyName || "N/A"}</p>
                    <p className="text-gray-600"><strong>Location:</strong> {job.location}</p>
                    <p className="text-gray-600"><strong>Type:</strong> {job.jobType}</p>
                    <p className="text-gray-600"><strong>Salary:</strong> ₹{job.salary}</p>
                </div>
                <div>
                    <p className="text-gray-600"><strong>Industry:</strong> {job.industry}</p>
                    <p className="text-gray-600"><strong>Status:</strong> <span className={`px-2 py-1 text-sm font-semibold rounded ${job.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{job.status}</span></p>
                </div>
            </div>
            <hr className="my-4" />
            <div>
                <h3 className="text-lg font-semibold text-gray-800">Job Description</h3>
                <p className="text-gray-600">{job.description}</p>
            </div>
            <hr className="my-4" />
            <div>
                <h3 className="text-lg font-semibold text-gray-800">Responsibilities</h3>
                <p className="text-gray-600">{job.responsibilities}</p>
            </div>
            <hr className="my-4" />
            <div>
                <h3 className="text-lg font-semibold text-gray-800">Qualifications</h3>
                <p className="text-gray-600">{job.qualifications}</p>
            </div>
        </div>
        
        </>
    );
};

export default AdminJobDetails;
