const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (uri) {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    } else {
      console.log("No MONGO_URI provided. Running in high-performance hybrid / in-memory mode.");
    }
  } catch (error) {
    console.log("MongoDB connection skipped or unavailable. Running in hybrid / in-memory mode.");
  }
};

module.exports = { connectDB };
