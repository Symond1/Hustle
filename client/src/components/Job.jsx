import React from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarImage } from './ui/avatar';
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
        <div className='p-4 rounded-2xl shadow-md bg-white border border-gray-200 hover:shadow-lg transition-shadow duration-300 w-80 h-auto min-h-[300px] max-h-[400px] flex flex-col justify-between mb-8 mx-2'>
            <div>
                <div className='flex items-center justify-between mb-4'>
                    <p className='text-sm text-gray-500'>
                        Posted on {job?.createdAt ? formatDate(job?.createdAt) : "Date not available"}
                    </p>
                </div>

                <div className='flex items-center gap-4 mb-4'>
                    <div className='flex-shrink-0'>
                        <Avatar className="rounded-full"> {/* Circular Avatar container */}
                            <AvatarImage src={job?.company?.logo} alt={job?.company?.name} className="rounded-full" /> {/* Circular Avatar image */}
                        </Avatar>
                    </div>
                    <div>
                        <h1 className='font-semibold text-lg text-gray-800 hover:text-blue-600 transition-colors duration-300'>
                            {job?.companyName} {/* Updated to use companyName */}
                        </h1>
                        <p className='text-sm text-gray-500'>India</p>
                    </div>
                </div>

                <div className='mb-4'>
                    <h1 className='font-bold text-lg text-gray-900'>{job?.title}</h1>
                    <p className='text-sm text-gray-600 mt-2 line-clamp-3'>{job?.description}</p>
                </div>

                <div className='flex flex-wrap items-center gap-2 mb-4'>
                    <Badge className="text-blue-700 font-semibold" variant="ghost">
                        {job?.position} Positions
                    </Badge>
                    <Badge className="text-[#F83002] font-semibold" variant="ghost">
                        {job?.jobType}
                    </Badge>
                    <Badge className="text-[#7209b7] font-semibold" variant="ghost">
                        {job?.salary}
                    </Badge>
                </div>
            </div>

            <div className='flex items-center justify-start'>
                <Button
                    onClick={() => navigate(`/description/${job?._id}`)}
                    className="bg-black text-white hover:bg-gray-800 rounded-md py-2 px-5 text-base transition-colors duration-300"
                >
                    View Details
                </Button>
            </div>
        </div>
    );
};

export default Job;
