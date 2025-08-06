require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const logger = require("./utils/logger");
const connectDB = require("./db");

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.debug(`Request body: ${JSON.stringify(req.body)}`);
  next();
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Post service is running on PORT: ${PORT}`);
    });
  })
  .catch((error) => {
    logger.warn("MongoDB connection failed..", error);
  });

// Unhandled promise rejection
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled rejection at", promise, "reason", reason);
});
