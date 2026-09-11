import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Image,
  Badge,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Divider,
  Icon,
  Alert,
  AlertIcon,
  useColorModeValue,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { FiAlertTriangle, FiPhone, FiUser, FiActivity } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const EmergencyAccess = () => {
  const { medicalId } = useParams();
  const { isAuthenticated, userRole } = useAuth();
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessTime, setAccessTime] = useState("");

  const bg = useColorModeValue("red.50", "red.900");
  const cardBg = useColorModeValue("white", "gray.800");

  useEffect(() => {
    const allowedRoles = ["doctor", "nurse", "admin", "scancenter"];
    if (!isAuthenticated || !allowedRoles.includes(userRole)) {
      setError(
        "Emergency override is restricted to authorized portal officials. Please log in through your portal.",
      );
      setLoading(false);
      return;
    }

    const fetchEmergencyData = async () => {
      try {
        const API_BASE_URL =
          process.env.REACT_APP_API_URL || "http://localhost:5002";
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `${API_BASE_URL}/emergency/emergency-access/${medicalId}`,
          {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
              "x-user-role": userRole || "",
            },
          },
        );

        if (!response.ok) {
          throw new Error(
            response.status === 403
              ? "Emergency override is restricted to authorized portal officials"
              : "Patient not found or access denied",
          );
        }

        const data = await response.json();
        setPatientData(data);
        setAccessTime(new Date().toLocaleString());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmergencyData();
  }, [medicalId, isAuthenticated, userRole]);

  if (loading) {
    return (
      <Center h="100vh" bg={bg}>
        <Spinner size="xl" color="red.500" thickness="4px" />
      </Center>
    );
  }

  if (error) {
    return (
      <Container maxW="lg" py={10}>
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
          borderRadius="md"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <Heading size="md" mt={4} mb={1}>
            Access Error
          </Heading>
          <Text>{error}</Text>
        </Alert>
      </Container>
    );
  }

  return (
    <Box minH="100vh" bg={bg} py={8}>
      <Container maxW="2xl">
        <VStack spacing={6}>
          {/* Emergency Header */}
          <Box
            textAlign="center"
            w="full"
            bg="red.600"
            color="white"
            p={4}
            borderRadius="lg"
            boxShadow="lg"
          >
            <Icon as={FiAlertTriangle} boxSize={10} mb={2} />
            <Heading size="lg">EMERGENCY MEDICAL ACCESS</Heading>
            <Text fontSize="sm" opacity={0.9}>
              Authorized for Emergency Personnel Only
            </Text>
          </Box>

          {/* Patient Identity Card */}
          <Card
            w="full"
            bg={cardBg}
            boxShadow="xl"
            borderTop="4px solid"
            borderColor="red.500"
          >
            <CardBody>
              <VStack spacing={4}>
                {patientData.Photo ? (
                  <Image
                    src={patientData.Photo}
                    alt={patientData.Name}
                    boxSize="150px"
                    objectFit="cover"
                    borderRadius="full"
                    border="4px solid"
                    borderColor="red.100"
                  />
                ) : (
                  <Center boxSize="150px" bg="gray.100" borderRadius="full">
                    <Icon as={FiUser} boxSize={12} color="gray.400" />
                  </Center>
                )}

                <VStack spacing={1}>
                  <Heading size="lg">{patientData.Name}</Heading>
                  <Badge
                    colorScheme="blue"
                    fontSize="md"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    ID: {patientData.MedicalId}
                  </Badge>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Critical Medical Info */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
            <Card bg={cardBg} borderLeft="4px solid" borderColor="red.500">
              <CardBody>
                <VStack align="start">
                  <HStack color="red.500">
                    <Icon as={FiActivity} />
                    <Text fontWeight="bold">Blood Group</Text>
                  </HStack>
                  <Heading size="xl">
                    {patientData.BloodGroup || "Unknown"}
                  </Heading>
                </VStack>
              </CardBody>
            </Card>

            <Card bg={cardBg} borderLeft="4px solid" borderColor="orange.500">
              <CardBody>
                <VStack align="start">
                  <HStack color="orange.500">
                    <Icon as={FiAlertTriangle} />
                    <Text fontWeight="bold">Allergies</Text>
                  </HStack>
                  <Text fontSize="lg" fontWeight="medium">
                    {patientData.Allergies || "None Reported"}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Reviewer Details */}
          <Card w="full" bg={cardBg} borderLeft="4px solid" borderColor="blue.500">
            <CardHeader pb={0}>
              <Heading size="sm" color="blue.600">
                Emergency Review Details
              </Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Box>
                  <Text fontSize="sm" color="gray.500">
                    Age
                  </Text>
                  <Text fontWeight="bold">{patientData.Age || "Unknown"}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500">
                    Gender
                  </Text>
                  <Text fontWeight="bold">{patientData.Gender || "Unknown"}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500">
                    Patient Status
                  </Text>
                  <Text fontWeight="bold">{patientData.status || "Unknown"}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500">
                    Assigned Doctor
                  </Text>
                  <Text fontWeight="bold">{patientData.assignedDoctor || "Unassigned"}</Text>
                </Box>
                <Box gridColumn={{ base: "span 1", md: "span 2" }}>
                  <Text fontSize="sm" color="gray.500">
                    Address
                  </Text>
                  <Text fontWeight="bold">{patientData.Address || "Not available"}</Text>
                </Box>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Chronic Conditions */}
          <Card w="full" bg={cardBg}>
            <CardHeader pb={0}>
              <Heading size="sm" color="gray.600">
                Chronic Conditions
              </Heading>
            </CardHeader>
            <CardBody>
              <Text fontSize="lg" fontWeight="medium">
                {patientData.ChronicConditions || "None Reported"}
              </Text>
            </CardBody>
          </Card>

          {/* Emergency Contact */}
          <Card w="full" bg={cardBg} border="2px dashed" borderColor="red.300">
            <CardBody>
              <VStack spacing={3} align="start">
                <Heading size="sm" color="red.600">
                  Emergency Contact
                </Heading>
                <Divider />
                <SimpleGrid columns={2} w="full" spacing={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.500">
                      Name
                    </Text>
                    <Text fontWeight="bold">
                      {patientData.EmergencyContactName || "Not Listed"}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500">
                      Phone
                    </Text>
                    <HStack>
                      <Icon as={FiPhone} color="green.500" />
                      <Text fontWeight="bold" fontSize="lg">
                        {patientData.EmergencyContactNumber ? (
                          <a
                            href={`tel:${patientData.EmergencyContactNumber}`}
                            style={{ textDecoration: "underline" }}
                          >
                            {patientData.EmergencyContactNumber}
                          </a>
                        ) : (
                          "Not Listed"
                        )}
                      </Text>
                    </HStack>
                  </Box>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>

          <Alert status="info" variant="left-accent" borderRadius="md">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" fontWeight="semibold">
                Restricted emergency snapshot only
              </Text>
              <Text fontSize="sm">
                Accessed by: {(userRole || "official").toUpperCase()} | Time: {accessTime || "Just now"}
              </Text>
              <Text fontSize="sm">
                For complete history: Doctor Portal / Patient Search / View Full Medical Record.
              </Text>
            </VStack>
          </Alert>
        </VStack>
      </Container>
    </Box>
  );
};

export default EmergencyAccess;
