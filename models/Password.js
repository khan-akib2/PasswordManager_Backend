const mongoose = require("mongoose");

const passwordSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  site:     { type: String, required: true, trim: true, maxlength: 255 },
  username: { type: String, required: true, trim: true, maxlength: 255 },
  password: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Password", passwordSchema);
