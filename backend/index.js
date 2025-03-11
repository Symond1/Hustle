import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoutes from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import eventRoutes from "./routes/event.route.js";
import { seedAdmin } from "./controllers/user.controller.js";

dotenv.config({});

const app = express();

// Test route for backend
app.get("/home", (req, res) => {
    return res.status(200).json({
        message: "It's from backend",
        success: true,
    });
});

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS setup
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true
}
app.use(cors(corsOptions));

// API routes (these will handle the main business logic)
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/event", eventRoutes);


const PORT = process.env.PORT || 3000;

// Server start function
const startServer = async () => {
    await connectDB();
    await seedAdmin(); // Ensure this runs after DB connection
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
