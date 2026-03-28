const crypto = require("crypto");

const ALGORITHM = "aes-256-cbc";
const SECRET = process.env.CRYPTO_SECRET;

// Fail fast at startup — never silently encrypt with a bad key
if (!SECRET || Buffer.byteLength(SECRET, "utf8") !== 32) {
  console.error("FATAL: CRYPTO_SECRET must be exactly 32 bytes (UTF-8)");
  process.exit(1);
}

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const key = Buffer.from(SECRET, "utf8");
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(text) {
  try {
    const [ivHex, encryptedHex] = text.split(":");
    if (!ivHex || !encryptedHex) throw new Error("Invalid format");
    const iv = Buffer.from(ivHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");
    const key = Buffer.from(SECRET, "utf8");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString("utf8");
  } catch {
    throw new Error("Decryption failed — data may be corrupt or key changed");
  }
}

module.exports = { encrypt, decrypt };
