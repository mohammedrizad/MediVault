import React, { useState, useRef, useEffect } from "react";
import { usePatients, useDoctors } from "../hooks/usePortalData";
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Avatar,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiUsers,
  FiHeart,
  FiCalendar,
  FiActivity,
  FiCamera,
} from "react-icons/fi";

const ManagePatients = () => {
  // Use the new centralized data hook
  const {
    patients,
    loading,
    error,
    addPatient,
    updatePatient,
    deletePatient,
    refetch,
  } = usePatients();

  const { doctors } = useDoctors();

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    bloodGroup: "",
    condition: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    medicalHistory: "",
    allergies: "",
    status: "Active",
    assignedDoctor: "",
    doctorId: "",
    photo: "", // Add photo field for face authentication
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  // Face capture states
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const toast = useToast();
  const cardBg = useColorModeValue("white", "gray.700");

  const stats = [
    {
      label: "Total Patients",
      value: patients.length,
      color: "blue.500",
      icon: FiUsers,
    },
    {
      label: "Active Patients",
      value: patients.filter((p) => p.status === "Active").length,
      color: "green.500",
      icon: FiHeart,
    },
    {
      label: "Critical Patients",
      value: patients.filter((p) => p.status === "Critical").length,
      color: "red.500",
      icon: FiActivity,
    },
    {
      label: "Discharged",
      value: patients.filter((p) => p.status === "Discharged").length,
      color: "purple.500",
      icon: FiCalendar,
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "doctorId") {
      const doctor = doctors.find((d) => d._id === value);
      setFormData({
        ...formData,
        doctorId: value,
        assignedDoctor: doctor ? doctor.name : "",
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Camera functions for face capture
  const startCamera = async () => {
    try {
      setCameraError(null);
      console.log("Starting camera...");

      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported by this browser");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });
      console.log("Camera stream obtained:", stream);

      streamRef.current = stream;
      setIsCameraOpen(true);

      // Set video source after state update
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current
            .play()
            .then(() => {
              console.log("Video playing");
            })
            .catch((err) => {
              console.error("Video play error:", err);
              setCameraError("Failed to start video playback");
            });
        }
      }, 100);
    } catch (error) {
      console.error("Camera error:", error);
      setCameraError(error.message);
      toast({
        title: "Camera Error",
        description: `Unable to access camera: ${error.message}. Please check permissions.`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      const photoDataUrl = canvas.toDataURL("image/jpeg", 0.8);
      setCapturedPhoto(photoDataUrl);
      setFormData({ ...formData, photo: photoDataUrl });
      stopCamera();

      toast({
        title: "Photo Captured",
        description:
          "Patient photo captured successfully for face authentication.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setFormData({ ...formData, photo: "" });
    startCamera();
  };

  // Face Authentication Test Function
  const testFaceAuthentication = async () => {
    if (!capturedPhoto) {
      toast({
        title: "No Photo",
        description: "Please capture a photo first",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5003/api/auth/face-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          faceImageData: capturedPhoto,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Face Authentication Success!",
          description: `Matched patient: ${result.patientName}`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Face Authentication Failed",
          description: "No matching face found in database",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Face authentication error:", error);
      toast({
        title: "Face Authentication Error",
        description: "Failed to authenticate face",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // OTP Test Function
  const testOTPLogin = async () => {
    if (!formData.phone) {
      toast({
        title: "Phone Required",
        description: "Please enter a phone number first",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Generate OTP
      const otpResponse = await fetch(
        "http://127.0.0.1:5003/api/auth/generate-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: formData.phone,
          }),
        }
      );

      const otpResult = await otpResponse.json();

      if (otpResult.success) {
        const enteredOTP = prompt(
          `OTP sent to ${formData.phone}. Enter the OTP:`
        );

        if (enteredOTP) {
          // Verify OTP
          const verifyResponse = await fetch(
            "http://127.0.0.1:5003/api/auth/verify-otp",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                phone: formData.phone,
                otp: enteredOTP,
              }),
            }
          );

          const verifyResult = await verifyResponse.json();

          if (verifyResult.success) {
            toast({
              title: "OTP Verification Success!",
              description: "OTP verified successfully",
              status: "success",
              duration: 5000,
              isClosable: true,
            });
          } else {
            toast({
              title: "OTP Verification Failed",
              description: "Invalid or expired OTP",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
          }
        }
      } else {
        toast({
          title: "OTP Generation Failed",
          description: "Failed to generate OTP",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("OTP test error:", error);
      toast({
        title: "OTP Test Error",
        description: "Failed to test OTP functionality",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone || !formData.age) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Optional validation for photo
    if (!formData.photo) {
      toast({
        title: "Face Photo Recommended",
        description:
          "Consider adding a face photo for enhanced security login.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }

    try {
      if (isEditing) {
        // Update existing patient using centralized API
        await updatePatient(selectedPatient._id, formData);
      } else {
        // Create new patient using centralized API
        await addPatient(formData);
      }
      handleModalClose();
    } catch (error) {
      console.error("Error saving patient:", error);
      toast({
        title: isEditing ? "Update Failed" : "Creation Failed",
        description: "Failed to save patient. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      age: "",
      gender: "",
      bloodGroup: "",
      condition: "",
      address: "",
      emergencyContact: "",
      emergencyPhone: "",
      medicalHistory: "",
      allergies: "",
      status: "Active",
      assignedDoctor: "",
      doctorId: "",
      photo: "", // Reset photo field
    });
    setSelectedPatient(null);
    setIsEditing(false);
    // Clean up camera resources
    setCapturedPhoto(null);
    setCameraError(null);
    stopCamera();
  };

  // Custom close handler for modal
  const handleModalClose = () => {
    handleReset();
    onClose();
  };

  const handleEdit = (patient) => {
    setSelectedPatient(patient);
    setFormData(patient);
    setIsEditing(true);
    onOpen();
  };

  const handleAdd = () => {
    handleReset();
    onOpen();
  };

  const handleDelete = async () => {
    if (!selectedPatient || !selectedPatient._id) {
      toast({
        title: "Delete Failed",
        description: "No patient selected for deletion",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Check if this is a demo/mock patient (shouldn't exist anymore, but just in case)
    if (selectedPatient._id.toString().startsWith("demo")) {
      toast({
        title: "Cannot Delete Demo Patient",
        description:
          "Demo patients cannot be deleted. Only real patients from the database can be removed.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      onDeleteClose();
      setSelectedPatient(null);
      return;
    }

    try {
      console.log("🗑️ Deleting patient:", selectedPatient._id);

      // Use centralized delete function that syncs across all portals
      const response = await deletePatient(selectedPatient._id);

      console.log("✅ Delete response:", response);

      toast({
        title: "Patient Deleted Successfully",
        description: `${
          selectedPatient.Name || selectedPatient.name
        } has been permanently removed from all portals and database`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      // Close modal and clear selection
      onDeleteClose();
      setSelectedPatient(null);
    } catch (error) {
      console.error("❌ Error deleting patient:", error);

      let errorMessage = "Could not delete patient";

      if (error.message.includes("timeout")) {
        errorMessage = "Request timeout - Server may be busy";
      } else if (error.message.includes("not found")) {
        errorMessage = "Patient not found in database";
      } else if (error.message.includes("server error")) {
        errorMessage = "Server error occurred";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Delete Failed",
        description: "Failed to delete patient. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const openDeleteDialog = (patient) => {
    setSelectedPatient(patient);
    onDeleteOpen();
  };

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Text fontSize="3xl" fontWeight="bold" color="gray.800">
              Manage Patients
            </Text>
            <Text color="gray.600">View and manage patient information</Text>
          </VStack>
          {/* Add button removed as per requirements */}
        </HStack>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
          {stats.map((stat, index) => (
            <Card key={index} bg={cardBg}>
              <CardBody>
                <Stat>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <StatLabel color="gray.600">{stat.label}</StatLabel>
                      <StatNumber color={stat.color} fontSize="2xl">
                        {stat.value}
                      </StatNumber>
                    </VStack>
                    <Box
                      p={3}
                      bg={`${stat.color.split(".")[0]}.100`}
                      borderRadius="full"
                    >
                      <stat.icon color={stat.color} size="24px" />
                    </Box>
                  </HStack>
                </Stat>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {/* Patients Table */}
        <Card bg={cardBg}>
          <CardBody>
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Patient</Th>
                    <Th>Contact</Th>
                    <Th>Age/Gender</Th>
                    <Th>Blood Group</Th>
                    <Th>Condition</Th>
                    <Th>Admission Date</Th>
                    <Th>Doctor</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {patients.map((patient) => (
                    <Tr key={patient.id}>
                      <Td>
                        <HStack spacing={3}>
                          <Avatar src={patient.avatar} size="sm" />
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="medium">{patient.name}</Text>
                            <Text fontSize="sm" color="gray.600">
                              ID:{" "}
                              {patient.MedicalId ||
                                `MED${patient.id?.toString().padStart(3, "0")}`}
                            </Text>
                          </VStack>
                        </HStack>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm">{patient.email}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {patient.phone}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm">{patient.age} years</Text>
                          <Text fontSize="sm" color="gray.600">
                            {patient.gender}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Badge colorScheme="red" variant="solid">
                          {patient.bloodGroup}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme="orange" variant="subtle">
                          {patient.condition}
                        </Badge>
                      </Td>
                      <Td>{patient.admissionDate}</Td>
                      <Td>
                        <Text fontSize="sm" color="gray.600">
                          {patient.doctor}
                        </Text>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={
                            patient.status === "Active"
                              ? "green"
                              : patient.status === "Critical"
                              ? "red"
                              : "purple"
                          }
                        >
                          {patient.status}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="View patient"
                            icon={<FiEye />}
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                          />
                          <IconButton
                            aria-label="Edit patient"
                            icon={<FiEdit />}
                            size="sm"
                            variant="ghost"
                            colorScheme="green"
                            onClick={() => handleEdit(patient)}
                          />
                          <IconButton
                            aria-label="Delete patient"
                            icon={<FiTrash2 />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => openDeleteDialog(patient)}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </CardBody>
        </Card>
      </VStack>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={handleModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? "Edit Patient" : "Add New Patient"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Robert Johnson"
                  />
                </FormControl>
                <FormControl isRequired>
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
                  <FormLabel>Phone</FormLabel>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 234-567-8900"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Age</FormLabel>
                  <Input
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="30"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    placeholder="Select gender"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Blood Group</FormLabel>
                  <Select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    placeholder="Select blood group"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Condition</FormLabel>
                  <Input
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    placeholder="Hypertension"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Assigned Doctor</FormLabel>
                  <Select
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={handleInputChange}
                    placeholder="Select Doctor"
                  >
                    {doctors.map((doctor) => (
                      <option key={doctor._id} value={doctor._id}>
                        {doctor.name} ({doctor.specialization})
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Status</FormLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Critical">Critical</option>
                    <option value="Discharged">Discharged</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Emergency Contact</FormLabel>
                  <Input
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    placeholder="Contact person name"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Emergency Phone</FormLabel>
                  <Input
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleInputChange}
                    placeholder="+1 234-567-8900"
                  />
                </FormControl>
              </SimpleGrid>
              <FormControl>
                <FormLabel>Address</FormLabel>
                <Textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter patient's address"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Medical History</FormLabel>
                <Textarea
                  name="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={handleInputChange}
                  placeholder="Previous medical conditions, surgeries, etc."
                />
              </FormControl>
              <FormControl>
                <FormLabel>Allergies</FormLabel>
                <Textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  placeholder="Food allergies, drug allergies, etc."
                />
              </FormControl>

              {/* Face Authentication Section */}
              <Box border="1px" borderColor="gray.200" borderRadius="md" p={4}>
                <FormLabel mb={3}>
                  <HStack>
                    <FiCamera />
                    <Text>Face Authentication Setup</Text>
                  </HStack>
                </FormLabel>

                {/* Debug Info */}
                {process.env.NODE_ENV === "development" && (
                  <Text fontSize="xs" color="gray.500" mb={2}>
                    Debug: Camera Open: {isCameraOpen ? "Yes" : "No"} | Photo:{" "}
                    {capturedPhoto ? "Captured" : "None"} | Error:{" "}
                    {cameraError || "None"}
                  </Text>
                )}

                {!capturedPhoto && !isCameraOpen && (
                  <VStack spacing={3}>
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      Capture patient's photo for secure face authentication
                      login
                    </Text>
                    <Button
                      leftIcon={<FiCamera />}
                      colorScheme="blue"
                      variant="outline"
                      onClick={startCamera}
                    >
                      Start Camera
                    </Button>
                  </VStack>
                )}

                {isCameraOpen && (
                  <VStack spacing={3}>
                    <Text fontSize="sm" color="blue.600" textAlign="center">
                      Position your face in the camera view and click capture
                    </Text>
                    <Box
                      position="relative"
                      borderRadius="md"
                      overflow="hidden"
                      border="2px"
                      borderColor="blue.200"
                    >
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{
                          width: "320px",
                          height: "240px",
                          objectFit: "cover",
                          backgroundColor: "#f0f0f0",
                        }}
                        onLoadedData={() => console.log("Video loaded")}
                        onError={(e) => console.error("Video error:", e)}
                      />
                    </Box>
                    <HStack>
                      <Button colorScheme="green" onClick={capturePhoto}>
                        Capture Photo
                      </Button>
                      <Button variant="outline" onClick={stopCamera}>
                        Cancel
                      </Button>
                    </HStack>
                  </VStack>
                )}

                {capturedPhoto && (
                  <VStack spacing={3}>
                    <Box borderRadius="md" overflow="hidden">
                      <img
                        src={capturedPhoto}
                        alt="Captured face for authentication"
                        style={{
                          width: "200px",
                          height: "150px",
                          objectFit: "cover",
                        }}
                      />
                    </Box>
                    <Text fontSize="sm" color="green.600">
                      ✓ Photo captured successfully
                    </Text>
                    <Button size="sm" variant="outline" onClick={retakePhoto}>
                      Retake Photo
                    </Button>
                  </VStack>
                )}

                {/* Hidden canvas for photo capture */}
                <canvas ref={canvasRef} style={{ display: "none" }} />
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={loading}
              loadingText={isEditing ? "Updating..." : "Creating..."}
            >
              {isEditing ? "Update" : "Add"} Patient
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Patient
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete {selectedPatient?.name}? This
              action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={onDeleteClose}>Cancel</Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
};

export default ManagePatients;
