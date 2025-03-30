import Event from "../models/event.model.js";
import User from "../models/user.model.js";
import sendEmail from "../utils/sendEmail.js";
import mongoose from "mongoose";

// Create Event (Only accessible by Recruiter and admin )
export const createEvent = async (req, res) => {
    try {
        if (!req.user || !req.user.role) {
            return res.status(400).json({
                message: "Role is not defined in the request.",
                success: false,
            });
        }

        // Allow both "Recruiter" and "Admin" to create an event
        const userRole = req.user.role.toLowerCase();
        if (userRole !== "recruiter" && userRole !== "admin") {
            return res.status(403).json({
                message: "You are not authorized to create an event.",
                success: false,
            });
        }

        const {
            eventTitle,
            Organizer,
            eventType,
            eventDescription,
            eventDate,
            eventStartTime,
            registrationDeadline,
            location,
            eventCategory,
            eventPrice,
            thirdPartyLink
        } = req.body;

        const createdBy = req.user._id;

        if (new Date(eventStartTime) < new Date()) {
            return res.status(400).json({
                message: "Event start time cannot be in the past.",
                success: false
            });
        }

        if (new Date(registrationDeadline) < new Date()) {
            return res.status(400).json({
                message: "Registration deadline cannot be in the past.",
                success: false
            });
        }

        const newEvent = new Event({
            eventTitle,
            Organizer,
            eventType,
            eventDescription,
            eventDate,
            eventStartTime,
            registrationDeadline,
            location,
            createdBy,
            eventCategory,
            eventPrice,
            thirdPartyLink
        });

        await newEvent.save();

        return res.status(201).json({
            message: "Event created successfully.",
            event: newEvent,
            success: true,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error creating event.",
            success: false,
        });
    }
};

// Get Event Details (including third-party link)
// Get Event Details (including third-party link)
export const getEventDetails = async (req, res) => {
    try {
        const eventId = req.params.id;

        // Find the event by its ID
        const event = await Event.findById(eventId).populate("attendees");

        if (!event) {
            return res.status(404).json({
                message: "Event not found.",
                success: false,
            });
        }

        // Check if the event is still active (before the event start time and after registration deadline)
        const currentTime = new Date();
        if (event.registrationDeadline < currentTime) {
            return res.status(400).json({
                message: "Registration period has ended.",
                success: false,
            });
        }

        // Return event details to all viewers (no need to check for recruiter or role)
        return res.status(200).json({
            event: {
                eventTitle: event.eventTitle,
                Organizer: event.Organizer,
                eventType: event.eventType,
                eventDescription: event.eventDescription,
                eventDate: event.eventDate,
                eventStartTime: event.eventStartTime,
                registrationDeadline: event.registrationDeadline,
                location: event.location,
                eventCategory: event.eventCategory,
                eventPrice: event.eventPrice,
                createdBy: event.createdBy,
                thirdPartyLink: event.thirdPartyLink // Display third-party link
            },
            success: true,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error retrieving event details.",
            success: false,
        });
    }
};


// Register for Event
export const registerForEvent = async (req, res) => {
    try {
        const userId = req.user._id; // Assuming authenticated user
        const eventId = req.params.id;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({
                message: "Invalid event ID.",
                success: false,
            });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user || !user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
            return res.status(400).json({
                message: "You must have a valid email to register for an event.",
                success: false,
            });
        }

        // Find the event
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                message: "Event not found.",
                success: false,
            });
        }

        // Check registration deadline
        if (new Date(event.registrationDeadline) < new Date()) {
            return res.status(400).json({
                message: "Registration period has ended.",
                success: false,
            });
        }

        // Check if already registered
        if (event.attendees.includes(userId)) {
            return res.status(400).json({
                message: "You are already registered for this event.",
                success: false,
            });
        }

        // Register the user
        event.attendees.push(userId);
        await event.save();
        

        return res.status(201).json({
            message: "Successfully registered for the event. A confirmation email has been sent.",
            success: true,
        });
    } catch (error) {
        console.error("Error registering for event:", error);
        return res.status(500).json({
            message: "Error registering for the event.",
            success: false,
        });
    }
};


// Get All Events (for viewers and Recruiter)
export const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find().populate("createdBy");

        if (!events.length) {
            return res.status(404).json({
                message: "No events found.",
                success: false,
            });
        }

        // Viewers can see event details excluding attendees
        const eventsToReturn = events.map((event) => ({
            eventId: event._id,
            eventTitle: event.eventTitle,
            Organizer: event.Organizer,
            eventType: event.eventType,
            eventDescription: event.eventDescription,
            eventDate: event.eventDate,
            eventStartTime: event.eventStartTime,
            registrationDeadline: event.registrationDeadline,
            location: event.location,
            eventCategory: event.eventCategory,
            eventPrice: event.eventPrice,
            createdBy: event.createdBy,
            thirdPartyLink: event.thirdPartyLink // Include third-party link
        }));

        return res.status(200).json({
            events: eventsToReturn,
            success: true,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error retrieving events.",
            success: false,
        });
    }
};


// Get Event Attendees (for Recruiter and Admin)

export const getEventAttendees = async (req, res) => {
    try {
        const eventId = req.params.id;

        // Find the event by its ID
        const event = await Event.findById(eventId).populate("attendees");

        if (!event) {
            return res.status(404).json({
                message: "Event not found.",
                success: false,
            });
        }
        if (
            req.user.role.toLowerCase() !== "admin" && 
            (req.user.role.toLowerCase() !== "recruiter" || event.createdBy.toString() !== req.user._id.toString())
        ) {
            return res.status(403).json({
                message: "You are not authorized to view the attendees for this event.",
                success: false,
            });
        }

        return res.status(200).json({
            attendees: event.attendees,
            success: true,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error retrieving attendees for the event.",
            success: false,
        });
    }
};


export const disableEvent = async (req, res) => {
    try {
        const { role, _id } = req.user; // Get role and user ID from the logged-in user
        const eventId = req.params.id; // Get event ID from request parameters

        console.log('User Role:', role);  // Debugging line
        console.log('User ID:', _id);  // Debugging line

        // Check if the event exists
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                message: "Event not found.",
                success: false,
            });
        }

        console.log('Event Created By (createdBy):', event.createdBy);  // Debugging line

        // Admin can disable any event, but a recruiter can only disable their own event
        if (
            role.toLowerCase() !== "admin" &&  // Case-insensitive role check for Admin
            event.createdBy.toString() !== _id.toString() // Ensure we are checking the correct user ID
        ) {
            console.log('Unauthorized Access Attempt');  // Debugging line
            return res.status(403).json({
                message: "Unauthorized access.",
                success: false,
            });
        }

        // Disable the event
        event.status = "Disabled";
        await event.save();

        return res.status(200).json({
            message: "Event disabled successfully.",
            success: true,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong.",
            success: false,
        });
    }
};
