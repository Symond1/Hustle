import React, { useEffect, useState } from "react";
import Navbar from "./shared/Navbar";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { setAllEvents } from "../redux/eventSlice";
import { motion } from "framer-motion";
import { Badge } from "./ui/badge";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Events = () => {
  const { allEvents, searchedQuery } = useSelector((store) => store.event);
  const [filteredEvents, setFilteredEvents] = useState(allEvents || []);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth); // Access user from auth state

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
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto mt-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.length <= 0 ? (
            <span>No events found</span>
          ) : (
            filteredEvents.map((event) => (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.3 }}
                key={event._id}
                className="p-6 rounded-lg shadow-lg bg-gray-100 text-black w-full max-w-sm cursor-pointer"
                onClick={() => handleEventClick(event)}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h1 className="font-semibold text-2xl text-black hover:text-gray-600 transition-colors duration-300">
                      {event?.eventTitle}
                    </h1>
                    <Badge
                      className={`text-white px-3 py-1 rounded-full text-xs ${
                        event?.eventPrice > 0 ? "bg-red-600" : "bg-green-600"
                      }`}
                    >
                      {event?.eventPrice > 0 ? "Paid" : "Free"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700">
                    Organizer: {event?.Organizer || "Not available"}
                  </p>
                  <p className="text-sm text-gray-700">
                    Category: {event?.eventCategory || "Not available"}
                  </p>
                  <p className="text-sm text-gray-700">
                    Date:{" "}
                    {event?.eventDate
                      ? formatDate(event.eventDate)
                      : "Date not available"}
                  </p>
                  <p className="text-sm text-gray-700">
                    Location: {event?.location || "Location not available"}
                  </p>
                  <p className="text-sm text-gray-700">
                    Type: {event?.eventType || "Type not available"}
                  </p>
                  <p className="text-sm text-gray-700">
                    Price: {event?.eventPrice || "Free"}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {selectedEvent && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-11/12 max-w-4xl relative">
              <button
                className="absolute top-4 right-4 text-gray-500 text-xl"
                onClick={closeModal}
              >
                &times;
              </button>
              <h2 className="text-3xl font-bold text-black mb-4">
                {selectedEvent.eventTitle}
              </h2>
              <p className="text-lg text-gray-700 mb-4">
                {selectedEvent.eventDescription}
              </p>
              <p className="text-sm text-gray-600">
                Event Type: {selectedEvent.eventType}
              </p>
              <p className="text-sm text-gray-600">
                Location: {selectedEvent.location}
              </p>
              <p className="text-sm text-gray-600">
                Date: {formatDate(selectedEvent.eventDate)}
              </p>
              <p className="text-sm text-gray-600">
                Registration Deadline:{" "}
                {formatDate(selectedEvent.registrationDeadline)}
              </p>
              <p className="text-sm text-gray-600">
                Price: {selectedEvent.eventPrice}
              </p>
              <p className="text-sm text-gray-600">
                Organizer: {selectedEvent.Organizer || "Not available"}
              </p>
              <p className="text-sm text-gray-600">
                Category: {selectedEvent.eventCategory || "Not available"}
              </p>

              <div className="flex justify-between mt-5">
                <button
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  onClick={closeModal}
                >
                  Back
                </button>
                <button
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  onClick={() =>
                    registerForEvent(
                      selectedEvent._id,
                      selectedEvent.thirdPartyLink
                    )
                  }
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ToastContainer />
    </div>
  );
};

export default Events;
