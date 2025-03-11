import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully.");
  } catch (err) {
    console.error("MongoDB connection failed", err.message); // This will give more details
    process.exit(1); // Exit the process if connection fails
  }
};

export default connectDB;
