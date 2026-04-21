const crypto = require("crypto");
const CryptoJS = require("crypto-js");

const algorithm = "aes-256-cbc";
const key = crypto.scryptSync("secretKey", "salt", 32);
const SECRET = "examvault";
const iv = Buffer.alloc(16, 0);

// 🔐 Encrypt
function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(JSON.stringify(text), "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

// 🔓 Decrypt
function decrypt(encryptedText) {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return JSON.parse(decrypted);
}

module.exports = { encrypt, decrypt };