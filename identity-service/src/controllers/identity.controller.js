const User = require("../models/user.model.js");
const generateTokens = require("../utils/generateToken.js");
const logger = require("../utils/logger.js");
const {
  validateRegistration,
  validateLogin,
} = require("../utils/validation.js");

// User registration
const registerUser = async (req, res) => {
  logger.info("Registering user...");
  try {
    // validate user data
    const { error } = validateRegistration(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { username, email, password } = req.body;

    let user = await User.findOne({ $or: [{ username }, { email }] });
    if (user) {
      logger.warn("User already exists");
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    user = new User({ username, email, password });
    await user.save();
    logger.info(`User registered successfully with ID: ${user._id}`);

    const { accessToken, refreshToken } = await generateTokens(user);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error("Registration failed", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// User login
const loginUser = async (req, res) => {
  try {
    logger.info("Login endpoint hit...");

    const { error } = validateLogin(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn("User not found");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      logger.warn("Invalid credentials");
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    try {
      const { accessToken, refreshToken } = await generateTokens(user);

      logger.info(
        `User logged in successfully. ID: ${user._id}, email: ${user.email}`
      );

      return res.status(200).json({
        success: true,
        message: "Login successful",
        accessToken,
        refreshToken,
        userId: user._id,
      });
    } catch (tokenError) {
      logger.error("Token generation failed", tokenError);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  } catch (error) {
    logger.error("Login failed", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
