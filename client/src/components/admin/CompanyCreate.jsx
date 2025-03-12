import React, { useState } from 'react';
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { COMPANY_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { setSingleCompany } from '@/redux/companySlice';
import { setUser, setToken } from '@/redux/authSlice'; // Import auth actions

const CompanyCreate = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Access token and user details from Redux store
    const { token, user } = useSelector((store) => store.auth);

    // Initialize state variables for each field
    const [companyName, setCompanyName] = useState('');
    const [companyLogo, setCompanyLogo] = useState('');
    const [companyWebsite, setCompanyWebsite] = useState('');
    const [companyDescription, setCompanyDescription] = useState('');
    const [companyIndustry, setCompanyIndustry] = useState('');
    const [companySize, setCompanySize] = useState('');
    const [location, setLocation] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');

    const registerNewCompany = async () => {
        try {
            const res = await axios.post(
                `${COMPANY_API_END_POINT}/register`, // Correct template literal here
                {
                    companyName,
                    companyLogo,
                    companyWebsite,
                    companyDescription,
                    companyIndustry,
                    companySize,
                    location,
                    contactEmail,
                    contactPhone,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`, // Correct Authorization format
                    },
                    withCredentials: true, // Ensure cookies are sent with the request
                }
            );

            if (res?.data?.success) {
                // Dispatch actions to update Redux state
                dispatch(setSingleCompany(res.data.company));
                dispatch(setUser(res.data.user)); // Update the user in Redux
                dispatch(setToken(res.data.token)); // Update the token in Redux
                toast.success(res.data.message);

                const companyId = res?.data?.company?._id;
                navigate(`/admin/companies/${companyId}`); // Corrected URL template literal
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Something went wrong');
        }
    };

    return (
        <div>
            <Navbar />
            <div className="max-w-4xl mx-auto">
                <div className="my-10">
                    <h1 className="font-bold text-2xl">Your Company Details</h1>
                    <p className="text-gray-500">
                        Feed your company Details. You are also allowed to change the details after the creation of your company.
                    </p>
                </div>

                <div className="my-4">
                    <Label>Company Name</Label>
                    <Input
                        type="text"
                        className="my-2"
                        placeholder="Enter your company name"
                        onChange={(e) => setCompanyName(e.target.value)}
                    />
                </div>

                <div className="my-4">
                    <Label>Company Website</Label>
                    <Input
                        type="text"
                        className="my-2"
                        placeholder="https://www.companywebsite.com"
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                    />
                </div>

                <div className="my-4">
                    <Label>Company Description</Label>
                    <Input
                        type="text"
                        className="my-2"
                        placeholder="Tell about your company"
                        onChange={(e) => setCompanyDescription(e.target.value)}
                    />
                </div>

                <div className="my-4">
                    <Label>Company Industry</Label>
                    <Input
                        type="text"
                        className="my-2"
                        placeholder="Industry (e.g., IT, Finance)"
                        onChange={(e) => setCompanyIndustry(e.target.value)}
                    />
                </div>

                <div className="my-4">
                    <Label>Company Size</Label>
                    <Input
                        type="text"
                        className="my-2"
                        placeholder="e.g., Small, Medium, Large"
                        onChange={(e) => setCompanySize(e.target.value)}
                    />
                </div>

                <div className="my-4">
                    <Label>Location</Label>
                    <Input
                        type="text"
                        className="my-2"
                        placeholder="City, State, or Country"
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </div>

                <div className="my-4">
                    <Label>Contact Email</Label>
                    <Input
                        type="email"
                        className="my-2"
                        placeholder="example@company.com"
                        onChange={(e) => setContactEmail(e.target.value)}
                    />
                </div>

                <div className="my-4">
                    <Label>Contact Phone</Label>
                    <Input
                        type="text"
                        className="my-2"
                        placeholder="(123) 456-7890"
                        onChange={(e) => setContactPhone(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 my-10">
                    <Button variant="outline" onClick={() => navigate("/admin/companies")}>
                        Cancel
                    </Button>
                    <Button onClick={registerNewCompany}>Continue</Button>
                </div>
            </div>
        </div>
    );
};

export default CompanyCreate;
