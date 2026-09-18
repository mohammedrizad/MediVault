import React, { useState } from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
  useToast,
  Container,
  Code,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import {
  patientAPI,
  doctorAPI,
  adminAPI,
  aiAPI,
  faceAPI,
} from "../services/api";
import IntegrationTest from "../components/testing/IntegrationTest";

const ApiTestPage = () => {
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";

  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState({});
  const toast = useToast();

  const runTest = async (testName, testFunction) => {
    setLoading((prev) => ({ ...prev, [testName]: true }));

    try {
      const result = await testFunction();
      setTestResults((prev) => ({
        ...prev,
        [testName]: { success: true, data: result },
      }));

      toast({
        title: `${testName} Test Passed`,
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        [testName]: { success: false, error: error.message },
      }));

      toast({
        title: `${testName} Test Failed`,
        description: error.message,
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading((prev) => ({ ...prev, [testName]: false }));
    }
  };

  const tests = [
    {
      name: "Backend Connection",
      description: "Test if backend server is running",
      test: async () => {
        const response = await fetch(`${API_URL}/`);
        if (!response.ok) throw new Error("Backend not accessible");
        return { status: "Backend is running" };
      },
    },
    {
      name: "Patient API",
      description: "Test patient endpoints",
      test: async () => {
        // Test getting patients list
        const response = await patientAPI.getAllPatients();
        return response;
      },
    },
    {
      name: "Doctor API",
      description: "Test doctor endpoints",
      test: async () => {
        const response = await doctorAPI.getAllDoctors();
        return response;
      },
    },
    {
      name: "Admin API",
      description: "Test admin endpoints",
      test: async () => {
        const response = await adminAPI.getAllAdmins();
        return response;
      },
    },
    {
      name: "AI Summarization",
      description: "Test Groq AI integration",
      test: async () => {
        const testData = {
          medicalData: "Patient has high blood pressure and diabetes",
          patientId: "test-patient",
        };
        const response = await aiAPI.summarizeMedicalData(testData);
        return response;
      },
    },
    {
      name: "Face++ Detection",
      description: "Test Face++ API integration",
      test: async () => {
        // Create a test image data URL (1x1 pixel image)
        const testImageUrl =
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
        const response = await faceAPI.authenticateWithFace(testImageUrl);
        return response;
      },
    },
  ];

  const getStatusColor = (result) => {
    if (!result) return "gray";
    return result.success ? "green" : "red";
  };

  const getStatusText = (result) => {
    if (!result) return "Not Tested";
    return result.success ? "PASS" : "FAIL";
  };

  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="lg" color="blue.600" mb={2}>
            MediVault API Integration Tests
          </Heading>
          <Text color="gray.600">
            Test backend connectivity and Face++ integration
          </Text>
        </Box>

        <Alert status="info">
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold">Before running tests:</Text>
            <Text fontSize="sm">
              1. Make sure the backend server is running on port 5000
            </Text>
            <Text fontSize="sm">2. Ensure MongoDB is connected</Text>
            <Text fontSize="sm">
              3. Verify Face++ API credentials are configured
            </Text>
          </VStack>
        </Alert>

        <VStack spacing={4}>
          {tests.map((test) => (
            <Box
              key={test.name}
              p={6}
              borderWidth="1px"
              borderRadius="lg"
              w="full"
              bg="white"
              shadow="sm"
            >
              <VStack align="stretch" spacing={4}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <VStack align="start" spacing={1}>
                    <Heading size="md">{test.name}</Heading>
                    <Text fontSize="sm" color="gray.600">
                      {test.description}
                    </Text>
                  </VStack>

                  <Badge
                    colorScheme={getStatusColor(testResults[test.name])}
                    variant="solid"
                    px={3}
                    py={1}
                  >
                    {getStatusText(testResults[test.name])}
                  </Badge>
                </Box>

                <Button
                  onClick={() => runTest(test.name, test.test)}
                  isLoading={loading[test.name]}
                  loadingText="Testing..."
                  colorScheme="blue"
                  size="sm"
                  w="fit-content"
                >
                  Run Test
                </Button>

                {testResults[test.name] && (
                  <Box>
                    {testResults[test.name].success ? (
                      <Box>
                        <Text
                          fontSize="sm"
                          fontWeight="bold"
                          color="green.600"
                          mb={2}
                        >
                          Test Result:
                        </Text>
                        <Code
                          p={3}
                          borderRadius="md"
                          overflow="auto"
                          maxH="200px"
                        >
                          {JSON.stringify(testResults[test.name].data, null, 2)}
                        </Code>
                      </Box>
                    ) : (
                      <Alert status="error" borderRadius="md">
                        <AlertIcon />
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="bold">Error:</Text>
                          <Text fontSize="sm">
                            {testResults[test.name].error}
                          </Text>
                        </VStack>
                      </Alert>
                    )}
                  </Box>
                )}
              </VStack>
            </Box>
          ))}
        </VStack>

        <Button
          onClick={() => {
            tests.forEach((test) => {
              runTest(test.name, test.test);
            });
          }}
          colorScheme="green"
          size="lg"
          isLoading={Object.values(loading).some(Boolean)}
        >
          Run All Tests
        </Button>
      </VStack>
    </Container>
  );
};

export default ApiTestPage;
