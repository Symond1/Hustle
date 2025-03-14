import React, { useEffect } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant';
import { setSingleJob } from '@/redux/jobSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

const JobDescription = () => {
  const { singleJob } = useSelector((store) => store.job); // Get job details from Redux
  const { user, token } = useSelector((store) => store.auth); // Get user info from Redux
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Initialize the navigate function
  const params = useParams();
  const jobId = params.id;

  // Apply for the job
  const applyJobHandler = async () => {
    if (!user || !token) {
      toast.error("Please log in to apply for a job.");
      return;
    }

    try {
        const res = await axios.post(
            `${APPLICATION_API_END_POINT}/apply/${jobId}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            }
        );

        if (res.data.success) {
            const updatedSingleJob = {
                ...singleJob,
                applications: [...singleJob.applications, { applicant: user?._id }],
                isApplied: true,
            };
            dispatch(setSingleJob(updatedSingleJob));
            toast.success(res.data.message);
        } else {
            toast.error(res.data.message || "An error occurred");
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || "An error occurred";
        if (errorMessage === "Please log in to apply for a job.") {
            toast.error(errorMessage);
            navigate("/login"); // Redirect to the login page
        } else {
            toast.error(errorMessage);
        }
    }
};

useEffect(() => {
  const fetchSingleJob = async () => {
    try {
      const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "", // Only include token if available
        },
        withCredentials: true,
      });

      if (res.data.success) {
        const jobData = res.data.job;
        const isJobApplied = user && jobData.applications.some(
          (application) => application.applicant === user?._id
        );

        // Dispatch action to update the job details in Redux
        dispatch(setSingleJob({ ...jobData, isApplied: isJobApplied }));
      } else {
        toast.error(res.data.message || 'Failed to fetch job details');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error fetching job details');
    }
  };

  fetchSingleJob();
}, [jobId, dispatch, user, token]);

// Check if the user has already applied based on Redux state
const isApplied = singleJob?.isApplied || false;

// Function to go back to the previous page
const goBack = () => {
  navigate(-1); // This will navigate back to the previous page
};

return (
  <div className="max-w-7xl mx-auto my-10 bg-white p-6 rounded-lg shadow-lg">
    {/* Back Button */}
    <Button onClick={goBack} className="mb-4">Back</Button>

    <div className="flex items-center justify-between border-b-2 pb-4 mb-6 border-gray-300">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{singleJob?.title}</h1>
        <div className="flex items-center gap-2 mt-4">
          <Badge className="text-blue-700 font-bold bg-blue-100 rounded-full py-2 px-4">
            {singleJob?.position} Positions
          </Badge>
          <Badge className="text-[#F83002] font-bold bg-[#F83002] text-white rounded-full py-2 px-4">
            {singleJob?.jobType}
          </Badge>
          <Badge className="text-[#7209b7] font-bold bg-[#7209b7] text-white rounded-full py-2 px-4">
            {singleJob?.salary} LPA
          </Badge>
        </div>
      </div>
      <Button
        onClick={applyJobHandler}
        disabled={isApplied}
        className={`rounded-lg py-3 px-6 ${isApplied ? 'bg-gray-500 text-white cursor-not-allowed' : 'bg-[#7209b7] hover:bg-[#5f32ad] text-white'}`}
      >
        {isApplied ? 'Already Applied' : 'Apply Now'}
      </Button>
    </div>
    
    <h2 className="text-xl font-medium text-gray-800 border-b-2 border-gray-300 py-4 mb-6">Job Description</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="text-lg font-bold text-gray-700">
        <span>Role:</span>
        <span className="pl-4 text-gray-800">{singleJob?.title}</span>
      </div>
      <div className="text-lg font-bold text-gray-700">
        <span>Company:</span>
        <span className="pl-4 text-gray-800">{singleJob?.companyName || 'Not Available'}</span>
      </div>
      <div className="text-lg font-bold text-gray-700">
        <span>Job Type:</span>
        <span className="pl-4 text-gray-800">{singleJob?.jobType}</span>
      </div>
      <div className="text-lg font-bold text-gray-700">
        <span>Location:</span>
        <span className="pl-4 text-gray-800">{singleJob?.location}</span>
      </div>
      <div className="text-lg font-bold text-gray-700">
        <span>Description:</span>
        <span className="pl-4 text-gray-800">{singleJob?.description}</span>
      </div>
      <div className="text-lg font-bold text-gray-700">
        <span>Responsibilities:</span>
        <span className="pl-4 text-gray-800">{singleJob?.responsibilities}</span>
      </div>
      <div className="text-lg font-bold text-gray-700">
        <span>Qualifications:</span>
        <span className="pl-4 text-gray-800">{singleJob?.qualifications}</span>
      </div>
      <div className="text-lg font-bold text-gray-700">
        <span>Salary:</span>
        <span className="pl-4 text-gray-800">{singleJob?.salary} LPA</span>
      </div>
      <div className="text-lg font-bold text-gray-700">
        <span>Job Niche:</span>
        <span className="pl-4 text-gray-800">{singleJob?.jobNiche}</span>
      </div>
      <div className="text-lg font-bold text-gray-700">
        <span>Industry:</span>
        <span className="pl-4 text-gray-800">{singleJob?.industry}</span>
      </div>
      <div className="text-lg font-bold text-gray-700">
        <span>Position:</span>
        <span className="pl-4 text-gray-800">{singleJob?.position}</span>
      </div>
      <div className="text-lg font-bold text-gray-700">
        <span>Posted Date:</span>
        <span className="pl-4 text-gray-800">{singleJob?.createdAt?.split('T')[0]}</span>
      </div>
    </div>
    <div className="mt-6 text-lg font-bold text-gray-700">
      <span>Total Applicants:</span>
      <span className="pl-4 text-gray-800">{singleJob?.applications?.length}</span>
    </div>
  </div>
);
};

export default JobDescription;
