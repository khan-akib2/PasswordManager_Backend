const crypto = require("crypto");

const ALGORITHM = "aes-256-cbc";
const SECRET = process.env.CRYPTO_SECRET; // must be exactly 32 chars

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const key = Buffer.from(SECRET, "utf8");
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  // store as iv:encryptedData (both hex)
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(text) {
  const [ivHex, encryptedHex] = text.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const key = Buffer.from(SECRET, "utf8");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

module.exports = { encrypt, decrypt };
