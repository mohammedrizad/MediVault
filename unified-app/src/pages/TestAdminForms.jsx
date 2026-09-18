import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Alert,
  AlertIcon,
  Container,
  Heading,
} from "@chakra-ui/react";
import dataService from "../services/DataService";

const TestAdminForms = () => {
  const [doctorData, setDoctorData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    experience: "",
    address: "",
    qualifications: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDoctorData((prev) => ({ ...prev, [name]: value }));
  };

  const testAddDoctor = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("Testing addDoctor with data:", doctorData);
      const response = await dataService.addDoctor(doctorData);
      console.log("addDoctor response:", response);
      setResult(response);
    } catch (err) {
      console.error("addDoctor error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testGetDoctors = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("Testing getDoctors...");
      const doctors = await dataService.getDoctors();
      console.log("getDoctors response:", doctors);
      setResult({ doctors, count: doctors.length });
    } catch (err) {
      console.error("getDoctors error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const populateTestData = () => {
    const timestamp = Date.now();
    setDoctorData({
      name: `Dr. React Test ${timestamp}`,
      email: `react.test.${timestamp}@medivault.com`,
      phone: "6666666666",
      specialization: "Orthopedic",
      experience: "6",
      address: "321 React Street",
      qualifications: "MBBS, MS Orthopedic",
    });
  };

  return (
    <Container maxW="md" py={8}>
      <VStack spacing={6}>
        <Heading>Admin Forms Test Page</Heading>

        <Box w="100%">
          <Button
            onClick={testGetDoctors}
            isLoading={loading}
            colorScheme="blue"
          >
            Test Get Doctors
          </Button>
        </Box>

        <Box
          w="100%"
          p={4}
          border="1px"
          borderColor="gray.200"
          borderRadius="md"
        >
          <VStack spacing={4}>
            <Heading size="md">Add Doctor Test</Heading>

            <Button onClick={populateTestData} colorScheme="green" size="sm">
              Fill Test Data
            </Button>

            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input
                name="name"
                value={doctorData.name}
                onChange={handleInputChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                value={doctorData.email}
                onChange={handleInputChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Phone</FormLabel>
              <Input
                name="phone"
                value={doctorData.phone}
                onChange={handleInputChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Specialization</FormLabel>
              <Input
                name="specialization"
                value={doctorData.specialization}
                onChange={handleInputChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Experience</FormLabel>
              <Input
                name="experience"
                value={doctorData.experience}
                onChange={handleInputChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Address</FormLabel>
              <Input
                name="address"
                value={doctorData.address}
                onChange={handleInputChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Qualifications</FormLabel>
              <Input
                name="qualifications"
                value={doctorData.qualifications}
                onChange={handleInputChange}
              />
            </FormControl>

            <Button
              onClick={testAddDoctor}
              isLoading={loading}
              colorScheme="blue"
              w="100%"
            >
              Test Add Doctor
            </Button>
          </VStack>
        </Box>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {result && (
          <Alert status="success">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Success!</Text>
              <Text fontSize="sm">{JSON.stringify(result, null, 2)}</Text>
            </Box>
          </Alert>
        )}
      </VStack>
    </Container>
  );
};

export default TestAdminForms;
