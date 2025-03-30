import React, { useState, useEffect } from 'react';
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useSelector } from 'react-redux';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import axios from 'axios';
import { JOB_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const PostJob = () => {
    const [input, setInput] = useState({
        title: "",
        description: "",
        responsibilities: "",
        qualifications: "",
        salary: "",
        location: "",
        jobType: "",
        jobNiche: "",
        industry: "",
        position: 1,
        companyId: "",
        companyName: "",
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { companies } = useSelector((store) => store.company);
    const { token, role, companyId } = useSelector((store) => store.auth);

    // Check if role is recruiter (case-insensitive)
    const isRecruiter = role?.toLowerCase() === 'recruiter';

    // For recruiters, filter companies so only his company appears
    const recruiterCompanies = isRecruiter
        ? companies.filter(company => company._id === companyId)
        : companies;

    // Automatically set recruiter’s company if available
    useEffect(() => {
        if (isRecruiter && recruiterCompanies.length > 0) {
            setInput(prev => ({
                ...prev,
                companyId: recruiterCompanies[0]._id,
                companyName: recruiterCompanies[0].companyName,
            }));
        }
    }, [recruiterCompanies, isRecruiter]);

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const selectChangeHandler = (value) => {
        if (!isRecruiter) {
            const selectedCompany = companies.find(
                (company) => company.companyName.toLowerCase() === value.toLowerCase()
            );
            if (selectedCompany) {
                setInput({ ...input, companyId: selectedCompany._id, companyName: selectedCompany.companyName });
            }
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        if (!token) {
            toast.error("Authentication error. Please log in again.");
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post(
                `${JOB_API_END_POINT}/post`,
                input,
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
                navigate('/admin/jobs');
            }
        } catch (error) {
            console.error("Error Response:", error.response?.data || error);
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
                    <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 border-b pb-4">Post a New Job</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Title */}
                        <div className="flex flex-col space-y-3">
                            <Label className="text-gray-700 font-semibold">Title</Label>
                            <Input 
                                type="text" 
                                name="title" 
                                value={input.title} 
                                onChange={changeEventHandler} 
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" 
                            />
                        </div>
                        {/* Description */}
                        <div className="flex flex-col space-y-3">
                            <Label className="text-gray-700 font-semibold">Description</Label>
                            <Input 
                                type="text" 
                                name="description" 
                                value={input.description} 
                                onChange={changeEventHandler} 
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" 
                            />
                        </div>
                        {/* Responsibilities */}
                        <div className="flex flex-col space-y-3">
                            <Label className="text-gray-700 font-semibold">Responsibilities</Label>
                            <Input 
                                type="text" 
                                name="responsibilities" 
                                value={input.responsibilities} 
                                onChange={changeEventHandler} 
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" 
                            />
                        </div>
                        {/* Qualifications */}
                        <div className="flex flex-col space-y-3">
                            <Label className="text-gray-700 font-semibold">Qualifications</Label>
                            <Input 
                                type="text" 
                                name="qualifications" 
                                value={input.qualifications} 
                                onChange={changeEventHandler} 
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" 
                            />
                        </div>
                        {/* Salary */}
                        <div className="flex flex-col space-y-3">
                            <Label className="text-gray-700 font-semibold">Salary</Label>
                            <Input 
                                type="text" 
                                name="salary" 
                                value={input.salary} 
                                onChange={changeEventHandler} 
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" 
                            />
                        </div>
                        {/* Location */}
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
                        {/* Industry */}
                        <div className="flex flex-col space-y-3">
                            <Label className="text-gray-700 font-semibold">Industry</Label>
                            <Input 
                                type="text" 
                                name="industry" 
                                value={input.industry} 
                                onChange={changeEventHandler} 
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" 
                            />
                        </div>
                        {/* Job Niche */}
                        <div className="flex flex-col space-y-3">
                            <Label className="text-gray-700 font-semibold">Job Niche</Label>
                            <Input 
                                type="text" 
                                name="jobNiche" 
                                value={input.jobNiche} 
                                onChange={changeEventHandler} 
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" 
                            />
                        </div>
                        {/* Job Type */}
                        <div className="flex flex-col space-y-3">
                            <Label className="text-gray-700 font-semibold">Job Type</Label>
                            <Select onValueChange={(value) => setInput({ ...input, jobType: value })}>
                                <SelectTrigger className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                                    <SelectValue placeholder="Select a job type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="Full-time">Full-time</SelectItem>
                                        <SelectItem value="Part-time">Part-time</SelectItem>
                                        <SelectItem value="Contract">Contract</SelectItem>
                                        <SelectItem value="Internship">Internship</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Company */}
                        <div className="flex flex-col space-y-3">
                            <Label className="text-gray-700 font-semibold">Company</Label>
                            <Select 
                                onValueChange={selectChangeHandler} 
                                disabled={isRecruiter} // disable for recruiters
                                value={input.companyName || ''}
                            >
                                <SelectTrigger className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                                    <SelectValue placeholder="Select a company" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {recruiterCompanies.map((company) => (
                                            <SelectItem key={company._id} value={company.companyName}>
                                                {company.companyName}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-center mt-10">
                        <Button 
                            type="submit" 
                            className="w-full md:w-1/3 py-3 bg-black hover:bg-gray-800 text-white font-bold rounded-full shadow-lg transition transform hover:scale-105"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Post Job'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostJob;
