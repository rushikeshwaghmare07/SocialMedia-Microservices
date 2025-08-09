const Post = require("../models/post.model");
const logger = require("../utils/logger");
const {
  createPostSchema,
  getPostByIdSchema,
} = require("../validations/post.validation");

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

const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user")
      .lean()
      .exec();

    const totalPosts = await Post.countDocuments();

    return res.status(200).json({
      success: true,
      message: "Retrieved posts successfully.",
      data: posts,
      pagination: {
        total: totalPosts,
        page,
        pages: Math.ceil(totalPosts / limit),
      },
    });
  } catch (error) {
    logger.error("Error while retrieving all the posts", {
      error: error.message,
    });
    return res.status(500).json({
      success: false,
      message: "Error while retrieving all the posts",
    });
  }
};

const getPostById = async (req, res) => {
  try {
    const postId = req.params.id;

    const { error } = getPostByIdSchema(postId);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const post = await Post.findById(postId)
      .populate("user", "username")
      .lean()
      .exec();

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    logger.info(`Post fetched successfully`, { postId: post._id });

    return res.status(200).json({
      success: true,
      message: "Post fetched successfully.",
      data: post,
    });
  } catch (error) {
    logger.error("Error while fetching a post", {
      error: error.message,
    });
    return res.status(500).json({
      success: false,
      message: "Error while fetching a post",
    });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
};
