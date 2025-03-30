import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import { Button } from '../ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import axios from 'axios';
import { COMPANY_API_END_POINT } from '@/utils/constant';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import useGetCompanyById from '@/hooks/useGetCompanyById';

const CompanySetup = () => {
    const params = useParams();
    const dispatch = useDispatch();
    useGetCompanyById(params.id);
    const { singleCompany } = useSelector(store => store.company); // Get company details from Redux
    const { token } = useSelector(state => state.auth);  // Access the token from the Redux store

    const [input, setInput] = useState({
        name: singleCompany?.companyName || "",
        description: singleCompany?.companyDescription || "",
        website: singleCompany?.companyWebsite || "",
        location: singleCompany?.location || "",
    });

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const changeFileHandler = (e) => {
        const file = e.target.files?.[0];
        setInput({ ...input, file });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        // Updated field names to match backend expectations
        formData.append("companyName", input.name);
        formData.append("companyDescription", input.description);
        formData.append("companyWebsite", input.website);
        formData.append("location", input.location);
        

        // Debug: Log formData entries
        for (let pair of formData.entries()) {
            console.log(`${pair[0]}: ${pair[1]}`);
        }

        try {
            setLoading(true);

            if (!token) {
                toast.error("Token not found, please log in again.");
                return;
            }

            console.log("Token:", token);  // Debugging log

            const res = await axios.put(
                `${COMPANY_API_END_POINT}/update/${params.id}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`  // Include token in request headers
                    },
                    withCredentials: true // Ensure credentials are sent with the request (cookies)
                }
            );

            console.log("Response from backend:", res.data);  // Log the response to check the structure

            if (res.data.success) {
                toast.success(res.data.message || "Company details updated successfully!");
                navigate("/admin/companies");
            } else {
                toast.error(res.data.message || "Something went wrong.");
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // Sync input state with Redux company data (to prevent issues with the initial state)
    useEffect(() => {
        setInput({
            name: singleCompany?.companyName || "",
            description: singleCompany?.companyDescription || "",
            website: singleCompany?.companyWebsite || "",
            location: singleCompany?.location || "",
            file: null // Reset file when company data changes
        });
    }, [singleCompany]);

    return (
        <div>
            <Navbar />
            <div className='max-w-xl mx-auto my-10'>
                <form onSubmit={submitHandler}>
                    <div className='flex items-center gap-5 p-8'>
                        <Button onClick={() => navigate("/admin/companies")} variant="outline" className="flex items-center gap-2 text-gray-500 font-semibold">
                            <ArrowLeft />
                            <span>Back</span>
                        </Button>
                        <h1 className='font-bold text-xl'>Company Update</h1>
                    </div>
                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <Label>Company Name</Label>
                            <Input
                                type="text"
                                name="name"
                                value={input.name}
                                onChange={changeEventHandler}
                            />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Input
                                type="text"
                                name="description"
                                value={input.description}
                                onChange={changeEventHandler}
                            />
                        </div>
                        <div>
                            <Label>Website</Label>
                            <Input
                                type="text"
                                name="website"
                                value={input.website}
                                onChange={changeEventHandler}
                            />
                        </div>
                        <div>
                            <Label>Location</Label>
                            <Input
                                type="text"
                                name="location"
                                value={input.location}
                                onChange={changeEventHandler}
                            />
                        </div>
                        
                    </div>
                    {
                        loading ? (
                            <Button className="w-full my-4">
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Please wait
                            </Button>
                        ) : (
                            <Button type="submit" className="w-full my-4">Update</Button>
                        )
                    }
                </form>
            </div>
        </div>
    );
};

export default CompanySetup;
