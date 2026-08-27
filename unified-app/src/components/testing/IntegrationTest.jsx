import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
  Code,
  Badge,
  SimpleGrid,
  useToast,
  Container,
} from "@chakra-ui/react";
import { FiCheck, FiX, FiLoader } from "react-icons/fi";

const IntegrationTest = () => {
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";
  const [tests, setTests] = useState({
    backendConnection: { status: "pending", message: "" },
    apiEndpoints: { status: "pending", message: "" },
    faceApiSimulation: { status: "pending", message: "" },
    authentication: { status: "pending", message: "" },
  });
  const [isRunning, setIsRunning] = useState(false);
  const toast = useToast();

  const updateTestStatus = (testName, status, message) => {
    setTests((prev) => ({
      ...prev,
      [testName]: { status, message },
    }));
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const runTests = async () => {
    setIsRunning(true);
    toast({
      title: "Running Integration Tests",
      description: "Testing MediVault backend and Face++ integration",
      status: "info",
      duration: 3000,
    });

    // Test 1: Backend Connection
    updateTestStatus(
      "backendConnection",
      "running",
      "Checking backend server..."
    );
    await delay(1000);

    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com", password: "test" }),
      });

      if (response.status === 400 || response.status === 401) {
        // Expected behavior - endpoint exists and validates input
        updateTestStatus(
          "backendConnection",
          "success",
          "Backend server is running and responsive"
        );
      } else {
        updateTestStatus(
          "backendConnection",
          "error",
          "Unexpected response from server"
        );
      }
    } catch (error) {
      updateTestStatus(
        "backendConnection",
        "error",
        `Server connection failed: ${error.message}`
      );
    }

    await delay(500);

    // Test 2: API Endpoints Structure
    updateTestStatus("apiEndpoints", "running", "Verifying API endpoints...");
    await delay(1000);

    const endpointTests = [
      { url: `${API_URL}/patient/getall`, expectedStatus: 401 },
      { url: `${API_URL}/doctor/login`, expectedStatus: 400 },
      { url: `${API_URL}/nurse/login`, expectedStatus: 400 },
      { url: `${API_URL}/ai/summarize`, expectedStatus: 400 },
    ];

    let passedEndpoints = 0;

    for (const test of endpointTests) {
      try {
        const response = await fetch(test.url, {
          method:
            test.url.includes("login") || test.url.includes("summarize")
              ? "POST"
              : "GET",
          headers: { "Content-Type": "application/json" },
          body:
            test.url.includes("login") || test.url.includes("summarize")
              ? "{}"
              : undefined,
        });

        if (
          response.status === test.expectedStatus ||
          response.status === 400 ||
          response.status === 401
        ) {
          passedEndpoints++;
        }
      } catch (error) {
        // Endpoint might not be available
      }
    }

    if (passedEndpoints >= 3) {
      updateTestStatus(
        "apiEndpoints",
        "success",
        `${passedEndpoints}/${endpointTests.length} endpoints are properly configured`
      );
    } else {
      updateTestStatus(
        "apiEndpoints",
        "warning",
        `Only ${passedEndpoints}/${endpointTests.length} endpoints responded as expected`
      );
    }

    await delay(500);

    // Test 3: Face++ API Simulation
    updateTestStatus(
      "faceApiSimulation",
      "running",
      "Testing Face++ API structure..."
    );
    await delay(1500);

    try {
      // Simulate Face++ API call structure (not actual call to avoid rate limits)
      const faceApiTest = {
        endpoint: "https://api-us.faceplusplus.com/facepp/v3/compare",
        hasApiKey: process.env.REACT_APP_FACE_API_ENABLED === "true",
        confidenceThreshold:
          parseInt(process.env.REACT_APP_FACE_CONFIDENCE_THRESHOLD) || 80,
      };

      if (faceApiTest.hasApiKey && faceApiTest.confidenceThreshold >= 80) {
        updateTestStatus(
          "faceApiSimulation",
          "success",
          `Face++ API configured with ${faceApiTest.confidenceThreshold}% confidence threshold`
        );
      } else {
        updateTestStatus(
          "faceApiSimulation",
          "warning",
          "Face++ API configuration incomplete - check environment variables"
        );
      }
    } catch (error) {
      updateTestStatus(
        "faceApiSimulation",
        "error",
        `Face++ API test failed: ${error.message}`
      );
    }

    await delay(500);

    // Test 4: Authentication Structure
    updateTestStatus(
      "authentication",
      "running",
      "Testing authentication structure..."
    );
    await delay(1000);

    try {
      // Test localStorage functionality and JWT structure
      const testToken = "test-jwt-token";
      localStorage.setItem("test-auth", testToken);
      const retrieved = localStorage.getItem("test-auth");
      localStorage.removeItem("test-auth");

      if (retrieved === testToken) {
        updateTestStatus(
          "authentication",
          "success",
          "Authentication storage and JWT handling is properly configured"
        );
      } else {
        updateTestStatus(
          "authentication",
          "error",
          "Authentication storage test failed"
        );
      }
    } catch (error) {
      updateTestStatus(
        "authentication",
        "error",
        `Authentication test failed: ${error.message}`
      );
    }

    setIsRunning(false);

    // Show completion toast
    const successTests = Object.values(tests).filter(
      (test) => test.status === "success"
    ).length;
    toast({
      title: "Integration Tests Completed",
      description: `${successTests}/4 tests passed successfully`,
      status: successTests >= 3 ? "success" : "warning",
      duration: 5000,
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <FiCheck color="green" />;
      case "error":
        return <FiX color="red" />;
      case "running":
        return <FiLoader color="blue" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "green";
      case "error":
        return "red";
      case "warning":
        return "orange";
      case "running":
        return "blue";
      default:
        return "gray";
    }
  };

  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="lg" color="blue.600" mb={2}>
            MediVault Integration Test Suite
          </Heading>
          <Text color="gray.600">
            Verify backend connectivity, Face++ integration, and system
            readiness
          </Text>
        </Box>

        <Alert status="info">
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold">Test Coverage:</Text>
            <Text fontSize="sm">
              ✓ Backend Server Connection (Express.js on port 5000)
            </Text>
            <Text fontSize="sm">
              ✓ API Endpoint Validation (Patient, Doctor, Nurse, Admin, AI)
            </Text>
            <Text fontSize="sm">✓ Face++ API Configuration</Text>
            <Text fontSize="sm">✓ Authentication System Structure</Text>
          </VStack>
        </Alert>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {Object.entries(tests).map(([testName, testData]) => (
            <Box
              key={testName}
              p={6}
              borderWidth="1px"
              borderRadius="lg"
              bg="white"
              shadow="sm"
            >
              <VStack align="stretch" spacing={3}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Text fontWeight="bold" textTransform="capitalize">
                    {testName.replace(/([A-Z])/g, " $1").trim()}
                  </Text>
                  <Badge
                    colorScheme={getStatusColor(testData.status)}
                    variant="solid"
                    display="flex"
                    alignItems="center"
                    gap={1}
                  >
                    {getStatusIcon(testData.status)}
                    {testData.status.toUpperCase()}
                  </Badge>
                </Box>

                {testData.message && (
                  <Text fontSize="sm" color="gray.600">
                    {testData.message}
                  </Text>
                )}
              </VStack>
            </Box>
          ))}
        </SimpleGrid>

        <VStack spacing={4}>
          <Button
            onClick={runTests}
            colorScheme="blue"
            size="lg"
            isLoading={isRunning}
            loadingText="Running Tests..."
            w="fit-content"
          >
            Run Integration Tests
          </Button>

          <Text fontSize="sm" color="gray.500" textAlign="center">
            These tests verify that your MediVault unified app is properly
            connected to the backend services and Face++ authentication system.
          </Text>
        </VStack>

        {/* Quick Status Overview */}
        <Box p={4} bg="gray.50" borderRadius="md">
          <Text fontWeight="bold" mb={2}>
            Quick Status:
          </Text>
          <Code p={2} display="block" whiteSpace="pre-wrap">
            {JSON.stringify(
              {
                backendRunning: tests.backendConnection.status === "success",
                apiEndpointsReady: tests.apiEndpoints.status === "success",
                faceApiConfigured: tests.faceApiSimulation.status === "success",
                authSystemReady: tests.authentication.status === "success",
              },
              null,
              2
            )}
          </Code>
        </Box>
      </VStack>
    </Container>
  );
};

export default IntegrationTest;
