const mongoose = require("mongoose");

const commentSchema = mongoose.Schema(
  {
    username: String,
    content: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Comment", commentSchema);
