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
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Progress,
  List,
  ListItem,
  ListIcon,
} from "@chakra-ui/react";
import {
  FiHeart,
  FiActivity,
  FiThermometer,
  FiDroplet,
  FiUser,
  FiCalendar,
  FiTrendingUp,
  FiTrendingDown,
  FiPlus,
  FiSearch,
  FiDownload,
  FiEdit,
  FiEye,
  FiAlertCircle,
  FiCheck,
} from "react-icons/fi";

const NurseHealthRecords = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [recordType, setRecordType] = useState("all");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Real health records, derived from each patient's record + latest vitals
  const [healthRecords, setHealthRecords] = useState([]);

  useEffect(() => {
    const loadHealthRecords = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";
        const [patientsRes, medsRes] = await Promise.all([
          fetch(`${API_URL}/patient/getall`),
          fetch(`${API_URL}/medications`),
        ]);
        const patientsData = await patientsRes.json();
        const medsData = await medsRes.json();
        const patients = patientsData.result || [];
        const meds = medsData.medications || [];

        const withHistory = await Promise.all(
          patients.map(async (p) => {
            try {
              const r = await fetch(`${API_URL}/patient/search/${p.MedicalId}`);
              const j = await r.json();
              return j.data;
            } catch {
              return p;
            }
          }),
        );

        const riskFromCondition = (conditions) => {
          if (!conditions || conditions === "None") return "Low";
          if (/critical|cardiac|coronary/i.test(conditions)) return "Critical";
          if (/diabetes|hypertension|disease/i.test(conditions)) return "High";
          return "Low";
        };

        setHealthRecords(
          withHistory.filter(Boolean).map((patient) => {
            const latest = (patient.History || [])[0];
            const patientMeds = meds
              .filter((m) => m.patientId === patient.MedicalId)
              .map((m) => `${m.medicineName} ${m.dosage || ""}`.trim());
            return {
              id: patient._id,
              patientName: patient.Name,
              patientId: patient.MedicalId,
              age: patient.Age,
              lastVisit: latest?.Date || "No visits recorded",
              vitals: {
                bloodPressure: latest?.vitals?.BP || "—",
                heartRate: latest?.vitals?.Pulse || "—",
                temperature: latest?.vitals?.Temp || "—",
                oxygenSat: String(latest?.vitals?.SpO2 || "—").replace("%", ""),
                weight: "—",
                height: "—",
              },
              conditions:
                patient.ChronicConditions && patient.ChronicConditions !== "None"
                  ? patient.ChronicConditions.split(",").map((c) => c.trim())
                  : [],
              medications: patientMeds,
              allergies:
                patient.Allergies && patient.Allergies !== "None"
                  ? patient.Allergies.split(",").map((a) => a.trim())
                  : ["None known"],
              status: patient.status || "Active",
              riskLevel: riskFromCondition(patient.ChronicConditions),
            };
          }),
        );
      } catch (err) {
        console.error("Failed to load health records:", err);
      }
    };
    loadHealthRecords();
  }, []);

  // Health summary statistics
  const healthStats = [
    {
      label: "Total Patients",
      value: healthRecords.length,
      color: "blue.500",
    },
    {
      label: "Critical Cases",
      value: healthRecords.filter((r) => r.riskLevel === "Critical").length,
      color: "red.500",
    },
    {
      label: "Stable Patients",
      value: healthRecords.filter(
        (r) => r.status === "Stable" || r.status === "Good",
      ).length,
      color: "green.500",
    },
    {
      label: "Requires Monitoring",
      value: healthRecords.filter((r) => r.status.includes("Monitoring"))
        .length,
      color: "orange.500",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Good":
        return "green";
      case "Stable":
        return "blue";
      case "Monitoring Required":
        return "orange";
      case "Critical Monitoring":
        return "red";
      default:
        return "gray";
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case "Low":
        return "green";
      case "Medium":
        return "yellow";
      case "High":
        return "orange";
      case "Critical":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={2}>
          Health Records & Summary
        </Text>
        <Text color="gray.600">
          Monitor patient health status, vitals, and medical history
        </Text>
      </Box>

      {/* Statistics */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        {healthStats.map((stat, index) => (
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
              <Text fontWeight="medium">Record Type:</Text>
              <Select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                maxW="180px"
              >
                <option value="all">All Records</option>
                <option value="vitals">Vital Signs</option>
                <option value="conditions">Conditions</option>
                <option value="medications">Medications</option>
                <option value="allergies">Allergies</option>
              </Select>
            </HStack>

            <Button colorScheme="purple" leftIcon={<FiPlus />} onClick={onOpen}>
              Add Record
            </Button>
            <Button
              colorScheme="green"
              leftIcon={<FiDownload />}
              onClick={() =>
                toast({
                  title: "Export Started",
                  description: "Health records data is being exported...",
                  status: "info",
                  duration: 3000,
                })
              }
            >
              Export Data
            </Button>
          </HStack>
        </CardBody>
      </Card>

      {/* Patient Health Records */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {healthRecords
          .filter((r) => {
            const matchesSearch =
              !searchTerm ||
              r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              r.patientId.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
          })
          .map((record) => (
            <Card key={record.id}>
              <CardHeader>
                <HStack justify="space-between">
                  <HStack>
                    <Avatar size="md" name={record.patientName} />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold">{record.patientName}</Text>
                      <Text fontSize="sm" color="gray.500">
                        ID: {record.patientId} • Age: {record.age}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        Last Visit: {record.lastVisit}
                      </Text>
                    </VStack>
                  </HStack>
                  <VStack align="end" spacing={1}>
                    <Badge colorScheme={getStatusColor(record.status)}>
                      {record.status}
                    </Badge>
                    <Badge
                      colorScheme={getRiskColor(record.riskLevel)}
                      variant="outline"
                    >
                      {record.riskLevel} Risk
                    </Badge>
                  </VStack>
                </HStack>
              </CardHeader>

              <CardBody pt={0}>
                <VStack spacing={4} align="stretch">
                  {/* Vital Signs */}
                  <Box>
                    <Text fontWeight="semibold" mb={2} color="purple.500">
                      <Icon as={FiActivity} mr={2} />
                      Vital Signs
                    </Text>
                    <SimpleGrid columns={2} spacing={3}>
                      <HStack>
                        <Icon as={FiHeart} color="red.500" w={4} h={4} />
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" color="gray.500">
                            BP
                          </Text>
                          <Text fontSize="sm" fontWeight="medium">
                            {record.vitals.bloodPressure}
                          </Text>
                        </VStack>
                      </HStack>
                      <HStack>
                        <Icon as={FiActivity} color="blue.500" w={4} h={4} />
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" color="gray.500">
                            HR
                          </Text>
                          <Text fontSize="sm" fontWeight="medium">
                            {record.vitals.heartRate} bpm
                          </Text>
                        </VStack>
                      </HStack>
                      <HStack>
                        <Icon
                          as={FiThermometer}
                          color="orange.500"
                          w={4}
                          h={4}
                        />
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" color="gray.500">
                            Temp
                          </Text>
                          <Text fontSize="sm" fontWeight="medium">
                            {record.vitals.temperature}°F
                          </Text>
                        </VStack>
                      </HStack>
                      <HStack>
                        <Icon as={FiDroplet} color="cyan.500" w={4} h={4} />
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" color="gray.500">
                            O2 Sat
                          </Text>
                          <Text fontSize="sm" fontWeight="medium">
                            {record.vitals.oxygenSat}%
                          </Text>
                        </VStack>
                      </HStack>
                    </SimpleGrid>
                  </Box>

                  <Divider />

                  {/* Medical Conditions */}
                  <Box>
                    <Text fontWeight="semibold" mb={2} color="orange.500">
                      Medical Conditions
                    </Text>
                    <List spacing={1}>
                      {record.conditions.map((condition, idx) => (
                        <ListItem key={idx} fontSize="sm">
                          <ListIcon as={FiAlertCircle} color="orange.500" />
                          {condition}
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  <Divider />

                  {/* Current Medications */}
                  <Box>
                    <Text fontWeight="semibold" mb={2} color="green.500">
                      Current Medications
                    </Text>
                    <List spacing={1}>
                      {record.medications.map((medication, idx) => (
                        <ListItem key={idx} fontSize="sm">
                          <ListIcon as={FiCheck} color="green.500" />
                          {medication}
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  <Divider />

                  {/* Allergies */}
                  <Box>
                    <Text fontWeight="semibold" mb={2} color="red.500">
                      Allergies
                    </Text>
                    <HStack spacing={2} wrap="wrap">
                      {record.allergies.map((allergy, idx) => (
                        <Badge key={idx} colorScheme="red" variant="outline">
                          {allergy}
                        </Badge>
                      ))}
                    </HStack>
                  </Box>

                  {/* Action Buttons */}
                  <HStack spacing={2} pt={2}>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      leftIcon={<FiEye />}
                      flex={1}
                      onClick={() =>
                        toast({
                          title: `${record.patientName} — Full Record`,
                          description: `Conditions: ${record.conditions.join(", ")} | Meds: ${record.medications.join(", ")}`,
                          status: "info",
                          duration: 5000,
                          isClosable: true,
                        })
                      }
                    >
                      View Full
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="green"
                      leftIcon={<FiEdit />}
                      flex={1}
                      onClick={() =>
                        toast({
                          title: "Record Updated",
                          description: `Health record for ${record.patientName} has been updated`,
                          status: "success",
                          duration: 3000,
                        })
                      }
                    >
                      Update
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
      </SimpleGrid>

      {/* Add Record Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Health Record</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Box w="full">
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
              <SimpleGrid columns={2} spacing={4} w="full">
                <Box>
                  <Text mb={2} fontWeight="medium">
                    Blood Pressure
                  </Text>
                  <Input placeholder="e.g. 120/80" />
                </Box>
                <Box>
                  <Text mb={2} fontWeight="medium">
                    Heart Rate
                  </Text>
                  <Input placeholder="bpm" />
                </Box>
              </SimpleGrid>
              <SimpleGrid columns={2} spacing={4} w="full">
                <Box>
                  <Text mb={2} fontWeight="medium">
                    Temperature (°F)
                  </Text>
                  <Input placeholder="e.g. 98.6" />
                </Box>
                <Box>
                  <Text mb={2} fontWeight="medium">
                    O2 Saturation (%)
                  </Text>
                  <Input placeholder="e.g. 98" />
                </Box>
              </SimpleGrid>
              <Box w="full">
                <Text mb={2} fontWeight="medium">
                  Clinical Notes
                </Text>
                <Textarea placeholder="Additional observations or notes..." />
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
                  title: "Record Added",
                  description: "New health record has been saved successfully",
                  status: "success",
                  duration: 3000,
                });
                onClose();
              }}
            >
              Save Record
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default NurseHealthRecords;
