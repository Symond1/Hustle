import React, { useEffect, useState } from "react";
import axios from "axios";
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
import { Eye, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

const AdminEventsTable = () => {
  const { allEvents, searchEventByText } = useSelector((store) => store.event);
  const { user } = useSelector((store) => store.auth);
  const [filterEvents, setFilterEvents] = useState(allEvents);
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [titleFilter, setTitleFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const navigate = useNavigate();

  // Utility function to determine organizer name:
  const getOrganizerName = (event) => {
    return event.Organizer || event.createdBy?.name || "Unknown";
  };

  useEffect(() => {
    const filteredEvents = allEvents.filter((event) => {
      if (user?.role === "Admin") return true;
      if (event?.createdBy?._id !== user?._id) return false;

      if (
        !searchEventByText &&
        !dateFilter.start &&
        !dateFilter.end &&
        !titleFilter &&
        !typeFilter
      )
        return true;

      const eventDate = new Date(event?.eventDate);
      const isTextMatch = event?.eventTitle
        ?.toLowerCase()
        .includes(searchEventByText.toLowerCase());
      const isTitleMatch = event?.eventTitle
        ?.toLowerCase()
        .includes(titleFilter.toLowerCase());
      const isTypeMatch = event?.eventType
        ?.toLowerCase()
        .includes(typeFilter.toLowerCase());
      const isDateMatch =
        (!dateFilter.start || eventDate >= new Date(dateFilter.start)) &&
        (!dateFilter.end || eventDate <= new Date(dateFilter.end));

      return isTextMatch && isDateMatch && isTitleMatch && isTypeMatch;
    });

    setFilterEvents(filteredEvents);
  }, [allEvents, searchEventByText, dateFilter, titleFilter, typeFilter, user]);

  const getFormattedDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
  };

  const getFormattedTime = (timeString) => {
    return timeString || "";
  };

  // Updated renderHeader with non-overlapping layout
const renderHeader = (doc, pageWidth, margin) => {
  // Make the header rectangle taller (height = 60)
  doc.setFillColor(0, 123, 255);
  doc.rect(0, 0, pageWidth, 60, "F");

  // Add the company logo
  doc.addImage("/logos/Logo.jpg", "JPEG", 10, 15, 30, 30);

  // Add "BrainerHub Solutions" on the left
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("BrainerHub Solutions", 50, 25);

  // Add "Report of Events" just below the company name
  doc.setFontSize(14);
  doc.text("Report of Events", 50, 35);

  // Right-align "Generated on" and "Role" to avoid overlap
  doc.setFontSize(10);
  const currentDate = new Date().toLocaleString();
  doc.text(`Generated on: ${currentDate}`, pageWidth - margin, 25, { align: "right" });
  if (user?.role) {
    doc.text(`Role: ${user.role}`, pageWidth - margin, 35, { align: "right" });
  }
};


  // Render the footer on each page
  const renderFooter = (doc, pageWidth, pageHeight, margin, currentPage) => {
    const footerY = pageHeight - 10;
    doc.setFontSize(8);
    doc.setTextColor(100);
    const downloadName = user?.name || "";
    const downloadEmail = user?.email || "";
    doc.text(`Downloaded by: ${downloadName} (${downloadEmail})`, margin, footerY);
    doc.text(`Page ${currentPage}`, pageWidth - margin - 20, footerY);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    // Start further down to leave space for the taller header
    let yOffset = 70;
    let currentPage = 1;

    // Draw header and footer for the first page
    renderHeader(doc, pageWidth, margin);
    renderFooter(doc, pageWidth, pageHeight, margin, currentPage);

    // ----------------- Render Event Cards -----------------
    filterEvents.forEach((event) => {
      // Check if there is enough space for a card (assume card height = 40)
      if (yOffset + 40 > pageHeight - margin - 10) {
        doc.addPage();
        currentPage++;
        yOffset = 70;
        renderHeader(doc, pageWidth, margin);
        renderFooter(doc, pageWidth, pageHeight, margin, currentPage);
      }

      // Draw card background
      doc.setDrawColor(200);
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, yOffset, pageWidth - 2 * margin, 35, "FD");

      // Write event details inside the card
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(event.eventTitle, margin + 2, yOffset + 8);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Organizer: ${getOrganizerName(event)}`, margin + 2, yOffset + 14);
      doc.text(`Type: ${event.eventType || "N/A"}`, margin + 2, yOffset + 20);
      doc.text(
        `Date: ${getFormattedDate(event.eventDate)} ${getFormattedTime(event.eventStartTime)}`,
        margin + 2,
        yOffset + 26
      );
      doc.text(`Location: ${event.location || "N/A"}`, margin + 2, yOffset + 32);

      yOffset += 40; // increment yOffset for next card
    });

    // ----------------- Graphs Page -----------------
    doc.addPage();
    currentPage++;
    renderHeader(doc, pageWidth, margin);
    renderFooter(doc, pageWidth, pageHeight, margin, currentPage);

    // Define content boundaries so graphs don't overlap header/footer
    const contentTop = 70; // content starts below header
    const contentBottom = pageHeight - 20; // leave room above footer

    // ===== Vertical Bar Graph: Events by Price Range =====
    const vLabelY = contentTop + 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Events by Price Range", margin, vLabelY);

    const vGraphY = vLabelY + 10;
    const vGraphHeight = 60;
    const vGraphMargin = margin;
    const vGraphWidth = pageWidth - 2 * vGraphMargin;

    const priceRanges = { Free: 0, Paid: 0 };
    filterEvents.forEach((event) => {
      const price = parseFloat(event.eventPrice) || 0;
      if (price === 0) {
        priceRanges.Free += 1;
      } else {
        priceRanges.Paid += 1;
      }
    });
    const priceKeys = Object.keys(priceRanges);
    const maxPriceCount = Math.max(...Object.values(priceRanges), 1);
    const vBarSpacing = 10;
    const vBarWidth = (vGraphWidth - (priceKeys.length + 1) * vBarSpacing) / priceKeys.length;

    priceKeys.forEach((range, index) => {
      const count = priceRanges[range];
      const barHeight = (count / maxPriceCount) * vGraphHeight;
      const xPos = vGraphMargin + vBarSpacing + index * (vBarWidth + vBarSpacing);
      const yPos = vGraphY + vGraphHeight - barHeight;
      doc.setFillColor(100, 149, 237);
      doc.roundedRect(xPos, yPos, vBarWidth, barHeight, 2, 2, "F");
      doc.setFontSize(8);
      doc.setTextColor(0);
      doc.text(range, xPos + vBarWidth / 2, vGraphY + vGraphHeight + 4, { align: "center" });
      doc.text(`${count}`, xPos + vBarWidth / 2, yPos - 2, { align: "center" });
    });

    // ===== Horizontal Bar Graph: Events by Category =====
    const hLabelY = vGraphY + vGraphHeight + 20;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Events by Category", margin, hLabelY);

    const categoryCounts = {};
    filterEvents.forEach((event) => {
      const category = event.eventCategory || "N/A";
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    const categories = Object.keys(categoryCounts);
    const maxCategoryCount = Math.max(...Object.values(categoryCounts), 1);

    const hGraphY = hLabelY + 10;
    const hGraphWidth = pageWidth - 2 * margin;
    const hBarHeight = 8;
    categories.forEach((category, index) => {
      const count = categoryCounts[category];
      const barLength = (count / maxCategoryCount) * hGraphWidth;
      const yPos = hGraphY + index * (hBarHeight + 5);
      doc.setFillColor(60, 179, 113);
      doc.roundedRect(margin, yPos, barLength, hBarHeight, 2, 2, "F");
      doc.setFontSize(10);
      doc.setTextColor(0);
      const labelText = `${category} (${count})`;
      const labelX = margin + barLength + 2;
      const labelWidth = doc.getTextWidth(labelText);
      const adjustedLabelX =
        labelX + labelWidth > pageWidth - margin
          ? pageWidth - margin - labelWidth
          : labelX;
      doc.text(labelText, adjustedLabelX, yPos + hBarHeight - 1);
    });

    doc.save("events_report.pdf");
  };

  // -------------------- Generate Excel Report (unchanged) --------------------
  const generateExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filterEvents.map((event) => ({
        Title: event.eventTitle,
        Organizer: getOrganizerName(event),
        Type: event.eventType,
        Description: event.eventDescription,
        Date: getFormattedDate(event.eventDate),
        "Start Time": getFormattedTime(event.eventStartTime),
        "Registration Deadline": getFormattedDate(event.registrationDeadline),
        Location: event.location,
        Category: event.eventCategory,
        Price: event.eventPrice,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Events");
    XLSX.writeFile(workbook, "events_report.xlsx");
  };

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Filter by title"
          value={titleFilter}
          onChange={(e) => setTitleFilter(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Filter by type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={dateFilter.start}
          onChange={(e) =>
            setDateFilter((prev) => ({ ...prev, start: e.target.value }))
          }
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={dateFilter.end}
          onChange={(e) =>
            setDateFilter((prev) => ({ ...prev, end: e.target.value }))
          }
          className="border p-2 rounded"
        />
        <button
          onClick={() => setDateFilter({ start: "", end: "" })}
          className="bg-gray-200 px-4 py-2 rounded"
        >
          Reset
        </button>
        <button
          onClick={generatePDF}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-black"
        >
          Download PDF
        </button>
        <button
          onClick={generateExcel}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-black"
        >
          Download Excel
        </button>
      </div>
      <Table>
        <TableCaption>A list of your recent events</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Event Title</TableHead>
            <TableHead>Organizer</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filterEvents?.map((event) => (
            <TableRow key={event.eventId}>
              <TableCell>{event?.eventTitle}</TableCell>
              <TableCell>{getOrganizerName(event)}</TableCell>
              <TableCell>{event?.eventType}</TableCell>
              <TableCell>{event?.location}</TableCell>
              <TableCell>{event?.eventCategory}</TableCell>
              <TableCell>{getFormattedDate(event?.eventDate)}</TableCell>
              <TableCell className="text-right cursor-pointer">
                <Popover>
                  <PopoverTrigger>
                    <MoreHorizontal />
                  </PopoverTrigger>
                  <PopoverContent className="w-32">
                    <div
                      onClick={() =>
                        navigate(`/admin/events/${event?.eventId}/attendees`)
                      }
                      className="flex items-center w-fit gap-2 cursor-pointer mt-2"
                    >
                      <Eye className="w-4" />
                      <span>Attendees</span>
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

export default AdminEventsTable;
