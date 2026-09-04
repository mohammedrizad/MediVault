import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Avatar,
  useColorModeValue,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Select,
  InputGroup,
  InputLeftElement,
  Flex,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  useToast,
} from "@chakra-ui/react";
import {
  FiUsers,
  FiSearch,
  FiFilter,
  FiEye,
  FiFileText,
  FiCalendar,
  FiPhone,
  FiMail,
  FiMapPin,
  FiActivity,
  FiHeart,
  FiAlertTriangle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const MyPatients = () => {
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();
  const toast = useToast();

  // Mock patient data
  const [patients, setPatients] = useState([
    {
      id: 1,
      name: "John Smith",
      age: 45,
      gender: "Male",
      condition: "Hypertension",
      status: "Active",
      lastVisit: "2024-10-28",
      nextAppointment: "2024-11-15",
      phone: "+1 234-567-8901",
      email: "john.smith@email.com",
      address: "123 Main St, City, State",
      bloodGroup: "A+",
      allergies: ["Penicillin", "Shellfish"],
      medications: ["Lisinopril 10mg", "Metformin 500mg"],
      vitals: {
        bp: "140/90",
        pulse: "75",
        temp: "98.6°F",
        weight: "185 lbs",
      },
      diagnosis: "Essential Hypertension, Type 2 Diabetes",
      notes:
        "Patient responding well to current medication. Monitor BP regularly.",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      age: 32,
      gender: "Female",
      condition: "Asthma",
      status: "Active",
      lastVisit: "2024-10-25",
      nextAppointment: "2024-12-01",
      phone: "+1 234-567-8902",
      email: "sarah.johnson@email.com",
      address: "456 Oak Ave, City, State",
      bloodGroup: "O-",
      allergies: ["Dust mites", "Pollen"],
      medications: ["Albuterol inhaler", "Fluticasone"],
      vitals: {
        bp: "120/80",
        pulse: "68",
        temp: "98.4°F",
        weight: "125 lbs",
      },
      diagnosis: "Allergic Asthma",
      notes: "Seasonal symptoms improving with current treatment plan.",
    },
    {
      id: 3,
      name: "Michael Brown",
      age: 58,
      gender: "Male",
      condition: "Diabetes",
      status: "Follow-up",
      lastVisit: "2024-10-20",
      nextAppointment: "2024-11-10",
      phone: "+1 234-567-8903",
      email: "michael.brown@email.com",
      address: "789 Pine St, City, State",
      bloodGroup: "B+",
      allergies: ["None known"],
      medications: ["Insulin", "Metformin 1000mg"],
      vitals: {
        bp: "130/85",
        pulse: "72",
        temp: "98.2°F",
        weight: "210 lbs",
      },
      diagnosis: "Type 1 Diabetes Mellitus",
      notes: "HbA1c levels need monitoring. Adjust insulin dosage as needed.",
    },
    {
      id: 4,
      name: "Emily Davis",
      age: 28,
      gender: "Female",
      condition: "Migraine",
      status: "Active",
      lastVisit: "2024-10-30",
      nextAppointment: "2024-11-20",
      phone: "+1 234-567-8904",
      email: "emily.davis@email.com",
      address: "321 Elm St, City, State",
      bloodGroup: "AB+",
      allergies: ["Aspirin"],
      medications: ["Sumatriptan", "Propranolol"],
      vitals: {
        bp: "115/75",
        pulse: "65",
        temp: "98.8°F",
        weight: "135 lbs",
      },
      diagnosis: "Chronic Migraine",
      notes:
        "Frequency reduced with preventive medication. Continue current regimen.",
    },
  ]);

  // Filter patients based on search and status
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      patient.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    onOpen();
  };

  const handleScheduleAppointment = (patientId) => {
    navigate(`/doctor/appointments?patient=${patientId}`);
    toast({
      title: "Redirecting to Appointments",
      description: "You can schedule a new appointment for this patient.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleViewRecords = (patientId) => {
    navigate(`/doctor/records?patient=${patientId}`);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "green";
      case "follow-up":
        return "yellow";
      case "critical":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>
            My Patients
          </Heading>
          <Text color="gray.600">Manage and view your assigned patients</Text>
        </Box>

        {/* Stats Cards */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={6}>
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <HStack>
                <Icon as={FiUsers} w={8} h={8} color="blue.500" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="2xl" fontWeight="bold">
                    {patients.length}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Total Patients
                  </Text>
                </VStack>
              </HStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <HStack>
                <Icon as={FiActivity} w={8} h={8} color="green.500" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="2xl" fontWeight="bold">
                    {patients.filter((p) => p.status === "Active").length}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Active Cases
                  </Text>
                </VStack>
              </HStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <HStack>
                <Icon as={FiCalendar} w={8} h={8} color="orange.500" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="2xl" fontWeight="bold">
                    {patients.filter((p) => p.status === "Follow-up").length}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Follow-ups
                  </Text>
                </VStack>
              </HStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <HStack>
                <Icon as={FiAlertTriangle} w={8} h={8} color="red.500" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="2xl" fontWeight="bold">
                    0
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Critical Cases
                  </Text>
                </VStack>
              </HStack>
            </CardBody>
          </Card>
        </Grid>

        {/* Search and Filter */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <HStack spacing={4}>
              <InputGroup flex="1">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search patients by name or condition..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              <Select
                placeholder="All Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                w="200px"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="follow-up">Follow-up</option>
                <option value="critical">Critical</option>
              </Select>
            </HStack>
          </CardBody>
        </Card>

        {/* Patients Table */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Patient List</Heading>
          </CardHeader>
          <CardBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Patient</Th>
                  <Th>Age/Gender</Th>
                  <Th>Condition</Th>
                  <Th>Status</Th>
                  <Th>Last Visit</Th>
                  <Th>Next Appointment</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredPatients.map((patient) => (
                  <Tr key={patient.id}>
                    <Td>
                      <HStack>
                        <Avatar size="sm" name={patient.name} />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">{patient.name}</Text>
                          <Text fontSize="sm" color="gray.500">
                            {patient.email}
                          </Text>
                        </VStack>
                      </HStack>
                    </Td>
                    <Td>
                      <Text>{patient.age} years</Text>
                      <Text fontSize="sm" color="gray.500">
                        {patient.gender}
                      </Text>
                    </Td>
                    <Td>{patient.condition}</Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(patient.status)}>
                        {patient.status}
                      </Badge>
                    </Td>
                    <Td>{patient.lastVisit}</Td>
                    <Td>{patient.nextAppointment}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          leftIcon={<FiEye />}
                          onClick={() => handleViewPatient(patient)}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<FiFileText />}
                          onClick={() => handleViewRecords(patient.id)}
                        >
                          Records
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="green"
                          leftIcon={<FiCalendar />}
                          onClick={() => handleScheduleAppointment(patient.id)}
                        >
                          Schedule
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </VStack>

      {/* Patient Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Patient Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedPatient && (
              <Tabs>
                <TabList>
                  <Tab>Overview</Tab>
                  <Tab>Medical Info</Tab>
                  <Tab>Contact Details</Tab>
                  <Tab>Vitals</Tab>
                </TabList>

                <TabPanels>
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <HStack spacing={6}>
                        <Avatar size="xl" name={selectedPatient.name} />
                        <VStack align="start" spacing={1}>
                          <Heading size="lg">{selectedPatient.name}</Heading>
                          <Text color="gray.600">
                            {selectedPatient.age} years old,{" "}
                            {selectedPatient.gender}
                          </Text>
                          <Badge
                            colorScheme={getStatusColor(selectedPatient.status)}
                          >
                            {selectedPatient.status}
                          </Badge>
                        </VStack>
                      </HStack>

                      <Divider />

                      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                        <Box>
                          <Text fontWeight="bold" mb={2}>
                            Primary Condition
                          </Text>
                          <Text>{selectedPatient.condition}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold" mb={2}>
                            Blood Group
                          </Text>
                          <Text>{selectedPatient.bloodGroup}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold" mb={2}>
                            Last Visit
                          </Text>
                          <Text>{selectedPatient.lastVisit}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold" mb={2}>
                            Next Appointment
                          </Text>
                          <Text>{selectedPatient.nextAppointment}</Text>
                        </Box>
                      </Grid>

                      <Box>
                        <Text fontWeight="bold" mb={2}>
                          Current Diagnosis
                        </Text>
                        <Text>{selectedPatient.diagnosis}</Text>
                      </Box>

                      <Box>
                        <Text fontWeight="bold" mb={2}>
                          Doctor's Notes
                        </Text>
                        <Text color="gray.600">{selectedPatient.notes}</Text>
                      </Box>
                    </VStack>
                  </TabPanel>

                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Text fontWeight="bold" mb={2}>
                          Allergies
                        </Text>
                        <HStack wrap="wrap">
                          {selectedPatient.allergies.map((allergy, idx) => (
                            <Badge
                              key={idx}
                              colorScheme="red"
                              variant="outline"
                            >
                              {allergy}
                            </Badge>
                          ))}
                        </HStack>
                      </Box>

                      <Box>
                        <Text fontWeight="bold" mb={2}>
                          Current Medications
                        </Text>
                        <VStack align="start" spacing={2}>
                          {selectedPatient.medications.map((med, idx) => (
                            <HStack key={idx}>
                              <Icon as={FiHeart} color="green.500" />
                              <Text>{med}</Text>
                            </HStack>
                          ))}
                        </VStack>
                      </Box>
                    </VStack>
                  </TabPanel>

                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <HStack>
                        <Icon as={FiPhone} color="blue.500" />
                        <Text>{selectedPatient.phone}</Text>
                      </HStack>
                      <HStack>
                        <Icon as={FiMail} color="green.500" />
                        <Text>{selectedPatient.email}</Text>
                      </HStack>
                      <HStack align="start">
                        <Icon as={FiMapPin} color="red.500" mt={1} />
                        <Text>{selectedPatient.address}</Text>
                      </HStack>
                    </VStack>
                  </TabPanel>

                  <TabPanel>
                    <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                      <Box>
                        <Text fontWeight="bold" mb={2}>
                          Blood Pressure
                        </Text>
                        <Text fontSize="lg">
                          {selectedPatient.vitals.bp} mmHg
                        </Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" mb={2}>
                          Pulse Rate
                        </Text>
                        <Text fontSize="lg">
                          {selectedPatient.vitals.pulse} bpm
                        </Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" mb={2}>
                          Temperature
                        </Text>
                        <Text fontSize="lg">{selectedPatient.vitals.temp}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" mb={2}>
                          Weight
                        </Text>
                        <Text fontSize="lg">
                          {selectedPatient.vitals.weight}
                        </Text>
                      </Box>
                    </Grid>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MyPatients;
