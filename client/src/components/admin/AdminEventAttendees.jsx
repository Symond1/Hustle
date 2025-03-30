import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { toast } from "sonner";
import Navbar from "../shared/Navbar";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const AdminEventAttendees = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useSelector((store) => store.auth);
  const [attendees, setAttendees] = useState([]);
  const [filteredAttendees, setFilteredAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    city: "",
    state: "",
  });

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/v1/event/${eventId}/attendees`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAttendees(response.data.attendees);
        setFilteredAttendees(response.data.attendees);
      } catch (error) {
        toast.error("Failed to fetch attendees");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendees();
  }, [eventId, token]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);

    const filtered = attendees.filter((attendee) =>
      Object.keys(updatedFilters).every(
        (key) =>
          updatedFilters[key] === "" ||
          (attendee[key] &&
            attendee[key]
              .toString()
              .toLowerCase()
              .includes(updatedFilters[key].toLowerCase()))
      )
    );
    setFilteredAttendees(filtered);
  };

  const resetFilters = () => {
    setFilters({
      fullname: "",
      email: "",
      phoneNumber: "",
      city: "",
      state: "",
    });
    setFilteredAttendees(attendees);
  };

  // Render header for PDF export
  const renderHeader = (doc, pageWidth, margin) => {
    doc.setFillColor(0, 123, 255); // Blue header
    doc.rect(0, 0, pageWidth, 30, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("Event Attendees Report", margin, 20);
    doc.setFontSize(10);
    const currentDate = new Date().toLocaleString();
    doc.text(`Generated on: ${currentDate}`, margin, 27);
    // Display user role if available
    if (user?.role) {
      doc.text(`Role: ${user.role}`, pageWidth - margin - 40, 20);
    }
    doc.setTextColor(0);
  };

  // Render footer for PDF export
  const renderFooter = (doc, pageWidth, pageHeight, margin, currentPage) => {
    const footerY = pageHeight - 10;
    doc.setFontSize(8);
    doc.setTextColor(100);
    const downloadName = user?.name || "";
    const downloadEmail = user?.email || "";
    doc.text(`Downloaded by: ${downloadName} (${downloadEmail})`, margin, footerY);
    doc.text(`Page ${currentPage}`, pageWidth - margin - 20, footerY);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;

    // First, render the table with attendees using autoTable and the header/footer hook.
    doc.autoTable({
      head: [["Name", "Email", "Contact", "City", "State"]],
      body: filteredAttendees.map((a) => [
        a.fullname,
        a.email,
        a.phoneNumber,
        a.city,
        a.state,
      ]),
      startY: 35, // Leave room for header
      didDrawPage: function () {
        const currentPage = doc.internal.getNumberOfPages();
        renderHeader(doc, pageWidth, margin);
        renderFooter(doc, pageWidth, pageHeight, margin, currentPage);
      },
    });

    // Add a new page for the vertical bar graph of registrations by state.
    doc.addPage();
    const currentPage = doc.internal.getNumberOfPages();
    renderHeader(doc, pageWidth, margin);
    renderFooter(doc, pageWidth, pageHeight, margin, currentPage);

    // Graph Title
    const graphLabelY = 35;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Vertical Bar Graph: Registrations by State", margin, graphLabelY);

    // Define graph area dimensions
    const graphY = graphLabelY + 10;
    const graphHeight = 60;
    const graphWidth = pageWidth - 2 * margin;

    // Calculate registration counts per state
    const stateCounts = {};
    filteredAttendees.forEach((attendee) => {
      const state = attendee.state || "N/A";
      stateCounts[state] = (stateCounts[state] || 0) + 1;
    });
    const stateKeys = Object.keys(stateCounts);
    const maxCount = Math.max(...Object.values(stateCounts), 1);

    // Calculate bar dimensions with spacing
    const barSpacing = 10;
    const barWidth = (graphWidth - (stateKeys.length + 1) * barSpacing) / stateKeys.length;

    // Draw bars for each state
    stateKeys.forEach((state, index) => {
      const count = stateCounts[state];
      const barHeight = (count / maxCount) * graphHeight;
      const xPos = margin + barSpacing + index * (barWidth + barSpacing);
      const yPos = graphY + graphHeight - barHeight;
      doc.setFillColor(100, 149, 237);
      doc.roundedRect(xPos, yPos, barWidth, barHeight, 2, 2, "F");
      // Label each bar with state and count
      doc.setFontSize(8);
      doc.setTextColor(0);
      doc.text(state, xPos + barWidth / 2, graphY + graphHeight + 4, { align: "center" });
      doc.text(`${count}`, xPos + barWidth / 2, yPos - 2, { align: "center" });
    });

    doc.save("event_attendees_report.pdf");
  };

  const exportToExcel = () => {
    const headerRows = [
      ["Event Attendees Report"],
      [
        `Report Date: ${new Date().toLocaleDateString()}`,
        "",
        `Downloaded by: ${user?.email || ""}`,
      ],
      [],
      ["Name", "Email", "Contact", "City", "State"],
    ];
    const dataRows = filteredAttendees.map((a) => [
      a.fullname,
      a.email,
      a.phoneNumber,
      a.city,
      a.state,
    ]);
    const worksheetData = [...headerRows, ...dataRows];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendees");
    XLSX.writeFile(workbook, "event_attendees_report.xlsx");
  };

  return (
    <>
      <Navbar />
      <div className="p-6">
        {/* Black Back Button */}
        <Button
          onClick={() => navigate(-1)}
          className="mb-4 bg-black text-white hover:bg-gray-800 font-semibold py-2 px-6 rounded-full transition-all duration-200 flex items-center gap-2"
        >
          <span>←</span> Back
        </Button>
        <h2 className="text-xl font-bold mb-4 text-center">
          Event Attendees
        </h2>
        <div className="flex gap-4 mb-4">
          {["fullname", "email", "phoneNumber", "city", "state"].map(
            (field) => (
              <Input
                key={field}
                name={field}
                value={filters[field]}
                onChange={handleFilterChange}
                placeholder={`Filter by ${field}`}
              />
            )
          )}
          <Button onClick={resetFilters}>Reset</Button>
          <Button onClick={exportToPDF} className="bg-red-500">
            Export PDF
          </Button>
          <Button onClick={exportToExcel} className="bg-green-500">
            Export Excel
          </Button>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <Table>
            <TableCaption>List of attendees for this event</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>City</TableHead>
                <TableHead>State</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttendees.length > 0 ? (
                filteredAttendees.map((attendee) => (
                  <TableRow key={attendee._id}>
                    <TableCell>{attendee.fullname}</TableCell>
                    <TableCell>{attendee.email}</TableCell>
                    <TableCell>{attendee.phoneNumber}</TableCell>
                    <TableCell>{attendee.city}</TableCell>
                    <TableCell>{attendee.state}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="5" className="text-center">
                    No attendees found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </>
  );
};

export default AdminEventAttendees;
