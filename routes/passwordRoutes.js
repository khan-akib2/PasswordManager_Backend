const router = require("express").Router();
const mongoose = require("mongoose");
const Password = require("../models/Password");
const auth = require("../middleware/auth");
const { encrypt, decrypt } = require("../utils/crypto");

function safeDecrypt(text) {
  try { return decrypt(text); } catch { return text; }
}
router.use(auth);

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// Get all passwords for user
router.get("/", async (req, res) => {
  try {
    const data = await Password.find({ userId: req.userId });
    res.json(data.map((item) => ({
      _id: item._id,
      site: item.site,
      username: item.username,
      password: safeDecrypt(item.password),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    })));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add password (plain text)
router.post("/add", async (req, res) => {
  try {
    const { site, username, password } = req.body;
    if (!site || !username || !password)
      return res.status(400).json({ message: "All fields required" });

    const data = await Password.create({ userId: req.userId, site, username, password: encrypt(password) });
    res.status(201).json({
      _id: data._id, site: data.site, username: data.username,
      password: safeDecrypt(data.password), createdAt: data.createdAt, updatedAt: data.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update password (plain text)
router.put("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ message: "Invalid ID" });
    const { site, username, password } = req.body;
    if (!site || !username || !password)
      return res.status(400).json({ message: "All fields required" });

    const updated = await Password.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { site, username, password: encrypt(password) },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json({
      _id: updated._id, site: updated.site, username: updated.username,
      password: safeDecrypt(updated.password), createdAt: updated.createdAt, updatedAt: updated.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete password
router.delete("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ message: "Invalid ID" });
    const deleted = await Password.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
