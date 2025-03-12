import React from 'react';
import { Badge } from '../ui/badge';
import { useNavigate } from 'react-router-dom';

const LatestJobCards = ({ job }) => {
    const navigate = useNavigate();

    // Function to format salary to "Lakh"
    const formatSalary = (salary) => (salary / 10000).toFixed(1) + ' Lakh';

    return (
        <div 
            onClick={() => navigate(`/description/${job._id}`)} 
            className="p-5 rounded-2xl shadow-xl bg-white border border-gray-100 cursor-pointer hover:shadow-2xl transition-shadow duration-300"
        >
            <div>
                <p className="text-sm text-gray-500">{job?.location || "India"}</p>
            </div>
            <div>
                <h1 className="font-bold text-lg my-2">{job?.title}</h1>
                <p className="text-sm text-gray-600">{job?.description}</p>
            </div>
            <div className="flex items-center gap-2 mt-4">
                <Badge className="text-[#F83002] font-bold" variant="ghost">
                    {job?.jobType}
                </Badge>
                <Badge className="text-[#7209b7] font-bold" variant="ghost">
                    {formatSalary(job?.salary)}
                </Badge>
            </div>
        </div>
    );
};

export default LatestJobCards;
