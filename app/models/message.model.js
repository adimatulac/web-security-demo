const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    username: String,
    content: String,
    rotation: Number,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);
