import React from 'react';

const filterData = [
    { filterType: "Job Type", array: ["Full-time", "Part-time", "Contract", "Internship"] },
    { filterType: "Salary", array: ["0-40000", "40000-100000", "100000-500000", "500000-1000000"] },
    { filterType: "Location", array: ["Remote", "Onsite"] },
    { filterType: "Industry", array: ["Education", "Tech", "Marketing", "Health", "Other"] },
    {
        filterType: "Title",
        array: [
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
            "Other",
        ],
    },
];

const FilterCard = ({ filters, onFilterChange }) => {
    return (
        <div className="w-full bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            {/* Header */}
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-purple-500">🔍</span> Filter Jobs
            </h1>
            <hr className="my-3 border-gray-200" />

            {/* Filter Sections */}
            <div className="space-y-4">
                {filterData.map((filter, index) => (
                    <div key={index} className="space-y-2">
                        <h3 className="text-sm font-semibold text-gray-800">{filter.filterType}</h3>
                        {["Job Type", "Salary", "Location"].includes(filter.filterType) ? (
                            <div className="space-y-1">
                                {filter.array.map((item, idx) => {
                                    const itemId = `${filter.filterType}-${idx}`;
                                    return (
                                        <div key={idx} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                id={itemId}
                                                name={filter.filterType}
                                                value={item}
                                                checked={filters[filter.filterType] === item}
                                                onChange={() => onFilterChange(filter.filterType, item)}
                                                className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                                            />
                                            <label
                                                htmlFor={itemId}
                                                className="text-sm font-medium text-gray-800 hover:text-purple-600 transition-colors duration-200"
                                            >
                                                {item}
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <select
                                className="w-full p-2 bg-white border border-gray-200 rounded-md text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-500 transition-all duration-300"
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
        </div>
    );
};

export default FilterCard;