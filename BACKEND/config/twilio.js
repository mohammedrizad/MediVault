// config/twilio.js - Twilio Configuration
// 🔐 IMPORTANT: Replace these with your actual Twilio credentials

module.exports = {
  // Your Twilio Account SID
  accountSid: process.env.TWILIO_ACCOUNT_SID,

  authToken: process.env.TWILIO_AUTH_TOKEN,

  // Your Twilio Verify Service SID
  serviceSid: process.env.TWILIO_VERIFY_SERVICE_SID,

  // Your Twilio Phone Number (for fallback SMS method)
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,

  // OTP Configuration
  otpLength: 6,
  otpExpiryMinutes: 5,
  maxAttempts: 3,

  // Test phone number (for development)
  testPhoneNumber: "+918072524479",
};

// 📝 How to get your Twilio credentials:
// 1. Go to https://console.twilio.com/
// 2. Copy Account SID from the dashboard
// 3. Copy Auth Token from the dashboard
// 4. Create a Verify Service and copy the Service SID
// 5. (Optional) Purchase a phone number for SMS fallback method
