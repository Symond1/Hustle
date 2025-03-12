import { createSlice } from "@reduxjs/toolkit";

const jobSlice = createSlice({
  name: "job",
  initialState: {
    allJobs: [],
    allAdminJobs: [],
    singleJob: null,
    searchJobByText: "",
    allAppliedJobs: [],
    searchedQuery: "",
    error: null,
  },
  reducers: {
    setAllJobs: (state, action) => {
      state.allJobs = action.payload || [];
    },
    setSingleJob: (state, action) => {
      state.singleJob = action.payload || null;
    },
    setAllAdminJobs: (state, action) => {
      // Ensure jobs are filtered by `isActive` field only if they exist in the payload
      state.allAdminJobs = (action.payload || []).filter((job) => job.isActive);
    },
    setSearchJobByText: (state, action) => {
      state.searchJobByText = action.payload || "";
    },
    setAllAppliedJobs: (state, action) => {
      state.allAppliedJobs = action.payload || [];
    },
    setSearchedQuery: (state, action) => {
      state.searchedQuery = action.payload || "";
    },
    setError: (state, action) => {
      state.error = action.payload || null;
    },
    setResetAllAppliedJobs: (state) => {
      state.allAppliedJobs = [];
    },
    setJobAppliedStatus: (state, action) => {
      const { jobId, userId, isApplied } = action.payload;
      
      if (state.singleJob && state.singleJob._id === jobId) {
        state.singleJob.applications = isApplied
          ? [...(state.singleJob.applications || []), { applicant: userId }]
          : state.singleJob.applications?.filter((app) => app.applicant !== userId) || [];
      }

      state.allJobs = state.allJobs.map((job) =>
        job._id === jobId ? { ...job, isApplied } : job
      );

      state.allAppliedJobs = isApplied
        ? [...state.allAppliedJobs, { _id: jobId }]
        : state.allAppliedJobs.filter((job) => job._id !== jobId);
    },
  },
});

export const {
  setAllJobs,
  setSingleJob,
  setAllAdminJobs,
  setSearchJobByText,
  setAllAppliedJobs,
  setSearchedQuery,
  setError,
  setJobAppliedStatus,
  setResetAllAppliedJobs,
} = jobSlice.actions;

export default jobSlice.reducer;
