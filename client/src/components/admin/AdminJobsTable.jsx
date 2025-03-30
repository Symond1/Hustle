import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
import { Edit2, Eye, MoreHorizontal, Download } from "lucide-react";
import { Button } from "../ui/button";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const AdminJobsTable = () => {
  const { allJobs } = useSelector((store) => store.job);
  const { user } = useSelector((store) => store.auth);
  const [filterJobs, setFilterJobs] = useState(allJobs);
  const [searchText, setSearchText] = useState("");
  const [searchType, setSearchType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();

  // Utility to convert a date string to a local "yyyy-mm-dd" format
  // This avoids potential timezone shifts from using toISOString.
  const getFormattedDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-CA");
  };

  useEffect(() => {
    if (!user) return;
    let filtered =
      user?.role === "Admin"
        ? allJobs
        : allJobs.filter((job) => job?.postedBy?._id === user._id);

    if (searchText) {
      filtered = filtered.filter((job) =>
        job?.title?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (searchType) {
      filtered = filtered.filter((job) =>
        job?.jobType?.toLowerCase().includes(searchType.toLowerCase())
      );
    }
    if (startDate || endDate) {
      filtered = filtered.filter((job) => {
        const jobDateString = getFormattedDate(job.createdAt); // in 'yyyy-mm-dd' format based on local time
        return (
          (!startDate || jobDateString >= startDate) &&
          (!endDate || jobDateString <= endDate)
        );
      });
    }
    setFilterJobs(filtered);
  }, [allJobs, searchText, searchType, startDate, endDate, user]);

  // PDF and Excel helper functions remain unchanged

  const addHeader = (doc, pageWidth) => {
    doc.setFillColor(0, 123, 255);
    doc.rect(0, 0, pageWidth, 30, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("Job Report", 14, 20);
    doc.setFontSize(10);
    const currentDate = new Date().toLocaleString();
    doc.text(`Generated on: ${currentDate}`, 14, 27);
    const reportFor = user?.role === "Admin" ? "Admin" : "Recruiter";
    doc.text(`Report for ${reportFor} by HUSTLE`, pageWidth - 80, 27);
  };

  const addFooter = (doc, pageWidth, pageHeight, currentPage, totalPages, userEmail) => {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setDrawColor(200);
    doc.line(14, pageHeight - 20, pageWidth - 14, pageHeight - 20);
    doc.text(`Downloaded by: ${userEmail}`, 14, pageHeight - 10);
    doc.text(`Page ${currentPage} of ${totalPages}`, pageWidth - 40, pageHeight - 10);
  };

  const drawMultilineText = (doc, label, text, x, y, maxWidth) => {
    const fullText = `${label}: ${text || "N/A"}`;
    const lines = doc.splitTextToSize(fullText, maxWidth);
    lines.forEach((line) => {
      doc.text(line, x, y);
      y += 6;
    });
    return y;
  };

  const estimateJobHeight = (doc, job, maxWidth) => {
    const linesResponsibilities = doc.splitTextToSize(
      `Responsibilities: ${job.responsibilities || "N/A"}`,
      maxWidth
    ).length;
    const linesQualifications = doc.splitTextToSize(
      `Qualifications: ${job.qualifications || "N/A"}`,
      maxWidth
    ).length;
    const linesJobNiche = doc.splitTextToSize(`Job Niche: ${job.jobNiche || "N/A"}`, maxWidth).length;
    return (
      10 + // Title
      8 + // Type and Company
      8 + // Salary and Location
      8 + // Date Posted
      linesResponsibilities * 6 + // Responsibilities
      linesQualifications * 6 + // Qualifications
      linesJobNiche * 6 + // Job Niche
      12 // Divider and gap
    );
  };

  const drawJobDetails = (doc, job, x, y, pageWidth) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Job: ${job.title || "N/A"}`, x, y);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Type: ${job.jobType || "N/A"}`, x, y);
    doc.text(`Company: ${job.companyName || "N/A"}`, pageWidth / 2, y);
    y += 8;

    doc.text(`Salary: ${job.salary || "N/A"}`, x, y);
    doc.text(`Location: ${job.location || "N/A"}`, pageWidth / 2, y);
    y += 8;

    doc.text(`Posted: ${getFormattedDate(job.createdAt)}`, x, y);
    y += 8;

    y = drawMultilineText(doc, "Responsibilities", job.responsibilities, x, y, pageWidth - 28);
    y = drawMultilineText(doc, "Qualifications", job.qualifications, x, y, pageWidth - 28);
    y = drawMultilineText(doc, "Job Niche", job.jobNiche, x, y, pageWidth - 28);

    doc.setDrawColor(220);
    doc.line(x, y + 2, pageWidth - x, y + 2);
    y += 12;
    return y;
  };

  const drawJobTitleBarChart = (doc, startY, pageWidth, blockWidth, blockHeight) => {
    const x = 14;
    const headerGap = 8;
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text("Job Title Bar Chart (Vertical)", x, startY - headerGap);
    doc.setDrawColor(0);
    doc.rect(x, startY, blockWidth, blockHeight);

    const jobTitleCounts = {};
    filterJobs.forEach((job) => {
      const title = job.title || "N/A";
      jobTitleCounts[title] = (jobTitleCounts[title] || 0) + 1;
    });
    const titles = Object.keys(jobTitleCounts);
    const counts = Object.values(jobTitleCounts);
    const maxCount = Math.max(...counts, 1);

    const spacing = 20;
    const numBars = titles.length;
    const availableWidth = blockWidth - (numBars + 1) * spacing;
    const barWidth = availableWidth / numBars;
    const maxBarHeight = blockHeight - 30;

    let xPos = x + spacing;
    titles.forEach((title) => {
      const count = jobTitleCounts[title];
      const barHeight = (count / maxCount) * maxBarHeight;
      doc.setFillColor(100, 149, 237);
      doc.rect(xPos, startY + blockHeight - barHeight, barWidth, barHeight, "F");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(0);
      doc.text(`${count}`, xPos + barWidth / 2, startY + blockHeight - barHeight - 4, { align: "center" });

      const labelGap = 6;
      const titleLines = doc.splitTextToSize(title, barWidth + 40);
      let labelY = startY + blockHeight + labelGap;
      titleLines.forEach((line) => {
        doc.text(line, xPos + barWidth / 2, labelY, { align: "center" });
        labelY += 6;
      });

      xPos += barWidth + spacing;
    });

    return startY + blockHeight + 25;
  };

  const drawSalaryRangeHistogram = (doc, startY, pageWidth, blockWidth, blockHeight) => {
    const x = 14;
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text("Salary Range Histogram", x, startY - 5);
    doc.setDrawColor(0);
    doc.rect(x, startY, blockWidth, blockHeight);

    const ranges = [
      { min: 0, max: 50000, label: "0-50K" },
      { min: 50000, max: 100000, label: "50K-100K" },
      { min: 100000, max: Infinity, label: "100K+" },
    ];
    const rangeCounts = ranges.map((range) => {
      return filterJobs.filter((job) => {
        const salary = parseFloat(job.salary) || 0;
        return salary >= range.min && salary < range.max;
      }).length;
    });
    const maxCount = Math.max(...rangeCounts, 1);

    let yPos = startY + 10;
    const barMaxWidth = blockWidth - 60;
    ranges.forEach((range, i) => {
      if (yPos + 12 <= startY + blockHeight) {
        const barLength = (rangeCounts[i] / maxCount) * barMaxWidth;
        doc.setFillColor(60, 179, 113);
        doc.rect(x + 10, yPos, barLength, 8, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text(`${range.label} (${rangeCounts[i]})`, x + barMaxWidth + 15, yPos + 6);
        yPos += 12;
      }
    });
    return startY + blockHeight + 15;
  };

  const drawJobTypeFrequencyBars = (doc, startY, pageWidth, blockWidth, blockHeight) => {
    const x = 14;
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text("Job Type Frequency Bars", x, startY - 5);
    doc.setDrawColor(0);
    doc.rect(x, startY, blockWidth, blockHeight);

    const jobTypeCounts = {};
    filterJobs.forEach((job) => {
      const type = job.jobType || "N/A";
      jobTypeCounts[type] = (jobTypeCounts[type] || 0) + 1;
    });
    const types = Object.keys(jobTypeCounts);
    const counts = Object.values(jobTypeCounts);
    const maxCount = Math.max(...counts, 1);

    let yPos = startY + 10;
    const barMaxWidth = blockWidth - 60;
    types.forEach((type) => {
      if (yPos + 12 <= startY + blockHeight) {
        const barLength = (jobTypeCounts[type] / maxCount) * barMaxWidth;
        doc.setFillColor(255, 99, 132);
        doc.rect(x + 10, yPos, barLength, 8, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(0);
        const label = `${type} (${jobTypeCounts[type]})`;
        const truncatedLabel = label.length > 20 ? `${label.slice(0, 17)}...` : label;
        doc.text(truncatedLabel, x + barMaxWidth + 15, yPos + 6);
        yPos += 12;
      }
    });
    return startY + blockHeight + 15;
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = pageWidth - 28;

    const jobHeights = filterJobs.map((job) => estimateJobHeight(doc, job, maxWidth));

    let yOffset = 40;
    let currentPage = 1;

    addHeader(doc, pageWidth);

    filterJobs.forEach((job, index) => {
      if (yOffset + jobHeights[index] > pageHeight - 30) {
        doc.addPage();
        currentPage++;
        addHeader(doc, pageWidth);
        yOffset = 40;
      }
      yOffset = drawJobDetails(doc, job, 14, yOffset, pageWidth);
    });

    doc.addPage();
    currentPage++;
    addHeader(doc, pageWidth);
    yOffset = 40;
    const blockWidth = pageWidth - 28;
    const blockHeight = 60;

    yOffset = drawJobTitleBarChart(doc, yOffset, pageWidth, blockWidth, blockHeight);
    yOffset = drawSalaryRangeHistogram(doc, yOffset, pageWidth, blockWidth, blockHeight);
    yOffset = drawJobTypeFrequencyBars(doc, yOffset, pageWidth, blockWidth, blockHeight);

    const totalPages = currentPage;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addFooter(doc, pageWidth, pageHeight, i, totalPages, user.email);
    }

    doc.save("Job_Report.pdf");
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filterJobs.map((job) => ({
        "Job Title": job.title || "N/A",
        "Job Type": job.jobType || "N/A",
        "Company Name": job.companyName || "N/A",
        "Salary": job.salary || "N/A",
        "Location": job.location || "N/A",
        "Date Posted": getFormattedDate(job.createdAt),
        "Responsibilities": job.responsibilities || "N/A",
        "Qualifications": job.qualifications || "N/A",
        "Job Niche": job.jobNiche || "N/A",
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Jobs");
    XLSX.writeFile(workbook, "Job_Report.xlsx");
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 space-y-6">
      <div className="bg-white shadow-lg rounded-lg p-4 flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap gap-4 flex-1">
          <input
            type="text"
            placeholder="Search by Job Title"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border p-2 rounded flex-1"
          />
          <input
            type="text"
            placeholder="Search by Job Type"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
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
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setSearchText("");
              setSearchType("");
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
      <Table className="divide-y divide-gray-200">
        <TableCaption>A list of your recent job postings</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Job Title</TableHead>
            <TableHead>Job Type</TableHead>
            <TableHead>Company Name</TableHead>
            <TableHead>Salary</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Date Posted</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filterJobs.map((job) => (
            <TableRow key={job._id}>
              <TableCell>{job?.title || "N/A"}</TableCell>
              <TableCell>{job?.jobType || "N/A"}</TableCell>
              <TableCell>{job?.companyName || "N/A"}</TableCell>
              <TableCell>{job?.salary || "N/A"}</TableCell>
              <TableCell>{job?.location || "N/A"}</TableCell>
              <TableCell>{getFormattedDate(job?.createdAt)}</TableCell>
              <TableCell className="text-right cursor-pointer">
                <Popover>
                  <PopoverTrigger>
                    <MoreHorizontal />
                  </PopoverTrigger>
                  <PopoverContent className="w-32">
                    <div
                      onClick={() => navigate(`/admin/jobs/${job._id}/details`)}
                      className="flex items-center gap-2 cursor-pointer mt-2"
                    >
                      <Eye className="w-4" />
                      <span>Details</span>
                    </div>
                    <div
                      onClick={() => navigate(`/admin/jobs/${job._id}/applicants`)}
                      className="flex items-center gap-2 cursor-pointer mt-2"
                    >
                      <Edit2 className="w-4" />
                      <span>Applicants</span>
                    </div>
                  </PopoverContent>
                </Popover>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminJobsTable;
