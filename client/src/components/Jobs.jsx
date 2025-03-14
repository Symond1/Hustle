
import React, { useEffect, useState } from 'react';
import Navbar from './shared/Navbar';
import FilterCard from './FilterCard';
import Job from './Job';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

const Jobs = () => {
  const { allJobs, searchedQuery } = useSelector(store => store.job);
  const [filterJobs, setFilterJobs] = useState(allJobs);
  const [filters, setFilters] = useState({
    "Job Type": "",
    "Salary": "",
    "Location": "",
    "Industry": "",
    "Title": "",
  });

  const applyFilters = () => {
    let filteredJobs = allJobs;

    // Apply searchedQuery filter (case-insensitive)
    if (searchedQuery) {
      const lowercasedQuery = searchedQuery.toLowerCase();
      filteredJobs = filteredJobs.filter((job) => {
        return job.title.toLowerCase().includes(lowercasedQuery) ||
          job.description.toLowerCase().includes(lowercasedQuery) ||
          job.location.toLowerCase().includes(lowercasedQuery) ||
          job.jobType?.toLowerCase().includes(lowercasedQuery) ||
          job.salary?.toLowerCase().includes(lowercasedQuery) ||
          job.companyName?.toLowerCase().includes(lowercasedQuery);
      });
    }

    // Apply filters
    filteredJobs = filteredJobs.filter((job) => {
      const salary = job.salary ? Number(job.salary) : null;
      const jobType = job.jobType ? String(job.jobType) : "";
      const industry = job.industry ? String(job.industry).toLowerCase().trim() : "";
      const title = job.title ? String(job.title).toLowerCase().trim() : "";
      const location = job.location ? String(job.location).toLowerCase() : "";

      // Salary filter
      let salaryMatch = true;
      if (filters["Salary"]) {
        const [minSalary, maxSalary] = filters["Salary"].split('-').map(Number);
        if (salary !== null) {
          salaryMatch = salary >= minSalary && (maxSalary ? salary <= maxSalary : true);
        }
      }

      // Location filter logic
      const locationMatch = filters["Location"] === "Remote"
        ? location === "remote"
        : filters["Location"] === "Onsite"
          ? location !== "remote"
          : true;

      // Industry and Title filter logic
      const industryMatch = filters["Industry"] === "Other"
        ? !["education", "tech", "marketing", "health"].includes(industry)
        : filters["Industry"]
          ? industry.includes(filters["Industry"].toLowerCase())
          : true;

      const titleMatch = filters["Title"] === "Other"
        ? ![
          "devops engineer", "data scientist", "software engineer",
          "frontend developer", "backend Engineer", "graphic designer",
          "fullstack developer", "ai engineer", "product manager",
          "ux/ui designer", "marketing specialist", "cloud architect",
          "blockchain developer", "cybersecurity specialist", "business analyst"
        ].includes(title)
        : filters["Title"]
          ? title.includes(filters["Title"].toLowerCase())
          : true;

      return salaryMatch && locationMatch && industryMatch && titleMatch && jobType.toLowerCase().includes(filters["Job Type"].toLowerCase());
    });

    setFilterJobs(filteredJobs);
  };

  useEffect(() => {
    applyFilters();
  }, [allJobs, searchedQuery, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      "Job Type": "",
      "Salary": "",
      "Location": "",
      "Industry": "",
      "Title": "",
    });
  };

  return (
    <div>
      <Navbar />
      <div className='max-w-7xl mx-auto mt-5'>
        <div className='flex gap-5'>
          <div className='w-1/5'>
            <FilterCard filters={filters} onFilterChange={handleFilterChange} />
            <button
              onClick={resetFilters}
              className="mt-2.5 bg-red-500 text-white p-2 rounded-md">
              Reset Filters
            </button>
          </div>
          {
            filterJobs.length <= 0 ? <span>Job not found</span> : (
              <div className='flex-1 h-[88vh] overflow-y-auto pb-5'>
                <div className='grid grid-cols-3 gap-4'>
                  {
                    filterJobs.map((job) => (
                      <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                        key={job?._id}>
                        <Job job={job} />
                      </motion.div>
                    ))
                  }
                </div>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}

export default Jobs;