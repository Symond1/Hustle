import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Avatar, AvatarImage } from '../ui/avatar';
import { LogOut, User2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { setUser } from '@/redux/authSlice';
import { setResetAllAppliedJobs } from '@/redux/jobSlice';  // Import the clearAppliedJobs action
import { toast } from 'sonner';

const Navbar = () => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const logoutHandler = async () => {
        try {
            const token = user?.token; // Assuming the token is stored in `user.token`
            const res = await axios.get(`${USER_API_END_POINT}/logout`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Add Authorization header
                },
                withCredentials: true, // If cookies are required
            });

            if (res.data.success) {
                dispatch(setUser(null)); // Clear the user data from Redux
                dispatch(setResetAllAppliedJobs()); // Clear applied jobs from Redux store
                navigate('/');
                toast.success(res.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'An error occurred during logout');
        }
    };

    // Normalize the role for case-insensitive comparison
    const normalizedRole = user?.role?.toLowerCase().trim();

    return (
        <div className='bg-white shadow-md'>
            <div className='flex items-center justify-between mx-auto max-w-7xl h-16'>
                <div className='flex items-center gap-12 mt-0'>
                    <h1 className='text-3xl font-bold text-gray-800'>Hustle</h1>
                    <ul className='flex font-medium items-center gap-5 mt-2.5 text-gray-700'>
                        {/* Links for Recruiters */}
                        {normalizedRole === 'recruiter' && (
                            <>
                                <li><Link to="/admin/companies" className='hover:text-red-600 transition-all'>Company</Link></li>
                                <li><Link to="/admin/jobs" className='hover:text-red-600 transition-all'>Jobs</Link></li>
                                <li><Link to="/admin/events" className='hover:text-red-600 transition-all'>Events</Link></li>
                            </>
                        )}

{normalizedRole === 'admin' && (
                            <>
                               <li><Link to="/Company" className='hover:text-red-600 transition-all'>Company</Link></li>
                                <li><Link to="/admin/jobs" className='hover:text-red-600 transition-all'>Jobs</Link></li>
                                <li><Link to="/admin/events" className='hover:text-red-600 transition-all'>Events</Link></li>
                                {/* Companies link visible for jobseekers */}
                               </>
                        )}

                        {/* Links for Jobseeker */}
                        {normalizedRole === 'jobseeker' && (
                            <>
                                <li><Link to="/" className='hover:text-red-600 transition-all'>Home</Link></li>
                                <li><Link to="/jobs" className='hover:text-red-600 transition-all'>Jobs</Link></li>
                                <li><Link to="/browse" className='hover:text-red-600 transition-all'>Browse</Link></li>
                                <li><Link to="/events" className='hover:text-red-600 transition-all'>Events</Link></li>
                                {/* Companies link visible for jobseekers */}
                                <li><Link to="/Company" className='hover:text-red-600 transition-all'>Company</Link></li>
                            </>
                        )}

                        {/* Links for Visitors */}
                        {!user && (
                            <>
                                <li><Link to="/" className='hover:text-red-600 transition-all'>Home</Link></li>
                                <li><Link to="/jobs" className='hover:text-red-600 transition-all'>Jobs</Link></li>
                                <li><Link to="/browse" className='hover:text-red-600 transition-all'>Browse</Link></li>
                                <li><Link to="/events" className='hover:text-red-600 transition-all'>Events</Link></li>
                                {/* Companies link visible for visitors */}
                                <li><Link to="/company" className='hover:text-red-600 transition-all'>Companies</Link></li>
                            </>
                        )}
                    </ul>
                </div>

                {/* User actions */}
                <div className='flex items-center gap-5 ml-auto'>
                    {!user ? (
                        <>
                            <Link to="/login">
                                <Button className="bg-black text-white hover:bg-gray-900 transition-all duration-300 transform hover:scale-105">Login</Button>
                            </Link>
                            <Link to="/signup">
                                <Button className="bg-black text-white hover:bg-gray-900 transition-all duration-300 transform hover:scale-105">Signup</Button>
                            </Link>
                        </>
                    ) : (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Avatar className="cursor-pointer">
                                    <AvatarImage src={user?.profile?.profilePhoto || "/logos/logo11.png"} alt="Profile" />
                                </Avatar>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 bg-white border border-gray-200 rounded-md shadow-lg p-4">
                                <div className='flex gap-2 space-y-2'>
                                    <Avatar className="cursor-pointer">
                                        <AvatarImage
                                            src={user?.profile?.profilePhoto || "/logos/logo11.png"} alt="Profile" />
                                    </Avatar>
                                    <div>
                                        <h4 className='font-medium text-gray-800'>{user?.fullname || 'Anonymous'}</h4>
                                        <p className='text-sm text-muted-foreground'>{user?.profile?.bio}</p>
                                    </div>
                                </div>
                                <div className='flex flex-col my-2 text-gray-600'>
                                    {['jobseeker', 'recruiter'].includes(normalizedRole) && (
                                        <div className='flex w-fit items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded-md'>
                                            <User2 />
                                            <Button variant="link" className='text-gray-800'>
                                                <Link to="/profile">View Profile</Link>
                                            </Button>
                                        </div>
                                    )}

                                    <div className='flex w-fit items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded-md'>
                                        <LogOut />
                                        <Button onClick={logoutHandler} className="bg-black text-white hover:bg-gray-800 transition-all duration-300 transform hover:scale-105" variant="link">
                                            Logout
                                        </Button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;
