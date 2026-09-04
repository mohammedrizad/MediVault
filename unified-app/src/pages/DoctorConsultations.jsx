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
  useToast,
  FormControl,
  FormLabel,
  Textarea,
  Avatar,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import {
  FiActivity,
  FiSearch,
  FiPlus,
  FiEye,
  FiEdit,
  FiClock,
  FiUser,
  FiFileText,
  FiHeart,
  FiThermometer,
  FiTrendingUp,
  FiVideo,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";

const DoctorConsultations = () => {
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [patientsList, setPatientsList] = useState([]);
  const toast = useToast();

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch(`${API_URL}/pews/pews-patients`);
        if (!res.ok) throw new Error("Failed to fetch patients");
        const data = await res.json();
        setPatientsList(data.patients || []);
      } catch (err) {
        console.error("Failed to load patients:", err);
      }
    };
    fetchPatients();
  }, [API_URL]);

  // Real consultations, derived from this doctor's appointments + the
  // patient's clinical History (disease/vitals/notes/prescription)
  const [consultations, setConsultations] = useState([]);

  useEffect(() => {
    const loadConsultations = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        const doctorId = userData.id;
        if (!doctorId) return;

        const apptRes = await fetch(`${API_URL}/appointments?doctorId=${doctorId}`);
        const apptJson = await apptRes.json();
        const appts = apptJson.appointments || [];

        const enriched = await Promise.all(
          appts.map(async (a) => {
            let clinical = {};
            try {
              const pRes = await fetch(`${API_URL}/patient/search/${a.patientId}`);
              const pJson = await pRes.json();
              const latestHistory = (pJson.data?.History || [])[0];
              clinical = {
                patientAge: pJson.data?.Age,
                diagnosis: latestHistory?.disease || "",
                vitals: latestHistory?.vitals || {},
                notes: latestHistory?.notes || "",
                prescription: latestHistory?.preciption || [],
              };
            } catch (e) {
              // keep defaults if patient lookup fails
            }
            return {
              id: a._id,
              patientId: a.patientId,
              patientName: a.patientName,
              patientAge: clinical.patientAge || "",
              date: a.date,
              time: a.time,
              duration: a.duration,
              type: a.location || "In-Person",
              status: a.status,
              chiefComplaint: a.reason || "",
              symptoms: [],
              diagnosis: clinical.diagnosis || a.type,
              treatment: "",
              vitals: clinical.vitals || {},
              prescription: clinical.prescription || [],
              followUp: "",
              notes: clinical.notes || a.notes || "",
              nextAppointment: "",
            };
          }),
        );
        setConsultations(enriched);
      } catch (err) {
        console.error("Failed to load consultations:", err);
      }
    };
    loadConsultations();
  }, [API_URL]);

  // Filter consultations
  const filteredConsultations = consultations.filter((consultation) => {
    const matchesSearch =
      consultation.patientName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      consultation.chiefComplaint
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      consultation.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      consultation.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesType =
      filterType === "all" ||
      consultation.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleViewConsultation = (consultation) => {
    setSelectedConsultation(consultation);
    onOpen();
  };

  const handleStatusChange = (consultationId, newStatus) => {
    setConsultations(
      consultations.map((cons) =>
        cons.id === consultationId ? { ...cons, status: newStatus } : cons,
      ),
    );
    toast({
      title: "Status Updated",
      description: `Consultation status changed to ${newStatus}`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "green";
      case "in progress":
        return "blue";
      case "scheduled":
        return "yellow";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  const getTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case "in-person":
        return "blue";
      case "telemedicine":
        return "green";
      case "emergency":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Box>
            <Heading size="lg" mb={2}>
              Consultations
            </Heading>
            <Text color="gray.600">
              Manage patient consultations and medical assessments
            </Text>
          </Box>
          <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onAddOpen}>
            New Consultation
          </Button>
        </Flex>

        {/* Stats Cards */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={6}>
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <HStack>
                <Icon as={FiActivity} w={8} h={8} color="blue.500" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="2xl" fontWeight="bold">
                    {consultations.length}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Total Consultations
                  </Text>
                </VStack>
              </HStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <HStack>
                <Icon as={FiClock} w={8} h={8} color="green.500" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="2xl" fontWeight="bold">
                    {
                      consultations.filter((c) => c.status === "Completed")
                        .length
                    }
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Completed
                  </Text>
                </VStack>
              </HStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <HStack>
                <Icon as={FiVideo} w={8} h={8} color="purple.500" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="2xl" fontWeight="bold">
                    {
                      consultations.filter((c) => c.type === "Telemedicine")
                        .length
                    }
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Telemedicine
                  </Text>
                </VStack>
              </HStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <HStack>
                <Icon as={FiMapPin} w={8} h={8} color="orange.500" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="2xl" fontWeight="bold">
                    {consultations.filter((c) => c.type === "In-Person").length}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    In-Person
                  </Text>
                </VStack>
              </HStack>
            </CardBody>
          </Card>
        </Grid>

        {/* Search and Filter */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Grid templateColumns={{ base: "1fr", md: "2fr 1fr 1fr" }} gap={4}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search consultations by patient, complaint, or diagnosis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              <Select
                placeholder="All Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="in progress">In Progress</option>
                <option value="scheduled">Scheduled</option>
                <option value="cancelled">Cancelled</option>
              </Select>
              <Select
                placeholder="All Types"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="in-person">In-Person</option>
                <option value="telemedicine">Telemedicine</option>
                <option value="emergency">Emergency</option>
              </Select>
            </Grid>
          </CardBody>
        </Card>

        {/* Consultations Table */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Recent Consultations</Heading>
          </CardHeader>
          <CardBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Patient</Th>
                  <Th>Date & Time</Th>
                  <Th>Type</Th>
                  <Th>Chief Complaint</Th>
                  <Th>Diagnosis</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredConsultations.map((consultation) => (
                  <Tr key={consultation.id}>
                    <Td>
                      <HStack>
                        <Avatar size="sm" name={consultation.patientName} />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">
                            {consultation.patientName}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {consultation.patientAge} years
                          </Text>
                        </VStack>
                      </HStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">{consultation.date}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {consultation.time}
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          {consultation.duration}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Badge colorScheme={getTypeColor(consultation.type)}>
                        {consultation.type}
                      </Badge>
                    </Td>
                    <Td>
                      <Text maxW="200px" isTruncated>
                        {consultation.chiefComplaint}
                      </Text>
                    </Td>
                    <Td>
                      <Text maxW="150px" isTruncated>
                        {consultation.diagnosis}
                      </Text>
                    </Td>
                    <Td>
                      <Select
                        size="sm"
                        value={consultation.status}
                        onChange={(e) =>
                          handleStatusChange(consultation.id, e.target.value)
                        }
                        w="130px"
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </Select>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          leftIcon={<FiEye />}
                          onClick={() => handleViewConsultation(consultation)}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<FiEdit />}
                          colorScheme="blue"
                        >
                          Edit
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

      {/* View Consultation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Consultation Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedConsultation && (
              <Tabs>
                <TabList>
                  <Tab>Overview</Tab>
                  <Tab>Vitals</Tab>
                  <Tab>Assessment</Tab>
                  <Tab>Treatment</Tab>
                  <Tab>Prescription</Tab>
                  <Tab>Follow-up</Tab>
                </TabList>

                <TabPanels>
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <HStack spacing={6}>
                        <Avatar
                          size="xl"
                          name={selectedConsultation.patientName}
                        />
                        <VStack align="start" spacing={1}>
                          <Heading size="lg">
                            {selectedConsultation.patientName}
                          </Heading>
                          <Text color="gray.600">
                            {selectedConsultation.patientAge} years old
                          </Text>
                          <HStack>
                            <Badge
                              colorScheme={getStatusColor(
                                selectedConsultation.status,
                              )}
                            >
                              {selectedConsultation.status}
                            </Badge>
                            <Badge
                              colorScheme={getTypeColor(
                                selectedConsultation.type,
                              )}
                            >
                              {selectedConsultation.type}
                            </Badge>
                          </HStack>
                        </VStack>
                      </HStack>

                      <Divider />

                      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                        <Box>
                          <Text fontWeight="bold" mb={2}>
                            Date & Time
                          </Text>
                          <Text>
                            {selectedConsultation.date} at{" "}
                            {selectedConsultation.time}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            Duration: {selectedConsultation.duration}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold" mb={2}>
                            Consultation Type
                          </Text>
                          <Text>{selectedConsultation.type}</Text>
                        </Box>
                      </Grid>

                      <Box>
                        <Text fontWeight="bold" mb={2}>
                          Chief Complaint
                        </Text>
                        <Text color="gray.600">
                          {selectedConsultation.chiefComplaint}
                        </Text>
                      </Box>

                      <Box>
                        <Text fontWeight="bold" mb={2}>
                          Symptoms
                        </Text>
                        <HStack wrap="wrap">
                          {selectedConsultation.symptoms.map((symptom, idx) => (
                            <Badge
                              key={idx}
                              colorScheme="orange"
                              variant="outline"
                            >
                              {symptom}
                            </Badge>
                          ))}
                        </HStack>
                      </Box>
                    </VStack>
                  </TabPanel>

                  <TabPanel>
                    <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                      <Card>
                        <CardBody textAlign="center">
                          <Icon
                            as={FiHeart}
                            w={8}
                            h={8}
                            color="red.500"
                            mb={2}
                          />
                          <Text fontWeight="bold">Blood Pressure</Text>
                          <Text fontSize="2xl">
                            {selectedConsultation.vitals.bp}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            mmHg
                          </Text>
                        </CardBody>
                      </Card>
                      <Card>
                        <CardBody textAlign="center">
                          <Icon
                            as={FiActivity}
                            w={8}
                            h={8}
                            color="blue.500"
                            mb={2}
                          />
                          <Text fontWeight="bold">Pulse Rate</Text>
                          <Text fontSize="2xl">
                            {selectedConsultation.vitals.pulse}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            bpm
                          </Text>
                        </CardBody>
                      </Card>
                      <Card>
                        <CardBody textAlign="center">
                          <Icon
                            as={FiThermometer}
                            w={8}
                            h={8}
                            color="orange.500"
                            mb={2}
                          />
                          <Text fontWeight="bold">Temperature</Text>
                          <Text fontSize="2xl">
                            {selectedConsultation.vitals.temp}
                          </Text>
                        </CardBody>
                      </Card>
                      <Card>
                        <CardBody textAlign="center">
                          <Icon
                            as={FiTrendingUp}
                            w={8}
                            h={8}
                            color="green.500"
                            mb={2}
                          />
                          <Text fontWeight="bold">Weight</Text>
                          <Text fontSize="2xl">
                            {selectedConsultation.vitals.weight}
                          </Text>
                        </CardBody>
                      </Card>
                      <Card>
                        <CardBody textAlign="center">
                          <Icon
                            as={FiUser}
                            w={8}
                            h={8}
                            color="purple.500"
                            mb={2}
                          />
                          <Text fontWeight="bold">Height</Text>
                          <Text fontSize="2xl">
                            {selectedConsultation.vitals.height}
                          </Text>
                        </CardBody>
                      </Card>
                      <Card>
                        <CardBody textAlign="center">
                          <Icon
                            as={FiActivity}
                            w={8}
                            h={8}
                            color="cyan.500"
                            mb={2}
                          />
                          <Text fontWeight="bold">Oxygen Saturation</Text>
                          <Text fontSize="2xl">
                            {selectedConsultation.vitals.oxygen}
                          </Text>
                        </CardBody>
                      </Card>
                    </Grid>
                  </TabPanel>

                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Text fontWeight="bold" mb={2}>
                          Diagnosis
                        </Text>
                        <Text color="gray.600">
                          {selectedConsultation.diagnosis}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" mb={2}>
                          Assessment Notes
                        </Text>
                        <Text color="gray.600">
                          {selectedConsultation.notes}
                        </Text>
                      </Box>
                    </VStack>
                  </TabPanel>

                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Text fontWeight="bold" mb={2}>
                          Treatment Plan
                        </Text>
                        <Text color="gray.600">
                          {selectedConsultation.treatment}
                        </Text>
                      </Box>
                    </VStack>
                  </TabPanel>

                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <Text fontWeight="bold">Prescribed Medications</Text>
                      {selectedConsultation.prescription.map((med, idx) => (
                        <Card key={idx}>
                          <CardBody>
                            <Grid templateColumns="repeat(4, 1fr)" gap={4}>
                              <Box>
                                <Text fontWeight="bold" fontSize="sm">
                                  Medication
                                </Text>
                                <Text>{med.medication}</Text>
                              </Box>
                              <Box>
                                <Text fontWeight="bold" fontSize="sm">
                                  Dosage
                                </Text>
                                <Text>{med.dosage}</Text>
                              </Box>
                              <Box>
                                <Text fontWeight="bold" fontSize="sm">
                                  Frequency
                                </Text>
                                <Text>{med.frequency}</Text>
                              </Box>
                              <Box>
                                <Text fontWeight="bold" fontSize="sm">
                                  Duration
                                </Text>
                                <Text>{med.duration}</Text>
                              </Box>
                            </Grid>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  </TabPanel>

                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Text fontWeight="bold" mb={2}>
                          Follow-up Instructions
                        </Text>
                        <Text color="gray.600">
                          {selectedConsultation.followUp}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" mb={2}>
                          Next Appointment
                        </Text>
                        <Text color="gray.600">
                          {selectedConsultation.nextAppointment}
                        </Text>
                      </Box>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Add Consultation Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New Consultation</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Tabs>
              <TabList>
                <Tab>Basic Info</Tab>
                <Tab>Vitals</Tab>
                <Tab>Assessment</Tab>
                <Tab>Treatment</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <VStack spacing={4}>
                    <Grid templateColumns="repeat(3, 1fr)" gap={4} w="100%">
                      <FormControl>
                        <FormLabel>Patient</FormLabel>
                        <Select placeholder="Select patient">
                          {patientsList.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} {p.medicalId ? `(${p.medicalId})` : ""}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Date</FormLabel>
                        <Input type="date" />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Time</FormLabel>
                        <Input type="time" />
                      </FormControl>
                    </Grid>

                    <Grid templateColumns="repeat(2, 1fr)" gap={4} w="100%">
                      <FormControl>
                        <FormLabel>Consultation Type</FormLabel>
                        <Select placeholder="Select type">
                          <option value="in-person">In-Person</option>
                          <option value="telemedicine">Telemedicine</option>
                          <option value="emergency">Emergency</option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Duration</FormLabel>
                        <NumberInput min={15} max={120}>
                          <NumberInputField placeholder="Minutes" />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                    </Grid>

                    <FormControl>
                      <FormLabel>Chief Complaint</FormLabel>
                      <Textarea placeholder="Enter patient's main concern" />
                    </FormControl>
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                    <FormControl>
                      <FormLabel>Blood Pressure</FormLabel>
                      <Input placeholder="120/80" />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Pulse Rate</FormLabel>
                      <Input placeholder="72" />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Temperature</FormLabel>
                      <Input placeholder="98.6°F" />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Weight</FormLabel>
                      <Input placeholder="150 lbs" />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Height</FormLabel>
                      <Input placeholder="5'8&quot;" />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Oxygen Saturation</FormLabel>
                      <Input placeholder="98%" />
                    </FormControl>
                  </Grid>
                </TabPanel>

                <TabPanel>
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>Diagnosis</FormLabel>
                      <Input placeholder="Enter diagnosis" />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Assessment Notes</FormLabel>
                      <Textarea placeholder="Enter detailed assessment" />
                    </FormControl>
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>Treatment Plan</FormLabel>
                      <Textarea placeholder="Enter treatment plan" />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Follow-up Instructions</FormLabel>
                      <Textarea placeholder="Enter follow-up instructions" />
                    </FormControl>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>

            <HStack justify="flex-end" spacing={3} mt={6}>
              <Button variant="outline" onClick={onAddClose}>
                Cancel
              </Button>
              <Button colorScheme="blue">Save Consultation</Button>
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default DoctorConsultations;
