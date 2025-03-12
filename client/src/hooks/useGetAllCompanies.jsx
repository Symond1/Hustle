import { setCompanies } from '@/redux/companySlice';
import { COMPANY_API_END_POINT } from '@/utils/constant';
import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const useGetAllCompanies = () => {
    const dispatch = useDispatch();
    const token = useSelector((state) => state.auth.token); // Get token from Redux

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                // Add Authorization header with token
                const res = await axios.get(`${COMPANY_API_END_POINT}/get`, {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${token}`, // Use token from Redux
                    },
                });

                console.log('API called');
                if (res.data.success) {
                    dispatch(setCompanies(res.data.companies)); // Dispatch data to Redux store
                }
            } catch (error) {
                console.error('Error fetching companies:', error);
            }
        };

        if (token) { // Only fetch if token exists
            fetchCompanies();
        } else {
            console.error('No token found');
        }
    }, [dispatch, token]); // Re-run if token changes
};

export default useGetAllCompanies;
