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
  const { singleJob } = useSelector((store) => store.job);
  const { user, token } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();
  const jobId = params.id;

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
          headers: { Authorization: `Bearer ${token}` },
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
        navigate("/login");
      } else {
        toast.error(errorMessage);
      }
    }
  };

  useEffect(() => {
    const fetchSingleJob = async () => {
      try {
        const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
          withCredentials: true,
        });
        if (res.data.success) {
          const jobData = res.data.job;
          const isJobApplied = user && jobData.applications.some(
            (application) => application.applicant?.toString() === user?._id.toString()
          );
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

  const isApplied = singleJob?.isApplied || false;
  const goBack = () => navigate(-1);

  return (
    <div className="max-w-4xl mx-auto my-12 p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 transition-all duration-300 hover:shadow-2xl">
      {/* Header & Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
        <Button 
          onClick={goBack} 
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-full transition-all duration-200 flex items-center gap-2"
        >
          <span>←</span> Back
        </Button>
        <Button
          onClick={applyJobHandler}
          disabled={isApplied}
          className={`w-full sm:w-auto py-2 px-8 rounded-full font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
            isApplied ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isApplied ? 'Applied ✓' : 'Apply Now →'}
        </Button>
      </div>

      {/* Job Header */}
      <div className="mb-10 pb-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">{singleJob?.title}</h1>
        <div className="flex flex-wrap gap-3">
          <Badge className="bg-blue-100 text-blue-800 font-medium px-3 py-1 rounded-full">📊 {singleJob?.position} Positions</Badge>
          <Badge className="bg-red-100 text-red-800 font-medium px-3 py-1 rounded-full">⏰ {singleJob?.jobType}</Badge>
          <Badge className="bg-purple-100 text-purple-800 font-medium px-3 py-1 rounded-full">💰 {singleJob?.salary} LPA</Badge>
        </div>
      </div>

      {/* Job Details */}
      <section className="space-y-10">
        <h2 className="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Job Details</h2>
        
        {/* Description */}
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
            <span className="text-indigo-500">📝</span> Description
          </p>
          <p className="text-gray-700 leading-relaxed pl-6">{singleJob?.description}</p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">👩‍💻</span>
              <div>
                <span className="text-sm font-medium text-gray-600">Role</span>
                <p className="text-gray-800">{singleJob?.title}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500 mt-1">🏢</span>
              <div>
                <span className="text-sm font-medium text-gray-600">Company</span>
                <p className="text-gray-800">{singleJob?.companyName || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-500 mt-1">⏳</span>
              <div>
                <span className="text-sm font-medium text-gray-600">Job Type</span>
                <p className="text-gray-800">{singleJob?.jobType}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow-500 mt-1">📍</span>
              <div>
                <span className="text-sm font-medium text-gray-600">Location</span>
                <p className="text-gray-800">{singleJob?.location}</p>
              </div>
            </div>
          </div>
          <div className="space-y-5">
            <div className="flex items-start gap-2">
              <span className="text-purple-500 mt-1">📅</span>
              <div>
                <span className="text-sm font-medium text-gray-600">Posted</span>
                <p className="text-gray-800">{singleJob?.createdAt?.split('T')[0]}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-teal-500 mt-1">🏭</span>
              <div>
                <span className="text-sm font-medium text-gray-600">Industry</span>
                <p className="text-gray-800">{singleJob?.industry}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-pink-500 mt-1">🎯</span>
              <div>
                <span className="text-sm font-medium text-gray-600">Job Niche</span>
                <p className="text-gray-800">{singleJob?.jobNiche}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-500 mt-1">👥</span>
              <div>
                <span className="text-sm font-medium text-gray-600">Positions</span>
                <p className="text-gray-800">{singleJob?.position}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Responsibilities & Qualifications */}
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
              <span className="text-indigo-500">✅</span> Responsibilities
            </p>
            <p className="text-gray-700 leading-relaxed pl-6">{singleJob?.responsibilities}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
              <span className="text-indigo-500">🎓</span> Qualifications
            </p>
            <p className="text-gray-700 leading-relaxed pl-6">{singleJob?.qualifications}</p>
          </div>
        </div>
      </section>

      {/* Applicants */}
      <div className="mt-10 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-indigo-500">👤</span>
          <span className="text-sm font-medium text-gray-600">Total Applicants:</span>
          <span className="text-gray-800 font-semibold">{singleJob?.applications?.length || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default JobDescription;