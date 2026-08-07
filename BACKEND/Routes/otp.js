// Routes/otp.js - OTP API endpoints
const express = require("express");
const router = express.Router();
const {
  sendOTPWithVerify,
  verifyOTP,
  generateOTP,
  sendOTPWithSMS,
} = require("../otpService");

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

/**
 * POST /otp/send
 * Send OTP to phone number
 */
router.post("/send", async (req, res) => {
  try {
    let { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Auto-format: Add +91 if missing and length is 10
    if (/^\d{10}$/.test(phone)) {
      phone = "+91" + phone;
    }

    // Validate phone number format (should be in E.164 format)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid phone number format. Use E.164 format (e.g., +918072524479)",
      });
    }

    console.log("Sending OTP to:", phone);

    // --- TWILIO VERIFY FLOW (Prioritized) ---
    try {
      const verifyResult = await sendOTPWithVerify(phone);

      if (verifyResult.success) {
        return res.status(200).json({
          success: true,
          message: "OTP sent successfully via Twilio",
          method: "twilio_verify",
        });
      } else {
        console.warn(
          "Twilio Verify failed, falling back to local OTP:",
          verifyResult.error
        );
      }
    } catch (err) {
      console.error("Twilio Verify Error:", err);
    }

    // --- FALLBACK: FIXED OTP FLOW (Self-Managed) ---
    // 1. Generate OTP locally
    const otp = generateOTP();

    // 2. Log it for debugging/testing (CRITICAL for development)
    console.log(`🔐 GENERATED OTP for ${phone}: ${otp}`);

    // 3. Store in memory with expiration (5 minutes)
    otpStore.set(phone, {
      otp: otp,
      expires: Date.now() + 5 * 60 * 1000,
      verified: false,
    });

    // 4. Send via SMS (Best effort)
    // We use sendOTPWithSMS instead of Verify service to have control over the code
    try {
      await sendOTPWithSMS(phone, otp);
    } catch (smsError) {
      console.error("Failed to send SMS (ignoring for dev):", smsError.message);
    }

    // Always return success in dev mode so UI can proceed
    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      dev_note: "Check server console for OTP if SMS fails",
      otp: otp, // Returning OTP for demo purposes
    });
  } catch (error) {
    console.error("Error in /send endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

/**
 * POST /otp/verify
 * Verify OTP code
 */
router.post("/verify", async (req, res) => {
  try {
    let { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP code are required",
      });
    }

    // Auto-format: Add +91 if missing and length is 10
    if (/^\d{10}$/.test(phone)) {
      phone = "+91" + phone;
    }

    console.log(`Verifying OTP for ${phone}: ${code}`);

    // 1. Try Twilio Verify first
    try {
      const verifyResult = await verifyOTP(phone, code);
      if (verifyResult.success) {
        return res.status(200).json({
          success: true,
          message: "OTP verified successfully (Twilio)",
          token: "mock_jwt_token_for_demo", // In real app, generate JWT here
        });
      }
    } catch (err) {
      console.error("Twilio Verify Check Error:", err);
    }

    // 2. Fallback to Local Store
    // Check if OTP was sent to this number
    const otpInfo = otpStore.get(phone);
    if (!otpInfo) {
      return res.status(400).json({
        success: false,
        message:
          "No OTP found for this phone number. Please request a new OTP.",
      });
    }

    // Check expiration
    if (Date.now() > otpInfo.expires) {
      otpStore.delete(phone);
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Verify Code
    if (otpInfo.otp === code) {
      otpInfo.verified = true;
      otpStore.set(phone, otpInfo); // Update status

      return res.status(200).json({
        success: true,
        message: "OTP verified successfully",
        status: "approved",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again.",
      });
    }
  } catch (error) {
    console.error("Error in /verify endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = router;
