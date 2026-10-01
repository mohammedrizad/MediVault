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

const AddScanCenter = () => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredCenter, setRegisteredCenter] = useState(null);

  const [formData, setFormData] = useState({
    centerName: "",
    email: "",
    phone: "",
    gender: "Male",
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

    if (!formData.centerName.trim()) {
      toast({
        title: "Center/Operator name is required",
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
      const adminData = JSON.parse(localStorage.getItem("userData") || "{}");
      const authToken = localStorage.getItem("authToken");

      const response = await fetch(`${API_BASE_URL}/admin/postforscancenter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          Admin: adminData.id,
          Doctor_name: formData.centerName,
          Email_Address: formData.email,
          phoneno: formData.phone,
          gender: formData.gender,
          DOB: formData.dob,
          Current_Address: formData.address,
          Qualifications: formData.qualifications,
          Specialization: formData.specialization,
          Medical_License_Number: formData.medicalLicense,
          Medical_Council_Registration_Number: formData.councilRegistration,
          Years_of_experience: formData.yearsExperience,
        }),
      });

      const data = await response.json();

      if (
        data.msg === "Details are saved successfully" ||
        data.msg === "Scan Center has been added" ||
        data.msg === "Added successfully" ||
        data.result
      ) {
        setRegistrationSuccess(true);
        setRegisteredCenter({
          name: formData.centerName,
          email: formData.email,
          specialization: formData.specialization,
          license: formData.medicalLicense,
        });

        toast({
          title: "Scan Center Added Successfully!",
          description: `${formData.centerName} — Login: ${formData.email} / Password: ${formData.medicalLicense}`,
          status: "success",
          duration: 8000,
        });
      } else {
        toast({
          title: "Failed to Add Scan Center",
          description: data.msg || "Something went wrong",
          status: "error",
          duration: 5000,
        });
      }
    } catch (err) {
      console.error("Error adding scan center:", err);
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
      centerName: "",
      email: "",
      phone: "",
      gender: "Male",
      dob: "",
      address: "",
      qualifications: "",
      specialization: "",
      medicalLicense: "",
      councilRegistration: "",
      yearsExperience: "",
    });
    setRegistrationSuccess(false);
    setRegisteredCenter(null);
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
                Scan Center Added!
              </Heading>
              <VStack spacing={2}>
                <Text fontSize="lg" fontWeight="bold">
                  {registeredCenter?.name}
                </Text>
                <Badge colorScheme="orange" fontSize="sm" px={3} py={1}>
                  {registeredCenter?.specialization || "Diagnostic Imaging"}
                </Badge>
                <Text color="gray.600">Email: {registeredCenter?.email}</Text>
                <Text color="gray.600">
                  Login Password: <strong>{registeredCenter?.license}</strong>{" "}
                  (License #)
                </Text>
              </VStack>
              <HStack spacing={4}>
                <Button
                  colorScheme="orange"
                  onClick={resetForm}
                  leftIcon={<FiUserPlus />}
                >
                  Add Another Scan Center
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
          bgGradient="linear(to-r, orange.400, red.500)"
          bgClip="text"
        >
          Add New Scan Center
        </Heading>

        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            <Card bg={bgColor} shadow="md" borderRadius="xl">
              <CardHeader pb={2}>
                <Heading size="md">Scan Center Details</Heading>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Center / Operator Name</FormLabel>
                    <Input
                      name="centerName"
                      value={formData.centerName}
                      onChange={handleInputChange}
                      placeholder="Scan Center Name"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="scancenter@email.com"
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
                    <FormLabel>Gender (Operator)</FormLabel>
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
                    <FormLabel>Date of Establishment</FormLabel>
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
                      placeholder="Center address"
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
                    <FormLabel>Qualifications / Certifications</FormLabel>
                    <Input
                      name="qualifications"
                      value={formData.qualifications}
                      onChange={handleInputChange}
                      placeholder="NABL, ISO, etc."
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
                      <option value="X-Ray">X-Ray</option>
                      <option value="MRI">MRI</option>
                      <option value="CT Scan">CT Scan</option>
                      <option value="Ultrasound">Ultrasound</option>
                      <option value="PET Scan">PET Scan</option>
                      <option value="Mammography">Mammography</option>
                      <option value="Pathology">Pathology</option>
                      <option value="Multi-Modality">Multi-Modality</option>
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
                    <FormLabel>Registration Number</FormLabel>
                    <Input
                      name="councilRegistration"
                      value={formData.councilRegistration}
                      onChange={handleInputChange}
                      placeholder="Registration #"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Years in Operation</FormLabel>
                    <Input
                      name="yearsExperience"
                      type="number"
                      value={formData.yearsExperience}
                      onChange={handleInputChange}
                      placeholder="e.g. 10"
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
                colorScheme="orange"
                size="lg"
                leftIcon={<FiUserPlus />}
                isLoading={isLoading}
                loadingText="Adding Scan Center..."
              >
                Add Scan Center
              </Button>
            </HStack>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default AddScanCenter;
