import mongoose from "mongoose";
const eventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
  },
  Organizer: {
    type: String,
    required: true,
  },
  eventTitle: {
    type: String,
    required: true,
  },
  eventDescription: {
    type: String,
  },
  eventDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value > new Date();  // Ensure event date is in the future
      },
      message: "Event date cannot be in the past.",
    }
  },
  eventStartTime: {
    type: Date,
    required: true,
  },
  registrationDeadline: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["Active", "Disabled"],
    default: "Active",
  },
  eventCategory: {
    type: String,
    enum: ["Technology", "Management", "Networking", "Career Development", "Career", "Other"],
    default: "Technology",
  },
  eventPrice: {
    type: String,
    required: function () {
      return this.eventCategory === "Paid";
    },
    min: 0,
    default: 0,
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  thirdPartyLink: {
    type: String,
    match: [/^(http|https):\/\/[^\s]+$/, 'Please provide a valid URL'],
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const Event = mongoose.model("Event", eventSchema);
export default Event;
