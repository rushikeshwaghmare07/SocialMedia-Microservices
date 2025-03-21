require("dotenv").config();
const express = require("express");

const logger = require("./utils/logger.js");
const connectDB = require("./db/index.js");
const authRouter = require("./routes/identity.routes.js");

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Identity service is running on PORT: ${PORT}`);
    });
  })
  .catch((error) => {
    logger.warn("MongoDB connection failed..", error);
  });
