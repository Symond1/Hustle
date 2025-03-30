import React, { useEffect, useState } from "react";
import Navbar from "./shared/Navbar";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { motion } from "framer-motion";
import { setCompanies } from "../redux/companySlice";
import { toast } from "sonner";
import { Users, MapPin, Mail, Phone } from "lucide-react";
import { Badge } from "./ui/badge";

const Company = () => {
  const { companies } = useSelector((store) => store.company);
  const { token, user } = useSelector((store) => store.auth);
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [actionType, setActionType] = useState(""); // "disable" or "activate"
  const dispatch = useDispatch();

  // Determine if the user is an admin.
  const isAdmin = user?.role?.toLowerCase() === "admin";

  useEffect(() => {
    dispatch(setCompanies([]));
    fetchCompanies();
  }, [token]);

  const fetchCompanies = async () => {
    try {
      let url = "";
      let config = {};

      // If token exists, use the protected endpoint; otherwise, use the public endpoint.
      if (token) {
        url = "http://localhost:8000/api/v1/company/get";
        config = { headers: { Authorization: `Bearer ${token}` } };
      } else {
        url = "http://localhost:8000/api/v1/company/getcompany";
      }

      const { data } = await axios.get(url, config);
      dispatch(setCompanies(data.company));
    } catch (error) {
      console.error("Error fetching companies:", error.message);
    }
  };

  // Opens the modal and sets the selected company and action type.
  const openConfirmationModal = (companyId, type) => {
    setSelectedCompany(companyId);
    setActionType(type);
    setShowConfirmModal(true);
  };

  // Handles both disable and activate actions.
  const confirmActionCompany = async () => {
    try {
      const endpoint =
        actionType === "disable"
          ? `http://localhost:8000/api/v1/company/disable/${selectedCompany}`
          : `http://localhost:8000/api/v1/company/activate/${selectedCompany}`;
      await axios.put(
        endpoint,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(
        actionType === "disable"
          ? "Company disabled successfully"
          : "Company activated successfully"
      );
      // Refresh companies list after action.
      fetchCompanies();
    } catch (error) {
      toast.error(
        actionType === "disable"
          ? "Failed to disable company"
          : "Failed to activate company"
      );
      console.error(error.message);
    } finally {
      setShowConfirmModal(false);
      setSelectedCompany(null);
      setActionType("");
    }
  };

  // Filtering logic:
  // - If a token exists, check the user role: only non-admins get the filter (active companies only).
  // - If no token exists, show all companies.
  const filteredCompanies = companies
    .filter(company => {
      if (token) {
        return isAdmin ? true : company.status === "active";
      }
      return true;
    })
    .filter(company =>
      company.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="relative mb-8">
          <input
            type="text"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow shadow-md"
          />
        </div>

        {/* Company List */}
        {filteredCompanies.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">No companies found.</p>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
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
                className="bg-white rounded-2xl shadow border border-gray-100 p-6 transition transform hover:scale-105 hover:shadow-xl cursor-pointer flex flex-col justify-between"
                whileHover={{ scale: 1.05 }}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <div>
                  {/* Company Header */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-xl text-gray-900">
                        {company.companyName}
                      </h2>
                      {company.companyIndustry && (
                        <Badge className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">
                          {company.companyIndustry}
                        </Badge>
                      )}
                    </div>
                    <a
                      href={company.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:underline text-sm"
                    >
                      {company.companyWebsite}
                    </a>
                  </div>

                  {/* Company Details */}
                  <div className="space-y-3 text-gray-800 text-sm">
                    <p className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-gray-600" />
                      <span>
                        <span className="font-medium">Size:</span> {company.companySize}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-gray-600" />
                      <span>
                        <span className="font-medium">Location:</span> {company.location}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-gray-600" />
                      <span>
                        <span className="font-medium">Email:</span> {company.contactEmail}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-gray-600" />
                      <span>
                        <span className="font-medium">Phone:</span> {company.contactPhone}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Admin Action Buttons */}
                {isAdmin && (
                  <div className="mt-6 flex justify-end gap-2">
                    {company.status === "active" ? (
                      <button
                        onClick={() =>
                          openConfirmationModal(company._id, "disable")
                        }
                        className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
                      >
                        <span>Disable Company</span>
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          openConfirmationModal(company._id, "activate")
                        }
                        className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <span>Activate Company</span>
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 className="text-lg font-semibold mb-4">
              Confirm {actionType === "disable" ? "Disable" : "Activate"}
            </h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to {actionType} this company? This action{" "}
              {actionType === "disable"
                ? "is irreversible."
                : "will reactivate the company."}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedCompany(null);
                  setActionType("");
                }}
                className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmActionCompany}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Company;
