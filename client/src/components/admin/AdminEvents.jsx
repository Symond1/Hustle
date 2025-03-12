import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AdminEventsTable from './AdminEventsTable'; // Create this table component
import useGetAllEvents from '@/hooks/useGetAllEvents'; // Hook for fetching all events
import { setSearchEventByText } from '@/redux/eventSlice'; // Redux action for search filter

const AdminEvents = () => {
  const dispatch = useDispatch();
  const [input, setInput] = useState("");
  const { searchEventByText } = useSelector((store) => store.event); // Access event search state
  const navigate = useNavigate();

  useGetAllEvents(); // Fetch all events using the provided hook

  useEffect(() => {
    if (input !== searchEventByText) {
      dispatch(setSearchEventByText(input)); // Update search text in Redux
    }
  }, [input, searchEventByText, dispatch]);

  return (
    <div>
      <Navbar />
      <div className='max-w-6xl mx-auto my-10'>
        <div className='flex items-center justify-between my-5'>
          <Button onClick={() => navigate("/admin/events/create")}>New Event</Button> {/* Navigate to event creation */}
        </div>
        <AdminEventsTable /> {/* Table component to display events */}
      </div>
    </div>
  );
};

export default AdminEvents;
