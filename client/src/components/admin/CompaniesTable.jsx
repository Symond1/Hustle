import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCaption, TableCell, TableHead,
  TableHeader, TableRow
} from "../ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Edit2, MoreHorizontal, Download } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const CompaniesTable = () => {
  const { companies } = useSelector((store) => store.company);
  const { user } = useSelector((store) => store.auth);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchWebsite, setSearchWebsite] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();

  // Filter companies based on recruiter, name, website, and date range
  useEffect(() => {
    if (!user) return;

    let filtered = companies.filter((company) => company?.createdBy === user._id);

    // Apply name filter
    if (searchText) {
      filtered = filtered.filter((company) =>
        company.companyName.toLowerCase().startsWith(searchText.toLowerCase())
      );
    }

    // Apply website filter
    if (searchWebsite) {
      filtered = filtered.filter((company) =>
        company.companyWebsite?.toLowerCase().includes(searchWebsite.toLowerCase())
      );
    }

    // Apply date range filter
    if (startDate || endDate) {
      filtered = filtered.filter((company) => {
        const companyDate = new Date(company.createdAt);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        return (!start || companyDate >= start) && (!end || companyDate <= end);
      });
    }

    setFilteredCompanies(filtered);
  }, [companies, searchText, searchWebsite, startDate, endDate, user]);

  // Generate PDF Report with Date, Time, and Page Numbers
  const generatePDF = () => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleString();
    let pageNumber = 1;

    doc.text("Company Report", 14, 15);
    doc.text(`Generated on: ${currentDate}`, 14, 25);

    const headers = [["Name", "Website", "Created Date"]];
    const data = filteredCompanies.map((company) => [
      company.companyName,
      company.companyWebsite || "N/A",
      new Date(company.createdAt).toLocaleString(),
    ]);

    doc.autoTable({
      head: headers,
      body: data,
      startY: 30,
      didDrawPage: function (data) {
        // Add page number
        doc.text(`Page ${pageNumber}`, 180, 285);
        pageNumber++;
      },
    });

    doc.save("Company_Report.pdf");
  };

  // Export to Excel with Date and Time
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredCompanies.map((company) => ({
        Name: company.companyName,
        Website: company.companyWebsite || "N/A",
        "Created Date": new Date(company.createdAt).toLocaleString(),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Companies");
    XLSX.writeFile(workbook, "Company_Report.xlsx");
  };

  return (
    <div className="max-w-6xl mx-auto mt-8">
      {/* Filter Section */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <input
          type="text"
          placeholder="Filter by Name (Starts with)"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border p-2 rounded w-1/4"
        />
        <input
          type="text"
          placeholder="Filter by Website"
          value={searchWebsite}
          onChange={(e) => setSearchWebsite(e.target.value)}
          className="border p-2 rounded w-1/4"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-2 rounded"
        />
        <Button onClick={() => { setSearchText(""); setSearchWebsite(""); setStartDate(""); setEndDate(""); }}>
          Reset Filters
        </Button>
        <Button onClick={generatePDF} className="bg-red-500 text-white flex items-center gap-2">
          <Download size={16} /> PDF
        </Button>
        <Button onClick={exportToExcel} className="bg-green-500 text-white flex items-center gap-2">
          <Download size={16} /> Excel
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-4 bg-gray-100 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700">Your Companies</h2>
        </div>
        <Table className="min-w-full">
          <TableCaption className="hidden">Your Companies</TableCaption>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="py-3 px-4 text-left text-sm font-medium text-gray-600">Name</TableHead>
              <TableHead className="py-3 px-4 text-left text-sm font-medium text-gray-600">Website</TableHead>
              <TableHead className="py-3 px-4 text-left text-sm font-medium text-gray-600">Created Date</TableHead>
              <TableHead className="py-3 px-4 text-right text-sm font-medium text-gray-600">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCompanies.length > 0 ? (
              filteredCompanies.map((company) => (
                <TableRow key={company._id} className="hover:bg-gray-50 transition duration-300">
                  <TableCell className="py-3 px-4 text-sm text-gray-800">{company.companyName}</TableCell>
                  <TableCell className="py-3 px-4 text-sm text-gray-800">
                    {company.companyWebsite || "N/A"}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-sm text-gray-600">
                    {new Date(company.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-right">
                    <Popover>
                      <PopoverTrigger>
                        <MoreHorizontal className="text-gray-500 hover:text-gray-700 transition duration-200 cursor-pointer" />
                      </PopoverTrigger>
                      <PopoverContent className="w-32 bg-white shadow-md rounded-lg">
                        <div
                          onClick={() => navigate(`/admin/companies/${company._id}`)}
                          className="flex items-center gap-2 p-2 hover:bg-blue-100 rounded-lg cursor-pointer"
                        >
                          <Edit2 className="w-4 text-gray-600" />
                          <span className="text-sm text-gray-700">Edit</span>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="4" className="py-4 text-center text-gray-600">
                  No Companies Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CompaniesTable;
