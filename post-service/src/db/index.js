const mongoose = require("mongoose");
const logger = require("../utils/logger.js");

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGO_URI);
    logger.info(
      `\nConnected to MongoDB! Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    logger.warn("MongoDB connection failed. Exiting now...", error);
    process.exit(1);
  }
};

module.exports = connectDB;
