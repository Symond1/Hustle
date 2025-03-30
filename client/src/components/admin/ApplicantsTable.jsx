import React, { useEffect, useState } from "react";
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
import * as XLSX from "xlsx";

// Status options
const shortlistingStatus = ["accepted", "rejected"];

const extractFieldWithDefault = (field, fieldType = "") => {
  if (typeof field === "string" && field.trim() !== "") return field;
  if (Array.isArray(field) && field.length > 0) return field.join(", ");
  // Custom fallbacks
  if (fieldType === "city") return "Add your city";
  if (fieldType === "state") return "Add your state";
  if (fieldType === "address") return "Add your address";
  if (fieldType === "experience") return "Fresher";
  return "";
};

// Header for PDF
const renderHeader = (doc, pageWidth, margin, user) => {
  doc.setFillColor(0, 123, 255);
  doc.rect(0, 0, pageWidth, 60, "F");

  doc.addImage("/logos/Logo.jpg", "JPEG", 10, 15, 30, 30);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("BrainerHub Solutions", 50, 25);

  doc.setFontSize(14);
  doc.text("Applicants Report", 50, 35);

  doc.setFontSize(10);
  const currentDate = new Date().toLocaleString();
  doc.text(`Generated on: ${currentDate}`, pageWidth - margin, 25, {
    align: "right",
  });
  if (user?.role) {
    doc.text(`Role: ${user.role}`, pageWidth - margin, 35, { align: "right" });
  }

  doc.setDrawColor(200);
  doc.setLineWidth(0.5);
  doc.line(margin, 65, pageWidth - margin, 65);

  doc.setTextColor(0, 0, 0);
};

const renderFooter = (doc, pageWidth, pageHeight, margin, currentPage, user) => {
  const footerY = pageHeight - 10;
  doc.setFontSize(8);
  doc.setTextColor(100);
  const downloadName = user?.name || "";
  const downloadEmail = user?.email || "";
  doc.text(`Downloaded by: ${downloadName} (${downloadEmail})`, margin, footerY);
  doc.text(`Page ${currentPage}`, pageWidth - margin - 20, footerY);
  doc.setTextColor(0);
};

