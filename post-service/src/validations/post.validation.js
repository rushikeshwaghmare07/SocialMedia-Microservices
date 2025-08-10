const Joi = require("joi");

const createPostSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  content: Joi.string().min(1).required(),
});

const objectIdPattern = /^[0-9a-fA-F]{24}$/; // Matches Mongo ObjectId

const getPostByIdSchema = Joi.object({
  id: Joi.string().pattern(objectIdPattern).required().messages({
    "string.empty": "Post ID is required",
    "string.pattern.base": "Invalid post ID format",
  }),
});

const deletePostByIdSchema = Joi.object({
  id: Joi.string().pattern(objectIdPattern).required().messages({
    "string.empty": "Post ID is required",
    "string.pattern.base": "Invalid post ID format",
  }),
});

module.exports = {
  createPostSchema,
  getPostByIdSchema,
  deletePostByIdSchema,
};
