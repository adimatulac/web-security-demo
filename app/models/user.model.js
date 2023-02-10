const mongoose = require("mongoose");

const AcquiredUserSchema = mongoose.Schema(
  {
    username: { type: String, unique: true, index: true },
    data: String,
  },
  {
    timestamps: true
  }
);

const UserSchema = mongoose.Schema(
  {
    username: { type: String, unique: true, index: true },
    accessCode: String,
    coins: Number,
    storage: [AcquiredUserSchema]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
