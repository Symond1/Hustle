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
import { Edit2, Eye, MoreHorizontal, FileText } from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const AdminEventsTable = () => {
  const { allEvents, searchEventByText } = useSelector((store) => store.event);
  const { user } = useSelector((store) => store.auth);
  const [filterEvents, setFilterEvents] = useState(allEvents);
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [titleFilter, setTitleFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const filteredEvents = allEvents.filter((event) => {
      // Ensure admins can see all events
      if (user?.role === "Admin") return true;  
      if (event?.createdBy?._id !== user?._id) return false; // Keep recruiters limited to their own events
  
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

  // Generate PDF Report
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Events Report", 14, 15);
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 14, 25);
    autoTable(doc, {
      startY: 30,
      head: [["Title", "Type", "Date"]],
      body: filterEvents.map((event) => [
        event.eventTitle,
        event.eventType,
        getFormattedDate(event.eventDate),
      ]),
      didDrawPage: function (data) {
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, 180, 285);
      },
    });
    doc.save("events_report.pdf");
  };

  // Generate Excel Report
  const generateExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filterEvents.map((event) => ({
        Title: event.eventTitle,
        Type: event.eventType,
        Date: getFormattedDate(event.eventDate),
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
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        {filterEvents?.map((event) => {
          return (
            <TableRow key={event.eventId}>
              <TableCell>{event?.eventTitle}</TableCell>
              <TableCell>{event?.eventType}</TableCell>
              <TableCell>{getFormattedDate(event?.eventDate)}</TableCell>
              <TableCell className="text-right cursor-pointer">
                <Popover>
                  <PopoverTrigger>
                    <MoreHorizontal />
                  </PopoverTrigger>
                  <PopoverContent className="w-32">
                    <div
                      onClick={() => {

                        navigate(`/admin/events/${event?.eventId}/attendees`);
                      }}
                      className="flex items-center w-fit gap-2 cursor-pointer mt-2"
                    >
                      <Eye className="w-4" />
                      <span>Attendees</span>
                    </div>
                  </PopoverContent>
                </Popover>
              </TableCell>
            </TableRow>
          );
        })}
      </Table>
    </div>
  );
};

export default AdminEventsTable;
