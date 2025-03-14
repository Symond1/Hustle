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
        const currentDate = new Date().toLocaleString();
        let pageNumber = 1;

        doc.text("Applied Jobs Report", 14, 15);
        doc.text(`Generated on: ${currentDate}`, 14, 25);

        const headers = [["Date", "Job Role", "Company", "Status"]];
        const data = filteredJobs.map((job) => [
            job.createdAt.split("T")[0],
            job?.job?.title || "N/A",
            job?.job?.companyName || "N/A",
            job.status.toUpperCase()
        ]);

        doc.autoTable({
            head: headers,
            body: data,
            startY: 30,
            didDrawPage: function () {
                doc.text(`Page ${pageNumber}`, 180, 285);
                pageNumber++;
            },
        });

        doc.save("Applied_Jobs_Report.pdf");
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(
            filteredJobs.map(job => ({
                "Date": job.createdAt.split("T")[0],
                "Job Role": job?.job?.title || "N/A",
                "Company": job?.job?.companyName || "N/A",
                "Status": job.status.toUpperCase(),
            }))
        );
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Applied Jobs");
        XLSX.writeFile(workbook, "Applied_Jobs_Report.xlsx");
    };

    return (
        <div>
            <div className="mb-4 flex flex-wrap gap-4">
                <input type="text" placeholder="Search by Job Title" value={searchJob} onChange={(e) => setSearchJob(e.target.value)} className="border p-2 rounded" />
                <input type="text" placeholder="Search by Company" value={searchCompany} onChange={(e) => setSearchCompany(e.target.value)} className="border p-2 rounded" />
                <select value={searchStatus} onChange={(e) => setSearchStatus(e.target.value)} className="border p-2 rounded">
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                </select>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border p-2 rounded" />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border p-2 rounded" />
                <Button onClick={() => { setSearchJob(""); setSearchCompany(""); setSearchStatus(""); setStartDate(""); setEndDate(""); }}>Reset Filters</Button>
                <Button onClick={generatePDF} className="bg-red-500 text-white">Export PDF</Button>
                <Button onClick={exportToExcel} className="bg-green-500 text-white">Export Excel</Button>
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
