import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Edit2, MoreHorizontal, Download } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
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

  useEffect(() => {
    if (!user || !companies) return;

    // Start with all companies
    let filtered = companies;

    // Filter by createdBy if available
    if (user._id) {
      filtered = filtered.filter((company) => company?.createdBy === user._id);
    }

    // Filter by company name (starts with searchText)
    if (searchText) {
      filtered = filtered.filter((company) =>
        company.companyName.toLowerCase().startsWith(searchText.toLowerCase())
      );
    }

    // Filter by website substring
    if (searchWebsite) {
      filtered = filtered.filter((company) =>
        company.companyWebsite
          ?.toLowerCase()
          .includes(searchWebsite.toLowerCase())
      );
    }

    // Filter by date range if provided
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

  const generatePDF = () => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleString();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
  
    // Header function: draws a blue header with logo and report info.
    const renderHeader = (doc, pageWidth, margin) => {
      doc.setFillColor(0, 123, 255);
      doc.rect(0, 0, pageWidth, 60, "F");
      // Company Logo
      doc.addImage("/logos/Logo.jpg", "JPEG", 10, 15, 30, 30);
      // Company Name and Report Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text("BrainerHub Solutions", 50, 25);
      doc.setFontSize(14);
      doc.text("Company Report by Hustle", 50, 35);
      // Right-aligned generated info and user role
      doc.setFontSize(10);
      doc.text(`Generated on: ${currentDate}`, pageWidth - margin, 25, { align: "right" });
      if (user?.role) {
        doc.text(`Role: ${user.role}`, pageWidth - margin, 35, { align: "right" });
      }
    };
  
    // Footer function: displays downloader details and page number.
    const renderFooter = (doc, pageWidth, pageHeight, margin, currentPage) => {
      const footerY = pageHeight - 10;
      doc.setFontSize(8);
      doc.setTextColor(100);
      const downloadName = user?.name || "";
      const downloadEmail = user?.email || "";
      doc.text(`Downloaded by: ${downloadName} (${downloadEmail})`, margin, footerY);
      doc.text(`Page ${currentPage}`, pageWidth - margin - 20, footerY);
    };
  
    // Draw header on the first page
    renderHeader(doc, pageWidth, margin);
  
    // Define table headers and map filtered companies into table data rows.
    const headers = [[
      "Name",
      "Contact Phone",
      "Email",
      "Location",
      "Size",
      "Industry",
      "Website"
    ]];
    const data = filteredCompanies.map((company) => [
      company.companyName,
      company.contactPhone || "N/A",
      company.contactEmail || "N/A",
      company.location || "N/A",
      company.companySize || "N/A",
      company.companyIndustry || "N/A",
      company.companyWebsite || "N/A",
    ]);
  
    // Use autoTable to render the table with the header starting at Y = 70.
    doc.autoTable({
      head: headers,
      body: data,
      startY: 70,
      headStyles: { fillColor: [0, 0, 0] },
      didDrawPage: function () {
        const currentPage = doc.internal.getNumberOfPages();
        // Re-render header and footer on each new page.
        renderHeader(doc, pageWidth, margin);
        renderFooter(doc, pageWidth, pageHeight, margin, currentPage);
      },
    });
  
    doc.save("Company_Report.pdf");
  };
  

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredCompanies.map((company) => ({
        Name: company.companyName,
        "Contact Phone": company.contactPhone || "N/A",
        Email: company.contactEmail || "N/A",
        Location: company.location || "N/A",
        Size: company.companySize || "N/A",
        Industry: company.companyIndustry || "N/A",
        Website: company.companyWebsite || "N/A",
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Companies");
    XLSX.writeFile(workbook, "Company_Report.xlsx");
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 space-y-6">
      {/* Filter Section */}
      <div className="bg-white shadow-lg rounded-lg p-4 flex flex-wrap items-center gap-4">
        {/* Left Group: Search Inputs */}
        <div className="flex flex-wrap gap-4 flex-1">
          <input
            type="text"
            placeholder="Filter by Name (Starts with)"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border p-2 rounded flex-1"
          />
          <input
            type="text"
            placeholder="Filter by Website"
            value={searchWebsite}
            onChange={(e) => setSearchWebsite(e.target.value)}
            className="border p-2 rounded flex-1"
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
        </div>
        {/* Right Group: Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setSearchText("");
              setSearchWebsite("");
              setStartDate("");
              setEndDate("");
            }}
            className="bg-gray-200 text-black px-4 py-2 rounded w-full md:w-auto"
          >
            Reset Filters
          </Button>
          <Button
            onClick={generatePDF}
            className="bg-red-500 text-white px-4 py-2 rounded w-full md:w-auto flex items-center gap-2"
          >
            <Download size={16} /> PDF
          </Button>
          <Button
            onClick={exportToExcel}
            className="bg-green-500 text-white px-4 py-2 rounded w-full md:w-auto flex items-center gap-2"
          >
            <Download size={16} /> Excel
          </Button>
        </div>
      </div>

      {/* Companies Card */}
      <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-4 bg-gray-100 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700">Your Companies</h2>
        </div>
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableCaption className="hidden">Your Companies</TableCaption>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                  Name
                </TableHead>
                <TableHead className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                  Contact Phone
                </TableHead>
                <TableHead className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                  Email
                </TableHead>
                <TableHead className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                  Location
                </TableHead>
                <TableHead className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                  Size
                </TableHead>
                <TableHead className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                  Industry
                </TableHead>
                <TableHead className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                  Website
                </TableHead>
                <TableHead className="py-3 px-4 text-right text-sm font-medium text-gray-600">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.length > 0 ? (
                filteredCompanies.map((company) => (
                  <TableRow key={company._id} className="hover:bg-gray-50 transition duration-300">
                    <TableCell className="py-3 px-4 text-sm text-gray-800 flex items-center gap-2">
                      {company.companyName}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-gray-800">
                      {company.contactPhone || "N/A"}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-gray-800">
                      {company.contactEmail || "N/A"}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-gray-800">
                      {company.location || "N/A"}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-gray-800">
                      {company.companySize || "N/A"}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-gray-800">
                      {company.companyIndustry || "N/A"}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-gray-800">
                      {company.companyWebsite || "N/A"}
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
                  <TableCell colSpan="9" className="py-4 text-center text-gray-600">
                    No Companies Found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default CompaniesTable;
