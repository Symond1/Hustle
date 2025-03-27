import express from "express";
import { 
  createEvent, getEventDetails,registerForEvent, getAllEvents, disableEvent,getEventAttendees, // Add this function to the imports for viewing attendees
} from "../controllers/event.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js"; // Import the updated isAuthenticated middleware

const router = express.Router();

// Create Event (Only accessible by Recruiter)
router.route("/create").post(isAuthenticated(["recruiter","admin"]), createEvent);

// Get Event Details (Anyone can view details)
router.route("/:id").get(getEventDetails);

// Register for Event (Job Seekers only)
router.route("/:id/register").post(isAuthenticated(["jobseeker"]), registerForEvent); // Only jobseekers can register

// Get All Events (Everyone can view the events)
router.route("/").get(getAllEvents);

// Get Event Attendees (Admin can view all attendees, Recruiter can view attendees of their own event)
router.route("/:id/attendees").get(isAuthenticated(["admin", "recruiter"]), getEventAttendees); 

// Admin disables an event, Recruiter can disable their own event
router.route("/:id/disable").post(isAuthenticated(["admin", "recruiter"]), disableEvent); // Admin and recruiter can disable, logic handled in controller


export default router;
