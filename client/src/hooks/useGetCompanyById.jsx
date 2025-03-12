import { setSingleCompany } from '@/redux/companySlice';
import { COMPANY_API_END_POINT } from '@/utils/constant';
import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const useGetCompanyById = (companyId) => {
    const dispatch = useDispatch();
    const token = useSelector((state) => state.auth.token); // Get token from Redux

    useEffect(() => {
        const fetchSingleCompany = async () => {
            try {
                // Add Authorization header with token
                const res = await axios.get(`${COMPANY_API_END_POINT}/get/${companyId}`, {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${token}`, // Use token from Redux
                    },
                });

                console.log(res.data.company);
                if (res.data.success) {
                    dispatch(setSingleCompany(res.data.company)); // Dispatch data to Redux store
                }
            } catch (error) {
                console.error('Error fetching company by ID:', error);
            }
        };

        if (token) { // Only fetch if token exists
            fetchSingleCompany();
        } else {
            console.error('No token found');
        }
    }, [companyId, dispatch, token]); // Re-run if companyId or token changes
};

export default useGetCompanyById;
