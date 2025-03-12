import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import axios from "axios";
import { APPLICATION_API_END_POINT } from "@/utils/constant";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const shortlistingStatus = ["accepted", "rejected"];

const ApplicantsTable = ({ jobId }) => {
  const { applicants: reduxApplicants } = useSelector(
    (store) => store.application
  );
  const [applicants, setApplicants] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    contact: "",
    status: null,
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token)
          return toast.error("Authentication error. Please log in again.");

        const res = await axios.get(
          `${APPLICATION_API_END_POINT}/${jobId}/applicants`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.success) {
          setApplicants(res.data.applicants);
        } else {
          toast.error("Failed to fetch applicants.");
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Error fetching applicants."
        );
      }
    };

    if (jobId) fetchApplicants();
  }, [jobId]);

  const statusHandler = async (status, id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token)
        return toast.error("Authentication error. Please log in again.");

      const res = await axios.post(
        `${APPLICATION_API_END_POINT}/status/${id}/update`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        setApplicants((prev) =>
          prev.map((applicant) =>
            applicant._id === id ? { ...applicant, status } : applicant
          )
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating status");
    }
  };

  const filteredApplicants = applicants.filter((applicant) => {
    return (
      (!filters.name ||
        applicant?.applicant?.fullname
          .toLowerCase()
          .includes(filters.name.toLowerCase())) &&
      (!filters.email ||
        applicant?.applicant?.email
          .toLowerCase()
          .includes(filters.email.toLowerCase())) &&
      (!filters.contact ||
        String(applicant?.applicant?.phoneNumber).includes(filters.contact)) &&
      (!filters.status || applicant?.status === filters.status) &&
      (!filters.startDate ||
        new Date(applicant.createdAt) >= new Date(filters.startDate)) &&
      (!filters.endDate ||
        new Date(applicant.createdAt) <= new Date(filters.endDate))
    );
  });

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Applicants Report", 14, 10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 10);
    autoTable(doc, {
      startY: 20,
      head: [["Name", "Email", "Contact", "Resume", "Date", "Status"]],
      body: filteredApplicants.map((applicant) => [
        applicant?.applicant?.fullname || "N/A",
        applicant?.applicant?.email || "N/A",
        applicant?.applicant?.phoneNumber || "N/A",
        applicant?.applicant?.profile?.resume ? "Available" : "N/A",
        applicant?.createdAt?.split("T")[0] || "N/A",
        applicant?.status || "N/A",
      ]),
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.text(`Page ${pageCount}`, 180, doc.internal.pageSize.height - 10);
      },
    });
    doc.save("Applicants_Report.pdf");
  };

  const generateExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredApplicants.map((applicant) => ({
        Name: applicant?.applicant?.fullname || "N/A",
        Email: applicant?.applicant?.email || "N/A",
        Contact: applicant?.applicant?.phoneNumber || "N/A",
        Resume: applicant?.applicant?.profile?.resume ? "Available" : "N/A",
        Date: applicant?.createdAt?.split("T")[0] || "N/A",
        Status: applicant?.status || "N/A",
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Applicants");
    XLSX.writeFile(wb, "Applicants_Report.xlsx");
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Input
          className="w-[150px]"
          placeholder="Name"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        />
        <Input
          className="w-[150px]"
          placeholder="Email"
          value={filters.email}
          onChange={(e) => setFilters({ ...filters, email: e.target.value })}
        />
        <Input
          className="w-[120px]"
          placeholder="Contact"
          value={filters.contact}
          onChange={(e) => setFilters({ ...filters, contact: e.target.value })}
        />
        <Input
          className="w-[120px]"
          type="date"
          value={filters.startDate}
          onChange={(e) =>
            setFilters({ ...filters, startDate: e.target.value })
          }
        />
        <Input
          className="w-[120px]"
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
        />

        <Select
          onValueChange={(value) => setFilters({ ...filters, status: value })}
          value={filters.status || undefined}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={() =>
            setFilters({
              name: "",
              email: "",
              contact: "",
              status: null,
              startDate: "",
              endDate: "",
            })
          }
        >
          Reset
        </Button>
        <Button onClick={generatePDF} className="bg-red-500 text-white flex items-center gap-2">Export PDF</Button>
        <Button onClick={generateExcel} className="bg-green-500 text-white flex items-center gap-2">Export Excel</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Resume</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredApplicants.map((applicant) => (
            <TableRow key={applicant._id}>
              <TableCell>{applicant?.applicant?.fullname}</TableCell>
              <TableCell>{applicant?.applicant?.email}</TableCell>
              <TableCell>{applicant?.applicant?.phoneNumber}</TableCell>
              <TableCell>
                {applicant?.applicant?.profile?.resume ? (
                  <a
                    className="text-blue-600 cursor-pointer"
                    href={applicant?.applicant?.profile?.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {applicant?.applicant?.profile?.resumeOriginalName ||
                      "View Resume"}
                  </a>
                ) : (
                  <span>NA</span>
                )}
              </TableCell>
              <TableCell>{applicant?.createdAt?.split("T")[0]}</TableCell>
              <TableCell>
                <Select
                  onValueChange={(value) => statusHandler(value, applicant._id)}
                  value={applicant.status || "Pending"} // Ensure a default value
                >
                  <SelectTrigger>
                    <SelectValue>{applicant.status || "Pending"}</SelectValue>{" "}
                    {/* Explicitly setting value */}
                  </SelectTrigger>
                  <SelectContent>
                    {shortlistingStatus.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ApplicantsTable;
