import React from 'react';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';

const LatestEventCards = ({ event }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/event-description/${event?._id}`)}
            className="p-5 rounded-md shadow-xl bg-white border border-gray-100 cursor-pointer"
        >
            <div>
                <h1 className="font-medium text-lg">{event?.host?.name}</h1>
                <p className="text-sm text-gray-500">{event?.location}</p>
            </div>
            <div>
                <h1 className="font-bold text-lg my-2">{event?.title}</h1>
                <p className="text-sm text-gray-600">{event?.description}</p>
            </div>
            <div className="flex items-center gap-2 mt-4">
                <Badge className="text-[#F83002] font-bold" variant="ghost">
                    {event?.eventType}
                </Badge>
                <Badge className="text-[#7209b7] font-bold" variant="ghost">
                    {new Date(event?.date).toLocaleDateString()}
                </Badge>
            </div>
        </div>
    );
};

export default LatestEventCards;
