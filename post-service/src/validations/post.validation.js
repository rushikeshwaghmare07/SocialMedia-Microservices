const Joi = require("joi");

const createPostSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  content: Joi.string().min(1).required(),
});

module.exports = {
  createPostSchema,
};
