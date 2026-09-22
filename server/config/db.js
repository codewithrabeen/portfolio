
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);

    if (process.env.NODE_ENV === "production") {
      console.log("MongoDB connected");
    } else {
      console.log(`MongoDB connected: ${connection.connection.host}`);
    }
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
