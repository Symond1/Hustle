import { useState, useEffect } from 'react';
import { setAllAppliedJobs } from "@/redux/jobSlice";
import { APPLICATION_API_END_POINT } from "@/utils/constant";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";

const useGetAppliedJobs = () => {
    const dispatch = useDispatch();
    const { token } = useSelector((store) => store.auth); // Ensure the token is correctly fetched from redux
    const { allAppliedJobs } = useSelector((store) => store.job); // Redux state to check applied jobs

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAppliedJobs = () => {
            axios
                .get("http://localhost:8000/api/v1/application/applied", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true,
                })
                .then((res) => {
                    console.log("API Response:", res.data); // For debugging

                    if (res.data.success) {
                        dispatch(setAllAppliedJobs(res.data.applications)); // Ensure it's applications
                    } else {
                        setError("Failed to fetch applied jobs.");
                    }
                })
                .catch((err) => {
                    console.error(err);
                    setError(err.response ? err.response.data.message : "Failed to fetch applied jobs.");
                });
        };

        fetchAppliedJobs();
    }, [dispatch, token]); // Re-fetch when token changes

    return { allAppliedJobs, loading, error }; // Return applied jobs from Redux
};

export default useGetAppliedJobs;