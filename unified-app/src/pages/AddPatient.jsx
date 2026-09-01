import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Input,
  Select,
  FormControl,
  FormLabel,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  useToast,
  Alert,
  AlertIcon,
  Badge,
  Image,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FiCamera,
  FiRefreshCw,
  FiUserPlus,
  FiCheck,
  FiX,
} from "react-icons/fi";

const AddPatient = () => {
  const toast = useToast();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedBase64, setCapturedBase64] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredPatient, setRegisteredPatient] = useState(null);

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    age: "",
    gender: "Male",
    address: "",
    aadhar: "",
    dob: "",
    bloodGroup: "",
    emergencyContact: "",
    emergencyPhone: "",
    allergies: "",
    conditions: "",
  });

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5002";

  // Camera functions
  const startCamera = useCallback(async () => {
    try {
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
      setCameraActive(true);
      setVideoReady(false);
      setCapturedImage(null);
      setCapturedBase64("");
    } catch (err) {
      toast({
        title: "Camera Error",
        description:
          "Could not access camera. Please allow camera permissions.",
        status: "error",
        duration: 5000,
      });
    }
  }, [toast]);

  // Assign stream to video element AFTER it renders
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.onloadeddata = () => {
        setVideoReady(true);
      };
      videoRef.current.play().catch(() => {});
    }
  }, [cameraActive]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setVideoReady(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      toast({
        title: "Camera not ready",
        description: "Please wait for camera to load.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");

    // Use video dimensions, fallback to 640x480
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;

    if (w === 0 || h === 0) {
      toast({
        title: "Camera not ready",
        description: "Please wait a moment and try again.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(video, 0, 0, w, h);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    const base64 = dataUrl.split(",")[1];

    setCapturedImage(dataUrl);
    setCapturedBase64(base64);
    stopCamera();

    toast({
      title: "Photo Captured",
      description:
        "Face photo captured successfully. This will be used for face login.",
      status: "success",
      duration: 3000,
    });
  }, [stopCamera, toast]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    setCapturedBase64("");
    startCamera();
  }, [startCamera]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstname.trim()) {
      toast({
        title: "First name is required",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    if (!formData.phone.trim()) {
      toast({
        title: "Phone number is required",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    if (!capturedBase64) {
      toast({
        title: "Face Photo Required",
        description:
          "Please capture a face photo for AWS Rekognition face login.",
        status: "warning",
        duration: 5000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const fullName = `${formData.firstname} ${formData.lastname}`.trim();

      const response = await fetch(`${API_BASE_URL}/patient/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname: formData.firstname,
          lastname: formData.lastname,
          name: fullName,
          email: formData.email,
          phone: formData.phone,
          Mobile_no: formData.phone,
          age: formData.age,
          Age: formData.age,
          gender: formData.gender,
          Gender: formData.gender,
          faceImage: capturedBase64,
          photo: capturedBase64,
          Address: formData.address,
          address: formData.address,
          Aadhar: formData.aadhar,
          DOB: formData.dob,
          bloodGroup: formData.bloodGroup,
          BloodGroup: formData.bloodGroup,
          emergencyContact: formData.emergencyContact,
          EmergencyContactName: formData.emergencyContact,
          emergencyPhone: formData.emergencyPhone,
          EmergencyContactNumber: formData.emergencyPhone,
          allergies: formData.allergies,
          Allergies: formData.allergies,
          condition: formData.conditions,
          ChronicConditions: formData.conditions,
        }),
      });

      const data = await response.json();

      if (data.msg === "Registration Successfully Done" || data.patient) {
        setRegistrationSuccess(true);
        setRegisteredPatient(data.patient);

        toast({
          title: "Patient Registered Successfully!",
          description: `${data.patient?.name || fullName} — Medical ID: ${data.patient?.medicalId || "Generated"}. Face registered in AWS Rekognition for face login.`,
          status: "success",
          duration: 8000,
        });
      } else {
        toast({
          title: "Registration Failed",
          description: data.msg || "Something went wrong",
          status: "error",
          duration: 5000,
        });
      }
    } catch (err) {
      console.error("Registration error:", err);
      toast({
        title: "Network Error",
        description: "Could not connect to server. Is the backend running?",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      age: "",
      gender: "Male",
      address: "",
      aadhar: "",
      dob: "",
      bloodGroup: "",
      emergencyContact: "",
      emergencyPhone: "",
      allergies: "",
      conditions: "",
    });
    setCapturedImage(null);
    setCapturedBase64("");
    setRegistrationSuccess(false);
    setRegisteredPatient(null);
  };

  if (registrationSuccess) {
    return (
      <Box maxW="600px" mx="auto" mt={10}>
        <Card bg={bgColor} shadow="xl" borderRadius="xl">
          <CardBody>
            <VStack spacing={6} align="center" py={6}>
              <Box p={4} bg="green.100" borderRadius="full">
                <FiCheck size={48} color="green" />
              </Box>
              <Heading size="lg" color="green.600">
                Patient Registered!
              </Heading>
              <VStack spacing={2}>
                <Text fontSize="lg" fontWeight="bold">
                  {registeredPatient?.name}
                </Text>
                <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
                  Medical ID: {registeredPatient?.medicalId}
                </Badge>
                <Text color="gray.600">
                  Email: {registeredPatient?.email || "N/A"}
                </Text>
                <Text color="gray.600">
                  Phone: {registeredPatient?.phone || "N/A"}
                </Text>
              </VStack>

              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Text fontSize="sm">
                  Face has been registered with AWS Rekognition. This patient
                  can now log in using <strong>Face Authentication</strong> on
                  the Patient Login page.
                </Text>
              </Alert>

              <HStack spacing={4}>
                <Button
                  colorScheme="blue"
                  onClick={resetForm}
                  leftIcon={<FiUserPlus />}
                >
                  Register Another Patient
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    );
  }

  return (
    <Box maxW="900px" mx="auto">
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading
            size="lg"
            bgGradient="linear(to-r, blue.500, purple.600)"
            bgClip="text"
          >
            Add New Patient
          </Heading>
          <Badge colorScheme="purple" fontSize="sm" px={3} py={1}>
            AWS Rekognition Face Registration
          </Badge>
        </HStack>

        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            {/* Face Capture Section */}
            <Card
              bg={bgColor}
              shadow="md"
              borderRadius="xl"
              border="2px"
              borderColor="blue.200"
            >
              <CardHeader pb={2}>
                <Heading size="md" color="blue.600">
                  📸 Face Registration (Required)
                </Heading>
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Capture patient's face photo for AWS Rekognition face login
                </Text>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="center">
                  {!cameraActive && !capturedImage && (
                    <VStack spacing={3}>
                      <Box
                        w="320px"
                        h="240px"
                        bg="gray.100"
                        borderRadius="lg"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        border="2px dashed"
                        borderColor="gray.300"
                      >
                        <VStack>
                          <FiCamera size={48} color="gray" />
                          <Text color="gray.500">No photo captured yet</Text>
                        </VStack>
                      </Box>
                      <Button
                        colorScheme="blue"
                        leftIcon={<FiCamera />}
                        onClick={startCamera}
                        size="lg"
                      >
                        Open Camera
                      </Button>
                    </VStack>
                  )}

                  {cameraActive && (
                    <VStack spacing={3}>
                      <Box
                        borderRadius="lg"
                        overflow="hidden"
                        border="3px solid"
                        borderColor="blue.400"
                      >
                        <video
                          ref={videoRef}
                          width={320}
                          height={240}
                          autoPlay
                          playsInline
                          muted
                          style={{
                            display: "block",
                            width: "320px",
                            height: "240px",
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                      <canvas ref={canvasRef} style={{ display: "none" }} />
                      <HStack spacing={3}>
                        <Button
                          colorScheme="green"
                          leftIcon={<FiCamera />}
                          onClick={capturePhoto}
                          size="lg"
                          isDisabled={!videoReady}
                        >
                          {videoReady ? "Capture Photo" : "Loading Camera..."}
                        </Button>
                        <Button
                          variant="outline"
                          leftIcon={<FiX />}
                          onClick={stopCamera}
                        >
                          Cancel
                        </Button>
                      </HStack>
                    </VStack>
                  )}

                  {capturedImage && (
                    <VStack spacing={3}>
                      <Box
                        borderRadius="lg"
                        overflow="hidden"
                        border="3px solid"
                        borderColor="green.400"
                      >
                        <Image
                          src={capturedImage}
                          w="320px"
                          h="240px"
                          objectFit="cover"
                        />
                      </Box>
                      <HStack spacing={3}>
                        <Badge colorScheme="green" fontSize="sm" px={3} py={1}>
                          ✅ Photo Captured
                        </Badge>
                        <Button
                          variant="outline"
                          leftIcon={<FiRefreshCw />}
                          onClick={retakePhoto}
                          size="sm"
                        >
                          Retake
                        </Button>
                      </HStack>
                    </VStack>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {/* Personal Details */}
            <Card bg={bgColor} shadow="md" borderRadius="xl">
              <CardHeader pb={2}>
                <Heading size="md">Personal Details</Heading>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>First Name</FormLabel>
                    <Input
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleInputChange}
                      placeholder="Enter first name"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Last Name</FormLabel>
                    <Input
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleInputChange}
                      placeholder="Enter last name"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="patient@email.com"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Phone Number</FormLabel>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91XXXXXXXXXX"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Date of Birth</FormLabel>
                    <Input
                      name="dob"
                      type="date"
                      value={formData.dob}
                      onChange={handleInputChange}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Age</FormLabel>
                    <Input
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="Age"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Gender</FormLabel>
                    <Select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Blood Group</FormLabel>
                    <Select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                    >
                      <option value="">Select</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Aadhar Number</FormLabel>
                    <Input
                      name="aadhar"
                      value={formData.aadhar}
                      onChange={handleInputChange}
                      placeholder="12-digit Aadhar"
                      maxLength={12}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Address</FormLabel>
                    <Input
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Full address"
                    />
                  </FormControl>
                </SimpleGrid>
              </CardBody>
            </Card>

            {/* Medical & Emergency Info */}
            <Card bg={bgColor} shadow="md" borderRadius="xl">
              <CardHeader pb={2}>
                <Heading size="md">Medical & Emergency Info</Heading>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Emergency Contact Name</FormLabel>
                    <Input
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                      placeholder="Emergency contact"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Emergency Contact Phone</FormLabel>
                    <Input
                      name="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={handleInputChange}
                      placeholder="+91XXXXXXXXXX"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Allergies</FormLabel>
                    <Input
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleInputChange}
                      placeholder="e.g. Penicillin, Peanuts"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Chronic Conditions</FormLabel>
                    <Input
                      name="conditions"
                      value={formData.conditions}
                      onChange={handleInputChange}
                      placeholder="e.g. Diabetes, Hypertension"
                    />
                  </FormControl>
                </SimpleGrid>
              </CardBody>
            </Card>

            <Divider />

            {/* Submit */}
            <HStack justify="flex-end" spacing={4}>
              <Button variant="outline" onClick={resetForm}>
                Clear Form
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                leftIcon={<FiUserPlus />}
                isLoading={isLoading}
                loadingText="Registering Patient & Face..."
              >
                Register Patient with Face
              </Button>
            </HStack>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default AddPatient;
