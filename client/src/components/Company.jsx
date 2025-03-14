import React, { useEffect, useState } from "react";
import Navbar from "./shared/Navbar";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { motion } from "framer-motion";
import { setCompanies } from "../redux/companySlice";
import { toast } from "sonner";

const Company = () => {
  const { companies } = useSelector((store) => store.company);
  const { token, user } = useSelector((store) => store.auth);
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useDispatch();
  const isAdmin = user?.role === "Admin";

  useEffect(() => {
    if (token) fetchCompanies();
  }, [token]);

  const fetchCompanies = async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/api/v1/company/get", {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch(setCompanies(data.company));
    } catch (error) {
      console.error("Error fetching companies:", error.message);
    }
  };

  const handleDisableCompany = async (companyId) => {
    if (!window.confirm("Are you sure you want to disable this company?")) return;
    if (!window.confirm("This action is irreversible. Proceed?")) return;

    try {
      await axios.put(`http://localhost:8000/api/v1/company/disable/${companyId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Company disabled successfully");
      fetchCompanies();
    } catch (error) {
      toast.error("Failed to disable company");
      console.error(error.message);
    }
  };

  const filteredCompanies = companies.filter((company) =>
    company.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto mt-5 p-4">
        {/* Search Bar */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 transition-shadow shadow-sm"
          />
        </div>

        {/* Company List */}
        {filteredCompanies.length === 0 ? (
          <p className="text-center text-gray-600">No companies found.</p>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
            }}
          >
            {filteredCompanies.map((company) => (
              <motion.div
                key={company._id}
                className="p-6 rounded-lg bg-white shadow-md hover:shadow-xl transform transition-all duration-300 border border-gray-200"
                whileHover={{ scale: 1.05 }}
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              >
                {/* Company Header */}
                <div className="flex items-center gap-4">
                  {company.companyLogo ? (
                    <img src={company.companyLogo} alt={company.companyName} className="w-16 h-16 rounded-full shadow-md border" />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-300 text-white text-xl font-bold shadow-md">
                      {company.companyName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h2 className="font-semibold text-xl text-gray-900">{company.companyName}</h2>
                    <a href={company.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                      {company.companyWebsite}
                    </a>
                  </div>
                </div>

                {/* Company Details */}
                <div className="mt-4 space-y-2 text-gray-700 text-sm">
                  <p><strong>Industry:</strong> {company.companyIndustry}</p>
                  <p><strong>Size:</strong> {company.companySize}</p>
                  <p><strong>Location:</strong> {company.location}</p>
                  <p><strong>Email:</strong> {company.contactEmail}</p>
                  <p><strong>Phone:</strong> {company.contactPhone}</p>
                </div>

                {/* Disable Button (Admin Only) */}
                {isAdmin && (
                  <button
                    onClick={() => handleDisableCompany(company._id)}
                    className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                  >
                    Disable Company
                  </button>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Company;
