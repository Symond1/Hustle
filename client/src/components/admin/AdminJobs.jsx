import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AdminJobsTable from './AdminJobsTable'; // Create this table component
import useGetAllJobs from '@/hooks/useGetAllJobs'; // Hook for fetching all jobs
import { setSearchJobByText } from '@/redux/jobSlice'; // Redux action for search filter

const AdminJobs = () => {
  const dispatch = useDispatch();
  const [input, setInput] = useState("");
  const { searchJobByText } = useSelector((store) => store.job); // Access job search state
  const navigate = useNavigate();

  useGetAllJobs(); // Fetch all jobs using the provided hook

  useEffect(() => {
    if (input !== searchJobByText) {
      dispatch(setSearchJobByText(input)); // Update search text in Redux
    }
  }, [input, searchJobByText, dispatch]);

  return (
    <div>
      <Navbar />
      <div className='max-w-6xl mx-auto my-10'>
        <div className='flex items-center justify-between my-5'>
          <Button onClick={() => navigate("/admin/jobs/create")}>New Job</Button> {/* Navigate to job creation */}
        </div>
        <AdminJobsTable /> {/* Table component to display jobs */}
      </div>
    </div>
  );
};

export default AdminJobs;
