import React, { useEffect, useState } from "react";
import Navbar from "./shared/Navbar";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { setAllEvents } from "../redux/eventSlice";
import { motion } from "framer-motion";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { Clock, MapPin, Tag, Calendar, AlertCircle, Users, Wallet } from "lucide-react";

const Events = () => {
  const { allEvents, searchedQuery } = useSelector((store) => store.event);
  const [filteredEvents, setFilteredEvents] = useState(allEvents || []);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sortOption, setSortOption] = useState("Sort by Date");
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/event/");
        if (res.data.success) {
          dispatch(setAllEvents(res.data.events));
        } else {
          toast.error(res.data.message);
        }
      } catch (error) {
        toast.error("Failed to fetch events. Please try again later.");
      }
    };

    fetchEvents();
  }, [dispatch]);

  // Filter events based on searched query
  useEffect(() => {
    if (searchedQuery) {
      const query = searchedQuery.toLowerCase();
      const filtered = (allEvents || []).filter(
        (event) =>
          event.eventTitle.toLowerCase().includes(query) ||
          event.eventDescription.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query) ||
          (event.eventDate && event.eventDate.toLowerCase().includes(query))
      );
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(allEvents || []);
    }
  }, [allEvents, searchedQuery]);

  // Dropdown sort functionality
  const sortEvents = (option) => {
    let sortedEvents = [...(filteredEvents || [])];
    if (option === "Sort by Date") {
      sortedEvents.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
    } else if (option === "Sort by Price") {
      sortedEvents.sort((a, b) => (a.eventPrice || 0) - (b.eventPrice || 0));
    } else if (option === "Sort by Category") {
      sortedEvents.sort((a, b) =>
        (a.eventCategory || "").localeCompare(b.eventCategory || "")
      );
    }
    setFilteredEvents(sortedEvents);
    setSortOption(option);
    setDropdownOpen(false);
  };

  const formatDate = (date) => {
    const eventDate = new Date(date);
    return eventDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const closeModal = () => {
    setSelectedEvent(null);
  };

  const registerForEvent = async (thirdPartyLink) => {
    if (!selectedEvent || !selectedEvent.eventId) {
      toast.error("Event details are not available. Please try again.");
      return;
    }
  
    const eventId = selectedEvent.eventId;
  
    try {
      const token = localStorage.getItem("token");
  
      if (!token) {
        toast.error("You need to log in to register for this event.");
        return;
      }
  
      await axios.post(
        `http://localhost:8000/api/v1/event/${eventId}/register`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      toast.success("Successfully registered for the event");
      
      setTimeout(() => {
        window.location.href = `${selectedEvent?.thirdPartyLink}`;
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      <Navbar />
      <div className="max-w-6xl mx-auto mt-10 px-4 sm:px-6 lg:px-8">
        {/* Dropdown for sorting */}
        <div className="flex justify-end mb-6 relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1 bg-white border border-gray-300 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <span className="text-sm font-medium text-gray-800">{sortOption}</span>
            <span className="text-lg">&#9662;</span>
          </button>
          {dropdownOpen && (
            <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-10">
              <button
                onClick={() => sortEvents("Sort by Date")}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                <span className="text-sm text-gray-700">Sort by Date</span>
              </button>
              <button
                onClick={() => sortEvents("Sort by Price")}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
              >
                <Wallet className="h-4 w-4" />
                <span className="text-sm text-gray-700">Sort by Price</span>
              </button>
              <button
                onClick={() => sortEvents("Sort by Category")}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
              >
                <Tag className="h-4 w-4" />
                <span className="text-sm text-gray-700">Sort by Category</span>
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.length <= 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-xl font-semibold text-gray-700 flex items-center justify-center gap-2">
                  <AlertCircle className="h-6 w-6 text-rose-600" />
                  No events found matching your search
                </p>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-shadow duration-300 h-[280px] flex flex-col cursor-pointer group"
                  onClick={() => handleEventClick(event)}
                >
                  <div className="space-y-4 flex-grow">
                    <div className="flex items-center justify-between">
                      <h1 className="text-xl font-bold text-gray-900 line-clamp-2">
                        {event?.eventTitle}
                      </h1>
                      <Badge
                        className={`px-3 py-1 rounded-full ${
                          event?.eventPrice > 0 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {event?.eventPrice > 0 ? `$${event.eventPrice}` : "Free"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="flex items-center gap-1.5 bg-blue-50 text-blue-700">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {event?.eventDate
                            ? formatDate(event.eventDate).split(",")[0]
                            : "N/A"}
                        </span>
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1.5 bg-purple-50 text-purple-700">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">
                          {event?.location || "Not available"}
                        </span>
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1.5 bg-amber-50 text-amber-700">
                        <Tag className="h-4 w-4" />
                        <span className="line-clamp-1">
                          {event?.eventCategory || "General"}
                        </span>
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3 group-hover:text-gray-800 transition-colors">
                      {event.eventDescription}
                    </p>
                  </div>
                  <div className="mt-auto pt-4 border-t border-dashed border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      <span className="line-clamp-1">
                        {event?.Organizer || "Organizer not available"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {selectedEvent && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex justify-center items-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-6 rounded-2xl w-full max-w-4xl shadow-2xl border border-gray-100 relative"
            >
              <button
                className="absolute top-4 right-4 text-gray-700 hover:text-black transition-colors text-2xl"
                onClick={closeModal}
              >
                &times;
              </button>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {selectedEvent.eventTitle}
              </h2>
              <p className="text-lg text-gray-700 mb-4">
                {selectedEvent.eventDescription}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <p>
                  <strong>Event Type:</strong>{" "}
                  {selectedEvent.eventType || "Not available"}
                </p>
                <p>
                  <strong>Organizer:</strong>{" "}
                  {selectedEvent.Organizer || "Not available"}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {selectedEvent.eventDate ? formatDate(selectedEvent.eventDate) : "Not available"}
                </p>
                <p>
                  <strong>Registration Deadline:</strong>{" "}
                  {selectedEvent.registrationDeadline ? formatDate(selectedEvent.registrationDeadline) : "Not available"}
                </p>
                <p>
                  <strong>Location:</strong>{" "}
                  {selectedEvent.location || "Not available"}
                </p>
                <p>
                  <strong>Category:</strong>{" "}
                  {selectedEvent.eventCategory || "Not available"}
                </p>
                <p>
                  <strong>Price:</strong>{" "}
                  {selectedEvent.eventPrice > 0 ? `$${selectedEvent.eventPrice}` : "Free"}
                </p>
              </div>
              <div className="flex justify-between mt-6 gap-3">
                <button
                  className="w-full py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  onClick={closeModal}
                >
                  Back
                </button>
                <button
                  className="w-full py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                  onClick={() =>
                    registerForEvent(selectedEvent.thirdPartyLink)
                  }
                >
                  Register
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
