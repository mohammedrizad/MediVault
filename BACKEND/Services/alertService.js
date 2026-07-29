const nodemailer = require("nodemailer");
const twilio = require("twilio");
const AlertHistory = require("../Models/AlertHistory");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const twilioClient = process.env.TWILIO_ACCOUNT_SID
  ? new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

exports.sendCriticalAlert = async (
  patientName,
  doctorEmail,
  emergencyPhone,
  message
) => {
  try {
    const timestamp = new Date().toISOString();

    if (process.env.EMAIL_USER && doctorEmail) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: doctorEmail,
        subject: `🚨 CRITICAL ALERT: ${patientName}`,
        text: `${message}\n\nTime: ${timestamp}\n\nPlease take immediate action.`,
      });

      // Log to Database
      await AlertHistory.create({
        patientName,
        recipientContact: doctorEmail,
        message,
        alertType: "EMAIL",
        status: "SENT",
      });

      console.log(`Email alert sent to ${doctorEmail}`);
    }

    if (twilioClient && emergencyPhone && process.env.TWILIO_PHONE_NUMBER) {
      try {
        await twilioClient.messages.create({
          body: `URGENT: Critical health alert for ${patientName}. ${message}. Please contact hospital.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: emergencyPhone,
        });

        // Log to Database
        await AlertHistory.create({
          patientName,
          recipientContact: emergencyPhone,
          message,
          alertType: "SMS",
          status: "SENT",
        });

        console.log(`SMS alert sent to ${emergencyPhone}`);
      } catch (smsError) {
        console.error("Failed to send SMS Alert:", smsError.message);

        // Log Failure
        await AlertHistory.create({
          patientName,
          recipientContact: emergencyPhone,
          message,
          alertType: "SMS",
          status: "FAILED",
          error: smsError.message,
        });
      }
    } else {
      console.log("Skipping SMS Alert: No TWILIO_PHONE_NUMBER configured.");
    }

    // Database logging commented out until model is migrated
    /*
    const alert = new AlertHistory({
      type: "CRITICAL_LAB",
      severity: "Critical",
      message: message,
      sentTo: [doctorEmail, emergencyPhone].filter(Boolean),
    });
    await alert.save();
    */

    return true;
  } catch (error) {
    console.error("Alert System Error:", error);
    return false;
  }
};
