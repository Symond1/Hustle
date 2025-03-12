import { setAllAdminJobs } from '@/redux/jobSlice';
import { JOB_API_END_POINT } from '@/utils/constant';
import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const useGetAllAdminJobs = () => {
    const dispatch = useDispatch();
    const token = useSelector((state) => state.auth.token); // Get token from Redux

    useEffect(() => {
        const fetchAllAdminJobs = async () => {
            try {
                // Add Authorization header with token
                const res = await axios.get(`${JOB_API_END_POINT}/getadminjobs`, {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${token}`, // Use token from Redux
                    },
                });

                if (res.data.success) {
                    dispatch(setAllAdminJobs(res.data.jobs)); // Dispatch data to Redux store
                }
            } catch (error) {
                console.error('Error fetching admin jobs:', error);
            }
        };

        if (token) { // Only fetch if token exists
            fetchAllAdminJobs();
        } else {
            console.error('No token found');
        }
    }, [dispatch, token]); // Re-run if token changes
};

export default useGetAllAdminJobs;
