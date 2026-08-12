const crypto = require("crypto");

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16; // AES block size

/**
 * Get the AES-256 encryption key from environment or derive one.
 * Must be exactly 32 bytes for AES-256.
 */
function getEncryptionKey() {
  const envKey = process.env.FILE_ENCRYPTION_KEY;
  if (envKey) {
    // Derive a consistent 32-byte key from the env variable using SHA-256
    return crypto.createHash("sha256").update(envKey).digest();
  }
  throw new Error(
    "FILE_ENCRYPTION_KEY environment variable is not set. Cannot encrypt/decrypt files.",
  );
}

/**
 * SHA-256 hash of a buffer or string.
 * Used for file integrity verification and privacy-safe filenames.
 * @param {Buffer|string} data
 * @returns {string} Hex-encoded SHA-256 hash
 */
function sha256Hash(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Generate a SHA-256 based filename from original filename + timestamp.
 * Ensures no patient-identifiable info leaks through filenames.
 * @param {string} originalName - Original filename
 * @returns {{ hashedName: string, originalName: string }}
 */
function hashFilename(originalName) {
  const timestamp = Date.now().toString();
  const hashedName = sha256Hash(originalName + timestamp);
  return { hashedName, originalName };
}

/**
 * AES-256-CBC encrypt a buffer.
 * @param {Buffer} buffer - Plain data to encrypt
 * @returns {{ encryptedData: Buffer, iv: string }} Encrypted buffer + hex IV
 */
function encryptBuffer(buffer) {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);

  return {
    encryptedData: encrypted,
    iv: iv.toString("hex"),
  };
}

/**
 * AES-256-CBC decrypt a buffer.
 * @param {Buffer} encryptedBuffer - Encrypted data
 * @param {string} ivHex - Hex-encoded initialization vector
 * @returns {Buffer} Decrypted data
 */
function decryptBuffer(encryptedBuffer, ivHex) {
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
}

/**
 * Compute SHA-256 hash of file content for integrity verification.
 * Compare this hash before and after download to verify file wasn't tampered with.
 * @param {Buffer} fileBuffer
 * @returns {string} Hex SHA-256 hash
 */
function computeFileIntegrityHash(fileBuffer) {
  return sha256Hash(fileBuffer);
}

/**
 * Verify file integrity by comparing hash.
 * @param {Buffer} fileBuffer
 * @param {string} expectedHash
 * @returns {boolean}
 */
function verifyFileIntegrity(fileBuffer, expectedHash) {
  const actualHash = sha256Hash(fileBuffer);
  return crypto.timingSafeEqual(
    Buffer.from(actualHash, "hex"),
    Buffer.from(expectedHash, "hex"),
  );
}

module.exports = {
  sha256Hash,
  hashFilename,
  encryptBuffer,
  decryptBuffer,
  computeFileIntegrityHash,
  verifyFileIntegrity,
  ALGORITHM,
};
