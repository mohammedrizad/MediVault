// otpService.js - Twilio OTP Integration
const twilio = require("twilio");
const twilioConfig = require("./config/twilio");

// Twilio credentials from config
const { accountSid, authToken, serviceSid, twilioPhoneNumber } = twilioConfig;

const client = new twilio(accountSid, authToken);

/**
 * Send OTP using Twilio Verify Service
 * @param {string} phoneNumber - Phone number in E.164 format (e.g., +918072524479)
 * @returns {Promise} - Twilio verification response
 */
async function sendOTPWithVerify(phoneNumber) {
  try {
    const verification = await client.verify.v2
      .services(serviceSid)
      .verifications.create({
        to: phoneNumber,
        channel: "sms",
      });

    console.log("OTP sent successfully:", verification.sid);
    return {
      success: true,
      sid: verification.sid,
      status: verification.status,
      message: "OTP sent successfully",
    };
  } catch (error) {
    console.error("Error sending OTP:", error);
    return {
      success: false,
      error: error.message,
      message: "Failed to send OTP",
    };
  }
}

/**
 * Verify OTP using Twilio Verify Service
 * @param {string} phoneNumber - Phone number in E.164 format
 * @param {string} code - The OTP code to verify
 * @returns {Promise} - Verification result
 */
async function verifyOTP(phoneNumber, code) {
  try {
    const verificationCheck = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({
        to: phoneNumber,
        code: code,
      });

    console.log("OTP verification result:", verificationCheck.status);
    return {
      success: verificationCheck.status === "approved",
      status: verificationCheck.status,
      message:
        verificationCheck.status === "approved"
          ? "OTP verified successfully"
          : "Invalid OTP",
    };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return {
      success: false,
      error: error.message,
      message: "OTP verification failed",
    };
  }
}

/**
 * Generate 6-digit OTP (fallback method for testing)
 * @returns {string} - 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP using traditional SMS (fallback method)
 * @param {string} phoneNumber - Phone number in E.164 format
 * @param {string} otp - The OTP code to send
 * @returns {Promise} - SMS sending result
 */
async function sendOTPWithSMS(phoneNumber, otp) {
  try {
    const message = await client.messages.create({
      body: `Your MediVault OTP is: ${otp}. Valid for 5 minutes.`,
      from: twilioPhoneNumber, // From config file
      to: phoneNumber,
    });

    console.log("SMS OTP sent successfully:", message.sid);
    return {
      success: true,
      sid: message.sid,
      otp: otp, // For testing only - remove in production
      message: "OTP sent successfully",
    };
  } catch (error) {
    console.error("Error sending SMS OTP:", error);
    return {
      success: false,
      error: error.message,
      message: "Failed to send OTP",
    };
  }
}

module.exports = {
  sendOTPWithVerify,
  verifyOTP,
  generateOTP,
  sendOTPWithSMS,
};
