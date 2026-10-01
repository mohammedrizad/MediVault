import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Button,
  useColorModeValue,
  SimpleGrid,
  Alert,
  AlertIcon,
  Icon,
  useToast,
  Flex,
  Spacer,
  Avatar,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Switch,
  Divider,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@chakra-ui/react";
import {
  FiUser,
  FiEdit,
  FiSave,
  FiCamera,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCalendar,
  FiShield,
  FiHeart,
} from "react-icons/fi";

const PatientProfile = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({});
  const [editedProfile, setEditedProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [patientMongoId, setPatientMongoId] = useState(null);

  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";

  useEffect(() => {
    const savedPatientData = localStorage.getItem("patientData");
    let patientData = {};
    if (savedPatientData) {
      try {
        patientData = JSON.parse(savedPatientData);
      } catch (error) {
        console.error("Error parsing patient data:", error);
      }
    }

    const medicalId = patientData.MedicalId || patientData.medicalId;

    const buildProfile = (p) => ({
      name: p.Name || "",
      email: p.Email || "",
      phone: p.Mobile_no || "",
      address: p.Address || "",
      dateOfBirth: p.DOB || "",
      gender: p.Gender || "",
      bloodType: p.BloodGroup || "",
      height: "",
      weight: "",
      emergencyContact: {
        name: p.EmergencyContactName || "",
        phone: p.EmergencyContactNumber || "",
        relationship: "",
      },
      insurance: { provider: "", policyNumber: "", groupNumber: "" },
      allergies:
        p.Allergies && p.Allergies !== "None" ? p.Allergies.split(",").map((a) => a.trim()) : [],
      medications: [],
      conditions:
        p.ChronicConditions && p.ChronicConditions !== "None"
          ? p.ChronicConditions.split(",").map((c) => c.trim())
          : [],
      preferences: { notifications: true, emailUpdates: true, smsReminders: false },
    });

    const loadFromBackend = async () => {
      if (!medicalId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/patient/search/${medicalId}`);
        const json = await res.json();
        if (json.data) {
          setPatientMongoId(json.data._id);
          const built = buildProfile(json.data);
          setProfile(built);
          setEditedProfile(built);
        }
      } catch (err) {
        console.error("Failed to load patient profile:", err);
      } finally {
        setLoading(false);
      }
    };
    loadFromBackend();
  }, [API_URL]);

  const handleSaveProfile = async () => {
    if (!patientMongoId) {
      setProfile(editedProfile);
      setIsEditing(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/patient/update/${patientMongoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Name: editedProfile.name,
          Email: editedProfile.email,
          Mobile_no: editedProfile.phone,
          Address: editedProfile.address,
          DOB: editedProfile.dateOfBirth,
          Gender: editedProfile.gender,
          BloodGroup: editedProfile.bloodType,
          Allergies: editedProfile.allergies.length ? editedProfile.allergies.join(", ") : "None",
          EmergencyContactName: editedProfile.emergencyContact.name,
          EmergencyContactNumber: editedProfile.emergencyContact.phone,
        }),
      });
      const data = await res.json();
      if (data.msg === "Patient updated successfully") {
        setProfile(editedProfile);
        setIsEditing(false);

        const savedPatientData = localStorage.getItem("patientData");
        if (savedPatientData) {
          try {
            const patientData = JSON.parse(savedPatientData);
            localStorage.setItem(
              "patientData",
              JSON.stringify({
                ...patientData,
                name: editedProfile.name,
                email: editedProfile.email,
                phone: editedProfile.phone,
                address: editedProfile.address,
              }),
            );
          } catch (error) {
            console.error("Error updating cached patient data:", error);
          }
        }

        toast({
          title: "Profile Updated!",
          description: "Your profile information has been saved successfully.",
          status: "success",
          duration: 3000,
        });
      } else {
        throw new Error(data.msg || "Failed to update profile");
      }
    } catch (err) {
      toast({
        title: "Failed to save profile",
        description: err.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleInputChange = (field, value, subField = null) => {
    if (subField) {
      setEditedProfile({
        ...editedProfile,
        [field]: {
          ...editedProfile[field],
          [subField]: value,
        },
      });
    } else {
      setEditedProfile({
        ...editedProfile,
        [field]: value,
      });
    }
  };

  if (loading) {
    return (
      <Box p={6}>
        <Alert status="info">
          <AlertIcon />
          Loading profile...
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack>
          <Icon as={FiUser} boxSize={8} color="blue.500" />
          <VStack align="start" spacing={1}>
            <Heading size="lg">My Profile</Heading>
            <Text color="gray.600">
              Manage your personal information and preferences
            </Text>
          </VStack>
          <Spacer />
          {!isEditing ? (
            <Button
              leftIcon={<FiEdit />}
              colorScheme="blue"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <HStack>
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button
                leftIcon={<FiSave />}
                colorScheme="green"
                onClick={handleSaveProfile}
              >
                Save Changes
              </Button>
            </HStack>
          )}
        </HStack>

        {/* Profile Overview */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <Flex
              direction={{ base: "column", md: "row" }}
              align="center"
              spacing={6}
            >
              <VStack spacing={4}>
                <Avatar size="2xl" name={profile.name} />
                <Button leftIcon={<FiCamera />} size="sm" variant="outline">
                  Change Photo
                </Button>
              </VStack>
              <VStack
                align={{ base: "center", md: "start" }}
                flex={1}
                ml={{ md: 8 }}
              >
                <Heading size="lg">{profile.name}</Heading>
                <HStack>
                  <Badge colorScheme="blue">Patient</Badge>
                  <Badge colorScheme="green">Verified</Badge>
                </HStack>
                <VStack align={{ base: "center", md: "start" }} spacing={1}>
                  <HStack>
                    <Icon as={FiMail} color="gray.500" />
                    <Text>{profile.email}</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FiPhone} color="gray.500" />
                    <Text>{profile.phone}</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FiMapPin} color="gray.500" />
                    <Text>{profile.address}</Text>
                  </HStack>
                </VStack>
              </VStack>
            </Flex>
          </CardBody>
        </Card>

        {/* Personal Information */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Personal Information</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl>
                <FormLabel>Full Name</FormLabel>
                <Input
                  value={isEditing ? editedProfile.name : profile.name}
                  isReadOnly={!isEditing}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Email Address</FormLabel>
                <Input
                  type="email"
                  value={isEditing ? editedProfile.email : profile.email}
                  isReadOnly={!isEditing}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Phone Number</FormLabel>
                <Input
                  value={isEditing ? editedProfile.phone : profile.phone}
                  isReadOnly={!isEditing}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Date of Birth</FormLabel>
                <Input
                  type="date"
                  value={
                    isEditing ? editedProfile.dateOfBirth : profile.dateOfBirth
                  }
                  isReadOnly={!isEditing}
                  onChange={(e) =>
                    handleInputChange("dateOfBirth", e.target.value)
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>Gender</FormLabel>
                <Select
                  value={isEditing ? editedProfile.gender : profile.gender}
                  isDisabled={!isEditing}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Blood Type</FormLabel>
                <Select
                  value={
                    isEditing ? editedProfile.bloodType : profile.bloodType
                  }
                  isDisabled={!isEditing}
                  onChange={(e) =>
                    handleInputChange("bloodType", e.target.value)
                  }
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

              <FormControl gridColumn={{ md: "span 2" }}>
                <FormLabel>Address</FormLabel>
                <Textarea
                  value={isEditing ? editedProfile.address : profile.address}
                  isReadOnly={!isEditing}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                />
              </FormControl>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Medical Information */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <Card bg={cardBg} borderColor={borderColor}>
            <CardHeader>
              <Heading size="md">Medical Information</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Height</FormLabel>
                  <Input
                    value={isEditing ? editedProfile.height : profile.height}
                    isReadOnly={!isEditing}
                    onChange={(e) =>
                      handleInputChange("height", e.target.value)
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Weight</FormLabel>
                  <Input
                    value={isEditing ? editedProfile.weight : profile.weight}
                    isReadOnly={!isEditing}
                    onChange={(e) =>
                      handleInputChange("weight", e.target.value)
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Known Allergies</FormLabel>
                  <Textarea
                    value={
                      isEditing
                        ? editedProfile.allergies.join(", ")
                        : profile.allergies.join(", ")
                    }
                    isReadOnly={!isEditing}
                    placeholder="List your allergies separated by commas"
                    onChange={(e) =>
                      handleInputChange("allergies", e.target.value.split(", "))
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Current Medications</FormLabel>
                  <Textarea
                    value={
                      isEditing
                        ? editedProfile.medications.join(", ")
                        : profile.medications.join(", ")
                    }
                    isReadOnly={!isEditing}
                    placeholder="List your medications separated by commas"
                    onChange={(e) =>
                      handleInputChange(
                        "medications",
                        e.target.value.split(", ")
                      )
                    }
                  />
                </FormControl>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor}>
            <CardHeader>
              <Heading size="md">Emergency Contact</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Contact Name</FormLabel>
                  <Input
                    value={
                      isEditing
                        ? editedProfile.emergencyContact.name
                        : profile.emergencyContact.name
                    }
                    isReadOnly={!isEditing}
                    onChange={(e) =>
                      handleInputChange(
                        "emergencyContact",
                        e.target.value,
                        "name"
                      )
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Phone Number</FormLabel>
                  <Input
                    value={
                      isEditing
                        ? editedProfile.emergencyContact.phone
                        : profile.emergencyContact.phone
                    }
                    isReadOnly={!isEditing}
                    onChange={(e) =>
                      handleInputChange(
                        "emergencyContact",
                        e.target.value,
                        "phone"
                      )
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Relationship</FormLabel>
                  <Input
                    value={
                      isEditing
                        ? editedProfile.emergencyContact.relationship
                        : profile.emergencyContact.relationship
                    }
                    isReadOnly={!isEditing}
                    onChange={(e) =>
                      handleInputChange(
                        "emergencyContact",
                        e.target.value,
                        "relationship"
                      )
                    }
                  />
                </FormControl>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Preferences */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Notification Preferences</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium">Push Notifications</Text>
                  <Text fontSize="sm" color="gray.600">
                    Receive notifications about appointments and health updates
                  </Text>
                </VStack>
                <Switch
                  isChecked={
                    isEditing
                      ? editedProfile.preferences.notifications
                      : profile.preferences.notifications
                  }
                  isDisabled={!isEditing}
                  onChange={(e) =>
                    handleInputChange(
                      "preferences",
                      e.target.checked,
                      "notifications"
                    )
                  }
                />
              </HStack>

              <Divider />

              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium">Email Updates</Text>
                  <Text fontSize="sm" color="gray.600">
                    Receive health tips and medical news via email
                  </Text>
                </VStack>
                <Switch
                  isChecked={
                    isEditing
                      ? editedProfile.preferences.emailUpdates
                      : profile.preferences.emailUpdates
                  }
                  isDisabled={!isEditing}
                  onChange={(e) =>
                    handleInputChange(
                      "preferences",
                      e.target.checked,
                      "emailUpdates"
                    )
                  }
                />
              </HStack>

              <Divider />

              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium">SMS Reminders</Text>
                  <Text fontSize="sm" color="gray.600">
                    Get text message reminders for appointments and medications
                  </Text>
                </VStack>
                <Switch
                  isChecked={
                    isEditing
                      ? editedProfile.preferences.smsReminders
                      : profile.preferences.smsReminders
                  }
                  isDisabled={!isEditing}
                  onChange={(e) =>
                    handleInputChange(
                      "preferences",
                      e.target.checked,
                      "smsReminders"
                    )
                  }
                />
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default PatientProfile;
