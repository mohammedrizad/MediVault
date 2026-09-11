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
  Badge,
  Button,
  useColorModeValue,
  SimpleGrid,
  Alert,
  AlertIcon,
  Icon,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Flex,
  Spacer,
} from "@chakra-ui/react";
import {
  FiFileText,
  FiCalendar,
  FiUser,
  FiDownload,
  FiEye,
  FiActivity,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const PatientHistory = () => {
  const toast = useToast();
  const { currentUser } = useAuth();
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    const medicalId = currentUser?.MedicalId || currentUser?.medicalId;
    if (!medicalId) {
      setLoading(false);
      return;
    }
    const loadHistory = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";
        const res = await fetch(`${API_URL}/patient/search/${medicalId}`);
        const json = await res.json();
        const history = json.data?.History || [];
        setMedicalHistory(
          history
            .slice()
            .reverse()
            .map((h, idx) => ({
              id: h._id || idx,
              date: h.Date || "",
              type: "Consultation",
              doctor:
                (typeof h.DoctorDetails === "object" && h.DoctorDetails?.name) ||
                json.data?.assignedDoctor ||
                "Unknown",
              diagnosis: h.disease || "General visit",
              status: "Completed",
              notes: h.notes || "",
            })),
        );
      } catch (err) {
        console.error("Failed to load medical history:", err);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [currentUser]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "green";
      case "pending":
        return "yellow";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case "consultation":
        return FiUser;
      case "lab test":
        return FiActivity;
      case "imaging":
        return FiEye;
      default:
        return FiFileText;
    }
  };

  const handleDownloadReport = (record) => {
    toast({
      title: "Downloading Report",
      description: `${record.type} report from ${record.date}`,
      status: "info",
      duration: 2000,
    });
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack>
          <Icon as={FiFileText} boxSize={8} color="blue.500" />
          <VStack align="start" spacing={1}>
            <Heading size="lg">Medical History</Heading>
            <Text color="gray.600">
              View your complete medical records and reports
            </Text>
          </VStack>
          <Spacer />
          <Button
            leftIcon={<FiDownload />}
            colorScheme="blue"
            variant="outline"
          >
            Export All
          </Button>
        </HStack>

        {/* Summary Cards */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <VStack spacing={2}>
                <Icon as={FiFileText} boxSize={6} color="blue.500" />
                <Text fontSize="2xl" fontWeight="bold">
                  {medicalHistory.length}
                </Text>
                <Text color="gray.600">Total Records</Text>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <VStack spacing={2}>
                <Icon as={FiCalendar} boxSize={6} color="green.500" />
                <Text fontSize="2xl" fontWeight="bold">
                  3
                </Text>
                <Text color="gray.600">This Month</Text>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <VStack spacing={2}>
                <Icon as={FiActivity} boxSize={6} color="purple.500" />
                <Text fontSize="2xl" fontWeight="bold">
                  1
                </Text>
                <Text color="gray.600">Pending Reports</Text>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Medical Records Table */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Recent Medical Records</Heading>
          </CardHeader>
          <CardBody>
            {loading ? (
              <Alert status="info">
                <AlertIcon />
                Loading medical history...
              </Alert>
            ) : (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Date</Th>
                    <Th>Type</Th>
                    <Th>Doctor</Th>
                    <Th>Diagnosis</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {medicalHistory.map((record) => {
                    const TypeIcon = getTypeIcon(record.type);
                    return (
                      <Tr key={record.id}>
                        <Td>{record.date}</Td>
                        <Td>
                          <HStack>
                            <Icon as={TypeIcon} color="blue.500" />
                            <Text>{record.type}</Text>
                          </HStack>
                        </Td>
                        <Td>{record.doctor}</Td>
                        <Td>{record.diagnosis}</Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              leftIcon={<FiEye />}
                              variant="outline"
                              colorScheme="blue"
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              leftIcon={<FiDownload />}
                              variant="outline"
                              onClick={() => handleDownloadReport(record)}
                            >
                              Download
                            </Button>
                          </HStack>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            )}
          </CardBody>
        </Card>

        {/* Health Timeline */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Health Timeline</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {medicalHistory.map((record, index) => (
                <Box key={record.id}>
                  <HStack spacing={4}>
                    <VStack>
                      <Icon
                        as={getTypeIcon(record.type)}
                        boxSize={6}
                        color="blue.500"
                      />
                      {index < medicalHistory.length - 1 && (
                        <Box h="40px" w="2px" bg="gray.200" />
                      )}
                    </VStack>
                    <VStack align="start" flex={1} spacing={1}>
                      <HStack>
                        <Text fontWeight="medium">{record.type}</Text>
                        <Badge colorScheme={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                      </HStack>
                      <Text fontSize="sm" color="gray.600">
                        {record.date} • {record.doctor}
                      </Text>
                      <Text fontSize="sm">{record.notes}</Text>
                    </VStack>
                  </HStack>
                  {index < medicalHistory.length - 1 && <Divider mt={4} />}
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default PatientHistory;
