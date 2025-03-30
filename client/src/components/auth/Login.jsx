import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setUser, setToken } from '@/redux/authSlice';
import { Loader2 } from 'lucide-react';

const ADMIN_EMAIL = "admin@example.com";

const Login = () => {
  const [input, setInput] = useState({ email: '', password: '' });
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [emailForReset, setEmailForReset] = useState('');
  const { loading, user } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const submitLoginHandler = async (e) => {
    e.preventDefault();

    try {
      dispatch(setLoading(true));
      // Send only email and password
      const res = await axios.post(`${USER_API_END_POINT}/login`, input, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });

      if (res.data.success) {
        // The server response should include the user's role along with other info.
        dispatch(setUser(res.data.user));
        dispatch(setToken(res.data.token));
        localStorage.setItem("token", res.data.token);
        navigate('/');
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error logging in');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const submitForgotPasswordHandler = async (e) => {
    e.preventDefault();
    if (!emailForReset) {
      toast.error("Please enter an email.");
      return;
    }

    try {
      const res = await axios.post(`${USER_API_END_POINT}/forgot-password`, { email: emailForReset });
      if (res.data.success) {
        toast.success(res.data.message);
        setIsForgotPassword(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending reset link");
    }
  };

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  return (
    <div>
      <Navbar />
      <div className="flex items-center justify-center max-w-7xl mx-auto mt-20">
        <form onSubmit={submitLoginHandler} className="w-1/2 border border-gray-200 rounded-md p-4 my-10">
          <h1 className="font-bold text-xl mb-5">Login</h1>

          {/* Email Input */}
          <div className="my-2">
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={input.email}
              onChange={handleInputChange}
              placeholder="Enter your Email address"
            />
          </div>

          {/* Password Input */}
          <div className="my-2">
            <Label>Password</Label>
            <Input
              type="password"
              name="password"
              value={input.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
            />
          </div>

          {/* Submit Button */}
          {loading ? (
            <Button className="w-full my-4">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
            </Button>
          ) : (
            <Button type="submit" className="w-full my-4">Login</Button>
          )}

          {/* Signup & Forgot Password Links */}
          <div className="mt-4 text-center">
            <span className="text-sm">
              Don't have an account? <Link to="/signup" className="text-blue-600">Signup</Link>
            </span>
            <Button type="button" onClick={() => setIsForgotPassword(true)} className="w-full my-4">
              Forgot Password?
            </Button>
          </div>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {isForgotPassword && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md w-1/3 text-black">
            <h2 className="font-bold text-xl mb-4">Forgot Password</h2>
            <form onSubmit={submitForgotPasswordHandler}>
              <div className="mb-4">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={emailForReset}
                  onChange={(e) => setEmailForReset(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <Button type="submit" className="w-full">Send Reset Link</Button>
              <Button type="button" onClick={() => setIsForgotPassword(false)} className="w-full mt-4 text-gray-600">
                Cancel
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
