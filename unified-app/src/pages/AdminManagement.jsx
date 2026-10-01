import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  VStack,
  useDisclosure,
  useToast,
  Badge,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  Image,
} from "@chakra-ui/react";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiUsers,
  FiUserCheck,
  FiHeart,
  FiCamera,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const AdminManagement = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeTab, setActiveTab] = useState("doctor");
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [entities, setEntities] = useState({
    doctors: [],
    nurses: [],
    patients: [],
    scanCenters: [],
  });
  const toast = useToast();
  const { currentUser } = useAuth();

  // Camera refs and state
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  // Load entities on component mount
  useEffect(() => {
    fetchAllEntities();
  }, []);

  // Camera functions
  const startCamera = async () => {
    try {
      setCameraError(null);
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

      streamRef.current = stream;
      setIsCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((err) => {
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
        description: error.message,
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
        status: "success",
        duration: 2000,
      });
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setFormData({ ...formData, photo: "" });
    startCamera();
  };

  // Clean up camera on unmount or modal close
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleCloseModal = () => {
    stopCamera();
    setCapturedPhoto(null);
    setFormData({});
    onClose();
  };

  const fetchAllEntities = async () => {
    try {
      setLoading(true);
      const [doctorsRes, nursesRes, patientsRes, scanCentersRes] =
        await Promise.all([
          fetch("http://localhost:5002/doctor/getall"),
          fetch("http://localhost:5002/nurse/getall"),
          fetch("http://localhost:5002/patient/getall"),
          fetch("http://localhost:5002/scan/getall"),
        ]);

      const doctorsData = await doctorsRes.json();
      const nursesData = await nursesRes.json();
      const patientsData = await patientsRes.json();
      const scanCentersData = await scanCentersRes.json();

      setEntities({
        doctors: doctorsData.doctors || [],
        nurses: nursesData.nurses || [],
        patients: patientsData.patients || [],
        scanCenters: scanCentersData.result || [],
      });
    } catch (error) {
      console.error("Error fetching entities:", error);
      toast({
        title: "Error fetching data",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Duplicate Check
      let isDuplicate = false;
      let duplicateMessage = "";

      if (activeTab === "doctor") {
        isDuplicate = entities.doctors.some(
          (d) =>
            d.Email_Address === formData.Email_Address ||
            d.Medical_License_Number === formData.Medical_License_Number
        );
        duplicateMessage = "Doctor with this Email or License already exists.";
      } else if (activeTab === "nurse") {
        isDuplicate = entities.nurses.some(
          (n) =>
            n.Email_Address === formData.Email_Address ||
            n.Medical_License_Number === formData.Medical_License_Number
        );
        duplicateMessage = "Nurse with this Email or License already exists.";
      } else if (activeTab === "patient") {
        isDuplicate = entities.patients.some(
          (p) =>
            (p.Email || p.email) === formData.email ||
            (p.Mobile_no || p.phone) === formData.phone
        );
        duplicateMessage = "Patient with this Email or Phone already exists.";
      } else if (activeTab === "scanCenter") {
        isDuplicate = entities.scanCenters.some(
          (s) =>
            s.Email_Address === formData.Email_Address ||
            s.username === formData.name
        );
        duplicateMessage =
          "Scan Center with this Email or Name already exists.";
      }

      if (isDuplicate) {
        toast({
          title: "Duplicate Entry",
          description: duplicateMessage,
          status: "warning",
          duration: 4000,
          isClosable: true,
        });
        setLoading(false);
        return;
      }

      let endpoint = "";
      let payload = { ...formData, Admin: currentUser?.id };

      switch (activeTab) {
        case "doctor":
          endpoint = "/admin/postbyadmin";
          break;
        case "nurse":
          endpoint = "/admin/postbyadminfornurse";
          break;
        case "patient":
          endpoint = "/patient/register";
          // Map frontend fields to backend expected format for Patient
          payload = {
            Name: `${formData.firstname} ${formData.lastname}`,
            Email: formData.email,
            Mobile_no: formData.phone,
            Age: formData.age,
            Gender: formData.gender,
            BloodGroup: formData.bloodGroup,
            Address: formData.Address,
            EmergencyContactName: formData.emergencyContact,
            EmergencyContactNumber: formData.emergencyPhone,
            ChronicConditions: formData.chronicConditions,
            Allergies: formData.allergies,
            Aadhar: formData.Aadhar,
            Password: "password123", // Default password
          };
          break;
        case "scanCenter":
          endpoint = "/admin/postforscancenter";
          break;
        default:
          throw new Error("Invalid tab");
      }

      const authToken = localStorage.getItem("authToken");
      const response = await fetch(`http://localhost:5002${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (
        data.msg === "Details are saved successfully" ||
        data.msg === "Registration Successfully Done"
      ) {
        toast({
          title: `${
            activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
          } Added Successfully!`,
          description: `New ${activeTab} has been added to the system.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onClose();
        setFormData({});
        fetchAllEntities();
      } else {
        throw new Error(data.msg || "Failed to add entity");
      }
    } catch (error) {
      console.error("Error adding entity:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add entity. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) {
      return;
    }

    try {
      let endpoint = "";
      let payload = {};

      switch (type) {
        case "doctor":
          endpoint = "/admin/deletedetail";
          payload = { Medical_License_Number: id };
          break;
        case "nurse":
          endpoint = "/admin/deletedetailnurse";
          payload = { Medical_License_Number: id };
          break;
        case "scanCenter":
          endpoint = "/admin/deletescancenter";
          payload = { Medical_License_Number: id };
          break;
        default:
          throw new Error("Invalid type");
      }

      const authToken = localStorage.getItem("authToken");
      const response = await fetch(`http://localhost:5002${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.msg === "Delete Successfully") {
        toast({
          title: "Deleted Successfully",
          description: `${
            type.charAt(0).toUpperCase() + type.slice(1)
          } has been removed from the system.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchAllEntities();
      } else {
        throw new Error(data.msg || "Failed to delete entity");
      }
    } catch (error) {
      console.error("Error deleting entity:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete entity.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const renderForm = () => {
    const commonFields = (
      <>
        <FormControl isRequired>
          <FormLabel>Name</FormLabel>
          <Input
            value={formData.Doctor_name || ""}
            onChange={(e) =>
              setFormData({ ...formData, Doctor_name: e.target.value })
            }
            placeholder="Enter full name"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Email Address</FormLabel>
          <Input
            type="email"
            value={formData.Email_Address || ""}
            onChange={(e) =>
              setFormData({ ...formData, Email_Address: e.target.value })
            }
            placeholder="Enter email address"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Phone Number</FormLabel>
          <Input
            value={formData.phoneno || ""}
            onChange={(e) =>
              setFormData({ ...formData, phoneno: e.target.value })
            }
            placeholder="Enter phone number"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Gender</FormLabel>
          <Select
            value={formData.gender || ""}
            onChange={(e) =>
              setFormData({ ...formData, gender: e.target.value })
            }
            placeholder="Select gender"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Date of Birth</FormLabel>
          <Input
            type="date"
            value={formData.DOB || ""}
            onChange={(e) => setFormData({ ...formData, DOB: e.target.value })}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Address</FormLabel>
          <Textarea
            value={formData.Current_Address || ""}
            onChange={(e) =>
              setFormData({ ...formData, Current_Address: e.target.value })
            }
            placeholder="Enter complete address"
          />
        </FormControl>
      </>
    );

    if (activeTab === "patient") {
      return (
        <VStack spacing={4}>
          <HStack width="100%" spacing={4}>
            <FormControl isRequired>
              <FormLabel>First Name</FormLabel>
              <Input
                value={formData.firstname || ""}
                onChange={(e) =>
                  setFormData({ ...formData, firstname: e.target.value })
                }
                placeholder="Enter first name"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Last Name</FormLabel>
              <Input
                value={formData.lastname || ""}
                onChange={(e) =>
                  setFormData({ ...formData, lastname: e.target.value })
                }
                placeholder="Enter last name"
              />
            </FormControl>
          </HStack>

          <FormControl isRequired>
            <FormLabel>Email Address</FormLabel>
            <Input
              type="email"
              value={formData.email || ""}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Enter email address"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Phone Number</FormLabel>
            <Input
              value={formData.phone || ""}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="Enter phone number"
            />
          </FormControl>

          <HStack width="100%" spacing={4}>
            <FormControl>
              <FormLabel>Age</FormLabel>
              <Input
                type="number"
                value={formData.age || ""}
                onChange={(e) =>
                  setFormData({ ...formData, age: e.target.value })
                }
                placeholder="Enter age"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Gender</FormLabel>
              <Select
                value={formData.gender || ""}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                placeholder="Select gender"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
            </FormControl>
          </HStack>

          <FormControl>
            <FormLabel>Blood Group</FormLabel>
            <Select
              value={formData.bloodGroup || ""}
              onChange={(e) =>
                setFormData({ ...formData, bloodGroup: e.target.value })
              }
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
            <FormLabel>Address</FormLabel>
            <Textarea
              value={formData.Address || ""}
              onChange={(e) =>
                setFormData({ ...formData, Address: e.target.value })
              }
              placeholder="Enter complete address"
            />
          </FormControl>

          <HStack width="100%" spacing={4}>
            <FormControl>
              <FormLabel>Emergency Contact Name</FormLabel>
              <Input
                value={formData.emergencyContact || ""}
                onChange={(e) =>
                  setFormData({ ...formData, emergencyContact: e.target.value })
                }
                placeholder="Contact person"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Emergency Phone</FormLabel>
              <Input
                value={formData.emergencyPhone || ""}
                onChange={(e) =>
                  setFormData({ ...formData, emergencyPhone: e.target.value })
                }
                placeholder="Emergency number"
              />
            </FormControl>
          </HStack>

          <FormControl>
            <FormLabel>Chronic Conditions</FormLabel>
            <Textarea
              value={formData.chronicConditions || ""}
              onChange={(e) =>
                setFormData({ ...formData, chronicConditions: e.target.value })
              }
              placeholder="List any chronic conditions"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Allergies</FormLabel>
            <Textarea
              value={formData.allergies || ""}
              onChange={(e) =>
                setFormData({ ...formData, allergies: e.target.value })
              }
              placeholder="List any allergies"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Aadhar Number</FormLabel>
            <Input
              value={formData.Aadhar || ""}
              onChange={(e) =>
                setFormData({ ...formData, Aadhar: e.target.value })
              }
              placeholder="Enter Aadhar number"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Face Registration (Required for Login)</FormLabel>
            <Box
              borderWidth="1px"
              borderRadius="lg"
              p={4}
              textAlign="center"
              bg="gray.50"
            >
              {!isCameraOpen && !capturedPhoto && (
                <VStack spacing={3}>
                  <FiCamera size={40} color="gray" />
                  <Text fontSize="sm" color="gray.500">
                    Patient face photo is required for authentication
                  </Text>
                  <Button
                    leftIcon={<FiCamera />}
                    colorScheme="blue"
                    onClick={startCamera}
                  >
                    Start Camera
                  </Button>
                </VStack>
              )}

              {isCameraOpen && (
                <VStack spacing={3}>
                  <Box
                    position="relative"
                    width="100%"
                    maxW="320px"
                    mx="auto"
                    overflow="hidden"
                    borderRadius="md"
                  >
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      style={{ width: "100%", borderRadius: "8px" }}
                    />
                  </Box>
                  <HStack>
                    <Button colorScheme="red" onClick={stopCamera} size="sm">
                      Cancel
                    </Button>
                    <Button
                      colorScheme="green"
                      onClick={capturePhoto}
                      size="sm"
                    >
                      Capture
                    </Button>
                  </HStack>
                </VStack>
              )}

              {capturedPhoto && (
                <VStack spacing={3}>
                  <Image
                    src={capturedPhoto}
                    alt="Captured Face"
                    boxSize="150px"
                    objectFit="cover"
                    borderRadius="full"
                    border="2px solid green"
                  />
                  <Text color="green.500" fontWeight="bold">
                    Photo Captured Successfully
                  </Text>
                  <Button size="sm" onClick={retakePhoto} variant="outline">
                    Retake Photo
                  </Button>
                </VStack>
              )}
              <canvas ref={canvasRef} style={{ display: "none" }} />
            </Box>
          </FormControl>
        </VStack>
      );
    }

    return (
      <VStack spacing={4}>
        {commonFields}

        <FormControl isRequired>
          <FormLabel>Qualifications</FormLabel>
          <Input
            value={formData.Qualifications || ""}
            onChange={(e) =>
              setFormData({ ...formData, Qualifications: e.target.value })
            }
            placeholder="Enter qualifications (e.g., MBBS, MD)"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Specialization</FormLabel>
          <Input
            value={formData.Specialization || ""}
            onChange={(e) =>
              setFormData({ ...formData, Specialization: e.target.value })
            }
            placeholder="Enter specialization"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Medical License Number</FormLabel>
          <Input
            value={formData.Medical_License_Number || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                Medical_License_Number: e.target.value,
              })
            }
            placeholder="Enter medical license number"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Medical Council Registration Number</FormLabel>
          <Input
            value={formData.Medical_Council_Registration_Number || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                Medical_Council_Registration_Number: e.target.value,
              })
            }
            placeholder="Enter council registration number"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Years of Experience</FormLabel>
          <Input
            type="number"
            value={formData.Years_of_experience || ""}
            onChange={(e) =>
              setFormData({ ...formData, Years_of_experience: e.target.value })
            }
            placeholder="Enter years of experience"
          />
        </FormControl>

        {activeTab === "doctor" && (
          <FormControl>
            <FormLabel>Contract Type</FormLabel>
            <Select
              value={formData.Contract_type || ""}
              onChange={(e) =>
                setFormData({ ...formData, Contract_type: e.target.value })
              }
              placeholder="Select contract type"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Consultant">Consultant</option>
            </Select>
          </FormControl>
        )}
      </VStack>
    );
  };

  const getTabIcon = (tab) => {
    switch (tab) {
      case "doctor":
        return FiHeart;
      case "nurse":
        return FiUserCheck;
      case "patient":
        return FiUsers;
      case "scanCenter":
        return FiCamera;
      default:
        return FiUsers;
    }
  };

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="2xl" fontWeight="bold">
            Admin Management
          </Text>
          <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onOpen}>
            Add New
          </Button>
        </HStack>

        <Alert status="info">
          <AlertIcon />
          Manage doctors, nurses, patients, and scan centers from this
          centralized dashboard.
        </Alert>

        <Tabs
          onChange={(index) => {
            const tabs = ["doctor", "nurse", "patient", "scanCenter"];
            setActiveTab(tabs[index]);
          }}
        >
          <TabList>
            <Tab>
              <HStack>
                <FiHeart />
                <Text>Doctors</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <FiUserCheck />
                <Text>Nurses</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <FiUsers />
                <Text>Patients</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <FiCamera />
                <Text>Scan Centers</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {["doctor", "nurse", "patient", "scanCenter"].map((type) => {
              const data = entities[type + "s"] || [];
              return (
                <TabPanel key={type}>
                  <Card>
                    <CardHeader>
                      <HStack justify="space-between">
                        <Text fontSize="lg" fontWeight="semibold">
                          {type.charAt(0).toUpperCase() + type.slice(1)}s List
                        </Text>
                        <Button
                          leftIcon={<FiPlus />}
                          colorScheme="blue"
                          size="sm"
                          onClick={() => {
                            setActiveTab(type);
                            onOpen();
                          }}
                        >
                          Add {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Button>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Name</Th>
                            <Th>Email</Th>
                            <Th>Details</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {data.length > 0 ? (
                            data.map((item, index) => (
                              <Tr key={item._id || index}>
                                <Td>
                                  {item.Doctor_name ||
                                    item.username ||
                                    item.Name ||
                                    `${item.firstname || ""} ${
                                      item.lastname || ""
                                    }`}
                                </Td>
                                <Td>
                                  {item.Email_Address ||
                                    item.Email ||
                                    item.email}
                                </Td>
                                <Td>
                                  {item.Specialization ||
                                    item.Mobile_no ||
                                    item.phone ||
                                    item.Current_Address ||
                                    "N/A"}
                                </Td>
                                <Td>
                                  <HStack spacing={2}>
                                    <IconButton
                                      icon={<FiTrash2 />}
                                      colorScheme="red"
                                      size="sm"
                                      onClick={() =>
                                        handleDelete(item._id, type)
                                      }
                                    />
                                  </HStack>
                                </Td>
                              </Tr>
                            ))
                          ) : (
                            <Tr>
                              <Td colSpan={4}>
                                <Text textAlign="center" color="gray.500">
                                  No {type}s found.
                                </Text>
                              </Td>
                            </Tr>
                          )}
                        </Tbody>
                      </Table>
                    </CardBody>
                  </Card>
                </TabPanel>
              );
            })}
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={handleCloseModal} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Add New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleFormSubmit}>
            <ModalBody>{renderForm()}</ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                type="submit"
                isLoading={loading}
                loadingText="Adding..."
              >
                Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default AdminManagement;
