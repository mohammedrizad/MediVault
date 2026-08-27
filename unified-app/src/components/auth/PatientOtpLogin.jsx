import React, { useState } from "react";
import {
  Box,
  VStack,
  Input,
  Button,
  Heading,
  Text,
  Alert,
  AlertIcon,
  useToast,
} from "@chakra-ui/react";

const PatientOtpLogin = ({ onSuccess }) => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1 = enter phone, 2 = enter OTP
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // 🆕 Real API: send OTP using Twilio
  const sendOtp = async () => {
    // Validate phone number (basic validation)
    if (!phone || phone.length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }

    // Convert to E.164 format if needed (assuming Indian number)
    let formattedPhone = phone;
    if (!phone.startsWith("+")) {
      if (phone.startsWith("91")) {
        formattedPhone = "+" + phone;
      } else if (phone.length === 10) {
        formattedPhone = "+91" + phone;
      } else {
        formattedPhone = "+" + phone;
      }
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5002/otp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: formattedPhone }),
      });

      const data = await response.json();

      if (data.success) {
        setStep(2);
        toast({
          title: "OTP Sent Successfully!",
          description: `OTP has been sent to ${formattedPhone}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        setError(data.message || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Real API: verify OTP using Twilio
  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    // Convert phone to E.164 format again
    let formattedPhone = phone;
    if (!phone.startsWith("+")) {
      if (phone.startsWith("91")) {
        formattedPhone = "+" + phone;
      } else if (phone.length === 10) {
        formattedPhone = "+91" + phone;
      } else {
        formattedPhone = "+" + phone;
      }
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5002/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: formattedPhone,
          code: otp,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // OTP verified! Now fetch patient data
        try {
          const patientResponse = await fetch(
            "http://localhost:5002/patient/getbyphone",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                phone: formattedPhone,
              }),
            }
          );

          const patientResult = await patientResponse.json();

          if (patientResult.success && patientResult.patient) {
            const pData = patientResult.patient;
            const patient = {
              id: pData._id,
              name: pData.Name,
              phone: pData.Mobile_no,
              email: pData.Email,
              age: pData.Age || "Unknown",
              gender: pData.Gender || "Unknown",
              medicalId: pData.MedicalId,
              address: pData.Address,
              bloodGroup: pData.BloodGroup,
              emergencyContact: pData.EmergencyContact,
              isVerified: true,
            };

            toast({
              title: "Login Successful!",
              description: `Welcome ${patient.name}!`,
              status: "success",
              duration: 3000,
              isClosable: true,
            });

            // Call parent's onSuccess handler
            if (onSuccess) {
              onSuccess(patient);
            }
          } else {
            // Patient not found in database
            toast({
              title: "Patient Not Found",
              description:
                "OTP verified but no patient record exists. Please register first.",
              status: "warning",
              duration: 5000,
              isClosable: true,
            });
            setError("Patient not found. Please contact admin to register.");
          }
        } catch (err) {
          console.error("Error fetching patient details:", err);
          setError("Failed to fetch patient details. Please try again.");
        }
      } else {
        setError(data.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box w="full">
      <VStack spacing={4}>
        <Heading size="md" textAlign="center" color="blue.500">
          {step === 1 ? "Enter Phone Number" : "Enter OTP"}
        </Heading>

        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {step === 1 && (
          <>
            <Text fontSize="sm" color="gray.600" textAlign="center">
              Enter your phone number to receive OTP
            </Text>
            <Input
              placeholder="Enter phone number (e.g., 8072524479)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
            />
            <Button
              colorScheme="blue"
              w="full"
              isLoading={loading}
              onClick={sendOtp}
            >
              Send OTP
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <Text fontSize="sm" color="gray.600" textAlign="center">
              Enter the 6-digit OTP sent to {phone}
            </Text>
            <Input
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              type="number"
            />
            <Button
              colorScheme="green"
              w="full"
              isLoading={loading}
              onClick={verifyOtp}
            >
              Verify OTP
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStep(1);
                setOtp("");
                setError("");
              }}
            >
              Change Phone Number
            </Button>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default PatientOtpLogin;
