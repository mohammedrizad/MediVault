import React, { useRef, useEffect, useState } from "react";
import { Box, Button, Center, Text, useToast } from "@chakra-ui/react";
import {
  stopAllCameraStreams,
  createCameraStream,
} from "../../utils/cameraUtils";

const FaceLogin = ({ onSuccess }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const toast = useToast();

  const API_BASE =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5002";

  const stopCamera = () => {
    if (streamRef.current) {
      stopAllCameraStreams(streamRef.current);
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await createCameraStream();
        if (stream) {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setCameraActive(true);
          }
        } else {
          setError("Camera access denied or not available.");
        }
      } catch (err) {
        setError("Camera access denied or not available.");
      }
    };
    startCamera();
    return () => stopCamera();
  }, []);

  // Capture a frame from the live webcam as base64
  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.8).split(",")[1]; // base64 only
  };

  // Real face recognition via live webcam → backend → AWS Rekognition
  const handleFaceLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const base64Image = captureFrame();
      if (!base64Image) {
        throw new Error("Failed to capture image from webcam");
      }

      const response = await fetch(`${API_BASE}/patient/loginforpatient`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });

      const data = await response.json();

      if (data.msg === "Faces match!" && data.result) {
        toast({
          title: `Welcome back, ${data.result.Name}!`,
          description: `Confidence: ${data.confidence || 95}%`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        const patientData = {
          id: data.result._id,
          name: data.result.Name,
          phone: data.result.Mobile_no,
          email: data.result.Email,
          gender: data.result.Gender,
          aadhar: data.result.Aadhar,
          dob: data.result.DOB,
          medicalId: data.result.MedicalId,
          role: "patient",
          authMethod: "face_recognition_webcam",
          token: data.token,
          photo: data.result.Photo,
        };

        setTimeout(() => onSuccess(patientData), 500);
      } else {
        setError(
          data.msg || "Face not recognized. Please try again or use OTP login.",
        );
        toast({
          title: "Face not recognized",
          description: "Try positioning your face clearly in the camera",
          status: "warning",
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error("Face login error:", err);
      setError("Face recognition failed. Please try again or use OTP login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center flexDirection="column" gap={4}>
      {error && (
        <Text color="red.500" fontSize="sm" textAlign="center">
          {error}
        </Text>
      )}

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {cameraActive && (
        <Box
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          overflow="hidden"
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: "100%", borderRadius: "md" }}
          />
        </Box>
      )}

      {/* Show loading spinner when camera is not yet active */}
      {!cameraActive && !error && (
        <Box
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          p={8}
          textAlign="center"
          bg="gray.50"
        >
          <Text color="gray.600">Starting camera...</Text>
        </Box>
      )}

      <Button
        colorScheme="blue"
        onClick={handleFaceLogin}
        isLoading={loading}
        loadingText="Recognizing..."
        w="full"
        isDisabled={!cameraActive}
      >
        Login with Face
      </Button>
    </Center>
  );
};

export default FaceLogin;
