import React, { useState } from 'react';
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useSelector } from 'react-redux';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import axios from 'axios';
import { EVENT_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const PostEvent = () => {
    const [input, setInput] = useState({
        eventTitle: "",
        Organizer: "",
        eventType: "",
        eventDescription: "",
        eventDate: "",
        eventStartTime: "",
        registrationDeadline: "",
        location: "",
        eventCategory: "",
        eventPrice: "",
        thirdPartyLink: "",
        attendees: [],
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { token, isAuthenticated } = useSelector((store) => store.auth);

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (field, value) => {
        setInput({ ...input, [field]: value });
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        // Basic required fields check
        if (!input.eventTitle || !input.eventDate) {
            toast.error("Event title and date are required.");
            return;
        }

        // Validate event start time is on the same day as event date
        if (input.eventStartTime) {
            const eventDateOnly = input.eventDate; // YYYY-MM-DD from the date input
            const eventStartDateOnly = new Date(input.eventStartTime)
                .toISOString()
                .split('T')[0]; // extract date part from datetime-local

            if (eventStartDateOnly !== eventDateOnly) {
                toast.error("Event start time must be on the same day as the event date.");
                return;
            }
        }

        // Validate that registration deadline does not exceed event start time
        if (input.registrationDeadline && input.eventStartTime) {
            const regDeadline = new Date(input.registrationDeadline);
            const eventStart = new Date(input.eventStartTime);
            if (regDeadline > eventStart) {
                toast.error("Registration deadline should not exceed the event start time.");
                return;
            }
        }

        try {
            setLoading(true);
            const res = await axios.post(
                `${EVENT_API_END_POINT}/create`,
                { ...input, attendees: [] },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    withCredentials: true,
                }
            );

            if (res.data.success) {
                toast.success(res.data.message);
                navigate('/admin/events');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-50 to-white">
            <Navbar />
            <div className="flex items-center justify-center py-12 px-4">
                <form onSubmit={submitHandler} className="bg-white p-12 max-w-4xl w-full rounded-2xl shadow-2xl border border-gray-100">
                    <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 border-b pb-4">Post a Event</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col space-y-3">
                            <Label className="text-gray-700 font-semibold">Event Title</Label>
                            <Input 
                                type="text" 
                                name="eventTitle" 
                                value={input.eventTitle} 
                                onChange={changeEventHandler} 
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" 
                            />
                        </div>
                        <div className="flex flex-col space-y-3">
                            <Label className="text-gray-700 font-semibold">Organizer</Label>
                            <Input 
                                type="text" 
                                name="Organizer" 
                                value={input.Organizer} 
                                onChange={changeEventHandler} 
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" 
                            />
                        </div>
                        <div className="flex flex-col space-y-3">
                            <Label className="text-gray-700 font-semibold">Event Type</Label>
                            <Select onValueChange={(value) => handleSelectChange("eventType", value)}>
                                <SelectTrigger className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                                    <SelectValue placeholder="Select event type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="Job Fair">Job Fair</SelectItem>
                                        <SelectItem value="Conference">Conference</SelectItem>
                                        <SelectItem value="Workshop">Workshop</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col space-y-3">
                            <Label className="text-gray-700 font-semibold">Event Description</Label>
                            <Input 
                                type="text" 
                                name="eventDescription" 
                                value={input.eventDescription} 
                                onChange={changeEventHandler} 
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" 
                            />
                        </div>
                        <div className="flex flex-col space-y-3">
                            <Label className="text-gray-700 font-semibold">Event Date</Label>
                            <Input 
                                type="date" 
                                name="eventDate" 
                                value={input.eventDate} 
                                onChange={changeEventHandler} 
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" 
                            />
                        </div>
                        <div className="flex flex-col space-y-3">
                            <Label className="text-gray-700 font-semibold">Event Start Time</Label>
                            <Input 
                                type="datetime-local" 
                                name="eventStartTime" 
                                value={input.eventStartTime} 
                                onChange={changeEventHandler} 
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" 
                            />
                        </div>
                        <div className="flex flex-col space-y-3">
                            <Label className="text-gray-700 font-semibold">Registration Deadline</Label>
                            <Input 
                                type="datetime-local" 
                                name="registrationDeadline" 
                                value={input.registrationDeadline} 
                                onChange={changeEventHandler} 
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" 
                            />
                        </div>
                        <div className="flex flex-col space-y-3">
                            <Label className="text-gray-700 font-semibold">Location</Label>
                            <Input 
                                type="text" 
                                name="location" 
                                value={input.location} 
                                onChange={changeEventHandler} 
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" 
                            />
                        </div>
                        <div className="flex flex-col space-y-3">
                            <Label className="text-gray-700 font-semibold">Event Category</Label>
                            <Select onValueChange={(value) => handleSelectChange("eventCategory", value)}>
                                <SelectTrigger className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                                    <SelectValue placeholder="Select event category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="Career">Career</SelectItem>
                                        <SelectItem value="Technology">Technology</SelectItem>
                                        <SelectItem value="Job Fair">Job Fair</SelectItem>
                                        <SelectItem value="Conference">Conference</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col space-y-3">
                            <Label className="text-gray-700 font-semibold">Event Price</Label>
                            <Select onValueChange={(value) => handleSelectChange("eventPrice", value)}>
                                <SelectTrigger className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                                    <SelectValue placeholder="Select price type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="Free">Free</SelectItem>
                                        <SelectItem value="Paid">Paid</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col space-y-3">
                            <Label className="text-gray-700 font-semibold">Third Party Link</Label>
                            <Input 
                                type="url" 
                                name="thirdPartyLink" 
                                value={input.thirdPartyLink} 
                                onChange={changeEventHandler} 
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" 
                            />
                        </div>
                    </div>
                    <div className="flex justify-center mt-10">
                        <Button 
                            type="submit" 
                            className="w-full md:w-1/3 py-3 bg-black hover:bg-gray-800 text-white font-bold rounded-full shadow-lg transition transform hover:scale-105"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Post Event'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostEvent;
