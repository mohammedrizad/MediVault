const express = require("express");
const router = express.Router();
const { verifyToken, authorize } = require("../Middleware/rbac");
const {
  upload,
  encryptAndUpload,
  downloadAndDecrypt,
} = require("../Services/uploadService");

// Upload Endpoint — SHA-256 hashing + AES-256 encryption (any authenticated user)
router.post(
  "/upload",
  verifyToken,
  authorize("admin", "doctor", "nurse", "patient", "scan_center"),
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ msg: "No file uploaded" });
      }

      // Encrypt with AES-256-CBC and upload to Cloudinary
      // SHA-256 hash computed for filename privacy + integrity verification
      const result = await encryptAndUpload(
        req.file.buffer,
        req.file.originalname,
      );

      res.json({
        msg: "File uploaded successfully (AES-256 encrypted, SHA-256 hashed)",
        url: result.url,
        filename: result.hashedFilename,
        originalName: result.originalName,
        fileHash: result.fileHash, // SHA-256 integrity hash
        encryptionIV: result.iv, // Required for decryption
        encryption: "AES-256-CBC",
        hashing: "SHA-256",
      });
    } catch (err) {
      console.error("Upload Error:", err);
      res
        .status(500)
        .json({ msg: "Server Error during upload", error: err.message });
    }
  },
);

// Download & Decrypt Endpoint — retrieves and decrypts AES-256 encrypted file
router.post("/download", async (req, res) => {
  try {
    const { url, iv, fileHash, originalName } = req.body;

    if (!url || !iv) {
      return res
        .status(400)
        .json({ msg: "url and iv are required for decryption" });
    }

    const { decryptedBuffer, integrityValid } = await downloadAndDecrypt(
      url,
      iv,
      fileHash,
    );

    if (!integrityValid) {
      return res.status(422).json({
        msg: "File integrity check failed — file may have been tampered with",
        integrityValid: false,
      });
    }

    // Determine content type from original name
    const ext = (originalName || "file").split(".").pop().toLowerCase();
    const mimeTypes = {
      pdf: "application/pdf",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
    };

    res.set({
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${originalName || "decrypted_file"}"`,
      "X-File-Hash": fileHash || "",
      "X-Integrity-Valid": integrityValid.toString(),
    });

    res.send(decryptedBuffer);
  } catch (err) {
    console.error("Download/Decrypt Error:", err);
    res
      .status(500)
      .json({ msg: "Server Error during decryption", error: err.message });
  }
});

// Verify file integrity without downloading full file
router.post("/verify-integrity", async (req, res) => {
  try {
    const { url, iv, fileHash } = req.body;

    if (!url || !iv || !fileHash) {
      return res
        .status(400)
        .json({ msg: "url, iv, and fileHash are required" });
    }

    const { integrityValid } = await downloadAndDecrypt(url, iv, fileHash);

    res.json({
      integrityValid,
      algorithm: "SHA-256",
      hash: fileHash,
    });
  } catch (err) {
    console.error("Integrity check error:", err);
    res
      .status(500)
      .json({ msg: "Integrity verification failed", error: err.message });
  }
});

module.exports = router;
