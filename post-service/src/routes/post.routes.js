const express = require("express");

const {
  createPost,
  getAllPosts,
  getPostById,
  deletePost,
} = require("../controllers/post.controller");
const { authenticateRequest } = require("../middleware/authMiddleware");
const {
  createPostLimiter,
  publicGetLimiter,
} = require("../rateLimit/postRateLimiters");

const router = express.Router();

// Auth middleware
router.use(authenticateRequest);

router.post("/", createPostLimiter, createPost);
router.get("/", publicGetLimiter, getAllPosts);
router.get("/:id", getPostById);
router.delete("/:id", deletePost);

module.exports = router;
