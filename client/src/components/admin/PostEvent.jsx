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

        if (!input.eventTitle || !input.eventDate) {
            toast.error("Event title and date are required.");
            return;
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
        <div>
            <Navbar />
            <div className="flex items-center justify-center w-screen my-5">
                <form onSubmit={submitHandler} className="p-8 max-w-5xl w-full border border-gray-200 shadow-lg rounded-md">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label>Event Title</Label>
                            <Input type="text" name="eventTitle" value={input.eventTitle} onChange={changeEventHandler} />
                        </div>
                        <div>
                            <Label>Organizer</Label>
                            <Input type="text" name="Organizer" value={input.Organizer} onChange={changeEventHandler} />
                        </div>
                        <div>
                            <Label>Event Type</Label>
                            <Select onValueChange={(value) => handleSelectChange("eventType", value)}>
                                <SelectTrigger>
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
                        <div>
                            <Label>Event Description</Label>
                            <Input type="text" name="eventDescription" value={input.eventDescription} onChange={changeEventHandler} />
                        </div>
                        <div>
                            <Label>Event Date</Label>
                            <Input type="date" name="eventDate" value={input.eventDate} onChange={changeEventHandler} />
                        </div>
                        <div>
                            <Label>Event Start Time</Label>
                            <Input type="datetime-local" name="eventStartTime" value={input.eventStartTime} onChange={changeEventHandler} />
                        </div>
                        <div>
                            <Label>Registration Deadline</Label>
                            <Input type="datetime-local" name="registrationDeadline" value={input.registrationDeadline} onChange={changeEventHandler} />
                        </div>
                        <div>
                            <Label>Location</Label>
                            <Input type="text" name="location" value={input.location} onChange={changeEventHandler} />
                        </div>
                        <div>
                            <Label>Event Category</Label>
                            <Select onValueChange={(value) => handleSelectChange("eventCategory", value)}>
                                <SelectTrigger>
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
                        <div>
                            <Label>Event Price</Label>
                            <Select onValueChange={(value) => handleSelectChange("eventPrice", value)}>
                                <SelectTrigger>
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
                        <div>
                            <Label>Third Party Link</Label>
                            <Input type="url" name="thirdPartyLink" value={input.thirdPartyLink} onChange={changeEventHandler} />
                        </div>
                    </div>
                    <div className="flex justify-center mt-5">
                        <Button type="submit" className="w-1/4">
                            {loading ? <Loader2 className="animate-spin" /> : 'Post Event'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostEvent;
