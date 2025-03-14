import React, { useEffect } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { EVENT_API_END_POINT } from '@/utils/constant';
import { setSingleEvent } from '@/redux/eventSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

const EventDescription = () => {
  const { singleEvent } = useSelector((store) => store.event); // Get event details from Redux
  const { user, token } = useSelector((store) => store.auth); // Get user info from Redux
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Initialize the navigate function
  const params = useParams();
  const eventId = params.id;

  useEffect(() => {
    const fetchSingleEvent = async () => {
      try {
        // API call to fetch event details
        const res = await axios.get(`${EVENT_API_END_POINT}/${eventId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        if (res.data.success) {
          const eventData = res.data.event;
          dispatch(setSingleEvent(eventData));
        } else {
          toast.error(res.data.message || 'Failed to fetch event details');
          console.error('Backend Response Error:', res.data.message);
        }
      } catch (error) {
        console.error('API Error:', error.response || error.message);
        toast.error(
          error.response?.data?.message || 'Error fetching event details. Please try again.'
        );
      }
    };

    if (eventId) fetchSingleEvent(); // Only fetch if eventId exists
  }, [eventId, dispatch, token]);

  const goBack = () => {
    navigate(-1); // This will navigate back to the previous page
  };

  if (!singleEvent) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto my-10 bg-white p-6 rounded-lg shadow-lg">
      {/* Back Button */}
      <Button onClick={goBack} className="mb-4">Back</Button>

      <div className="flex items-center justify-between border-b-2 pb-4 mb-6 border-gray-300">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{singleEvent?.eventTitle}</h1>
          <div className="flex items-center gap-2 mt-4">
            <Badge className="text-blue-700 font-bold bg-blue-100 rounded-full py-2 px-4">
              {singleEvent?.eventType}
            </Badge>
            <Badge className="text-[#F83002] font-bold bg-[#F83002] text-white rounded-full py-2 px-4">
              {singleEvent?.eventCategory}
            </Badge>
            <Badge className="text-[#7209b7] font-bold bg-[#7209b7] text-white rounded-full py-2 px-4">
              ${singleEvent?.eventPrice}
            </Badge>
          </div>
        </div>
      </div>
      
      <h2 className="text-xl font-medium text-gray-800 border-b-2 border-gray-300 py-4 mb-6">Event Details</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="text-lg font-bold text-gray-700">
          <span>Event Title:</span>
          <span className="pl-4 text-gray-800">{singleEvent?.eventTitle}</span>
        </div>
        <div className="text-lg font-bold text-gray-700">
          <span>Event Type:</span>
          <span className="pl-4 text-gray-800">{singleEvent?.eventType}</span>
        </div>
        <div className="text-lg font-bold text-gray-700">
          <span>Location:</span>
          <span className="pl-4 text-gray-800">{singleEvent?.location}</span>
        </div>
        <div className="text-lg font-bold text-gray-700">
          <span>Description:</span>
          <span className="pl-4 text-gray-800">{singleEvent?.eventDescription}</span>
        </div>
        <div className="text-lg font-bold text-gray-700">
          <span>Event Date:</span>
          <span className="pl-4 text-gray-800">{new Date(singleEvent?.eventDate).toLocaleDateString()}</span>
        </div>
        <div className="text-lg font-bold text-gray-700">
          <span>Start Time:</span>
          <span className="pl-4 text-gray-800">{new Date(singleEvent?.eventStartTime).toLocaleTimeString()}</span>
        </div>
        <div className="text-lg font-bold text-gray-700">
          <span>Registration Deadline:</span>
          <span className="pl-4 text-gray-800">{new Date(singleEvent?.registrationDeadline).toLocaleString()}</span>
        </div>
        <div className="text-lg font-bold text-gray-700">
          <span>Price:</span>
          <span className="pl-4 text-gray-800">${singleEvent?.eventPrice}</span>
        </div>
      </div>
    </div>
  );
};

export default EventDescription;
