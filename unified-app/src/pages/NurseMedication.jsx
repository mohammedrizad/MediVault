import React, { useState, useEffect } from "react";
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
} from "@chakra-ui/react";
import {
  FiHeart,
  FiClock,
  FiAlertCircle,
  FiCheck,
  FiX,
  FiUser,
  FiCalendar,
  FiPlus,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiBell,
  FiActivity,
  FiDroplet,
} from "react-icons/fi";
import dataService from "../services/DataService";

const NurseMedication = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const [medicationData, setMedicationData] = useState([]);
  const [patientsList, setPatientsList] = useState([]);
  const [newMed, setNewMed] = useState({
    patientId: "",
    medicineName: "",
    dosage: "",
    frequency: "",
    notes: "",
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";
        const res = await fetch(`${API_URL}/pews/pews-patients`);
        const data = await res.json();
        setPatientsList(data.patients || []);
      } catch (err) {
        console.error("Failed to load patients:", err);
      }
    };
    fetchPatients();
  }, []);

  const handleAddMedication = async () => {
    if (!newMed.patientId || !newMed.medicineName) {
      toast({
        title: "Missing fields",
        description: "Please select a patient and enter a medication name.",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    const patient = patientsList.find((p) => p.id === newMed.patientId);
    try {
      await dataService.addMedication({
        patientId: patient?.medicalId || newMed.patientId,
        patientName: patient?.name || "",
        medicineName: newMed.medicineName,
        dosage: newMed.dosage,
        frequency: newMed.frequency,
        notes: newMed.notes,
        status: "Active",
        startDate: new Date().toISOString().split("T")[0],
      });
      toast({
        title: "Medication Added",
        description: "New medication has been added to the patient's schedule",
        status: "success",
        duration: 3000,
      });
      setNewMed({ patientId: "", medicineName: "", dosage: "", frequency: "", notes: "" });
      onClose();
      loadMedications();
    } catch (err) {
      toast({
        title: "Failed to add medication",
        description: err.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const loadMedications = async () => {
    const meds = await dataService.getMedications();
    const grouped = {};
    meds.forEach((m) => {
      if (!grouped[m.patientId]) {
        grouped[m.patientId] = {
          id: m.patientId,
          patientName: m.patientName,
          patientId: m.patientId,
          medications: [],
        };
      }
      grouped[m.patientId].medications.push({
        _id: m._id,
        name: m.medicineName,
        dosage: m.dosage,
        frequency: m.frequency,
        timing: [],
        startDate: m.startDate,
        endDate: m.endDate || "Ongoing",
        status: m.status,
        taken: m.status === "Completed",
        nextDose: m.status === "Active" ? "As scheduled" : "N/A",
        instructions: m.notes,
        prescribedBy: m.prescribedBy,
        condition: m.notes,
      });
    });
    setMedicationData(Object.values(grouped));
  };

  useEffect(() => {
    loadMedications();
  }, []);

  // Calculate medication statistics
  const allMedications = medicationData.flatMap((patient) =>
    patient.medications.map((med) => ({
      ...med,
      patientName: patient.patientName,
      patientId: patient.patientId,
    })),
  );

  const medicationStats = [
    {
      label: "Total Medications",
      value: allMedications.length,
      color: "blue.500",
    },
    {
      label: "Active",
      value: allMedications.filter((m) => m.status === "Active").length,
      color: "green.500",
    },
    {
      label: "Missed Doses",
      value: allMedications.filter((m) => m.status === "Missed").length,
      color: "red.500",
    },
    {
      label: "Due Today",
      value: allMedications.filter(
        (m) => m.status === "Active" && m.timing.some((time) => time !== "PRN"),
      ).length,
      color: "orange.500",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "green";
      case "Missed":
        return "red";
      case "Discontinued":
        return "gray";
      case "Completed":
        return "blue";
      default:
        return "gray";
    }
  };

  const getMedicationAlerts = () => {
    const missedMeds = allMedications.filter((m) => m.status === "Missed");
    const dueMeds = allMedications.filter(
      (m) =>
        m.status === "Active" &&
        !m.taken &&
        m.timing.some((time) => {
          const now = new Date();
          const currentTime =
            now.getHours() + ":" + String(now.getMinutes()).padStart(2, "0");
          return time <= currentTime && time !== "PRN";
        }),
    );

    return [...missedMeds, ...dueMeds];
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={2}>
          Medication Management
        </Text>
        <Text color="gray.600">
          Track and manage patient medications, dosages, and schedules
        </Text>
      </Box>

      {/* Medication Alerts */}
      {getMedicationAlerts().length > 0 && (
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Medication Alerts!</AlertTitle>
            <AlertDescription>
              {getMedicationAlerts().length} medication(s) require attention -
              missed doses or overdue medications.
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {/* Statistics */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        {medicationStats.map((stat, index) => (
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
                placeholder="Search medications or patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                maxW="300px"
              />
            </HStack>

            <HStack>
              <Text fontWeight="medium">Status:</Text>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                maxW="150px"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Missed">Missed</option>
                <option value="Discontinued">Discontinued</option>
              </Select>
            </HStack>

            <Button colorScheme="purple" leftIcon={<FiPlus />} onClick={onOpen}>
              Add Medication
            </Button>
          </HStack>
        </CardBody>
      </Card>

      {/* Patient Medication Cards */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {medicationData
          .filter((patient) => {
            const matchesSearch =
              !searchTerm ||
              patient.patientName
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              patient.patientId
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              patient.medications.some((m) =>
                m.name.toLowerCase().includes(searchTerm.toLowerCase()),
              );
            const matchesStatus =
              statusFilter === "all" ||
              patient.medications.some((m) => m.status === statusFilter);
            return matchesSearch && matchesStatus;
          })
          .map((patient) => (
            <Card key={patient.id}>
              <CardHeader>
                <HStack justify="space-between">
                  <HStack>
                    <Avatar size="md" name={patient.patientName} />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold">{patient.patientName}</Text>
                      <Text fontSize="sm" color="gray.500">
                        ID: {patient.patientId}
                      </Text>
                      <Badge colorScheme="purple" variant="outline">
                        {patient.medications.length} medications
                      </Badge>
                    </VStack>
                  </HStack>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    variant="outline"
                    onClick={() =>
                      toast({
                        title: `${patient.patientName} — Schedule`,
                        description: `${patient.medications.length} medication(s): ${patient.medications.map((m) => `${m.name} (${m.timing.join(", ")})`).join(" | ")}`,
                        status: "info",
                        duration: 5000,
                        isClosable: true,
                      })
                    }
                  >
                    View Schedule
                  </Button>
                </HStack>
              </CardHeader>

              <CardBody pt={0}>
                <VStack spacing={4} align="stretch">
                  {patient.medications.map((medication, idx) => (
                    <Box
                      key={idx}
                      p={4}
                      border="1px"
                      borderColor={borderColor}
                      borderRadius="md"
                    >
                      <HStack justify="space-between" mb={3}>
                        <HStack>
                          <Icon as={FiHeart} color="purple.500" w={5} h={5} />
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="bold">{medication.name}</Text>
                            <Text fontSize="sm" color="gray.500">
                              {medication.dosage} • {medication.frequency}
                            </Text>
                          </VStack>
                        </HStack>
                        <Badge colorScheme={getStatusColor(medication.status)}>
                          {medication.status}
                        </Badge>
                      </HStack>

                      <VStack spacing={2} align="stretch">
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">
                            <Icon as={FiClock} mr={1} />
                            Next Dose:
                          </Text>
                          <Text fontSize="sm" fontWeight="medium">
                            {medication.nextDose}
                          </Text>
                        </HStack>

                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">
                            Condition:
                          </Text>
                          <Badge colorScheme="gray" variant="outline">
                            {medication.condition}
                          </Badge>
                        </HStack>

                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">
                            Prescribed by:
                          </Text>
                          <Text fontSize="sm" fontWeight="medium">
                            {medication.prescribedBy}
                          </Text>
                        </HStack>

                        <Box>
                          <Text fontSize="sm" color="gray.600" mb={1}>
                            Instructions:
                          </Text>
                          <Text
                            fontSize="sm"
                            bg="gray.50"
                            p={2}
                            borderRadius="md"
                          >
                            {medication.instructions}
                          </Text>
                        </Box>

                        {/* Medication Timeline */}
                        <Box>
                          <Text fontSize="sm" color="gray.600" mb={2}>
                            Daily Schedule:
                          </Text>
                          <HStack spacing={2} wrap="wrap">
                            {medication.timing.map((time, timeIdx) => (
                              <Badge
                                key={timeIdx}
                                colorScheme={
                                  medication.taken ? "green" : "orange"
                                }
                                variant={medication.taken ? "solid" : "outline"}
                              >
                                {time}
                                {medication.taken && (
                                  <Icon as={FiCheck} ml={1} w={3} h={3} />
                                )}
                              </Badge>
                            ))}
                          </HStack>
                        </Box>

                        {/* Action Buttons */}
                        <HStack spacing={2} pt={2}>
                          <Button
                            size="sm"
                            colorScheme="green"
                            leftIcon={<FiCheck />}
                            flex={1}
                            onClick={async () => {
                              try {
                                await dataService.updateMedication(medication._id, {
                                  status: "Completed",
                                });
                                toast({
                                  title: "Medication Taken",
                                  description: `${medication.name} ${medication.dosage} marked as taken for ${patient.patientName}`,
                                  status: "success",
                                  duration: 3000,
                                });
                                loadMedications();
                              } catch (err) {
                                toast({
                                  title: "Failed to update",
                                  description: err.message,
                                  status: "error",
                                  duration: 3000,
                                });
                              }
                            }}
                          >
                            Mark Taken
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="outline"
                            leftIcon={<FiTrash2 />}
                            onClick={async () => {
                              try {
                                await dataService.deleteMedication(medication._id);
                                toast({
                                  title: "Medication Removed",
                                  description: `${medication.name} has been removed from ${patient.patientName}'s list`,
                                  status: "warning",
                                  duration: 3000,
                                });
                                loadMedications();
                              } catch (err) {
                                toast({
                                  title: "Failed to remove",
                                  description: err.message,
                                  status: "error",
                                  duration: 3000,
                                });
                              }
                            }}
                          >
                            Remove
                          </Button>
                        </HStack>
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          ))}
      </SimpleGrid>

      {/* Add Medication Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Medication</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <SimpleGrid columns={2} spacing={4} w="full">
                <Box>
                  <Text mb={2} fontWeight="medium">
                    Patient
                  </Text>
                  <Select
                    placeholder="Select patient"
                    value={newMed.patientId}
                    onChange={(e) => setNewMed({ ...newMed, patientId: e.target.value })}
                  >
                    {patientsList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.medicalId ? `(${p.medicalId})` : ""}
                      </option>
                    ))}
                  </Select>
                </Box>
                <Box>
                  <Text mb={2} fontWeight="medium">
                    Medication Name
                  </Text>
                  <Input
                    placeholder="Enter medication name"
                    value={newMed.medicineName}
                    onChange={(e) => setNewMed({ ...newMed, medicineName: e.target.value })}
                  />
                </Box>
                <Box>
                  <Text mb={2} fontWeight="medium">
                    Dosage
                  </Text>
                  <Input
                    placeholder="e.g., 10mg"
                    value={newMed.dosage}
                    onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                  />
                </Box>
                <Box>
                  <Text mb={2} fontWeight="medium">
                    Frequency
                  </Text>
                  <Select
                    placeholder="Select frequency"
                    value={newMed.frequency}
                    onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                  >
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="Three times daily">Three times daily</option>
                    <option value="As needed">As needed</option>
                  </Select>
                </Box>
              </SimpleGrid>
              <Box w="full">
                <Text mb={2} fontWeight="medium">
                  Instructions
                </Text>
                <Textarea
                  placeholder="Special instructions for taking this medication"
                  value={newMed.notes}
                  onChange={(e) => setNewMed({ ...newMed, notes: e.target.value })}
                />
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="purple" onClick={handleAddMedication}>
              Add Medication
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default NurseMedication;
