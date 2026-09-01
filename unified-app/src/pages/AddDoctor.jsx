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

const AddDoctor = () => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredDoctor, setRegisteredDoctor] = useState(null);

  const [formData, setFormData] = useState({
    doctorName: "",
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
    contractType: "Full-time",
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

    if (!formData.doctorName.trim()) {
      toast({
        title: "Doctor name is required",
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
        title: "Medical License Number is required (used as password)",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const adminData = JSON.parse(localStorage.getItem("user") || "{}");

      const response = await fetch(`${API_BASE_URL}/admin/postbyadmin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Admin: adminData.email || "admin@test.com",
          Doctor_name: formData.doctorName,
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
          Contract_type: formData.contractType,
        }),
      });

      const data = await response.json();

      if (
        data.msg === "Doctor has been added" ||
        data.msg === "Added successfully"
      ) {
        setRegistrationSuccess(true);
        setRegisteredDoctor({
          name: formData.doctorName,
          email: formData.email,
          specialization: formData.specialization,
          license: formData.medicalLicense,
        });

        toast({
          title: "Doctor Added Successfully!",
          description: `${formData.doctorName} — Login: ${formData.email} / Password: ${formData.medicalLicense}`,
          status: "success",
          duration: 8000,
        });
      } else {
        toast({
          title: "Failed to Add Doctor",
          description: data.msg || "Something went wrong",
          status: "error",
          duration: 5000,
        });
      }
    } catch (err) {
      console.error("Error adding doctor:", err);
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
      doctorName: "",
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
      contractType: "Full-time",
    });
    setRegistrationSuccess(false);
    setRegisteredDoctor(null);
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
                Doctor Added!
              </Heading>
              <VStack spacing={2}>
                <Text fontSize="lg" fontWeight="bold">
                  {registeredDoctor?.name}
                </Text>
                <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>
                  {registeredDoctor?.specialization || "General"}
                </Badge>
                <Text color="gray.600">Email: {registeredDoctor?.email}</Text>
                <Text color="gray.600">
                  Login Password: <strong>{registeredDoctor?.license}</strong>{" "}
                  (Medical License #)
                </Text>
              </VStack>
              <HStack spacing={4}>
                <Button
                  colorScheme="blue"
                  onClick={resetForm}
                  leftIcon={<FiUserPlus />}
                >
                  Add Another Doctor
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
            Add New Doctor
          </Heading>
        </HStack>

        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            <Card bg={bgColor} shadow="md" borderRadius="xl">
              <CardHeader pb={2}>
                <Heading size="md">Doctor Details</Heading>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Doctor Name</FormLabel>
                    <Input
                      name="doctorName"
                      value={formData.doctorName}
                      onChange={handleInputChange}
                      placeholder="Dr. Full Name"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="doctor@email.com"
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
                      placeholder="MBBS, MD, etc."
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
                      <option value="General Medicine">General Medicine</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Oncology">Oncology</option>
                      <option value="Radiology">Radiology</option>
                      <option value="Psychiatry">Psychiatry</option>
                      <option value="Surgery">Surgery</option>
                      <option value="Gynecology">Gynecology</option>
                      <option value="ENT">ENT</option>
                      <option value="Ophthalmology">Ophthalmology</option>
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Medical License Number</FormLabel>
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
                      placeholder="Medical council reg. #"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Years of Experience</FormLabel>
                    <Input
                      name="yearsExperience"
                      type="number"
                      value={formData.yearsExperience}
                      onChange={handleInputChange}
                      placeholder="e.g. 5"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Contract Type</FormLabel>
                    <Select
                      name="contractType"
                      value={formData.contractType}
                      onChange={handleInputChange}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Visiting">Visiting</option>
                    </Select>
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
                colorScheme="blue"
                size="lg"
                leftIcon={<FiUserPlus />}
                isLoading={isLoading}
                loadingText="Adding Doctor..."
              >
                Add Doctor
              </Button>
            </HStack>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default AddDoctor;
