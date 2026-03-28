const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true, maxlength: 50 },
  lastName:  { type: String, required: true, trim: true, maxlength: 50 },
  email:     { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 254 },
  password:  { type: String, required: true },
});

module.exports = mongoose.model("User", userSchema);
