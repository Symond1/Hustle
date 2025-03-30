import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    loading: false,  // Indicates loading state for authentication actions
    user: null,      // Stores logged-in user details
    token: null,     // Stores the authentication token
    savedJobs: [],   // Stores the IDs of saved jobs
  },

  reducers: {
    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Set user details
    setUser: (state, action) => {
      state.user = action.payload;
    },

    // Update user role
    setUserRole: (state, action) => {
      if (state.user) {
        state.user.role = action.payload;
      }
    },

    // Logout and clear all auth-related state
    logout: (state) => {
      console.log("Logging out user, clearing state."); // Debugging log
      state.user = null;
      state.token = null;
      state.savedJobs = [];
    },

    // Set authentication token
    setToken: (state, action) => {
      state.token = action.payload;
    },

    // Set saved jobs
    setSavedJobs: (state, action) => {
      state.savedJobs = action.payload;
    },

    // Add a job to the saved jobs list
    addSavedJob: (state, action) => {
      // Prevent adding duplicates
      if (!state.savedJobs.some((job) => job.id === action.payload.id)) {
        state.savedJobs.push(action.payload);
      }
    },

    // Remove a job from the saved jobs list
    removeSavedJob: (state, action) => {
      state.savedJobs = state.savedJobs.filter(
        (job) => job.id !== action.payload
      );
    },

    // NEW: Set or update the companyId for the logged-in user (recruiter)
    setUserCompanyId: (state, action) => {
      if (state.user) {
        state.user.companyId = action.payload;
      }
    },
  },
});

export const {
  setLoading,
  setUser,
  setUserRole,
  logout,
  setToken,
  setSavedJobs,
  addSavedJob,
  removeSavedJob,
  setUserCompanyId, // NEW reducer exported
} = authSlice.actions;

export const selectToken = (state) => state.auth.token;

export default authSlice.reducer;
