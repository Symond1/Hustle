import { setAllEvents } from '@/redux/eventSlice'; // Correct Redux action
import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const useGetAllEvents = () => {
    const dispatch = useDispatch();
    const token = useSelector((state) => state.auth.token); // Get token from Redux

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/v1/event/', { // Use your API endpoint
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${token}`, // Pass the token for authentication
                    },
                });

                if (res.data.success) {
                    dispatch(setAllEvents(res.data.events)); // Use the correct action `setAllEvents`
                }
            } catch (error) {
                console.error('Error fetching events:', error.response?.data?.message || error.message);
            }
        };

        if (token) { // Fetch only if the token is available
            fetchEvents();
        } else {
            console.error('No token found. Cannot fetch events.');
        }
    }, [dispatch, token]); // Rerun when `dispatch` or `token` changes
};

export default useGetAllEvents;
