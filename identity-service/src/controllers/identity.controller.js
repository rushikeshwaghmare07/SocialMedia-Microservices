const RefreshToken = require("../models/refreshToken.model.js");
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

// Generate new refresh token
const refreshTokenUser = async (req, res) => {
  logger.info("Refresh token endpoint hit...");
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      logger.warn("Refresh token missing");

      return res.status(400).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    const storedToken = await RefreshToken.findOne({ token: refreshToken });

    if (!storedToken || storedToken.expiresAt < Date.now()) {
      logger.warn("Invalid or expired refresh token.");

      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token.",
      });
    }

    const user = await User.findById(storedToken.user);

    if (!user) {
      logger.warn("User not found.");

      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateTokens(user);

    // Delete old refresh token
    try {
      const result = await RefreshToken.deleteOne({ _id: storedToken._id });
      if (result.deletedCount === 0) {
        logger.warn("Old refresh token could not be deleted");
      }
    } catch (tokenError) {
      logger.error("Refresh token generation failed", tokenError);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }

    logger.info(
      `Refresh token generated successfully for user ID: ${user._id}`
    );

    return res.status(200).json({
      success: true,
      message: "New tokens issued successfully.",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    logger.error("Refresh token endpoint failed", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshTokenUser,
};
