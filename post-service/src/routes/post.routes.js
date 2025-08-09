const express = require("express");

const {
  createPost,
  getAllPosts,
  getPostById,
} = require("../controllers/post.controller");
const { authenticateRequest } = require("../middleware/authMiddleware");

const router = express.Router();

// Auth middleware
router.use(authenticateRequest);

router.post("/", createPost);
router.get("/", getAllPosts);
router.get("/:id", getPostById);

module.exports = router;
