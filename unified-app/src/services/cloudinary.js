// Cloudinary File Upload Service for MediVault
// All uploads now go through the backend for SHA-256 hashing + AES-256 encryption
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5002";

class CloudinaryService {
  constructor() {
    this.uploadUrl = `${API_BASE}/records/upload`;
  }

  /**
   * Upload file through backend (SHA-256 hashed + AES-256 encrypted)
   * @param {File|string} file - File object or base64 string
   * @param {Object} options - Upload options (kept for backward compatibility)
   * @returns {Promise} Upload result with encryption metadata
   */
  async uploadFile(file, options = {}) {
    try {
      const formData = new FormData();

      if (typeof file === "string" && file.startsWith("data:")) {
        // Convert base64 to blob for FormData
        const response = await fetch(file);
        const blob = await response.blob();
        formData.append("file", blob, options.filename || "upload.jpg");
      } else if (file instanceof File) {
        formData.append("file", file);
      } else {
        throw new Error("Invalid file format");
      }

      const result = await axios.post(this.uploadUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      return {
        success: true,
        data: {
          public_id: result.data.filename,
          url: result.data.url,
          secure_url: result.data.url,
          format: result.data.originalName?.split(".").pop() || "raw",
          bytes: 0,
          created_at: new Date().toISOString(),
          // Encryption metadata
          fileHash: result.data.fileHash,
          encryptionIV: result.data.encryptionIV,
          encryption: result.data.encryption,
          hashing: result.data.hashing,
        },
      };
    } catch (error) {
      console.error("[CLOUDINARY] Encrypted upload failed:", error);
      return {
        success: false,
        error: error.response?.data?.msg || error.message || "Upload failed",
      };
    }
  }

  /**
   * Upload medical document
   * @param {File} file Medical document file
   * @returns {Promise} Upload result
   */
  async uploadMedicalDocument(file) {
    return this.uploadFile(file, {
      folder: "medivault/medical_documents",
      transformation: {
        quality: "auto:good",
        format: "auto",
      },
    });
  }

  /**
   * Upload patient face image
   * @param {string|File} faceImage Face image data
   * @returns {Promise} Upload result
   */
  async uploadFaceImage(faceImage) {
    return this.uploadFile(faceImage, {
      folder: "medivault/face_images",
      transformation: {
        width: 300,
        height: 300,
        crop: "fill",
        quality: "auto:good",
        format: "jpg",
      },
    });
  }

  /**
   * Upload hospital logo
   * @param {File} logoFile Logo file
   * @returns {Promise} Upload result
   */
  async uploadHospitalLogo(logoFile) {
    return this.uploadFile(logoFile, {
      folder: "medivault/hospital_logos",
      transformation: {
        width: 200,
        height: 200,
        crop: "fit",
        quality: "auto:best",
        format: "png",
      },
    });
  }

  /**
   * Get optimized image URL
   * @param {string} publicId Public ID of the image
   * @param {Object} options Transformation options
   * @returns {string} Optimized image URL
   */
  getOptimizedUrl(publicId, options = {}) {
    const baseUrl = `https://res.cloudinary.com/${this.cloudName}/image/upload`;
    let transformations = [];

    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.crop) transformations.push(`c_${options.crop}`);
    if (options.quality) transformations.push(`q_${options.quality}`);
    if (options.format) transformations.push(`f_${options.format}`);

    const transformString =
      transformations.length > 0 ? `/${transformations.join(",")}` : "";

    return `${baseUrl}${transformString}/${publicId}`;
  }

  /**
   * Delete file from Cloudinary (requires backend API)
   * @param {string} publicId Public ID of the file to delete
   * @returns {Promise} Deletion result
   */
  async deleteFile(publicId) {
    try {
      // This would typically be done via backend API for security
      console.log(
        "[CLOUDINARY] Demo mode - File deletion simulated for:",
        publicId,
      );

      return {
        success: true,
        message: "File deleted successfully (Demo mode)",
      };
    } catch (error) {
      console.error("[CLOUDINARY] Delete failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Export singleton instance
const cloudinaryService = new CloudinaryService();
export default cloudinaryService;

// Export class for testing
export { CloudinaryService };
