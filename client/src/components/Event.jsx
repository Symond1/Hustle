import React from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';

const Event = ({ event }) => {
  const navigate = useNavigate();

  const formatDate = (mongodbTime) => {
    if (!mongodbTime) return 'Date not available';
    const createdAt = new Date(mongodbTime);
    return createdAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (mongodbTime) => {
    if (!mongodbTime) return 'Time not available';
    const eventTime = new Date(mongodbTime);
    return eventTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  return (
    <div className="p-4 rounded-2xl shadow-md bg-white border border-gray-200 hover:shadow-lg transition-shadow duration-300 w-80 h-auto min-h-[300px] max-h-[400px] flex flex-col justify-between mb-8 mx-2">
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            Posted on {formatDate(event?.eventDate)}
          </p>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex-shrink-0">
            <Avatar className="rounded-full">
              <AvatarImage src={event?.company?.logo || '/default-logo.png'} alt={event?.company?.name || 'Company'} className="rounded-full" />
            </Avatar>
          </div>
          <div>
            <p className="text-sm text-gray-500">{event?.location || 'Location not available'}</p>
          </div>
        </div>

        <div className="mb-4">
          <h1 className="font-bold text-lg text-gray-900">{event?.eventTitle || 'Event Title'}</h1>
          <p className="text-sm text-gray-600 mt-2 line-clamp-3">{event?.eventDescription || 'No description available.'}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge className="text-blue-700 font-semibold" variant="ghost">
            {event?.eventCategory || 'Category'}
          </Badge>
          <Badge className="text-[#F83002] font-semibold" variant="ghost">
            {event?.eventPrice ? `$${event.eventPrice}` : 'Free'}
          </Badge>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          <p>Organizer: {event?.Organizer || 'Organizer not available'}</p>
          <p>Start Time: {formatTime(event?.eventStartTime)}</p>
        </div>
      </div>

      <div className="flex items-center justify-start">
        <Button
          onClick={() => navigate(`/event/${event?._id}`)}
          className="bg-black text-white hover:bg-gray-800 rounded-md py-2 px-5 text-base transition-colors duration-300"
        >
          View Details
        </Button>
      </div>
    </div>
  );
};

export default Event;
