import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Alert,
  AlertIcon,
  useToast,
  Progress,
  Badge,
  Card,
  CardBody,
  PinInput,
  PinInputField,
  FormControl,
  FormLabel,
  Input,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiCamera, FiRefreshCw, FiShield, FiSmartphone } from "react-icons/fi";

const FacialAuth = ({ onSuccess, onError }) => {
  const [authStep, setAuthStep] = useState("camera"); // camera, processing, otp, success
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [patientData, setPatientData] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [confidence, setConfidence] = useState(0);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const toast = useToast();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // API Base URL
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5002";

  // Mock patient database
  const mockPatientDatabase = [
    {
      id: "MED001",
      name: "Mohamed Ratke",
      phone: "+1234567890",
      email: "mohamed.ratke@email.com",
      faceToken: "mock_face_token_1",
    },
    {
      id: "MED002",
      name: "Sarah Johnson",
      phone: "+1234567891",
      email: "sarah.johnson@email.com",
      faceToken: "mock_face_token_2",
    },
  ];

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((error) => {
          console.warn("Video play interrupted:", error);
          // This is normal when switching between video modes
        });
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Camera initialization error:", error);
      setError(
        "Camera access denied. Please allow camera access and try again.",
      );
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [initializeCamera]);

  // Capture image from video
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    return canvas.toDataURL("image/jpeg", 0.8);
  };

  // Convert data URL to blob
  const dataURLToBlob = (dataURL) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(resolve, "image/jpeg", 0.8);
      };

      img.onerror = reject;
      img.src = dataURL;
    });
  };

  // Backend facial authentication
  const authenticateWithBackend = async (base64Image) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patient/loginforpatient`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64Image,
        }),
        timeout: 15000,
      });

      const data = await response.json();
      console.log("Backend response:", data);

      // If backend auth fails, return failure (triggers OTP fallback)
      if (data.msg !== "Faces match!" || !data.result) {
        console.log("Face auth response:", data.msg);
        return {
          success: false,
          message: data.msg || "Face not recognized",
        };
      }

      if (data.msg === "Faces match!" && data.result) {
        return {
          success: true,
          patient: data.result,
          confidence: data.confidence,
          authMethod: data.authMethod || "face_recognition",
          token: data.token,
        };
      } else {
        return {
          success: false,
          message: data.msg || "Authentication failed",
        };
      }
    } catch (error) {
      console.error("Backend authentication error:", error);

      // Return failure on network error (triggers OTP fallback)
      return {
        success: false,
        message: "Network error during authentication. Please try OTP.",
      };
    }
  };

  // Send OTP to patient's phone
  const sendOTP = async (phoneNumber, patientId = null) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/patient/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phoneNumber,
          patientId: patientId,
        }),
      });

      const data = await response.json();

      if (data.msg === "OTP sent successfully") {
        toast({
          title: "OTP Sent",
          description: `Verification code sent to ${phoneNumber}`,
          status: "success",
          duration: 5000,
        });
        return { success: true };
      } else {
        toast({
          title: "Failed to Send OTP",
          description: data.msg || "Please try again",
          status: "error",
          duration: 5000,
        });
        return { success: false, message: data.msg };
      }
    } catch (error) {
      console.error("OTP sending error:", error);
      toast({
        title: "Network Error",
        description: "Failed to send OTP. Please check your connection.",
        status: "error",
        duration: 5000,
      });
      return { success: false, message: "Network error" };
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP code
  const verifyOTP = async (phoneNumber, otp) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/patient/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phoneNumber,
          otp: otp,
        }),
      });

      const data = await response.json();

      if (data.msg === "OTP verified successfully" && data.result) {
        setPatientData({
          id: data.result._id,
          name: data.result.Name,
          phone: data.result.Mobile_no,
          email: data.result.Email,
          gender: data.result.Gender,
          aadhar: data.result.Aadhar,
          dob: data.result.DOB,
          role: "patient",
          medicalId: data.result.MedicalId,
          authMethod: "OTP",
          token: data.token,
        });

        setAuthStep("success");
        return { success: true };
      } else {
        toast({
          title: "Invalid OTP",
          description: data.msg || "Please check your OTP and try again",
          status: "error",
          duration: 5000,
        });
        return { success: false, message: data.msg };
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      toast({
        title: "Verification Failed",
        description: "Network error during OTP verification",
        status: "error",
        duration: 5000,
      });
      return { success: false, message: "Network error" };
    } finally {
      setIsLoading(false);
    }
  };

  // Handle facial authentication
  const handleFacialAuth = async () => {
    try {
      setIsLoading(true);
      setError("");
      setAuthStep("processing");

      const imageData = captureImage();
      if (!imageData) {
        throw new Error("Failed to capture image");
      }

      // Convert to blob and then to base64
      const blob = await dataURLToBlob(imageData);
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64Image = reader.result.split(",")[1];

        // Try backend authentication first
        const backendResult = await authenticateWithBackend(base64Image);

        if (backendResult.success) {
          setPatientData({
            id: backendResult.patient._id,
            name: backendResult.patient.Name,
            phone: backendResult.patient.Mobile_no,
            email: backendResult.patient.Email,
            gender: backendResult.patient.Gender,
            aadhar: backendResult.patient.Aadhar,
            dob: backendResult.patient.DOB,
            role: "patient",
            medicalId: backendResult.patient.MedicalId,
            authMethod: backendResult.authMethod,
            token: backendResult.token,
            photo: backendResult.patient.Photo,
          });

          setConfidence(backendResult.confidence || 95);
          setAuthStep("success");

          toast({
            title: "Authentication Successful!",
            description: `Welcome back, ${backendResult.patient.Name}`,
            status: "success",
            duration: 5000,
          });

          onSuccess({
            id: backendResult.patient._id,
            name: backendResult.patient.Name,
            phone: backendResult.patient.Mobile_no,
            email: backendResult.patient.Email,
            gender: backendResult.patient.Gender,
            aadhar: backendResult.patient.Aadhar,
            dob: backendResult.patient.DOB,
            role: "patient",
            medicalId: backendResult.patient.MedicalId,
            authMethod: backendResult.authMethod,
            token: backendResult.token,
            photo: backendResult.patient.Photo,
          });
        } else {
          // If facial auth fails, offer OTP as fallback
          setError("Face authentication failed. Please try OTP verification.");
          setAuthStep("otp");

          toast({
            title: "Face Authentication Failed",
            description: "Please try OTP verification as an alternative",
            status: "warning",
            duration: 5000,
          });
        }
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Facial authentication error:", error);
      setError(
        "Authentication failed. Please try again or use OTP verification.",
      );
      setAuthStep("otp");

      toast({
        title: "Authentication Error",
        description: "Please try OTP verification",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP submission
  const handleOTPSubmit = async () => {
    if (otpCode.length !== 4) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 4-digit OTP",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    const result = await verifyOTP(phoneNumber, otpCode);
    if (result.success) {
      onSuccess(patientData);
    }
  };

  // Handle send OTP
  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    await sendOTP(phoneNumber);
  };

  // Render success step
  const renderSuccess = () => (
    <VStack spacing={6} align="center">
      <Box textAlign="center">
        <FiShield size={60} color="green" />
        <Text fontSize="2xl" fontWeight="bold" color="green.500" mt={4}>
          Authentication Successful!
        </Text>
        <Text color="gray.600" mt={2}>
          Welcome back, {patientData?.name}
        </Text>
      </Box>

      {confidence > 0 && (
        <Box textAlign="center">
          <Text fontSize="sm" color="gray.500">
            Confidence Score
          </Text>
          <Badge colorScheme="green" fontSize="lg" px={3} py={1}>
            {confidence}%
          </Badge>
        </Box>
      )}

      <Button
        colorScheme="blue"
        size="lg"
        onClick={() => onSuccess(patientData)}
        width="full"
      >
        Continue to Dashboard
      </Button>
    </VStack>
  );

  // Render OTP step
  const renderOTP = () => (
    <VStack spacing={6} align="center">
      <Box textAlign="center">
        <FiSmartphone size={48} />
        <Text fontSize="xl" fontWeight="bold" mt={4}>
          OTP Verification
        </Text>
        <Text color="gray.600" mt={2}>
          Face authentication failed. Please use phone verification.
        </Text>
      </Box>

      <FormControl>
        <FormLabel>Phone Number</FormLabel>
        <Input
          placeholder="Enter your phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          type="tel"
        />
      </FormControl>

      <Button
        colorScheme="blue"
        onClick={handleSendOTP}
        isLoading={isLoading}
        loadingText="Sending OTP..."
        width="full"
      >
        Send OTP
      </Button>

      <FormControl>
        <FormLabel>Enter 4-digit OTP</FormLabel>
        <HStack justify="center">
          <PinInput value={otpCode} onChange={setOtpCode} size="lg">
            <PinInputField />
            <PinInputField />
            <PinInputField />
            <PinInputField />
          </PinInput>
        </HStack>
      </FormControl>

      <Button
        colorScheme="green"
        onClick={handleOTPSubmit}
        isLoading={isLoading}
        loadingText="Verifying..."
        isDisabled={otpCode.length !== 4}
        width="full"
      >
        Verify OTP
      </Button>

      <Button variant="ghost" onClick={() => setAuthStep("camera")} size="sm">
        Back to Face Authentication
      </Button>
    </VStack>
  );

  // Render camera step
  const renderCamera = () => (
    <VStack spacing={6} align="center">
      <Box textAlign="center">
        <Text fontSize="xl" fontWeight="bold">
          Face Authentication
        </Text>
        <Text color="gray.600" mt={2}>
          Position your face in the camera and click authenticate
        </Text>
      </Box>

      <Box
        position="relative"
        borderRadius="lg"
        overflow="hidden"
        border="2px"
        borderColor={borderColor}
      >
        <video
          ref={videoRef}
          width={320}
          height={240}
          autoPlay
          muted
          style={{ display: "block" }}
        />
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {isLoading && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.600"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="white" fontSize="lg">
              Initializing camera...
            </Text>
          </Box>
        )}
      </Box>

      {error && (
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      )}

      <VStack spacing={3} width="full">
        <Button
          colorScheme="blue"
          leftIcon={<FiCamera />}
          onClick={handleFacialAuth}
          isLoading={isLoading}
          loadingText="Authenticating..."
          isDisabled={!!error}
          size="lg"
          width="full"
        >
          Authenticate with Face
        </Button>

        <Button
          variant="outline"
          leftIcon={<FiSmartphone />}
          onClick={() => setAuthStep("otp")}
          size="lg"
          width="full"
        >
          Use OTP Instead
        </Button>

        <Button
          variant="ghost"
          leftIcon={<FiRefreshCw />}
          onClick={initializeCamera}
          size="sm"
        >
          Restart Camera
        </Button>
      </VStack>
    </VStack>
  );

  // Render processing step
  const renderProcessing = () => (
    <VStack spacing={6} align="center">
      <Text fontSize="xl" fontWeight="bold">
        Processing Authentication...
      </Text>
      <Progress size="lg" isIndeterminate width="full" colorScheme="blue" />
      <Text color="gray.600">Please wait while we verify your identity</Text>
    </VStack>
  );

  return (
    <Card
      bg={bgColor}
      shadow="lg"
      borderRadius="xl"
      p={6}
      minH="500px"
      maxW="md"
      mx="auto"
    >
      <CardBody>
        {authStep === "camera" && renderCamera()}
        {authStep === "processing" && renderProcessing()}
        {authStep === "otp" && renderOTP()}
        {authStep === "success" && renderSuccess()}
      </CardBody>
    </Card>
  );
};

export default FacialAuth;
