import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useSelector, useDispatch } from 'react-redux';
import { setAllAppliedJobs } from '../redux/jobSlice';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const AppliedJobTable = () => {
    const dispatch = useDispatch();
    const { allAppliedJobs } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth); // Assuming user info is stored in Redux auth slice
    const [loading, setLoading] = useState(true);
    const [searchJob, setSearchJob] = useState("");
    const [searchCompany, setSearchCompany] = useState("");
    const [searchStatus, setSearchStatus] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        const fetchAppliedJobs = async () => {
            try {
                const token = document.cookie.split(';').find(cookie => cookie.trim().startsWith('token=')).split('=')[1];
                const response = await axios.get("http://localhost:8000/api/v1/application/applied", {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    withCredentials: true,
                });
                if (response.data.success && response.data.applications.length > 0) {
                    dispatch(setAllAppliedJobs(response.data.applications));
                }
            } catch (error) {
                console.error("Error fetching applied jobs:", error);
            } finally {
                setLoading(false);
            }
        };
        if (allAppliedJobs.length === 0) {
            fetchAppliedJobs();
        } else {
            setLoading(false);
        }
    }, [dispatch, allAppliedJobs]);

    const filteredJobs = allAppliedJobs.filter(job => {
        return (
            (searchJob ? job?.job?.title?.toLowerCase().includes(searchJob.toLowerCase()) : true) &&
            (searchCompany ? job?.job?.companyName?.toLowerCase().includes(searchCompany.toLowerCase()) : true) &&
            (searchStatus ? job?.status.toLowerCase() === searchStatus.toLowerCase() : true) &&
            (startDate ? new Date(job.createdAt) >= new Date(startDate) : true) &&
            (endDate ? new Date(job.createdAt) <= new Date(endDate) : true)
        );
    });

    const generatePDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 14;
        let pageNumber = 1;

        // Header function
        const renderHeader = () => {
            // Blue header background
            doc.setFillColor(0, 123, 255);
            doc.rect(0, 0, pageWidth, 40, "F");

            // Add company logo (adjust the path and dimensions as needed)
            try {
                doc.addImage("/logo.jpg", "jpg", margin, 5, 30, 30);
            } catch (error) {
                console.error("Error loading logo image:", error);
            }

            // Company name and report title
            doc.setFont("helvetica", "bold");
            doc.setFontSize(18);
            doc.setTextColor(255, 255, 255);
            doc.text("BrainerHub Solutions", margin + 35, 15);

            doc.setFontSize(14);
            doc.text("Applied Jobs Report", margin + 35, 25);

            // Generated date and user role
            doc.setFontSize(10);
            const currentDate = new Date().toLocaleString();
            doc.text(`Generated on: ${currentDate}`, pageWidth - margin, 15, { align: "right" });
            if (user?.role) {
                doc.text(`Role: ${user.role}`, pageWidth - margin, 25, { align: "right" });
            }

            // Draw a line after header
            doc.setDrawColor(200);
            doc.setLineWidth(0.5);
            doc.line(margin, 45, pageWidth - margin, 45);
        };

        // Footer function
        const renderFooter = () => {
            const footerY = pageHeight - 10;
            doc.setFontSize(8);
            doc.setTextColor(100);
            const downloadedBy = `(${user?.email || "N/A"})`;
            doc.text(`Downloaded by: ${downloadedBy}`, margin, footerY);
            doc.text(`Page ${pageNumber}`, pageWidth - margin, footerY, { align: "right" });
            doc.setTextColor(0);
        };

        // Initial header render for the first page
        renderHeader();

        // Table headers and data
        const headers = [["Date", "Job Role", "Company", "Status"]];
        const data = filteredJobs.map((job) => [
            job.createdAt.split("T")[0],
            job?.job?.title || "N/A",
            job?.job?.companyName || "N/A",
            job.status.toUpperCase(),
        ]);

        doc.autoTable({
            head: headers,
            body: data,
            startY: 50,
            styles: { fontSize: 10, cellPadding: 2 },
            headStyles: { fillColor: [0, 123, 255], textColor: 255 },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            didDrawPage: () => {
                renderFooter();
                pageNumber++;
            },
            willDrawPage: () => {
                renderHeader();
            },
        });

        doc.save("Applied_Jobs_Report.pdf");
    };

    const exportToExcel = () => {
        const currentDate = new Date().toLocaleString();
        const downloadedBy = `${user?.name || "Unknown User"} (${user?.email || "N/A"})`;
        const worksheetData = [
            ["Company Name:", "BrainerHub Solutions"],
            ["Report:", "Applied Jobs Report"],
            ["Generated on:", currentDate],
            ["Downloaded by:", downloadedBy],
            [], // Empty row for spacing
            ["Date", "Job Role", "Company", "Status"],
            ...filteredJobs.map(job => [
                job.createdAt.split("T")[0],
                job?.job?.title || "N/A",
                job?.job?.companyName || "N/A",
                job.status.toUpperCase(),
            ]),
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Applied Jobs");
        XLSX.writeFile(workbook, "Applied_Jobs_Report.xlsx");
    };

    return (
        <div>
            <div className="mb-4 flex flex-wrap gap-4">
                <input
                    type="text"
                    placeholder="Search by Job Title"
                    value={searchJob}
                    onChange={(e) => setSearchJob(e.target.value)}
                    className="border p-2 rounded"
                />
                <input
                    type="text"
                    placeholder="Search by Company"
                    value={searchCompany}
                    onChange={(e) => setSearchCompany(e.target.value)}
                    className="border p-2 rounded"
                />
                <select
                    value={searchStatus}
                    onChange={(e) => setSearchStatus(e.target.value)}
                    className="border p-2 rounded"
                >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                </select>
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
                <Button
                    onClick={() => {
                        setSearchJob("");
                        setSearchCompany("");
                        setSearchStatus("");
                        setStartDate("");
                        setEndDate("");
                    }}
                >
                    Reset Filters
                </Button>
                <Button onClick={generatePDF} className="bg-red-500 text-white">
                    Export PDF
                </Button>
                <Button onClick={exportToExcel} className="bg-green-500 text-white">
                    Export Excel
                </Button>
            </div>
            <Table>
                <TableCaption>A list of your applied jobs</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Job Role</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow>
                    ) : filteredJobs.length === 0 ? (
                        <TableRow><TableCell colSpan={4}>No applied jobs found.</TableCell></TableRow>
                    ) : (
                        filteredJobs.map((appliedJob) => (
                            <TableRow key={appliedJob._id}>
                                <TableCell>{appliedJob.createdAt.split("T")[0]}</TableCell>
                                <TableCell>{appliedJob?.job?.title || "N/A"}</TableCell>
                                <TableCell>{appliedJob?.job?.companyName || "N/A"}</TableCell>
                                <TableCell className="text-right">
                                    <Badge
                                        className={`${
                                            appliedJob?.status === 'rejected'
                                                ? 'bg-red-400'
                                                : appliedJob.status === 'pending'
                                                ? 'bg-gray-400'
                                                : 'bg-green-400'
                                        }`}
                                    >
                                        {appliedJob.status.toUpperCase()}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default AppliedJobTable;
