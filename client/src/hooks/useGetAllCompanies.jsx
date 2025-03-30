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
        // Always call the API; include token header only if token exists
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${COMPANY_API_END_POINT}/get`, {
          withCredentials: true,
          headers,
        });

        console.log('API called');
        if (res.data.success) {
          dispatch(setCompanies(res.data.companies)); // Dispatch data to Redux store
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };

    fetchCompanies();
  }, [dispatch, token]);
};

export default useGetAllCompanies;
