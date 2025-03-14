import React, { useEffect } from 'react';
import Navbar from './shared/Navbar';
import HeroSection from './pages/HeroSection';
import CategoryCarousel from './pages/CategoryCarousel';
import LatestJobs from './pages/LatestJobs';
import InteractiveSection from './pages/InteractiveSection';
import Company from './pages/Company';
import Footer from './shared/Footer';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import HowItWorks from './pages/HowItWork';

const Home = () => {
  useGetAllJobs();
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role) {
      const role = user.role.toLowerCase(); // Convert role to lowercase
      if (role === 'recruiter') {
        navigate('/admin/companies');
      }
    }
  }, [user, navigate]); // Add user and navigate as dependencies

  return (
    <div>
      <Navbar />
      <HeroSection />
      <CategoryCarousel />
      <HowItWorks />
      <InteractiveSection />
      <LatestJobs />
      <Company />
      <br />
      <Footer />
    </div>
  );
};

export default Home;
