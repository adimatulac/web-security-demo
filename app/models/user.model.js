const mongoose = require("mongoose");
const { Schema } = mongoose;

const acquiredUserSchema = mongoose.Schema(
  {
    username: { type: String, unique: true, index: true },
    data: String,
  },
  {
    timestamps: true,
  }
);

const userSchema = mongoose.Schema(
  {
    username: { type: String, unique: true, index: true },
    accessCode: String,
    inventory: [
      {
        item: { type: Schema.Types.ObjectId, ref: "Item", required: true },
        quantity: Number,
      },
    ],
    storage: [acquiredUserSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
