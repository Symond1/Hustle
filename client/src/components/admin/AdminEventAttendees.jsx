import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { toast } from 'sonner';
import Navbar from '../shared/Navbar';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const AdminEventAttendees = () => {
    const { eventId } = useParams();
    const { token } = useSelector(store => store.auth);
    const [attendees, setAttendees] = useState([]);
    const [filteredAttendees, setFilteredAttendees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ fullname: '', email: '', phoneNumber: '', city: '', state: '' });

    useEffect(() => {
        const fetchAttendees = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/v1/event/${eventId}/attendees`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
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
    
        const filtered = attendees.filter(attendee =>
            Object.keys(updatedFilters).every(key =>
                updatedFilters[key] === "" || // If filter is empty, do not filter this field
                (attendee[key] && attendee[key].toString().toLowerCase().includes(updatedFilters[key].toLowerCase()))
            )
        );
        setFilteredAttendees(filtered);
    };
    

    const resetFilters = () => {
        setFilters({ fullname: '', email: '', phoneNumber: '', city: '', state: '' });
        setFilteredAttendees(attendees);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("Event Attendees Report", 14, 10);
        doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 14, 20);

        doc.autoTable({
            head: [['Name', 'Email', 'Contact', 'City', 'State']],
            body: filteredAttendees.map(a => [a.fullname, a.email, a.phoneNumber, a.city, a.state]),
            startY: 30,
        });
        doc.save("event_attendees_report.pdf");
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredAttendees);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendees");
        XLSX.writeFile(workbook, "event_attendees_report.xlsx");
    };

    return (
        <>
            <Navbar/>
            <div className="p-6">
                <h2 className="text-xl font-bold mb-4 text-center">Event Attendees</h2>
                <div className="flex gap-4 mb-4">
                    {['fullname', 'email', 'phoneNumber', 'city', 'state'].map(field => (
                        <Input
                            key={field}
                            name={field}
                            value={filters[field]}
                            onChange={handleFilterChange}
                            placeholder={`Filter by ${field}`}
                        />
                    ))}
                    <Button onClick={resetFilters}>Reset</Button>
                    <Button onClick={exportToPDF} className="bg-red-500">Export PDF</Button>
                    <Button onClick={exportToExcel} className="bg-green-500">Export Excel</Button>
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
                                filteredAttendees.map(attendee => (
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
                                    <TableCell colSpan="5" className="text-center">No attendees found</TableCell>
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
