const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true, maxlength: 50 },
  lastName:  { type: String, required: true, trim: true, maxlength: 50 },
  email:     { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 254 },
  password:  { type: String, required: true },
});

// Hash password before saving (skip if it's a Google account or already hashed)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  if (this.password.startsWith("google_") || this.password.startsWith("$2b$")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model("User", userSchema);
