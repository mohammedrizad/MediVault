import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
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
  Textarea,
} from "@chakra-ui/react";
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiPhone,
  FiMapPin,
  FiPlus,
  FiSearch,
  FiFilter,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import dataService from "../services/DataService";

const NurseAppointments = () => {
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";
  const [patientsList, setPatientsList] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [appointmentsData, setAppointmentsData] = useState([]);
  const [newAppt, setNewAppt] = useState({
    patientId: "",
    doctorId: "",
    date: new Date().toISOString().split("T")[0],
    time: "",
    type: "",
    reason: "",
  });

  const loadAppointments = async () => {
    if (!currentUser?.id) return;
    const data = await dataService.getAppointments({ nurseId: currentUser.id });
    setAppointmentsData(
      data.map((a) => ({
        id: a._id,
        patientName: a.patientName,
        patientId: a.patientId,
        doctorName: a.doctorName,
        time: a.time,
        duration: a.duration,
        type: a.type,
        status: a.status,
        priority: a.priority || "Normal",
        phone: a.patientPhone,
        reason: a.reason,
        date: a.date,
      })),
    );
  };

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [pRes, dRes] = await Promise.all([
          fetch(`${API_URL}/pews/pews-patients`),
          fetch(`${API_URL}/doctor/getall`),
        ]);
        const pData = await pRes.json();
        const dData = await dRes.json();
        setPatientsList(pData.patients || []);
        setDoctorsList(dData.doctors || []);
      } catch (err) {
        console.error("Failed to load lookups:", err);
      }
    };
    fetchLookups();
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  const handleScheduleAppointment = async () => {
    if (!newAppt.patientId || !newAppt.date || !newAppt.time) {
      toast({
        title: "Missing fields",
        description: "Please select a patient, date, and time.",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    const patient = patientsList.find((p) => p.id === newAppt.patientId);
    const doctor = doctorsList.find((d) => d._id === newAppt.doctorId);
    try {
      await dataService.addAppointment({
        patientId: patient?.medicalId || newAppt.patientId,
        patientName: patient?.name || "",
        doctorId: newAppt.doctorId,
        doctorName: doctor?.Doctor_name || "",
        nurseId: currentUser.id,
        nurseName: currentUser.name,
        type: newAppt.type || "Consultation",
        date: newAppt.date,
        time: newAppt.time,
        reason: newAppt.reason,
        status: "Scheduled",
        createdByRole: "nurse",
        createdById: currentUser.id,
      });
      toast({
        title: "Appointment Scheduled",
        description: "New appointment has been created successfully",
        status: "success",
        duration: 3000,
      });
      setNewAppt({ patientId: "", doctorId: "", date: new Date().toISOString().split("T")[0], time: "", type: "", reason: "" });
      onClose();
      loadAppointments();
    } catch (err) {
      toast({
        title: "Failed to schedule",
        description: err.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleUpdateStatus = async (appointment) => {
    const nextStatus =
      appointment.status === "Scheduled"
        ? "In Progress"
        : appointment.status === "In Progress"
          ? "Completed"
          : "Completed";
    try {
      await dataService.updateAppointment(appointment.id, { status: nextStatus });
      toast({
        title: "Status Updated",
        description: `${appointment.patientName}'s appointment status updated to ${nextStatus}`,
        status: "success",
        duration: 3000,
      });
      loadAppointments();
    } catch (err) {
      toast({
        title: "Failed to update status",
        description: err.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  // Statistics
  const stats = [
    {
      label: "Today's Appointments",
      value: appointmentsData.length,
      color: "blue.500",
    },
    {
      label: "Completed",
      value: appointmentsData.filter((a) => a.status === "Completed").length,
      color: "green.500",
    },
    {
      label: "In Progress",
      value: appointmentsData.filter((a) => a.status === "In Progress").length,
      color: "orange.500",
    },
    {
      label: "Pending",
      value: appointmentsData.filter((a) => a.status === "Scheduled").length,
      color: "purple.500",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Scheduled":
        return "blue";
      case "In Progress":
        return "orange";
      case "Completed":
        return "green";
      case "Cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Urgent":
        return "red";
      case "High":
        return "orange";
      case "Normal":
        return "blue";
      default:
        return "gray";
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={2}>
          Appointments Management
        </Text>
        <Text color="gray.600">
          Manage and track patient appointments for today
        </Text>
      </Box>

      {/* Statistics */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        {stats.map((stat, index) => (
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

      {/* Filters and Search */}
      <Card>
        <CardBody>
          <HStack spacing={4} mb={4} wrap="wrap">
            <HStack>
              <Icon as={FiCalendar} color="purple.500" />
              <Text fontWeight="medium">Date:</Text>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                maxW="200px"
              />
            </HStack>

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
              <Icon as={FiFilter} color="purple.500" />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                maxW="150px"
              >
                <option value="all">All Status</option>
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </Select>
            </HStack>

            <Button colorScheme="purple" leftIcon={<FiPlus />} onClick={onOpen}>
              New Appointment
            </Button>
          </HStack>
        </CardBody>
      </Card>

      {/* Appointments Table */}
      <Card>
        <CardBody>
          <HStack justify="space-between" mb={4}>
            <Text fontSize="lg" fontWeight="semibold">
              Today's Schedule
            </Text>
            <Badge colorScheme="purple" p={2}>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Badge>
          </HStack>

          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Time</Th>
                <Th>Patient</Th>
                <Th>Doctor</Th>
                <Th>Type</Th>
                <Th>Priority</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {appointmentsData
                .filter((a) => {
                  const matchesSearch =
                    !searchTerm ||
                    a.patientName
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    a.patientId
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    a.doctorName
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase());
                  const matchesStatus =
                    statusFilter === "all" || a.status === statusFilter;
                  return matchesSearch && matchesStatus;
                })
                .map((appointment) => (
                  <Tr key={appointment.id}>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <HStack>
                          <Icon as={FiClock} w={4} h={4} color="gray.500" />
                          <Text fontWeight="medium">{appointment.time}</Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.500">
                          {appointment.duration}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <HStack>
                          <Avatar size="sm" name={appointment.patientName} />
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="medium">
                              {appointment.patientName}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              ID: {appointment.patientId}
                            </Text>
                          </VStack>
                        </HStack>
                        <HStack>
                          <Icon as={FiPhone} w={3} h={3} color="gray.400" />
                          <Text fontSize="sm" color="gray.500">
                            {appointment.phone}
                          </Text>
                        </HStack>
                      </VStack>
                    </Td>
                    <Td>
                      <Text fontWeight="medium">{appointment.doctorName}</Text>
                    </Td>
                    <Td>
                      <Badge colorScheme="gray">{appointment.type}</Badge>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={getPriorityColor(appointment.priority)}
                      >
                        {appointment.priority}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="outline"
                          onClick={() =>
                            toast({
                              title: "Appointment Details",
                              description: `${appointment.patientName} — ${appointment.reason}`,
                              status: "info",
                              duration: 4000,
                            })
                          }
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="green"
                          variant="outline"
                          onClick={() => handleUpdateStatus(appointment)}
                        >
                          Update
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      {/* New Appointment Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Schedule New Appointment</ModalHeader>
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
                    value={newAppt.patientId}
                    onChange={(e) => setNewAppt({ ...newAppt, patientId: e.target.value })}
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
                    Doctor
                  </Text>
                  <Select
                    placeholder="Select doctor"
                    value={newAppt.doctorId}
                    onChange={(e) => setNewAppt({ ...newAppt, doctorId: e.target.value })}
                  >
                    {doctorsList.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.Doctor_name}
                      </option>
                    ))}
                  </Select>
                </Box>
              </SimpleGrid>
              <SimpleGrid columns={2} spacing={4} w="full">
                <Box>
                  <Text mb={2} fontWeight="medium">
                    Date
                  </Text>
                  <Input
                    type="date"
                    value={newAppt.date}
                    onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })}
                  />
                </Box>
                <Box>
                  <Text mb={2} fontWeight="medium">
                    Time
                  </Text>
                  <Input
                    type="time"
                    value={newAppt.time}
                    onChange={(e) => setNewAppt({ ...newAppt, time: e.target.value })}
                  />
                </Box>
              </SimpleGrid>
              <Box w="full">
                <Text mb={2} fontWeight="medium">
                  Type
                </Text>
                <Select
                  placeholder="Select type"
                  value={newAppt.type}
                  onChange={(e) => setNewAppt({ ...newAppt, type: e.target.value })}
                >
                  <option value="Consultation">Consultation</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Treatment">Treatment</option>
                </Select>
              </Box>
              <Box w="full">
                <Text mb={2} fontWeight="medium">
                  Reason
                </Text>
                <Textarea
                  placeholder="Reason for appointment..."
                  value={newAppt.reason}
                  onChange={(e) => setNewAppt({ ...newAppt, reason: e.target.value })}
                />
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="purple" onClick={handleScheduleAppointment}>
              Schedule
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default NurseAppointments;
