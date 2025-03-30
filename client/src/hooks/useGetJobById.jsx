import { setSingleJob } from '@/redux/jobSlice';
import { JOB_API_END_POINT } from '@/utils/constant';
import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const useGetJobById = (jobId) => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token); // Get token from Redux

  useEffect(() => {
    const fetchSingleJob = async () => {
      if (!jobId) {
        console.error('Job ID is undefined, skipping fetch.');
        return;
      }
      try {
        const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log(res.data.job);
        if (res.data.success) {
          dispatch(setSingleJob(res.data.job)); // Dispatch job data to Redux store
        }
      } catch (error) {
        console.error('Error fetching job by ID:', error);
      }
    };

    if (token && jobId) {
      fetchSingleJob();
    } else {
      if (!token) console.error('No token found');
      if (!jobId) console.error('Job ID is undefined');
    }
  }, [jobId, dispatch, token]);
};

export default useGetJobById;
