import React, { useEffect, useState } from 'react';
import Navbar from './shared/Navbar';
import Job from './Job';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import { Calendar, Wallet, Tag } from 'lucide-react';

const Browse = () => {
  const { allJobs, searchedQuery } = useSelector((store) => store.job);
  const dispatch = useDispatch();

  // State for the sorting dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sortOption, setSortOption] = useState("Sort by Job Type");

  useGetAllJobs(); // Fetch jobs on initial load or when the query changes

  useEffect(() => {
    return () => {
      dispatch(setSearchedQuery(''));
    };
  }, [dispatch]);

  // Ensure searchedQuery is a string before using .toLowerCase()
  const query = typeof searchedQuery === 'string' ? searchedQuery.toLowerCase() : '';

  // Filter jobs by title first
  let filteredJobs = allJobs.filter(job =>
    job.title.toLowerCase().includes(query)
  );

  // Apply sorting based on the selected option
  if (sortOption === "Sort by Job Type") {
    filteredJobs = filteredJobs.sort((a, b) =>
      a.jobType.localeCompare(b.jobType)
    );
  } else if (sortOption === "Sort by Posted Date") {
    filteredJobs = filteredJobs.sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  } else if (sortOption === "Sort by Number of Positions") {
    filteredJobs = filteredJobs.sort((a, b) =>
      b.position - a.position
    );
  }

  const handleSearchChange = (e) => {
    dispatch(setSearchedQuery(e.target.value));
  };

  const sortJobs = (option) => {
    setSortOption(option);
    setDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      <Navbar />
      <div className="max-w-6xl mx-auto mt-10 px-4 sm:px-6 lg:px-8">
        {/* Dropdown for sorting */}
        <div className="flex justify-end mb-6 relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1 bg-white border border-gray-300 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <span className="text-sm font-medium text-gray-800">{sortOption}</span>
            <span className="text-lg">&#9662;</span>
          </button>
          {dropdownOpen && (
            <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-10">
              <button
                onClick={() => sortJobs("Sort by Job Type")}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
              >
                <Tag className="h-4 w-4" />
                <span className="text-sm text-gray-700">Sort by Job Type</span>
              </button>
              <button
                onClick={() => sortJobs("Sort by Posted Date")}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                <span className="text-sm text-gray-700">Sort by Posted Date</span>
              </button>
              <button
                onClick={() => sortJobs("Sort by Number of Positions")}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
              >
                <Wallet className="h-4 w-4" />
                <span className="text-sm text-gray-700">Sort by Number of Positions</span>
              </button>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-10 flex justify-center">
          <input
            type="text"
            placeholder="Search jobs by title..."
            value={searchedQuery}
            onChange={handleSearchChange}
            className="p-4 w-full sm:w-3/4 lg:w-2/3 xl:w-1/2 border-2 border-black rounded-full shadow-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-300 transition-all"
          />
        </div>

        <h1 className="font-bold text-2xl my-5 text-center">
          Search Results ({filteredJobs.length})
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => <Job key={job._id} job={job} />)
          ) : (
            <p className="col-span-full text-center text-xl text-gray-500">No jobs found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Browse;
