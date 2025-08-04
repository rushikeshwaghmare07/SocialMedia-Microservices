require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const logger = require("./utils/logger");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());

app.listen(PORT, () => {
  logger.info(`API-Gateway is running on PORT: ${PORT}`);
});
