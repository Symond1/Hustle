import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';

const Job = ({ job }) => {
  const navigate = useNavigate();

  const formatDate = (mongodbTime) => {
    const createdAt = new Date(mongodbTime);
    return createdAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 w-full max-w-sm flex flex-col justify-between h-[340px] mx-auto">
      {/* Header Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500 font-medium">
            {job?.createdAt ? formatDate(job?.createdAt) : "Date not available"}
          </p>
          {/* New Badge for recently posted jobs */}
          {job?.createdAt && new Date(job.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
            <Badge className="bg-green-50 text-green-700 font-medium px-2 py-0.5 rounded-full text-xs">
              New
            </Badge>
          )}
        </div>

        {/* Company Info without logo */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-gray-800 hover:text-purple-600 transition-colors duration-200 cursor-pointer line-clamp-1">
              {job?.companyName || "Company Name"}
            </h1>
            {/* Premium Company Badge */}
            {job?.premium && (
              <Badge className="bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-full text-xs">
                Premium
              </Badge>
            )}
          </div>
          <div className="flex flex-col gap-1">
            {/* Location */}
            <div className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 2.637C4.2 3.324 3.5 4.316 3.5 5.5 3.5 7.709 5.291 9.5 7.5 9.5s4-1.791 4-4c0-1.184-.7-2.176-1.55-2.863A7.003 7.003 0 0010 0C5.581 0 2 3.582 2 8s3.581 8 8 8 8-3.582 8-8a7.003 7.003 0 00-2.45-5.363z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-xs text-gray-500">{job?.location || "India"}</p>
            </div>
            {/* Email */}
            <div className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v1H2V5z" />
                <path
                  fillRule="evenodd"
                  d="M2 8h16v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8zm2-1h12a1 1 0 00-.117-.993L15 6H5a1 1 0 00-.993.883L4 7z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-xs text-gray-500">{job?.email || "contact@example.com"}</p>
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 line-clamp-1">
              {job?.title || "Job Title"}
            </h1>
            {/* Urgent Badge */}
            {job?.urgent && (
              <Badge className="bg-red-50 text-red-700 font-medium px-2 py-0.5 rounded-full text-xs">
                Urgent
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {job?.description || "No description available"}
          </p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <Badge className="bg-purple-50 text-purple-700 font-medium px-2 py-0.5 rounded-full text-xs">
            {job?.position || "N/A"} Positions
          </Badge>
          <Badge className="bg-red-50 text-red-700 font-medium px-2 py-0.5 rounded-full text-xs">
            {job?.jobType || "N/A"}
          </Badge>
          <Badge className="bg-purple-50 text-purple-700 font-medium px-2 py-0.5 rounded-full text-xs">
            {job?.salary || "N/A"}
          </Badge>
          {job?.featured && (
            <Badge className="bg-yellow-50 text-yellow-700 font-medium px-2 py-0.5 rounded-full text-xs">
              Featured
            </Badge>
          )}
        </div>
      </div>

      {/* Button */}
      <div className="mt-0.5">
        <Button
          onClick={() => navigate(`/description/${job?._id}`)}
          className="w-full rounded-full bg-black hover:bg-gray-800 text-white px-4 py-2 text-sm font-semibold transition-all duration-300"
        >
          View Details
        </Button>
      </div>
    </div>
  );
};

export default Job;