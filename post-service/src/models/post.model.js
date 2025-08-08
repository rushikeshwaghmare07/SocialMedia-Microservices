const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mediaUrls: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

postSchema.index({ content: "text" });

const PostSchema = mongoose.model("Post", postSchema);

module.exports = PostSchema;
