import React from 'react';

const filterData = [
  { filterType: "Job Type", array: ["Full-time", "Part-time", "Contract", "Internship"] },
  { filterType: "Salary", array: ["0-40000", "40000-100000", "100000-500000", "500000-1000000"] },
  { filterType: "Location", array: ["Remote", "Onsite"] }, // Updated to Remote and Onsite
  { filterType: "Industry", array: ["Education", "Tech", "Marketing", "Health", "Other"] },
  { filterType: "Title", array: [
      "DevOps Engineer",
      "Data Scientist",
      "Software Engineer",
      "Frontend Developer",
      "Backend Engineer",
      "Graphic Designer",
      "FullStack Developer",
      "AI Engineer",
      "Product Manager",
      "UX/UI Designer",
      "Marketing Specialist",
      "Cloud Architect",
      "Blockchain Developer",
      "Cybersecurity Specialist",
      "Business Analyst",
      "Other"
    ] },
];

const FilterCard = ({ filters, onFilterChange }) => {
  return (
    <div className="w-full bg-white p-3 rounded-md">
      <h1 className="font-bold text-lg">Filter Jobs</h1>
      <hr className="mt-3" />
      {filterData.map((filter, index) => (
        <div key={index} className="mb-4">
          <h3 className="font-semibold text-md">{filter.filterType}</h3>
          {/* Render radio buttons or dropdown */}
          {["Job Type", "Salary", "Location"].includes(filter.filterType) ? (
            filter.array.map((item, idx) => {
              const itemId = `${filter.filterType}-${idx}`;
              return (
                <div key={idx} className="flex items-center space-x-2 my-1">
                  <input
                    type="radio"
                    id={itemId}
                    name={filter.filterType}
                    value={item}
                    checked={filters[filter.filterType] === item}
                    onChange={() => onFilterChange(filter.filterType, item)}
                  />
                  <label htmlFor={itemId}>{item}</label>
                </div>
              );
            })
          ) : (
            <select
              className="w-full mt-2 p-2 border rounded-md"
              value={filters[filter.filterType]}
              onChange={(e) => onFilterChange(filter.filterType, e.target.value)}
            >
              <option value="">Select {filter.filterType}</option>
              {filter.array.map((item, idx) => (
                <option key={idx} value={item}>
                  {item}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}
    </div>
  );
};

export default FilterCard;
