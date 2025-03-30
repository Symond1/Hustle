import { createSlice } from "@reduxjs/toolkit";

const companySlice = createSlice({
  name: "company",
  initialState: {
    singleCompany: null,
    companies: [],
    searchCompanyByText: "", // To store the search text entered by the user
    userId: "",
    userRole: "", // Default role
  },
  reducers: {
    setSingleCompany: (state, action) => {
      state.singleCompany = action.payload || null;
    },
    setCompanies: (state, action) => {
      const companies = Array.isArray(action.payload) ? action.payload : [];
      console.log("Companies received:", companies); // Debugging
      state.companies = companies;
    },
    removeCompany: (state, action) => {
      const companyId = action.payload;
      state.companies = state.companies.filter(
        (company) => company._id !== companyId
      );
    },
    setSearchCompanyByText: (state, action) => {
      state.searchCompanyByText = action.payload || "";
    },
    setUserId: (state, action) => {
      state.userId = action.payload || "";
    },
    setUserRole: (state, action) => {
      const validRoles = ["jobseeker", "recruiter", "admin"]; // All roles in lowercase
      state.userRole = validRoles.includes(action.payload.toLowerCase())
        ? action.payload.toLowerCase() // Make sure to store it in lowercase
        : "recruiter"; // Default to "recruiter" if invalid role
    },
    // New reducer to update a company in the Redux store
    updateCompanyInStore: (state, action) => {
      const updatedCompany = action.payload;
      state.companies = state.companies.map((company) =>
        company._id === updatedCompany._id ? updatedCompany : company
      );
      if (state.singleCompany && state.singleCompany._id === updatedCompany._id) {
        state.singleCompany = updatedCompany;
      }
    },
  },
});

export const {
  setSingleCompany,
  setCompanies,
  removeCompany,
  setSearchCompanyByText,
  setUserId,
  setUserRole,
  updateCompanyInStore,
} = companySlice.actions;

export default companySlice.reducer;
