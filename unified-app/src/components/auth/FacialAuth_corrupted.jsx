import React, { useState, useRef, useCallback } from "react";
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  useToast,
  Spinner,
  Image,
  Divider,
  Input,
  FormControl,
  FormLabel,
  PinInput,
  PinInputField,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiCamera, FiUser, FiShield, FiPhone } from "react-icons/fi";

const FacialAuth = ({ onAuthSuccess, isLoading, setIsLoading }) => {
  const [authStep, setAuthStep] = useState("capture"); // 'capture', 'processing', 'otp', 'success', 'error'
  const [capturedImage, setCapturedImage] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [patientData, setPatientData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Face++ API Configuration (You'll need to replace with your actual API keys)
  const FACEPP_API_KEY = process.env.REACT_APP_FACEPP_API_KEY || "demo-key";
  const FACEPP_API_SECRET =
    process.env.REACT_APP_FACEPP_API_SECRET || "demo-secret";
  const FACEPP_BASE_URL = "https://api-us.faceplusplus.com/facepp/v3";

  // Mock patient database with face tokens (In real app, this would be in backend)
  const mockPatientDatabase = [
    {
      id: "P001",
      name: "John Smith",
      phone: "+1234567890",
      faceToken: "mock_face_token_1",
      medicalId: "MED001",
    },
    {
      id: "P002",
      name: "Sarah Johnson",
      phone: "+1234567891",
      faceToken: "mock_face_token_2",
      medicalId: "MED002",
    },
  ];

  // Start camera for facial capture
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: "user",
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error("Camera access error:", error);
      toast({
        title: "Camera Access Error",
        description: "Unable to access camera. Please check permissions.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [toast]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Capture photo from video stream
  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);

      // Convert to base64
      const imageData = canvas.toDataURL("image/jpeg", 0.8);
      setCapturedImage(imageData);
      stopCamera();

      // Start facial recognition process
      processFacialRecognition(imageData);
    }
  }, [stopCamera]);

  // Simulate Face++ API facial recognition
  const processFacialRecognition = async (imageData) => {
    setAuthStep("processing");
    setIsLoading(true);

    try {
      // Convert base64 to blob for API call
      const response = await fetch(imageData);
      const blob = await response.blob();

      // Call real backend API for face recognition
      const facialAnalysisResult = await authenticateWithBackend(blob);

      if (facialAnalysisResult.success) {
        const patient = facialAnalysisResult.patient;
        const confidence = facialAnalysisResult.confidence;

        if (confidence > 80) {
          setPatientData(patient);
          setConfidenceScore(confidence);
          setAuthStep("success");

          setTimeout(() => {
            onAuthSuccess({
              id: patient.id,
              _id: patient._id,
              name: patient.name,
              email: patient.email,
              phone: patient.phone,
              address: patient.address,
              aadhar: patient.aadhar,
              dob: patient.dob,
              role: "patient",
              medicalId: patient.medicalId,
              authMethod: "facial",
              confidence: confidence,
              token: facialAnalysisResult.token,
            });
          }, 2000);
        } else {
          // Low confidence, request OTP backup
          setPatientData(patient);
          setConfidenceScore(confidence);
          setAuthStep("otp");
        }
      } else {
        setErrorMessage(
          facialAnalysisResult.message ||
            "No matching patient found. Please contact admin or use manual login."
        );
        setAuthStep("error");
      }
    } catch (error) {
      console.error("Facial recognition error:", error);
      setErrorMessage(
        "Authentication service temporarily unavailable. Please try again."
      );
      setAuthStep("error");
    } finally {
      setIsLoading(false);
    }
  };

  // Real backend authentication function
  const authenticateWithBackend = async (imageBlob) => {
    try {
      // Convert blob to base64
      const base64Image = await blobToBase64(imageBlob);

      const API_BASE_URL =
        process.env.REACT_APP_API_BASE_URL || "http://localhost:5002";

      console.log("Calling enhanced backend face login API...");

      const response = await fetch(`${API_BASE_URL}/patient/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64Image,
          patientId: null, // Can be added later for additional verification
          phone: phoneNumber || null
        }),
      });

      const data = await response.json();
      console.log("Backend response:", data);

      if (data.requiresAdditionalAuth) {
        // Handle cases requiring additional authentication
        if (data.suggestedAuth === "otp") {
          if (data.matches && data.matches.length > 1) {
            // Multiple face matches detected
            setErrorMessage(`Multiple matching faces detected. Please verify with OTP.`);
            toast({
              title: "Multiple Matches",
              description: "Multiple patients with similar faces found. OTP verification required.",
              status: "warning",
              duration: 5000,
            });
          } else if (data.patientData) {
            // Medium confidence match
            setPatientData(data.patientData);
            setConfidenceScore(data.confidence);
            toast({
              title: "Additional Verification Required",
              description: `Face confidence: ${data.confidence}%. Please verify with OTP.`,
              status: "info",
              duration: 5000,
            });
          }
          setAuthStep("otp");
          return { success: false, requiresOTP: true, data: data };
        } else if (data.suggestedAuth === "manual_login") {
          setErrorMessage("Face not recognized. Please use manual login.");
          setAuthStep("error");
          return { success: false, message: "Face not recognized" };
        }
      }

      if (data.result && data.msg === "Faces match!") {
        return {
          success: true,
          patient: data.result,
          confidence: data.confidence,
          authMethod: data.authMethod,
          token: data.token
        };
      } else {
        return {
          success: false,
          message: data.msg || "Authentication failed",
        };
      }
    } catch (error) {
      console.error("Backend authentication error:", error);
      return {
        success: false,
        message: "Network error. Please check your connection.",
      };
    }
  };

  // OTP verification function
  const verifyOTP = async (phoneNumber, otp) => {
  };

  // Helper function to convert blob to base64
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Find patient match in database (now handled by backend)
  const findPatientMatch = (faceToken) => {
    // In real app, this would compare face tokens using Face++ Search API
    // For demo, randomly match with one of the mock patients
    return mockPatientDatabase[
      Math.floor(Math.random() * mockPatientDatabase.length)
    ];
  };

  // Send OTP to patient's registered phone number
  const sendOTP = async (phoneNumber, patientId = null) => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5002";
      
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/patient/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phoneNumber,
          patientId: patientId
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.msg === "OTP sent successfully") {
        toast({
          title: "OTP Sent",
          description: `OTP sent to ${data.phone}. Demo OTP: ${data.demoOTP}`,
          status: "success",
          duration: 8000,
        });
        return { success: true, data: data };
      } else {
        toast({
          title: "Failed to Send OTP",
          description: data.msg || "Error sending OTP",
          status: "error",
          duration: 5000,
        });
        return { success: false, message: data.msg };
      }
    } catch (error) {
      console.error("Send OTP error:", error);
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

  // Handle OTP form submission
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
          otp: otpCode,
          patientId: patientId,
          phone: phoneNumber
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.msg === "OTP verification successful") {
        toast({
          title: "Authentication Successful",
          description: "OTP verified successfully!",
          status: "success",
          duration: 3000,
        });
        
        // Call success callback with enhanced patient data
        onAuthSuccess({
          id: data.result._id,
          _id: data.result._id,
          name: data.result.Name,
          email: data.result.Email,
          phone: data.result.Mobile_no,
          address: data.result.Address,
          aadhar: data.result.Aadhar,
          dob: data.result.DOB,
          role: "patient",
          medicalId: data.result.MedicalId,
          authMethod: data.authMethod,
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

  // Handle OTP form submission
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

    const result = await verifyOTP(
      otpCode, 
      patientData?.id || patientData?.medicalId, 
      phoneNumber || patientData?.phone
    );
    
    if (!result.success) {
      setOtpCode(""); // Clear OTP field on failure
    }
  };

  // Handle phone number input for OTP
  const handleSendOTP = async () => {
    if (!phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your registered phone number",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    const result = await sendOTP(phoneNumber, patientData?.id || patientData?.medicalId);
    if (result.success && result.data.patientInfo) {
      setPatientData(result.data.patientInfo);
    }
  };

  // Validate phone number against database before sending OTP
  const validatePhoneNumber = async (phoneNumber) => {
    try {
      const API_BASE_URL =
        process.env.REACT_APP_API_URL || "http://localhost:5002";

      console.log("🔍 Validating phone number:", phoneNumber);

      const response = await fetch(`${API_BASE_URL}/patient/validate-phone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
        }),
      });

      const data = await response.json();
      console.log("📱 Phone validation response:", data);

      return data;
    } catch (error) {
      console.error("💥 Phone validation error:", error);
      return {
        success: false,
        msg: "Unable to validate phone number. Please try again.",
      };
    }
  };

  // Send OTP via Firebase (ONLY to registered phone numbers)
  const sendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);

      // STEP 1: Validate phone number against database
      console.log(
        "🔒 SECURITY CHECK: Validating phone against patient database..."
      );

      const validationResult = await validatePhoneNumber(phoneNumber);

      if (!validationResult.success) {
        console.log("❌ Phone number not registered:", phoneNumber);

        toast({
          title: "Phone Number Not Registered! 🚫",
          description:
            validationResult.msg ||
            "This phone number is not registered in our system. Please contact admin or register first.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // STEP 2: Phone is registered - proceed with OTP
      console.log(
        "✅ Phone number verified in database:",
        validationResult.patient.name
      );

      // Update patient data with validated information
      setPatientData({
        ...patientData,
        id: validationResult.patient._id,
        name: validationResult.patient.name,
        medicalId: validationResult.patient.medicalId,
        phone: validationResult.patient.phone,
      });

      // STEP 3: Send Firebase OTP to REGISTERED phone only
      console.log(
        "📱 Sending Firebase OTP to registered patient:",
        validationResult.patient.name
      );

      // Simulate Firebase OTP sending (replace with real Firebase call)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "OTP Sent Successfully! 📱",
        description: `Verification code sent to registered number: +91${phoneNumber}
Patient: ${validationResult.patient.name}
Medical ID: ${validationResult.patient.medicalId}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      console.log("✅ OTP sent to validated registered patient");
    } catch (error) {
      console.error("💥 OTP send error:", error);
      toast({
        title: "OTP Error",
        description: "Failed to send OTP. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const verifyOTP = async () => {
    if (otpCode.length === 6) {
      setIsLoading(true);

      // Simulate OTP verification
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock verification (accept any 6-digit code for demo)
      if (otpCode === "123456" || otpCode.length === 6) {
        setAuthStep("success");

        setTimeout(() => {
          onAuthSuccess({
            id: patientData.id,
            name: patientData.name,
            role: "patient",
            medicalId: patientData.medicalId,
            authMethod: "otp-verified",
            confidence: 95,
            phoneVerified: true,
          });
        }, 1500);
      } else {
        toast({
          title: "Invalid OTP",
          description: "Please enter the correct verification code.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }

      setIsLoading(false);
    }
  };

  // Reset authentication flow
  const resetAuth = () => {
    setAuthStep("capture");
    setCapturedImage(null);
    setPatientData(null);
    setConfidenceScore(0);
    setErrorMessage("");
    setOtpCode("");
    setPhoneNumber("");
    stopCamera();
  };

  // Initialize camera on component mount
  React.useEffect(() => {
    if (authStep === "capture") {
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [authStep, startCamera, stopCamera]);

  return (
    <Card
      maxW="md"
      mx="auto"
      bg={cardBg}
      borderColor={borderColor}
      borderWidth={1}
    >
      <CardHeader textAlign="center">
        <VStack spacing={2}>
          <FiShield size={40} color="blue.500" />
          <Heading size="md">Facial Authentication</Heading>
          <Text fontSize="sm" color="gray.600">
            Secure access with facial recognition
          </Text>
        </VStack>
      </CardHeader>

      <CardBody>
        {authStep === "capture" && (
          <VStack spacing={4}>
            <Box position="relative" borderRadius="md" overflow="hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: "100%",
                  maxWidth: "300px",
                  height: "auto",
                  borderRadius: "8px",
                }}
              />
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                border="2px solid"
                borderColor="blue.400"
                borderRadius="50%"
                w="200px"
                h="200px"
                pointerEvents="none"
              />
            </Box>

            <canvas ref={canvasRef} style={{ display: "none" }} />

            <VStack spacing={2}>
              <Button
                colorScheme="blue"
                leftIcon={<FiCamera />}
                onClick={capturePhoto}
                size="lg"
                disabled={isLoading}
              >
                Capture Face
              </Button>

              {/* Demo Login Button for Testing */}
              <Button
                variant="outline"
                colorScheme="green"
                size="md"
                onClick={() => {
                  // Simulate successful facial recognition for demo
                  setAuthStep("processing");
                  setTimeout(() => {
                    onAuthSuccess({
                      id: "P001",
                      name: "John Smith",
                      role: "patient",
                      medicalId: "MED001",
                      authMethod: "facial-demo",
                      confidence: 95,
                    });
                  }, 2000);
                }}
              >
                🎭 Demo Login (Skip Camera)
              </Button>

              <Text fontSize="xs" textAlign="center" color="gray.500">
                Position your face within the circle and click capture, or use
                Demo Login for testing
              </Text>
            </VStack>
          </VStack>
        )}

        {authStep === "processing" && (
          <VStack spacing={4}>
            {capturedImage && (
              <Image
                src={capturedImage}
                alt="Captured face"
                maxW="200px"
                borderRadius="md"
              />
            )}

            <VStack spacing={2}>
              <Spinner size="lg" color="blue.500" />
              <Text fontWeight="medium">Processing facial recognition...</Text>
              <Progress
                value={85}
                colorScheme="blue"
                size="sm"
                w="100%"
                hasStripe
                isAnimated
              />
              <Text fontSize="sm" color="gray.600">
                Analyzing facial features with Face++ AI
              </Text>
            </VStack>
          </VStack>
        )}

        {authStep === "otp" && (
          <VStack spacing={4}>
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <VStack align="start" spacing={1}>
                <AlertTitle fontSize="sm">
                  {patientData?.duplicateDetected ? "Multiple Faces Detected" : "Additional Verification Required"}
                </AlertTitle>
                <AlertDescription fontSize="xs">
                  {patientData?.duplicateDetected 
                    ? `Multiple patients with similar faces found. OTP verification required for security.`
                    : `Face confidence: ${confidenceScore.toFixed(1)}%. Please verify with OTP for secure access.`
                  }
                </AlertDescription>
              </VStack>
            </Alert>

            {patientData?.duplicateDetected && (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <VStack align="start" spacing={1}>
                  <AlertDescription fontSize="xs">
                    Detected {patientData.matchCount || 'multiple'} similar faces in our system. 
                    We're using OTP to ensure you access the correct medical records.
                  </AlertDescription>
                </VStack>
              </Alert>
            )}

            {patientData && (
              <Box p={3} bg="blue.50" borderRadius="md" w="full">
                <Text fontSize="sm" fontWeight="bold" color="blue.700">
                  Verifying Access For:
                </Text>
                <Text fontSize="sm" color="blue.600">
                  Name: {patientData.name}
                </Text>
                <Text fontSize="sm" color="blue.600">
                  Medical ID: {patientData.medicalId}
                </Text>
              </Box>
            )}

            <FormControl>
              <FormLabel fontSize="sm">Registered Phone Number</FormLabel>
              <Input
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                size="sm"
                bg="white"
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                Enter the phone number registered with your medical records
              </Text>
            </FormControl>

            <Button
              colorScheme="blue"
              size="sm"
              onClick={sendOTP}
              disabled={!phoneNumber || isLoading}
              leftIcon={<FiPhone />}
              width="full"
            >
              {isLoading ? "Sending..." : "Send Verification Code"}
            </Button>

            <Divider />

            <FormControl>
              <FormLabel fontSize="sm">Enter 6-Digit Verification Code</FormLabel>
              <HStack justify="center">
                <PinInput
                  value={otpCode}
                  onChange={setOtpCode}
                  onComplete={verifyOTP}
                  size="lg"
                >
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                </PinInput>
              </HStack>
            </FormControl>

            <Text fontSize="xs" color="gray.500" textAlign="center">
              Enter the 6-digit code sent to your registered phone number
            </Text>
            
            <Button
              variant="link"
              size="sm"
              onClick={() => setAuthStep("camera")}
              color="blue.500"
            >
              ← Back to Face Recognition
            </Button>
          </VStack>
        )}

        {authStep === "success" && (
          <VStack spacing={4}>
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              <VStack align="start" spacing={1}>
                <AlertTitle fontSize="sm">
                  Authentication Successful!
                </AlertTitle>
                <AlertDescription fontSize="xs">
                  Welcome back, {patientData?.name}
                </AlertDescription>
              </VStack>
            </Alert>

            <VStack spacing={2}>
              <Text fontSize="sm">
                <strong>Patient ID:</strong> {patientData?.medicalId}
              </Text>
              <Text fontSize="sm">
                <strong>Confidence:</strong> {confidenceScore.toFixed(1)}%
              </Text>
              <Progress
                value={confidenceScore}
                colorScheme="green"
                size="sm"
                w="100%"
              />
            </VStack>

            <Text fontSize="xs" color="gray.500" textAlign="center">
              Redirecting to patient portal...
            </Text>
          </VStack>
        )}

        {authStep === "error" && (
          <VStack spacing={4}>
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <VStack align="start" spacing={1}>
                <AlertTitle fontSize="sm">Authentication Failed</AlertTitle>
                <AlertDescription fontSize="xs">
                  {errorMessage}
                </AlertDescription>
              </VStack>
            </Alert>

            <Button
              colorScheme="blue"
              variant="outline"
              onClick={resetAuth}
              size="sm"
            >
              Try Again
            </Button>
          </VStack>
        )}
      </CardBody>
    </Card>
  );
};

export default FacialAuth;
