import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Search } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { useNavigate } from 'react-router-dom';
import 'animate.css';
import billOne from '@/assets/billOne.png';
import billTwo from '@/assets/billTwo.png';
import billThree from '@/assets/billThree.png';
import billFour from '@/assets/billFour.png';

const HeroSection = () => {
    const [query, setQuery] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const searchJobHandler = () => {
        if (query.trim()) {
            dispatch(setSearchedQuery(query));
            navigate('/browse');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            searchJobHandler();
        }
    };

    return (
        <div className="relative text-center bg-gray-50 py-16 overflow-hidden">
    {/* Image Section */}
    <div className="absolute top-0 left-0 flex flex-col gap-8">
        <img
            src={billOne}
            alt="Bill One"
            className="w-32 h-32 object-contain animate__animated animate__fadeInLeft mb-4 ml-6"
        />
        <img
            src={billTwo}
            alt="Bill Two"
            className="w-32 h-32 object-contain animate__animated animate__fadeInLeft mt-4"
        />
    </div>
    <div className="absolute top-0 right-0 flex flex-col gap-8">
        <img
            src={billThree}
            alt="Bill Three"
            className="w-32 h-32 object-contain animate__animated animate__fadeInRight mb-6 mr-6"
        />
        <img
            src={billFour}
            alt="Bill Four"
            className="w-32 h-32 object-contain animate__animated animate__fadeInRight mt-6"
        />
    </div>

            {/* Hero Content */}
            <div className="flex flex-col gap-5 my-10 relative z-10">
                <span className="mx-auto px-4 py-2 rounded-full bg-[#F5F5F5] text-[#000] font-medium shadow-md animate__animated animate__fadeFromleft">
                    Unlock the Power of Your Hustle.
                </span>
                <h1 className="text-5xl font-extrabold text-gray-900 leading-tight animate__animated animate__fadeInUp">
                    Where Ambition Meets Opportunity – <br />
                    Let the Hustle Begin!
                </h1>
                <div className="flex flex-col items-center gap-4 animate__animated animate__fadeIn">
                    <div className="flex w-[60%] shadow-md border border-gray-200 pl-3 rounded-full items-center gap-4">
                        <input
                            type="text"
                            placeholder="Find your dream jobs"
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="outline-none border-none w-full py-3 px-4 rounded-l-full text-gray-700"
                        />
                        <Button
                            onClick={searchJobHandler}
                            className="rounded-r-full bg-[#6A38C2] hover:bg-[#5b30a6] text-white px-4 py-3"
                        >
                            <Search className="h-5 w-5" />
                        </Button>
                    </div>
                    <Button
                        onClick={searchJobHandler}
                        className="bg-[#6A38C2] hover:bg-[#5b30a6] text-white px-6 py-3 rounded-lg shadow-md"
                    >
                        Search Jobs
                    </Button>
                    <p className="text-gray-600 mt-4 text-lg font-light animate__animated animate__fadeInUp">
                        From Search to Success, We've Got You Covered.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
