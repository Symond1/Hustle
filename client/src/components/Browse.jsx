import React, { useEffect } from 'react';
import Navbar from './shared/Navbar';
import Job from './Job';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import useGetAllJobs from '@/hooks/useGetAllJobs';

const Browse = () => {
    const { allJobs, searchedQuery } = useSelector((store) => store.job);
    const dispatch = useDispatch();

    // Fetch jobs based on search query or on initial load
    useGetAllJobs(); // Automatically fetch jobs based on the search query or initial load

    useEffect(() => {
        return () => {
            dispatch(setSearchedQuery('')); // Clear search query on component unmount
        };
    }, [dispatch]);

    // Ensure searchedQuery is a string before using .toLowerCase()
    const query = typeof searchedQuery === 'string' ? searchedQuery.toLowerCase() : '';

    // Filter the jobs based on the searchedQuery
    const filteredJobs = allJobs.filter((job) =>
        job.title.toLowerCase().includes(query)
    );

    // Handle the change in search input
    const handleSearchChange = (e) => {
        dispatch(setSearchedQuery(e.target.value)); // Dispatch search query to Redux
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <Navbar />
            <div className="max-w-7xl mx-auto my-10 px-4">
                {/* Search Bar */}
                <div className="mb-8 flex justify-center">
                    <input
                        type="text"
                        placeholder="Search jobs by title..."
                        value={searchedQuery}
                        onChange={handleSearchChange}
                        className="p-4 w-full sm:w-3/4 lg:w-2/3 xl:w-1/2 border-2 border-indigo-500 rounded-full shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all"
                    />
                </div>
                <h1 className="font-bold text-2xl my-5 text-center">
                    Search Results ({filteredJobs.length})
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {filteredJobs.length > 0 ? (
                        filteredJobs.map((job) => <Job key={job._id} job={job} />)
                    ) : (
                        <p className="text-center text-xl text-gray-500">No jobs found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Browse;
