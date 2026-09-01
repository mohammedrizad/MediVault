import React, { useState } from "react";
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
  Badge,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiUserPlus, FiCheck } from "react-icons/fi";

const AddNurse = () => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredNurse, setRegisteredNurse] = useState(null);

  const [formData, setFormData] = useState({
    nurseName: "",
    email: "",
    phone: "",
    gender: "Female",
    dob: "",
    address: "",
    qualifications: "",
    specialization: "",
    medicalLicense: "",
    councilRegistration: "",
    yearsExperience: "",
  });

  const bgColor = useColorModeValue("white", "gray.800");

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5002";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nurseName.trim()) {
      toast({
        title: "Nurse name is required",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    if (!formData.email.trim()) {
      toast({ title: "Email is required", status: "warning", duration: 3000 });
      return;
    }
    if (!formData.medicalLicense.trim()) {
      toast({
        title: "License Number is required (used as password)",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const adminData = JSON.parse(localStorage.getItem("user") || "{}");

      const response = await fetch(
        `${API_BASE_URL}/admin/postbyadminfornurse`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Admin: adminData.email || "admin@test.com",
            Doctor_name: formData.nurseName,
            Email_Address: formData.email,
            PhoneNo: formData.phone,
            gender: formData.gender,
            DOB: formData.dob,
            Current_Address: formData.address,
            Qualifications: formData.qualifications,
            Specialization: formData.specialization,
            Medical_License_Number: formData.medicalLicense,
            Medical_Council_Registration_Number: formData.councilRegistration,
            Years_of_experience: formData.yearsExperience,
          }),
        },
      );

      const data = await response.json();

      if (
        data.msg === "Nurse has been added" ||
        data.msg === "Added successfully" ||
        data.result
      ) {
        setRegistrationSuccess(true);
        setRegisteredNurse({
          name: formData.nurseName,
          email: formData.email,
          specialization: formData.specialization,
          license: formData.medicalLicense,
        });

        toast({
          title: "Nurse Added Successfully!",
          description: `${formData.nurseName} — Login: ${formData.email} / Password: ${formData.medicalLicense}`,
          status: "success",
          duration: 8000,
        });
      } else {
        toast({
          title: "Failed to Add Nurse",
          description: data.msg || "Something went wrong",
          status: "error",
          duration: 5000,
        });
      }
    } catch (err) {
      console.error("Error adding nurse:", err);
      toast({
        title: "Network Error",
        description: "Could not connect to server.",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nurseName: "",
      email: "",
      phone: "",
      gender: "Female",
      dob: "",
      address: "",
      qualifications: "",
      specialization: "",
      medicalLicense: "",
      councilRegistration: "",
      yearsExperience: "",
    });
    setRegistrationSuccess(false);
    setRegisteredNurse(null);
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
                Nurse Added!
              </Heading>
              <VStack spacing={2}>
                <Text fontSize="lg" fontWeight="bold">
                  {registeredNurse?.name}
                </Text>
                <Badge colorScheme="teal" fontSize="sm" px={3} py={1}>
                  {registeredNurse?.specialization || "General Nursing"}
                </Badge>
                <Text color="gray.600">Email: {registeredNurse?.email}</Text>
                <Text color="gray.600">
                  Login Password: <strong>{registeredNurse?.license}</strong>{" "}
                  (License #)
                </Text>
              </VStack>
              <HStack spacing={4}>
                <Button
                  colorScheme="teal"
                  onClick={resetForm}
                  leftIcon={<FiUserPlus />}
                >
                  Add Another Nurse
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
        <Heading
          size="lg"
          bgGradient="linear(to-r, teal.500, green.500)"
          bgClip="text"
        >
          Add New Nurse
        </Heading>

        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            <Card bg={bgColor} shadow="md" borderRadius="xl">
              <CardHeader pb={2}>
                <Heading size="md">Nurse Details</Heading>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Nurse Name</FormLabel>
                    <Input
                      name="nurseName"
                      value={formData.nurseName}
                      onChange={handleInputChange}
                      placeholder="Full Name"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="nurse@email.com"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Phone</FormLabel>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91XXXXXXXXXX"
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
                    <FormLabel>Date of Birth</FormLabel>
                    <Input
                      name="dob"
                      type="date"
                      value={formData.dob}
                      onChange={handleInputChange}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Address</FormLabel>
                    <Input
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Current address"
                    />
                  </FormControl>
                </SimpleGrid>
              </CardBody>
            </Card>

            <Card bg={bgColor} shadow="md" borderRadius="xl">
              <CardHeader pb={2}>
                <Heading size="md">Professional Details</Heading>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Qualifications</FormLabel>
                    <Input
                      name="qualifications"
                      value={formData.qualifications}
                      onChange={handleInputChange}
                      placeholder="BSc Nursing, GNM, etc."
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Specialization</FormLabel>
                    <Select
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Specialization</option>
                      <option value="General Nursing">General Nursing</option>
                      <option value="ICU">ICU</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Pediatric">Pediatric</option>
                      <option value="Surgical">Surgical</option>
                      <option value="Cardiac">Cardiac</option>
                      <option value="Oncology">Oncology</option>
                      <option value="Maternity">Maternity</option>
                      <option value="Geriatric">Geriatric</option>
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>License Number</FormLabel>
                    <Input
                      name="medicalLicense"
                      value={formData.medicalLicense}
                      onChange={handleInputChange}
                      placeholder="License # (also used as login password)"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Council Registration Number</FormLabel>
                    <Input
                      name="councilRegistration"
                      value={formData.councilRegistration}
                      onChange={handleInputChange}
                      placeholder="Nursing council reg. #"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Years of Experience</FormLabel>
                    <Input
                      name="yearsExperience"
                      type="number"
                      value={formData.yearsExperience}
                      onChange={handleInputChange}
                      placeholder="e.g. 3"
                    />
                  </FormControl>
                </SimpleGrid>
              </CardBody>
            </Card>

            <Divider />

            <HStack justify="flex-end" spacing={4}>
              <Button variant="outline" onClick={resetForm}>
                Clear Form
              </Button>
              <Button
                type="submit"
                colorScheme="teal"
                size="lg"
                leftIcon={<FiUserPlus />}
                isLoading={isLoading}
                loadingText="Adding Nurse..."
              >
                Add Nurse
              </Button>
            </HStack>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default AddNurse;
