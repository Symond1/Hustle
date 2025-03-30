import React from 'react';
import Navbar from '../shared/Navbar';
import { Button } from '../ui/button';
import CompaniesTable from './CompaniesTable';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useGetAllCompanies from '@/hooks/useGetAllCompanies';

const Companies = () => {
  const { user } = useSelector((store) => store.auth);
  const { companies } = useSelector((store) => store.company);
  const navigate = useNavigate();

  const isLoading = companies === null;
  const hasCompany = companies?.some((company) => company.createdBy === user._id);

  // This hook initializes the companies in Redux on mount
  useGetAllCompanies();

  if (isLoading) return <div>Loading companies...</div>;
  if (!user) return <div>Please log in to view companies.</div>;

  return (
    <div>
      <Navbar />
      <div className='max-w-6xl mx-auto my-10'>
        <div className='flex items-center justify-between my-5'>
          <Button
            onClick={() => navigate("/admin/companies/create")}
            disabled={hasCompany}
          >
            Add Company
          </Button>
        </div>
        <CompaniesTable />
      </div>
    </div>
  );
};

export default Companies;
