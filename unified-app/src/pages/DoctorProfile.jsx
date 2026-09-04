import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Avatar,
  Badge,
  Button,
  Divider,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  Grid,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Switch,
  Select,
} from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import dataService from "../services/DataService";

const DoctorProfile = () => {
  const { currentUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || "Dr. Smith",
    email: currentUser?.email || "doctor@medivault.com",
    phone: "+1 (555) 123-4567",
    address: "123 Medical Center Dr, Healthcare City, HC 12345",
    specialization: "Internal Medicine",
    license: "MD123456789",
    experience: "15 years",
    bio: "Experienced physician specializing in internal medicine with a focus on preventive care and chronic disease management.",
    hospital: "MediVault General Hospital",
    department: "Internal Medicine",
    emergencyContact: "+1 (555) 987-6543",
  });

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser?.id) return;
      try {
        const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";
        const res = await fetch(`${API_URL}/doctor/getall`);
        const data = await res.json();
        const doctor = (data.doctors || []).find((d) => d._id === currentUser.id);
        if (doctor) {
          setFormData({
            name: doctor.Doctor_name || "",
            email: doctor.Email_Address || "",
            phone: doctor.PhoneNo || "",
            address: doctor.Current_Address || "",
            specialization: doctor.Specialization || "",
            license: doctor.Medical_License_Number || "",
            experience: doctor.Years_of_experience || "",
            bio: "",
            hospital: currentUser.hospitalName || "",
            department: doctor.Contract_type || "",
            emergencyContact: "",
          });
        }
      } catch (err) {
        console.error("Failed to load doctor profile:", err);
      }
    };
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  const handleSave = async () => {
    try {
      await dataService.updateDoctor(currentUser.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        specialization: formData.specialization,
        licenseNumber: formData.license,
        experience: formData.experience,
        contractType: formData.department,
      });
      setEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser?.name || "Dr. Smith",
      email: currentUser?.email || "doctor@medivault.com",
      phone: "+1 (555) 123-4567",
      address: "123 Medical Center Dr, Healthcare City, HC 12345",
      specialization: "Internal Medicine",
      license: "MD123456789",
      experience: "15 years",
      bio: "Experienced physician specializing in internal medicine with a focus on preventive care and chronic disease management.",
      hospital: "MediVault General Hospital",
      department: "Internal Medicine",
      emergencyContact: "+1 (555) 987-6543",
    });
    setEditing(false);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = () => {
    onOpen();
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>
            Doctor Profile
          </Heading>
          <Text color="gray.600">
            Manage your professional profile and settings
          </Text>
        </Box>

        {/* Profile Overview Card */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md">Profile Information</Heading>
              <HStack spacing={3}>
                {editing && (
                  <>
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button colorScheme="green" onClick={handleSave}>
                      Save Changes
                    </Button>
                  </>
                )}
                {!editing && (
                  <Button colorScheme="blue" onClick={() => setEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </HStack>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="stretch">
              {/* Avatar and Basic Info */}
              <HStack spacing={6} align="start">
                <Avatar size="2xl" name={formData.name} />
                <VStack align="start" spacing={2} flex={1}>
                  <HStack>
                    <Heading size="md">{formData.name}</Heading>
                    <Badge colorScheme="green" variant="subtle">
                      Doctor
                    </Badge>
                  </HStack>
                  <Text color="gray.600">{formData.email}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {formData.specialization} • {formData.experience} experience
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    License: {formData.license}
                  </Text>
                </VStack>
              </HStack>

              <Divider />

              {/* Form Fields */}
              <Grid
                templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                gap={6}
              >
                <FormControl>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    isReadOnly={!editing}
                    bg={editing ? "white" : "gray.50"}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Email Address</FormLabel>
                  <Input
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    isReadOnly={!editing}
                    bg={editing ? "white" : "gray.50"}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Phone Number</FormLabel>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    isReadOnly={!editing}
                    bg={editing ? "white" : "gray.50"}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Emergency Contact</FormLabel>
                  <Input
                    value={formData.emergencyContact}
                    onChange={(e) =>
                      handleInputChange("emergencyContact", e.target.value)
                    }
                    isReadOnly={!editing}
                    bg={editing ? "white" : "gray.50"}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Specialization</FormLabel>
                  {editing ? (
                    <Select
                      value={formData.specialization}
                      onChange={(e) =>
                        handleInputChange("specialization", e.target.value)
                      }
                    >
                      <option value="Internal Medicine">
                        Internal Medicine
                      </option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Psychiatry">Psychiatry</option>
                      <option value="Radiology">Radiology</option>
                      <option value="Surgery">Surgery</option>
                    </Select>
                  ) : (
                    <Input
                      value={formData.specialization}
                      isReadOnly
                      bg="gray.50"
                    />
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel>Medical License</FormLabel>
                  <Input
                    value={formData.license}
                    onChange={(e) =>
                      handleInputChange("license", e.target.value)
                    }
                    isReadOnly={!editing}
                    bg={editing ? "white" : "gray.50"}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Years of Experience</FormLabel>
                  <Input
                    value={formData.experience}
                    onChange={(e) =>
                      handleInputChange("experience", e.target.value)
                    }
                    isReadOnly={!editing}
                    bg={editing ? "white" : "gray.50"}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Hospital/Clinic</FormLabel>
                  <Input
                    value={formData.hospital}
                    onChange={(e) =>
                      handleInputChange("hospital", e.target.value)
                    }
                    isReadOnly={!editing}
                    bg={editing ? "white" : "gray.50"}
                  />
                </FormControl>
              </Grid>

              <FormControl>
                <FormLabel>Address</FormLabel>
                <Input
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  isReadOnly={!editing}
                  bg={editing ? "white" : "gray.50"}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Professional Bio</FormLabel>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  isReadOnly={!editing}
                  bg={editing ? "white" : "gray.50"}
                  rows={4}
                />
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        {/* Security Settings */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Security & Privacy</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium">Password</Text>
                  <Text fontSize="sm" color="gray.500">
                    Change your account password
                  </Text>
                </VStack>
                <Button
                  colorScheme="blue"
                  variant="outline"
                  onClick={handlePasswordChange}
                >
                  Change Password
                </Button>
              </HStack>

              <Divider />

              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium">Two-Factor Authentication</Text>
                  <Text fontSize="sm" color="gray.500">
                    Add an extra layer of security to your account
                  </Text>
                </VStack>
                <Switch colorScheme="green" />
              </HStack>

              <Divider />

              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium">Email Notifications</Text>
                  <Text fontSize="sm" color="gray.500">
                    Receive notifications about appointments and updates
                  </Text>
                </VStack>
                <Switch colorScheme="green" defaultChecked />
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Professional Information */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Professional Information</Heading>
          </CardHeader>
          <CardBody>
            <Grid
              templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
              gap={6}
            >
              <Box>
                <Text fontWeight="bold" mb={2}>
                  Department
                </Text>
                <Text color="gray.600">{formData.department}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold" mb={2}>
                  Hospital
                </Text>
                <Text color="gray.600">{formData.hospital}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold" mb={2}>
                  Medical License
                </Text>
                <Text color="gray.600">{formData.license}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold" mb={2}>
                  Status
                </Text>
                <Badge colorScheme="green">Active</Badge>
              </Box>
            </Grid>
          </CardBody>
        </Card>
      </VStack>

      {/* Change Password Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change Password</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Current Password</FormLabel>
                <Input type="password" placeholder="Enter current password" />
              </FormControl>
              <FormControl>
                <FormLabel>New Password</FormLabel>
                <Input type="password" placeholder="Enter new password" />
              </FormControl>
              <FormControl>
                <FormLabel>Confirm New Password</FormLabel>
                <Input type="password" placeholder="Confirm new password" />
              </FormControl>
              <HStack spacing={3} w="100%" justify="flex-end">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme="blue" onClick={onClose}>
                  Update Password
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default DoctorProfile;