const ApplicantsTable = ({ jobId }) => {
  const { applicants } = useSelector((store) => store.application);
  const { user } = useSelector((store) => store.auth);
  const [applicantsData, setApplicantsData] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    contact: "",
    status: null,
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    setApplicantsData(applicants);
  }, [applicants]);

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
        setApplicantsData((prev) =>
          prev.map((applicant) =>
            applicant._id === id ? { ...applicant, status } : applicant
          )
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating status");
    }
  };

  const filteredApplicants = applicantsData.filter((applicant) => {
    const fullName = (applicant?.applicant?.fullname || "").toLowerCase();
    const email = (applicant?.applicant?.email || "").toLowerCase();
    const contact = applicant?.applicant?.phoneNumber || "";
    return (
      (!filters.name || fullName.includes(filters.name.toLowerCase())) &&
      (!filters.email || email.includes(filters.email.toLowerCase())) &&
      (!filters.contact || contact.includes(filters.contact)) &&
      (!filters.status || applicant?.status === filters.status) &&
      (!filters.startDate ||
        new Date(applicant.createdAt) >= new Date(filters.startDate)) &&
      (!filters.endDate ||
        new Date(applicant.createdAt) <= new Date(filters.endDate))
    );
  });

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    let currentPage = 1;

    renderHeader(doc, pageWidth, margin, user);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    let startY = 70;
    const cardGap = 5;

    // --- Render Applicant Cards in PDF using Card Format ---
    filteredApplicants.forEach((applicant) => {
      const profile = applicant?.applicant?.profile || {};
      const city = extractFieldWithDefault(
        profile.city || applicant?.applicant?.city,
        "city"
      );
      const state = extractFieldWithDefault(
        profile.state || applicant?.applicant?.state,
        "state"
      );
      const lines = [
        `Name: ${applicant?.applicant?.fullname || ""}`,
        `Email: ${applicant?.applicant?.email || ""}`,
        `Contact: ${applicant?.applicant?.phoneNumber || ""}`,
        `City: ${city}`,
        `State: ${state}`,
        `Gender: ${profile.gender || ""}`,
        `Education: ${
          Array.isArray(profile.education) && profile.education.length > 0
            ? profile.education
                .map(
                  (edu) =>
                    `${edu.degree || ""} in ${edu.fieldOfStudy || ""} (${
                      edu.startDate
                        ? new Date(edu.startDate).toLocaleDateString()
                        : ""
                    } - ${
                      edu.endDate
                        ? new Date(edu.endDate).toLocaleDateString()
                        : ""
                    })`
                )
                .join(" | ")
            : ""
        }`,
        `Status: ${applicant?.status || "Pending"}`,
        `Applied on: ${
          applicant?.createdAt ? applicant.createdAt.split("T")[0] : ""
        }`,
      ];

      const cardHeight = lines.length * 5 + 7;

      // Check if new page is needed
      if (startY + cardHeight > pageHeight - margin - 10) {
        renderFooter(doc, pageWidth, pageHeight, margin, currentPage, user);
        doc.addPage();
        currentPage++;
        renderHeader(doc, pageWidth, margin, user);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        startY = 70;
      }

      // Draw a card background with rounded corners (no outer border)
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(margin, startY, pageWidth - 2 * margin, cardHeight, 3, 3, "F");

      // Render text lines inside the card
      let textY = startY + 7;
      lines.forEach((line) => {
        doc.text(line, margin + 4, textY);
        textY += 5;
      });

      startY += cardHeight + cardGap;
    });

    renderFooter(doc, pageWidth, pageHeight, margin, currentPage, user);

    // --- Next Page: Charts Section ---
    doc.addPage();
    currentPage++;
    renderHeader(doc, pageWidth, margin, user);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    let graphStartY = 70;
    doc.setFontSize(14);
    doc.text("Job Status Distribution", margin, graphStartY);
    graphStartY += 10; // Move down after title

    // Calculate status counts
    const statuses = ["accepted", "rejected", "pending"];
    let statusCounts = { accepted: 0, rejected: 0, pending: 0 };
    filteredApplicants.forEach((applicant) => {
      let st = (applicant?.status || "pending").toLowerCase();
      if (!["accepted", "rejected"].includes(st)) st = "pending";
      statusCounts[st]++;
    });
    const maxStatus = Math.max(...Object.values(statusCounts)) || 1;
    const graphHeight = 60;
    const barSpacing = 10;
    const numBars = statuses.length;
    const availableWidth = pageWidth - 2 * margin;
    const barWidth = (availableWidth - (numBars + 1) * barSpacing) / numBars;

    // Draw each status bar
    statuses.forEach((status, index) => {
      const count = statusCounts[status];
      const barHeight = (count / maxStatus) * graphHeight;
      const x = margin + barSpacing + index * (barWidth + barSpacing);
      const y = graphStartY + graphHeight - barHeight;
      doc.setFillColor(100, 149, 237);
      doc.rect(x, y, barWidth, barHeight, "F");
      doc.setFontSize(10);
      doc.text(status, x + barWidth / 2, graphStartY + graphHeight + 5, {
        align: "center",
      });
      doc.text(`${count}`, x + barWidth / 2, y - 2, { align: "center" });
    });

    // Add border around the Job Status Distribution chart (below title)
    const jobChartY = graphStartY - 5; // Start border below the title
    const jobChartHeight = graphHeight + 15;
    doc.setDrawColor(0);
    doc.rect(margin, jobChartY, availableWidth, jobChartHeight, "S");

    // Second graph: Education Distribution
    graphStartY += graphHeight + 30; // Adjusted spacing
    doc.setFontSize(14);
    doc.text("Education Distribution", margin, graphStartY);
    graphStartY += 10; // Move down after title

    const eduCategories = ["Bachelor", "Master", "PhD"];
    let eduCounts = { Bachelor: 0, Master: 0, PhD: 0 };
    filteredApplicants.forEach((applicant) => {
      const profile = applicant?.applicant?.profile || {};
      if (Array.isArray(profile.education)) {
        profile.education.forEach((edu) => {
          const degree = edu.degree ? edu.degree.toLowerCase() : "";
          if (degree.includes("bachelor")) {
            eduCounts["Bachelor"]++;
          } else if (degree.includes("master")) {
            eduCounts["Master"]++;
          } else if (degree.includes("phd")) {
            eduCounts["PhD"]++;
          }
        });
      }
    });
    const maxEdu = Math.max(...Object.values(eduCounts)) || 1;
    const eduGraphHeight = 60;
    const eduBarWidth =
      (availableWidth - (eduCategories.length + 1) * barSpacing) /
      eduCategories.length;

    eduCategories.forEach((cat, index) => {
      const count = eduCounts[cat];
      const barHeight = (count / maxEdu) * eduGraphHeight;
      const x = margin + barSpacing + index * (eduBarWidth + barSpacing);
      const y = graphStartY + eduGraphHeight - barHeight;
      doc.setFillColor(60, 179, 113);
      doc.rect(x, y, eduBarWidth, barHeight, "F");
      doc.setFontSize(10);
      doc.text(cat, x + eduBarWidth / 2, graphStartY + eduGraphHeight + 5, {
        align: "center",
      });
      doc.text(`${count}`, x + eduBarWidth / 2, y - 2, { align: "center" });
    });

    // Add border around the Education Distribution chart (below title)
    const eduChartY = graphStartY - 5; // Start border below the title
    const eduChartHeight = eduGraphHeight + 15;
    doc.setDrawColor(0);
    doc.rect(margin, eduChartY, availableWidth, eduChartHeight, "S");

    renderFooter(doc, pageWidth, pageHeight, margin, currentPage, user);
    doc.save("Applicants_Report.pdf");
  };

  const generateExcel = () => {
    const data = filteredApplicants.map((applicant) => {
      const profile = applicant?.applicant?.profile || {};
      const city = extractFieldWithDefault(
        profile.city || applicant?.applicant?.city,
        "city"
      );
      const state = extractFieldWithDefault(
        profile.state || applicant?.applicant?.state,
        "state"
      );
      const address = extractFieldWithDefault(
        profile.address || applicant?.applicant?.address,
        "address"
      );
      return {
        Name: applicant?.applicant?.fullname || "",
        Email: applicant?.applicant?.email || "",
        Contact: applicant?.applicant?.phoneNumber || "",
        City: city,
        State: state,
        Address: address,
        Gender: profile.gender || "",
        Education:
          Array.isArray(profile.education) && profile.education.length > 0
            ? profile.education
                .map(
                  (edu) =>
                    `${edu.degree || ""} in ${edu.fieldOfStudy || ""} (${
                      edu.startDate
                        ? new Date(edu.startDate).toLocaleDateString()
                        : ""
                    } - ${
                      edu.endDate
                        ? new Date(edu.endDate).toLocaleDateString()
                        : ""
                    })`
                )
                .join(" | ")
            : "",
        Status: applicant?.status || "",
        "Applied On": applicant?.createdAt
          ? applicant.createdAt.split("T")[0]
          : "",
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Applicants");
    XLSX.writeFile(wb, "Applicants_Report.xlsx");
  };

  return (
    <div>
      <Button onClick={() => window.history.back()} className="mb-4">
        Back
      </Button>
      <div className="flex items-center gap-4 mb-4 overflow-x-auto whitespace-nowrap">
        <Input
          className="min-w-[150px] w-full max-w-[200px]"
          placeholder="Filter by name"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        />
        <Input
          className="min-w-[150px] w-full max-w-[200px]"
          placeholder="Filter by email"
          value={filters.email}
          onChange={(e) => setFilters({ ...filters, email: e.target.value })}
        />
        <Input
          className="min-w-[120px] w-full max-w-[160px]"
          placeholder="Filter by contact"
          value={filters.contact}
          onChange={(e) => setFilters({ ...filters, contact: e.target.value })}
        />
        <Input
          className="min-w-[120px] w-full max-w-[140px]"
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
        />
        <Input
          className="min-w-[120px] w-full max-w-[140px]"
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
        />
        <Select
          onValueChange={(value) => setFilters({ ...filters, status: value })}
          value={filters.status || undefined}
        >
          <SelectTrigger className="min-w-[140px] w-full max-w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {shortlistingStatus.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
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
          className="min-w-[80px]"
        >
          Reset
        </Button>
        <Button
          onClick={generatePDF}
          className="min-w-[100px] bg-red-500 text-white flex items-center gap-2"
        >
          Export PDF
        </Button>
        <Button
          onClick={generateExcel}
          className="min-w-[100px] bg-green-500 text-white flex items-center gap-2"
        >
          Export Excel
        </Button>
      </div>

      {/* Main View: Card Layout for Applicants */}
      <div className="rounded shadow mb-4">
        <div className="bg-gray-100 p-4 border-b">
          <h2 className="text-xl font-semibold">Applicants List</h2>
        </div>
        <div className="flex flex-col divide-y">
          {filteredApplicants.map((applicant) => {
            const profile = applicant?.applicant?.profile || {};
            const city = extractFieldWithDefault(
              profile.city || applicant?.applicant?.city,
              "city"
            );
            const state = extractFieldWithDefault(
              profile.state || applicant?.applicant?.state,
              "state"
            );
            const address = extractFieldWithDefault(
              profile.address || applicant?.applicant?.address,
              "address"
            );
            return (
              <div
                key={applicant._id}
                className="flex flex-row items-center justify-between p-4"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">
                      {applicant?.applicant?.fullname || ""}
                    </span>
                    <span className="text-sm text-gray-600">
                      {applicant?.applicant?.email || ""}
                    </span>
                  </div>
                  <div className="mt-1 text-sm">
                    <span>
                      Contact: {applicant?.applicant?.phoneNumber || ""}
                    </span>
                  </div>
                  <div className="mt-1 text-sm flex gap-4">
                    <span>City: {city}</span>
                    <span>State: {state}</span>
                  </div>
                  <div className="mt-1 text-sm">
                    <span>Address: {address}</span>
                  </div>
                  <div className="mt-1 text-sm">
                    <span>Gender: {profile.gender || ""}</span>
                  </div>
                  <div className="mt-1 text-sm">
                    <span>
                      Education:{" "}
                      {Array.isArray(profile.education) &&
                      profile.education.length > 0
                        ? profile.education
                            .map(
                              (edu) =>
                                `${edu.degree || ""} in ${
                                  edu.fieldOfStudy || ""
                                } (${
                                  edu.startDate
                                    ? new Date(edu.startDate).toLocaleDateString()
                                    : ""
                                } - ${
                                  edu.endDate
                                    ? new Date(edu.endDate).toLocaleDateString()
                                    : ""
                                })`
                            )
                            .join(" | ")
                        : ""}
                    </span>
                  </div>
                  {profile.resume && (
                    <div className="mt-1 text-sm">
                      <a
                        className="text-blue-600 hover:underline"
                        href={profile.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {profile.resumeOriginalName || ""}
                      </a>
                    </div>
                  )}
                  <div className="mt-1 text-xs text-gray-500">
                    Applied on:{" "}
                    {applicant?.createdAt
                      ? applicant.createdAt.split("T")[0]
                      : ""}
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <Select
                    onValueChange={(value) =>
                      statusHandler(value, applicant._id)
                    }
                    value={applicant.status || "Pending"}
                  >
                    <SelectTrigger className="min-w-[120px] text-center">
                      <SelectValue>
                        <span
                          className={`block w-full text-center px-2 py-1 rounded-full text-white ${
                            applicant.status === "accepted"
                              ? "bg-green-500"
                              : applicant.status === "rejected"
                              ? "bg-red-500"
                              : "bg-gray-500"
                          }`}
                        >
                          {applicant.status || "Pending"}
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {shortlistingStatus.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ApplicantsTable;