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
      // Assuming that only active jobs should be stored for admin view.
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
    // Remove this reducer since we now update a job instead of removing it.
    // removeDisabledJob: (state, action) => { ... },

    // New reducer to update a job's properties (for both disable and enable)
    updateJob: (state, action) => {
      const updatedJob = action.payload;
      // Update in allJobs
      state.allJobs = state.allJobs.map((job) =>
        job._id === updatedJob._id ? updatedJob : job
      );
      // Update in allAdminJobs if applicable (if job is active, add or update)
      if (updatedJob.isActive) {
        const exists = state.allAdminJobs.find((job) => job._id === updatedJob._id);
        if (exists) {
          state.allAdminJobs = state.allAdminJobs.map((job) =>
            job._id === updatedJob._id ? updatedJob : job
          );
        } else {
          state.allAdminJobs.push(updatedJob);
        }
      } else {
        // Remove from admin list if not active
        state.allAdminJobs = state.allAdminJobs.filter((job) => job._id !== updatedJob._id);
      }
      // Optionally update singleJob if it matches
      if (state.singleJob && state.singleJob._id === updatedJob._id) {
        state.singleJob = updatedJob;
      }
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
  updateJob,
} = jobSlice.actions;

export default jobSlice.reducer;
