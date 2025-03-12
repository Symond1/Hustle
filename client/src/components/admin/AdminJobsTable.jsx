import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Edit2, Eye, MoreHorizontal, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const AdminJobsTable = () => {
    const { allJobs } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
    const [filterJobs, setFilterJobs] = useState(allJobs);
    const [searchText, setSearchText] = useState("");
    const [searchType, setSearchType] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const navigate = useNavigate();


    useEffect(() => {
        if (!user) return;
        let filtered = user?.role === "Admin" ? allJobs : allJobs.filter(job => job?.postedBy?._id === user._id);
    
        if (searchText) {
            filtered = filtered.filter(job => job?.title?.toLowerCase().includes(searchText.toLowerCase()));
        }
        if (searchType) {
            filtered = filtered.filter(job => job?.jobType?.toLowerCase().includes(searchType.toLowerCase()));
        }
        if (startDate || endDate) {
            filtered = filtered.filter(job => {
                const jobDate = new Date(job.createdAt);
                const start = startDate ? new Date(startDate) : null;
                const end = endDate ? new Date(endDate) : null;
                return (!start || jobDate >= start) && (!end || jobDate <= end);
            });
        }
        setFilterJobs(filtered);
    }, [allJobs, searchText, searchType, startDate, endDate, user]);
        const getFormattedDate = (dateString) => {
        if (!dateString) return ''; 
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0]; 
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        const currentDate = new Date().toLocaleString();
        let pageNumber = 1;

        doc.text("Job Report", 14, 15);
        doc.text(`Generated on: ${currentDate}`, 14, 25);

        const headers = [["Job Title", "Job Type", "Date Posted"]];
        const data = filterJobs.map((job) => [
            job.title,
            job.jobType,
            getFormattedDate(job.createdAt),
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

        doc.save("Job_Report.pdf");
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(
            filterJobs.map(job => ({
                "Job Title": job.title,
                "Job Type": job.jobType,
                "Date Posted": getFormattedDate(job.createdAt),
            }))
        );
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Jobs");
        XLSX.writeFile(workbook, "Job_Report.xlsx");
    };

    

    return (
        <div>
            <div className="mb-4 flex flex-wrap gap-4">
                <input type="text" placeholder="Search by Job Title" value={searchText} onChange={(e) => setSearchText(e.target.value)} className="border p-2 rounded" />
                <input type="text" placeholder="Search by Job Type" value={searchType} onChange={(e) => setSearchType(e.target.value)} className="border p-2 rounded" />
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border p-2 rounded" />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border p-2 rounded" />
                <Button onClick={() => { setSearchText(""); setSearchType(""); setStartDate(""); setEndDate(""); }}>Reset Filters</Button>
                <Button onClick={generatePDF} className="bg-red-500 text-white flex items-center gap-2"><Download size={16} /> PDF</Button>
                <Button onClick={exportToExcel} className="bg-green-500 text-white flex items-center gap-2"><Download size={16} /> Excel</Button>
            </div>
            <Table>
                <TableCaption>A list of your recent job postings</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Job Title</TableHead>
                        <TableHead>Job Type</TableHead>
                        <TableHead>Date Posted</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filterJobs.map(job => (
                        <TableRow key={job._id}>
                            <TableCell>{job?.title}</TableCell>
                            <TableCell>{job?.jobType}</TableCell>
                            <TableCell>{getFormattedDate(job?.createdAt)}</TableCell>
                            <TableCell className="text-right cursor-pointer">
                                <Popover>
                                    <PopoverTrigger><MoreHorizontal /></PopoverTrigger>
                                    <PopoverContent className="w-32">
                                        <div onClick={() => navigate(`/admin/jobs/${job._id}/details`)} className='flex items-center w-fit gap-2 cursor-pointer mt-2'>
                                            <Eye className='w-4'/>
                                            <span>Details</span>
                                        </div>
                                        <div onClick={() => navigate(`/admin/jobs/${job._id}/applicants`)} className='flex items-center w-fit gap-2 cursor-pointer mt-2'>
                                            <Edit2 className='w-4'/>
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
}

export default AdminJobsTable;
