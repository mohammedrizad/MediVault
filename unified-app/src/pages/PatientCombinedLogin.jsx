import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  VStack,
  Heading,
  Text,
  Box,
  Divider,
  Alert,
  AlertIcon,
  useToast,
} from "@chakra-ui/react";
import FaceLogin from "../components/auth/FaceLogin";
import PatientOtpLogin from "../components/auth/PatientOtpLogin";
import { useAuth } from "../context/AuthContext";

const PatientCombinedLogin = () => {
  const [loginStatus, setLoginStatus] = useState(null); // "success" | "fail"
  const [userInfo, setUserInfo] = useState(null); // user data from face login
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const handleFaceSuccess = (user) => {
    setLoginStatus("success");
    setUserInfo(user);
    setErrorMessage("");
    console.log("Face login success:", user);

    // Login user and redirect
    login(user, "patient");
    setTimeout(() => {
      navigate("/patient/dashboard");
    }, 1500);
  };

  const handleFaceError = (error) => {
    setLoginStatus("fail");
    setUserInfo(null);
    setErrorMessage(error);
    console.log("Face login failed:", error);
  };

  const handleOtpSuccess = (patient) => {
    console.log("OTP login success:", patient);
    toast({
      title: "Login Successful!",
      description: `Welcome ${patient.name}!`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    // Login user and redirect
    login(patient, "patient");
    setTimeout(() => {
      navigate("/patient/dashboard");
    }, 1500);
  };

  return (
    <VStack spacing={8} mt={8} w="full" maxW="500px" mx="auto" p={6}>
      <Box textAlign="center">
        <Heading size="lg">Patient Login</Heading>
        <Text color="gray.600">Use face recognition or OTP to login</Text>
      </Box>

      {/* Face Login Component */}
      <FaceLogin onSuccess={handleFaceSuccess} onError={handleFaceError} />

      {/* Real-time feedback */}
      {loginStatus && (
        <Alert
          status={loginStatus === "success" ? "success" : "error"}
          borderRadius="md"
        >
          <AlertIcon />
          {loginStatus === "success"
            ? `Face login successful! Welcome ${userInfo?.name || "Patient"}`
            : `Face login failed: ${errorMessage}`}
        </Alert>
      )}

      <Divider orientation="horizontal" />

      {/* OTP Login Component */}
      <PatientOtpLogin onSuccess={handleOtpSuccess} />
    </VStack>
  );
};

export default PatientCombinedLogin;
