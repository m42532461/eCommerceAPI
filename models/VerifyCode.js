const mongoose = require("mongoose");

const VerifyCodeSchema = mongoose.Schema({
  username: { type: String, required: true },
  uuid: { type: String, required: true },
  verifyCode: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, index: { expires: 120 } },
});

module.exports = mongoose.model("VerifyCode", VerifyCodeSchema);
