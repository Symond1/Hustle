import React, { useState } from 'react';
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
    const { token, isAuthenticated, role } = useSelector((store) => store.auth);

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const selectChangeHandler = (value) => {
        const selectedCompany = companies.find(
            (company) => company.companyName.toLowerCase() === value.toLowerCase()
        );
        if (selectedCompany) {
            setInput({ ...input, companyId: selectedCompany._id, companyName: selectedCompany.companyName });
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
        <div>
            <Navbar />
            <div className="flex items-center justify-center w-screen my-5">
                <form onSubmit={submitHandler} className="p-8 max-w-4xl border border-gray-200 shadow-lg rounded-md">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label>Title</Label>
                            <Input type="text" name="title" value={input.title} onChange={changeEventHandler} className="my-1" />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Input type="text" name="description" value={input.description} onChange={changeEventHandler} className="my-1" />
                        </div>
                        <div>
                            <Label>Responsibilities</Label>
                            <Input type="text" name="responsibilities" value={input.responsibilities} onChange={changeEventHandler} className="my-1" />
                        </div>
                        <div>
                            <Label>Qualifications</Label>
                            <Input type="text" name="qualifications" value={input.qualifications} onChange={changeEventHandler} className="my-1" />
                        </div>
                        <div>
                            <Label>Salary</Label>
                            <Input type="text" name="salary" value={input.salary} onChange={changeEventHandler} className="my-1" />
                        </div>
                        <div>
                            <Label>Location</Label>
                            <Input type="text" name="location" value={input.location} onChange={changeEventHandler} className="my-1" />
                        </div>
                        <div>
                            <Label>Industry</Label>
                            <Input type="text" name="industry" value={input.industry} onChange={changeEventHandler} className="my-1" />
                        </div>
                        <div>
                            <Label>Job Niche</Label>
                            <Input type="text" name="jobNiche" value={input.jobNiche} onChange={changeEventHandler} className="my-1" />
                        </div>
                        <div>
                            <Label>Job Type</Label>
                            <Select onValueChange={(value) => setInput({ ...input, jobType: value })}>
                                <SelectTrigger className="w-full">
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
                        <div>
                            <Label>Company</Label>
                            <Select onValueChange={selectChangeHandler}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a company" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {companies.map((company) => (
                                            <SelectItem key={company._id} value={company.companyName}>
                                                {company.companyName}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-center mt-5">
                        <Button type="submit" className="w-1/4">
                            {loading ? <Loader2 className="animate-spin" /> : 'Post Job'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostJob;
