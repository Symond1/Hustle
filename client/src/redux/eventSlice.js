import { createSlice } from "@reduxjs/toolkit";

const eventSlice = createSlice({
  name: "event",
  initialState: {
    allEvents: [], // All available events visible to users
    singleEvent: null, // Single event details for viewing
    searchedQuery: "", // Final search query used
    searchEventByText: "", // Search query state to filter events
    error: null, // Error message for API calls
  },
  reducers: {
    setAllEvents: (state, action) => {
      state.allEvents = action.payload || []; // Ensure default empty array
    },
    setSingleEvent: (state, action) => {
      state.singleEvent = action.payload || null; // Default null if no event
    },
    setSearchedQuery: (state, action) => {
      state.searchedQuery = action.payload || ""; // Default empty string
    },
    setError: (state, action) => {
      state.error = action.payload || null; // Default null
    },
    setSearchEventByText: (state, action) => {
      state.searchEventByText = action.payload || ""; // Set search query for filtering events
    },
  },
});

export const {
  setAllEvents,
  setSingleEvent,
  setSearchedQuery,
  setError,
  setSearchEventByText, // Export the new action
} = eventSlice.actions;

// **Selector to filter events**
export const selectFilteredEvents = (state) => {
  const { allEvents = [], searchedQuery = "" } = state.event;

  if (searchedQuery.trim()) {
    // Filter events based on searched query
    const filteredEvents = allEvents.filter((event) =>
      event.eventTitle.toLowerCase().includes(searchedQuery.toLowerCase().trim())
    );
    return filteredEvents.length > 0 ? filteredEvents : []; // Return empty array if no matches
  }
  return allEvents; // Return all events if no search query
};

// **Selector to get a single event by its ID**
export const selectEventById = (state, eventId) => {
  if (!eventId) return null; // Ensure valid eventId
  return state.event.allEvents.find((event) => event._id === eventId) || null;
};

// **Selector for error state**
export const selectErrorState = (state) => state.event.error;

export default eventSlice.reducer;
