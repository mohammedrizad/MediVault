const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const {
  sha256Hash,
  hashFilename,
  encryptBuffer,
  decryptBuffer,
  computeFileIntegrityHash,
  verifyFileIntegrity,
} = require("./cryptoService");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage so we can process the buffer before uploading
const memoryStorage = multer.memoryStorage();

const ALLOWED_MIMETYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "application/pdf",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const 
upload = multer({
  storage: memoryStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, JPEG, and PDF files are allowed"));
    }
  },
});

/**
 * Encrypt file buffer with AES-256 and upload to Cloudinary.
 * Also computes SHA-256 hash of original file for integrity verification.
 *
 * @param {Buffer} fileBuffer - Raw file buffer
 * @param {string} originalName - Original filename
 * @returns {Promise<{ url: string, hashedFilename: string, fileHash: string, iv: string, originalName: string }>}
 */
async function encryptAndUpload(fileBuffer, originalName) {
  // 1. SHA-256 hash of original file content (integrity verification)
  const fileHash = computeFileIntegrityHash(fileBuffer);

  // 2. SHA-256 hash of filename (privacy — no patient names in storage)
  const { hashedName } = hashFilename(originalName);

  // 3. AES-256-CBC encrypt the file buffer
  const { encryptedData, iv } = encryptBuffer(fileBuffer);

  // 4. Upload encrypted data to Cloudinary as raw resource
  const uploadResult = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "medivault_records",
        public_id: hashedName,
        resource_type: "raw",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    uploadStream.end(encryptedData);
  });

  return {
    url: uploadResult.secure_url,
    hashedFilename: hashedName,
    fileHash, // SHA-256 of original content for integrity check
    iv, // Required for AES-256 decryption
    originalName,
  };
}

/**
 * Download encrypted file from Cloudinary and decrypt it.
 *
 * @param {string} url - Cloudinary URL of the encrypted file
 * @param {string} iv - Hex-encoded IV used during encryption
 * @param {string} expectedHash - SHA-256 hash for integrity verification
 * @returns {Promise<{ decryptedBuffer: Buffer, integrityValid: boolean }>}
 */
async function downloadAndDecrypt(url, iv, expectedHash) {
  const axios = require("axios");
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const encryptedBuffer = Buffer.from(response.data);

  // AES-256-CBC decrypt
  const decryptedBuffer = decryptBuffer(encryptedBuffer, iv);

  // Verify SHA-256 integrity
  const integrityValid = expectedHash
    ? verifyFileIntegrity(decryptedBuffer, expectedHash)
    : true;

  return { decryptedBuffer, integrityValid };
}

module.exports = {
  upload,
  encryptAndUpload,
  downloadAndDecrypt,
  cloudinary,
};
