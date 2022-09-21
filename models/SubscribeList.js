const mongoose = require("mongoose");

const SubscribeListSchema = mongoose.Schema(
  {
    email: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubscribeList", SubscribeListSchema);
