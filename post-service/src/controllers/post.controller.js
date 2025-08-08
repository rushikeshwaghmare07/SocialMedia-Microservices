const Post = require("../models/post.model");
const logger = require("../utils/logger");
const { createPostSchema } = require("../validations/post.validation");

const createPost = async (req, res) => {
  try {
    const { title, content, mediaIds } = req.body;

    const { error } = createPostSchema(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: user not found.",
      });
    }

    const newPost = await Post.create({
      user: req.user.userId,
      title,
      content,
      mediaIds: mediaIds || [],
    });

    logger.info(`Post created successfully by user ${req.user.userId}`, {
      postId: newPost._id,
    });

    return res.status(201).json({
      success: true,
      message: "Post created successfully.",
      data: newPost,
    });
  } catch (error) {
    logger.error("Error while creating a post", { error: error.message });
    return res.status(500).json({
      success: false,
      message: "Error while creating a post",
    });
  }
};

module.exports = {
  createPost,
};
