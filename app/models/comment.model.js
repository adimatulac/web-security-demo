const mongoose = require("mongoose");

const CommentSchema = mongoose.Schema(
  {
    username: String,
    content: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Comment", CommentSchema);
