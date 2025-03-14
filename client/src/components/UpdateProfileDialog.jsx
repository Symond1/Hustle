import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { setUser, setToken } from '@/redux/authSlice';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const UpdateProfileDialog = ({ open, setOpen }) => {
    const [loading, setLoading] = useState(false);
    const { user, token } = useSelector((store) => store.auth);
    const navigate = useNavigate();
    const isAdult = (dob) => {
        const today = new Date();
        const birthDate = new Date(dob);
        const age = today.getFullYear() - birthDate.getFullYear();
        const month = today.getMonth() - birthDate.getMonth();
        if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
            return age > 18;
        }
        return age >= 18;
    };


    const [input, setInput] = useState({
        fullname: user?.fullname || '',
        phoneNumber: user?.phoneNumber || '',
        bio: user?.profile?.bio || '',
        skills: user?.profile?.skills?.join(', ') || '',
        file: user?.profile?.resume || '',
        gender: user?.profile?.gender || '',
        company: user?.profile?.company || '',
        city: user?.city || '',
        state: user?.state || '',
        experience: user?.profile?.experience || '',
        education: user?.profile?.education || '',
    });

    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const fileChangeHandler = (e) => {
        const file = e.target.files?.[0];
        setInput({ ...input, file });
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        Object.keys(input).forEach((key) => {
            formData.append(key, input[key]);
        });

        try {
            setLoading(true);

            const res = await axios.post(`${USER_API_END_POINT}/updateProfile`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            });

            if (res.data.success) {
                dispatch(setUser(res.data.user));  // Update user data in Redux
                toast.success(res.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'An error occurred');
        } finally {
            setLoading(false);
        }

        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[600px] space-y-6 p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-800">
                        Update Profile
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={submitHandler}>
                    <div className="grid gap-6">
                        {[{ label: 'Name', id: 'fullname', type: 'text' },
                        { label: 'Phone Number', id: 'phoneNumber', type: 'text' },
                        { label: 'Bio', id: 'bio', type: 'text' },
                        { label: 'Skills', id: 'skills', type: 'text' },
                        { label: 'Experience', id: 'experience', type: 'text' },
                        { label: 'Education', id: 'education', type: 'text' }
                        ].map((field) => (
                            <div key={field.id} className="flex items-center gap-4">
                                <Label htmlFor={field.id} className="w-1/4 text-right">
                                    {field.label}
                                </Label>
                                <Input
                                    id={field.id}
                                    name={field.id}
                                    type={field.type}
                                    value={input[field.id]}
                                    onChange={changeEventHandler}
                                    className="flex-grow"
                                />
                            </div>
                        ))}

                        <div className="grid grid-cols-2 gap-8">
                            <div className="flex items-center gap-4">
                                <Label htmlFor="city" className="w-1/4 text-right">
                                    City
                                </Label>
                                <Input
                                    id="city"
                                    name="city"
                                    type="text"
                                    value={input.city}
                                    onChange={changeEventHandler}
                                    className="flex-grow"
                                />
                            </div>
                            <div className="my-2">

                                <div className="flex items-center gap-6"></div>
                                <Label htmlFor="state" className="w-1/4 text-right"></Label>
                                <select
                                    value={input.state}
                                    name="state"
                                    onChange={changeEventHandler}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                >
                                    <option value="">Select your state</option>
                                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                                    <option value="Assam">Assam</option>
                                    <option value="Bihar">Bihar</option>
                                    <option value="Chhattisgarh">Chhattisgarh</option>
                                    <option value="Goa">Goa</option>
                                    <option value="Gujarat">Gujarat</option>
                                    <option value="Haryana">Haryana</option>
                                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                                    <option value="Jharkhand">Jharkhand</option>
                                    <option value="Karnataka">Karnataka</option>
                                    <option value="Kerala">Kerala</option>
                                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                                    <option value="Maharashtra">Maharashtra</option>
                                    <option value="Manipur">Manipur</option>
                                    <option value="Meghalaya">Meghalaya</option>
                                    <option value="Mizoram">Mizoram</option>
                                    <option value="Nagaland">Nagaland</option>
                                    <option value="Odisha">Odisha</option>
                                    <option value="Punjab">Punjab</option>
                                    <option value="Rajasthan">Rajasthan</option>
                                    <option value="Sikkim">Sikkim</option>
                                    <option value="Tamil Nadu">Tamil Nadu</option>
                                    <option value="Telangana">Telangana</option>
                                    <option value="Tripura">Tripura</option>
                                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                                    <option value="Uttarakhand">Uttarakhand</option>
                                    <option value="West Bengal">West Bengal</option>
                                    <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                                    <option value="Chandigarh">Chandigarh</option>
                                    <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                                    <option value="Lakshadweep">Lakshadweep</option>
                                    <option value="Delhi (National Capital Territory of Delhi)">Delhi (National Capital Territory of Delhi)</option>
                                    <option value="Puducherry">Puducherry</option>
                                </select>
                            </div>
                        </div>



                        {/* Gender dropdown */}

                        <div className="flex items-center gap-4">
                            <Label htmlFor="gender" className="w-1/4 text-right">
                                Gender
                            </Label>
                            <select
                                id="gender"
                                name="gender"
                                value={input.gender}
                                onChange={changeEventHandler}
                                className="flex-grow"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-4">
                            <Label htmlFor="dob" className="w-1/4 text-right">
                                Date of Birth
                            </Label>
                            <Input
                                id="dob"
                                name="dob"
                                type="date"
                                value={input.dob}
                                onChange={changeEventHandler}
                                className="flex-grow"
                            />
                        </div>

                        {input.dob && !isAdult(input.dob) && (
                            <p className="text-red-500 text-sm mt-2">You must be at least 18 years old.</p>
                        )}


                        {/* Resume field for Job Seekers */}
                        {user.role === 'Jobseeker' && (
                            <div className="flex items-center gap-4">
                                <Label htmlFor="file" className="w-1/4 text-right">
                                    Resume
                                </Label>
                                <Input
                                    id="file"
                                    name="file"
                                    type="file"
                                    accept="application/pdf"
                                    onChange={fileChangeHandler}
                                    className="flex-grow"
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter className="mt-4">
                        {loading ? (
                            <Button className="w-full">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                            </Button>
                        ) : (
                            <Button type="submit" className="w-full">
                                Update
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default UpdateProfileDialog;

