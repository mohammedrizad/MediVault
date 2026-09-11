import React, { useState } from "react";
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Heading,
  VStack,
  Text,
  Alert,
  AlertIcon,
  Center,
  Spinner,
  useToast,
  Container,
  Icon,
  HStack,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiShield, FiSmartphone, FiUser } from "react-icons/fi";
import FacialAuth from "../components/auth/FacialAuth";
import PatientOtpLogin from "../components/auth/PatientOtpLogin";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PatientLogin = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [patient, setPatient] = useState(null);

  // Remove camera cleanup - keep camera active
  // useEffect(() => {
  //   return () => {
  //     globalCameraCleanup();
  //   };
  // }, []);

  // Theme colors
  const bgGradient = useColorModeValue(
    "linear(to-br, blue.50, cyan.50, white)",
    "linear(to-br, gray.900, blue.900)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const shadowColor = useColorModeValue("rgba(0,0,0,0.1)", "rgba(0,0,0,0.3)");

  const handleLoginSuccess = async (patientData) => {
    setPatient(patientData);

    // Store patient data in localStorage for the dashboard
    localStorage.setItem("patientData", JSON.stringify(patientData));

    // Keep camera active - remove cleanup
    // globalCameraCleanup();

    // Authenticate user with the system using mock credentials
    try {
      await login(
        {
          email: patientData.email || "patient@example.com",
          password: "patient123",
        },
        "patient",
        { ...patientData, role: "patient" }
      );

      toast({
        title: "Login Successful! 🎉",
        description: `Welcome back, ${patientData.name}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Redirect to patient dashboard after a short delay
      setTimeout(() => {
        navigate("/patient/dashboard");
      }, 1500);
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: "Failed to authenticate user session",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      <Container maxW="7xl" py={8}>
        {/* Header Section */}
        <VStack spacing={8} mb={8}>
          <VStack spacing={4} textAlign="center">
            <Icon as={FiShield} boxSize={12} color="blue.500" />
            <Heading
              size="2xl"
              bgGradient="linear(to-r, blue.500, cyan.500)"
              bgClip="text"
            >
              MediVault Patient Portal
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="600px">
              Secure access to your medical records, appointments, and health
              monitoring tools. Login with face recognition or OTP verification.
            </Text>
          </VStack>
        </VStack>

        <Center>
          <Box
            bg={cardBg}
            p={8}
            borderRadius="2xl"
            boxShadow={`0 20px 60px ${shadowColor}`}
            w={{ base: "95%", md: "600px" }}
            border="1px"
            borderColor="gray.100"
          >
            {/* Login Methods Info */}
            <HStack spacing={6} mb={6} justify="center">
              <VStack spacing={2}>
                <Icon as={FiUser} boxSize={6} color="blue.500" />
                <Text fontSize="sm" fontWeight="medium">
                  Face Login
                </Text>
              </VStack>
              <Divider orientation="vertical" h="40px" />
              <VStack spacing={2}>
                <Icon as={FiSmartphone} boxSize={6} color="green.500" />
                <Text fontSize="sm" fontWeight="medium">
                  OTP Login
                </Text>
              </VStack>
            </HStack>

            <Tabs variant="enclosed" colorScheme="blue" size="lg">
              <TabList mb={6} bg="gray.50" borderRadius="lg" p={1}>
                <Tab
                  flex={1}
                  borderRadius="md"
                  _selected={{
                    bg: "blue.500",
                    color: "white",
                    shadow: "md",
                  }}
                  fontSize="md"
                  fontWeight="medium"
                >
                  <Icon as={FiUser} mr={2} />
                  Face Recognition
                </Tab>
                <Tab
                  flex={1}
                  borderRadius="md"
                  _selected={{
                    bg: "green.500",
                    color: "white",
                    shadow: "md",
                  }}
                  fontSize="md"
                  fontWeight="medium"
                >
                  <Icon as={FiSmartphone} mr={2} />
                  OTP Verification
                </Tab>
              </TabList>

              <TabPanels>
                {/* Face Login Tab */}
                <TabPanel px={0}>
                  <VStack spacing={4}>
                    <Alert status="info" borderRadius="lg">
                      <AlertIcon />
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">Face Recognition Login</Text>
                        <Text fontSize="sm">
                          Look directly at the camera for secure authentication
                        </Text>
                      </VStack>
                    </Alert>
                    <Box w="full">
                      <FacialAuth
                        onSuccess={handleLoginSuccess}
                        onError={(error) =>
                          console.error("Face auth error:", error)
                        }
                      />
                    </Box>
                  </VStack>
                </TabPanel>

                {/* OTP Login Tab */}
                <TabPanel px={0}>
                  <VStack spacing={4}>
                    <Alert status="success" borderRadius="lg">
                      <AlertIcon />
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">OTP Verification</Text>
                        <Text fontSize="sm">
                          Enter your registered phone number to receive OTP
                        </Text>
                      </VStack>
                    </Alert>
                    <Box w="full">
                      <PatientOtpLogin onSuccess={handleLoginSuccess} />
                    </Box>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>

            {patient && (
              <Box
                mt={8}
                p={6}
                bg="green.50"
                border="2px solid"
                borderColor="green.200"
                borderRadius="xl"
                textAlign="center"
              >
                <VStack spacing={3}>
                  <Icon as={FiShield} boxSize={8} color="green.500" />
                  <Heading size="md" color="green.700">
                    Authentication Successful!
                  </Heading>
                  <Text color="green.600">
                    Redirecting to your dashboard...
                  </Text>
                  <VStack spacing={2} pt={2}>
                    <Text fontSize="sm">
                      <Text as="span" fontWeight="bold">
                        Name:
                      </Text>{" "}
                      {patient.name}
                    </Text>
                    <Text fontSize="sm">
                      <Text as="span" fontWeight="bold">
                        Phone:
                      </Text>{" "}
                      {patient.phone}
                    </Text>
                    <Text fontSize="sm">
                      <Text as="span" fontWeight="bold">
                        Email:
                      </Text>{" "}
                      {patient.email}
                    </Text>
                  </VStack>
                  <Spinner size="sm" color="green.500" />
                </VStack>
              </Box>
            )}
          </Box>
        </Center>
      </Container>
    </Box>
  );
};

export default PatientLogin;
