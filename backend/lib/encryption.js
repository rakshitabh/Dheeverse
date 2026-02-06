const crypto = require("crypto");

// AES-256-CBC needs a 32-byte key and a 16-byte IV.
const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;
const SENSITIVE_FIELDS = ["content", "aiInsight", "recommendation", "question"];

let cachedKey = null;
function getKey() {
  if (cachedKey) return cachedKey;
  const rawKey = process.env.ENCRYPTION_KEY;
  if (!rawKey) {
    throw new Error("ENCRYPTION_KEY is not set (expected 64-char hex string)");
  }
  if (!/^[0-9a-fA-F]{64}$/.test(rawKey)) {
    throw new Error("ENCRYPTION_KEY must be a 64-character hex string (32 bytes)");
  }
  const key = Buffer.from(rawKey, "hex");
  if (key.length !== 32) {
    throw new Error("ENCRYPTION_KEY did not decode to 32 bytes");
  }
  cachedKey = key;
  return cachedKey;
}

function encryptString(plainText) {
  if (plainText === undefined || plainText === null) return plainText;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(plainText), "utf8"), cipher.final()]);
  // Store as hex iv + hex ciphertext separated by a colon for easy transport.
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

function decryptString(cipherText) {
  if (cipherText === undefined || cipherText === null) return cipherText;

  const [ivHex, dataHex] = String(cipherText).split(":");
  if (!ivHex || !dataHex) {
    // If the format is unexpected, return the original to avoid data loss.
    return cipherText;
  }

  const iv = Buffer.from(ivHex, "hex");
  const encryptedText = Buffer.from(dataHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString("utf8");
}

function encryptSensitiveFields(entryLike) {
  if (!entryLike || typeof entryLike !== "object") return entryLike;
  const clone = { ...entryLike };
  for (const field of SENSITIVE_FIELDS) {
    if (clone[field] !== undefined && clone[field] !== null) {
      clone[field] = encryptString(clone[field]);
    }
  }
  return clone;
}

function decryptSensitiveFields(entryLike) {
  if (!entryLike || typeof entryLike !== "object") return entryLike;
  const clone = { ...entryLike };
  for (const field of SENSITIVE_FIELDS) {
    if (clone[field] !== undefined && clone[field] !== null) {
      clone[field] = decryptString(clone[field]);
    }
  }
  return clone;
}

module.exports = {
  encryptSensitiveFields,
  decryptSensitiveFields,
};


