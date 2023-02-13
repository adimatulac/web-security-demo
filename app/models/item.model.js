const mongoose = require("mongoose");

const ItemSchema = mongoose.Schema(
  {
    displayName: String,
    id: String,
    imagePath: String,
    category: {
      type: String,
      enum: ["currency", "equipment", "food", "miscellaneous", "companion"],
      default: "miscellaneous",
    },
    rarityScore: Number,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Item", ItemSchema);
