import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Avatar,
  Icon,
  Divider,
  Input,
  Select,
  Textarea,
  useColorModeValue,
  Progress,
  List,
  ListItem,
  ListIcon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import {
  FiUsers,
  FiHeart,
  FiActivity,
  FiClipboard,
  FiUser,
  FiCalendar,
  FiPlus,
  FiSearch,
  FiEdit,
  FiEye,
  FiFileText,
  FiAlertCircle,
  FiCheck,
  FiClock,
  FiPhone,
  FiMapPin,
  FiTrendingUp,
  FiTrendingDown,
} from "react-icons/fi";

const NursePatientCare = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [careFilter, setCareFilter] = useState("all");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Real patient data from backend, transformed into the care-view shape
  const [patientCareData, setPatientCareData] = useState([]);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";
        const res = await fetch(`${API_URL}/patient/getall`);
        const data = await res.json();
        const patients = data.result || [];
        setPatientCareData(
          patients.map((p) => {
            const careLevel =
              p.status === "Active" && p.ChronicConditions !== "None"
                ? "Standard"
                : "Standard";
            const alerts = [];
            if (p.Allergies && p.Allergies !== "None") alerts.push(`Allergy: ${p.Allergies}`);
            if (p.ChronicConditions && p.ChronicConditions !== "None")
              alerts.push(`Chronic condition: ${p.ChronicConditions}`);
            return {
              id: p._id,
              patientName: p.Name,
              patientId: p.MedicalId,
              age: p.Age,
              gender: p.Gender,
              roomNumber: "—",
              admissionDate: p.DOB,
              primaryNurse: "",
              condition: p.ChronicConditions !== "None" ? p.ChronicConditions : "General care",
              careLevel,
              status: p.status || "Active",
              activities: [],
              assessments: [],
              alerts,
            };
          }),
        );
      } catch (err) {
        console.error("Failed to load patients:", err);
      }
    };
    loadPatients();
  }, []);

  // Care statistics
  const careStats = [
    {
      label: "Total Patients",
      value: patientCareData.length,
      color: "blue.500",
    },
    {
      label: "Critical Care",
      value: patientCareData.filter((p) => p.careLevel === "Critical").length,
      color: "red.500",
    },
    {
      label: "Stable Patients",
      value: patientCareData.filter((p) => p.status === "Stable").length,
      color: "green.500",
    },
    {
      label: "Pending Activities",
      value: patientCareData.reduce(
        (total, patient) =>
          total +
          patient.activities.filter(
            (a) => a.status === "Pending" || a.status === "Scheduled",
          ).length,
        0,
      ),
      color: "orange.500",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Stable":
        return "green";
      case "Improving":
        return "blue";
      case "Recovering":
        return "cyan";
      case "Critical":
        return "red";
      default:
        return "gray";
    }
  };

  const getCareColor = (level) => {
    switch (level) {
      case "Critical":
        return "red";
      case "Intensive":
        return "orange";
      case "Standard":
        return "blue";
      default:
        return "gray";
    }
  };

  const getActivityColor = (status) => {
    switch (status) {
      case "Completed":
        return "green";
      case "In Progress":
        return "blue";
      case "Pending":
        return "orange";
      case "Scheduled":
        return "purple";
      case "Ongoing":
        return "cyan";
      default:
        return "gray";
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={2}>
          Patient Care Management
        </Text>
        <Text color="gray.600">
          Comprehensive patient care tracking, assessments, and activity
          monitoring
        </Text>
      </Box>

      {/* Statistics */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        {careStats.map((stat, index) => (
          <Card key={index}>
            <CardBody>
              <Stat>
                <StatLabel>{stat.label}</StatLabel>
                <StatNumber color={stat.color}>{stat.value}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Search and Filters */}
      <Card>
        <CardBody>
          <HStack spacing={4} mb={4} wrap="wrap">
            <HStack>
              <Icon as={FiSearch} color="purple.500" />
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                maxW="250px"
              />
            </HStack>

            <HStack>
              <Text fontWeight="medium">Care Level:</Text>
              <Select
                value={careFilter}
                onChange={(e) => setCareFilter(e.target.value)}
                maxW="150px"
              >
                <option value="all">All Levels</option>
                <option value="Critical">Critical</option>
                <option value="Intensive">Intensive</option>
                <option value="Standard">Standard</option>
              </Select>
            </HStack>

            <Button colorScheme="purple" leftIcon={<FiPlus />} onClick={onOpen}>
              Add Care Plan
            </Button>
          </HStack>
        </CardBody>
      </Card>

      {/* Patient Care Cards */}
      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={6}>
        {patientCareData
          .filter((p) => {
            const matchesSearch =
              !searchTerm ||
              p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              p.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
              p.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter =
              careFilter === "all" || p.careLevel === careFilter;
            return matchesSearch && matchesFilter;
          })
          .map((patient) => (
            <Card key={patient.id}>
              <CardHeader>
                <HStack justify="space-between">
                  <HStack>
                    <Avatar size="lg" name={patient.patientName} />
                    <VStack align="start" spacing={1} flex={1}>
                      <Text fontWeight="bold" fontSize="lg">
                        {patient.patientName}
                      </Text>
                      <HStack spacing={4}>
                        <Text fontSize="sm" color="gray.500">
                          ID: {patient.patientId}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          Room: {patient.roomNumber}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          Age: {patient.age}
                        </Text>
                      </HStack>
                      <HStack spacing={2}>
                        <Badge colorScheme={getStatusColor(patient.status)}>
                          {patient.status}
                        </Badge>
                        <Badge
                          colorScheme={getCareColor(patient.careLevel)}
                          variant="outline"
                        >
                          {patient.careLevel} Care
                        </Badge>
                      </HStack>
                    </VStack>
                  </HStack>
                </HStack>
              </CardHeader>

              <CardBody pt={0}>
                <Tabs size="sm" colorScheme="purple">
                  <TabList>
                    <Tab>Activities</Tab>
                    <Tab>Assessment</Tab>
                    <Tab>Alerts</Tab>
                  </TabList>

                  <TabPanels>
                    {/* Activities Tab */}
                    <TabPanel px={0}>
                      <VStack spacing={3} align="stretch">
                        <Text fontWeight="semibold" color="purple.500">
                          <Icon as={FiActivity} mr={2} />
                          Today's Care Activities
                        </Text>
                        {patient.activities.map((activity, idx) => (
                          <Box
                            key={idx}
                            p={3}
                            bg="gray.50"
                            borderRadius="md"
                            borderLeft="4px"
                            borderLeftColor={`${getActivityColor(
                              activity.status,
                            )}.500`}
                          >
                            <HStack justify="space-between" mb={2}>
                              <HStack>
                                <Icon
                                  as={FiClock}
                                  w={4}
                                  h={4}
                                  color="gray.500"
                                />
                                <Text fontWeight="medium" fontSize="sm">
                                  {activity.time}
                                </Text>
                              </HStack>
                              <Badge
                                colorScheme={getActivityColor(activity.status)}
                                size="sm"
                              >
                                {activity.status}
                              </Badge>
                            </HStack>
                            <Text fontSize="sm" fontWeight="medium" mb={1}>
                              {activity.activity}
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                              {activity.notes}
                            </Text>
                          </Box>
                        ))}
                      </VStack>
                    </TabPanel>

                    {/* Assessment Tab */}
                    <TabPanel px={0}>
                      <VStack spacing={3} align="stretch">
                        <Text fontWeight="semibold" color="blue.500">
                          <Icon as={FiClipboard} mr={2} />
                          Latest Assessment
                        </Text>
                        {patient.assessments.map((assessment, idx) => (
                          <Box
                            key={idx}
                            p={3}
                            border="1px"
                            borderColor={borderColor}
                            borderRadius="md"
                          >
                            <HStack justify="space-between" mb={2}>
                              <Text fontWeight="medium" fontSize="sm">
                                {assessment.type}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {assessment.date}
                              </Text>
                            </HStack>
                            <VStack align="start" spacing={2}>
                              <Box>
                                <Text
                                  fontSize="xs"
                                  fontWeight="medium"
                                  color="gray.600"
                                  mb={1}
                                >
                                  Findings:
                                </Text>
                                <Text fontSize="sm">{assessment.findings}</Text>
                              </Box>
                              <Box>
                                <Text
                                  fontSize="xs"
                                  fontWeight="medium"
                                  color="gray.600"
                                  mb={1}
                                >
                                  Care Plan:
                                </Text>
                                <Text fontSize="sm">{assessment.plan}</Text>
                              </Box>
                            </VStack>
                          </Box>
                        ))}

                        {/* Patient Details */}
                        <Box p={3} bg="blue.50" borderRadius="md">
                          <Text fontWeight="semibold" mb={2} fontSize="sm">
                            Patient Information
                          </Text>
                          <SimpleGrid columns={2} spacing={2}>
                            <Text fontSize="xs">
                              <Text as="span" fontWeight="medium">
                                Condition:
                              </Text>{" "}
                              {patient.condition}
                            </Text>
                            <Text fontSize="xs">
                              <Text as="span" fontWeight="medium">
                                Admitted:
                              </Text>{" "}
                              {patient.admissionDate}
                            </Text>
                            <Text fontSize="xs">
                              <Text as="span" fontWeight="medium">
                                Primary Nurse:
                              </Text>{" "}
                              {patient.primaryNurse}
                            </Text>
                            <Text fontSize="xs">
                              <Text as="span" fontWeight="medium">
                                Gender:
                              </Text>{" "}
                              {patient.gender}
                            </Text>
                          </SimpleGrid>
                        </Box>
                      </VStack>
                    </TabPanel>

                    {/* Alerts Tab */}
                    <TabPanel px={0}>
                      <VStack spacing={3} align="stretch">
                        <Text fontWeight="semibold" color="red.500">
                          <Icon as={FiAlertCircle} mr={2} />
                          Care Alerts & Reminders
                        </Text>
                        {patient.alerts.map((alert, idx) => (
                          <Alert
                            key={idx}
                            status="warning"
                            size="sm"
                            borderRadius="md"
                          >
                            <AlertIcon boxSize="4" />
                            <Text fontSize="sm">{alert}</Text>
                          </Alert>
                        ))}

                        {/* Quick Actions */}
                        <Box mt={4}>
                          <Text fontWeight="semibold" mb={3} fontSize="sm">
                            Quick Actions
                          </Text>
                          <SimpleGrid columns={2} spacing={2}>
                            <Button
                              size="sm"
                              colorScheme="green"
                              leftIcon={<FiCheck />}
                              onClick={() =>
                                toast({
                                  title: "Activity Marked",
                                  description: `Marked next pending activity for ${patient.patientName} as completed`,
                                  status: "success",
                                  duration: 3000,
                                })
                              }
                            >
                              Mark Activity
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="blue"
                              leftIcon={<FiEdit />}
                              onClick={() =>
                                toast({
                                  title: "Update Care",
                                  description: `Care plan for ${patient.patientName} has been updated`,
                                  status: "info",
                                  duration: 3000,
                                })
                              }
                            >
                              Update Care
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="purple"
                              leftIcon={<FiFileText />}
                              onClick={() =>
                                toast({
                                  title: "Note Added",
                                  description: `Clinical note added to ${patient.patientName}'s chart`,
                                  status: "success",
                                  duration: 3000,
                                })
                              }
                            >
                              Add Note
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="orange"
                              leftIcon={<FiEye />}
                              onClick={() =>
                                toast({
                                  title: "Patient Details",
                                  description: `Viewing full record for ${patient.patientName} (${patient.patientId})`,
                                  status: "info",
                                  duration: 3000,
                                })
                              }
                            >
                              View Full
                            </Button>
                          </SimpleGrid>
                        </Box>
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </CardBody>
            </Card>
          ))}
      </SimpleGrid>

      {/* Add Care Plan Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Care Plan</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <SimpleGrid columns={2} spacing={4} w="full">
                <Box>
                  <Text mb={2} fontWeight="medium">
                    Patient
                  </Text>
                  <Select placeholder="Select patient">
                    <option value="P001">Sarah Johnson (P001)</option>
                    <option value="P002">Michael Brown (P002)</option>
                    <option value="P003">Emily Wilson (P003)</option>
                    <option value="P004">David Lee (P004)</option>
                  </Select>
                </Box>
                <Box>
                  <Text mb={2} fontWeight="medium">
                    Care Level
                  </Text>
                  <Select placeholder="Select care level">
                    <option value="Standard">Standard</option>
                    <option value="Intensive">Intensive</option>
                    <option value="Critical">Critical</option>
                  </Select>
                </Box>
              </SimpleGrid>
              <Box w="full">
                <Text mb={2} fontWeight="medium">
                  Care Activities
                </Text>
                <Textarea placeholder="Describe care activities and schedule..." />
              </Box>
              <Box w="full">
                <Text mb={2} fontWeight="medium">
                  Special Instructions
                </Text>
                <Textarea placeholder="Any special care instructions or alerts..." />
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="purple"
              onClick={() => {
                toast({
                  title: "Care Plan Created",
                  description: "New care plan has been added successfully",
                  status: "success",
                  duration: 3000,
                });
                onClose();
              }}
            >
              Create Care Plan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default NursePatientCare;
