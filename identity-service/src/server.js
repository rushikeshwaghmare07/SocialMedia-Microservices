require("dotenv").config();
const express = require("express");

const logger = require("./utils/logger.js");
const connectDB = require("./db/index.js");

const app = express();
const PORT = process.env.PORT || 3001;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Identity service is running on PORT: ${PORT}`);
    });
  })
  .catch((error) => {
    logger.warn("MongoDB connection failed..", error);
  });
