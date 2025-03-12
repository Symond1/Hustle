import React, { useEffect } from 'react';
import Navbar from '../shared/Navbar';
import ApplicantsTable from './ApplicantsTable';
import axios from 'axios';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAllApplicants } from '@/redux/applicationSlice';

const Applicants = () => {
    const { jobId } = useParams(); 
   
    const dispatch = useDispatch();
    const { applicants } = useSelector(store => store.application);

    useEffect(() => {
        const fetchAllApplicants = async () => {
            const token = localStorage.getItem("token");
        
        
            if (!token) {
                console.error("Token is missing! Redirecting to login.");
                window.location.href = "/login"; 
                return;
            }
        
            try {
                const res = await axios.get(`${APPLICATION_API_END_POINT}/${jobId}/applicants`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    withCredentials: true, 
                });
        
              
                if (res.data?.applicants) {
                    dispatch(setAllApplicants(res.data.applicants));
                }
            } catch (error) {
                console.error("Error fetching applicants:", error.response?.data || error.message);
            }
        };
    
        fetchAllApplicants();
    }, [jobId, dispatch]);

    return (
        <div>
            <Navbar />
            <div className='max-w-7xl mx-auto'>
                <h1 className='font-bold text-xl my-5'>Applicants ({applicants?.length || 0})</h1>
                
                <ApplicantsTable jobId={jobId} />
            </div>
        </div>
    );
};

export default Applicants;
