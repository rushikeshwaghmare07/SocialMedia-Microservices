const express = require("express");
const { createPost, getAllPosts } = require("../controllers/post.controller");

const router = express.Router();

router.post("/", createPost);
router.get("/", getAllPosts);

module.exports = router;
