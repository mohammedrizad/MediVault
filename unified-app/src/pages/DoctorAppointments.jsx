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
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import {
  FiCalendar,
  FiSearch,
  FiPlus,
  FiEye,
  FiEdit,
  FiTrash2,
  FiClock,
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiActivity,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import dataService from "../services/DataService";

const DoctorAppointments = () => {
  const { currentUser } = useAuth();
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("all");
  const [patientsList, setPatientsList] = useState([]);

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
  const toast = useToast();

  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [newAppointment, setNewAppointment] = useState({
    patientId: "",
    type: "",
    date: "",
    time: "",
    duration: "30 mins",
    location: "",
    reason: "",
    notes: "",
  });

  const loadAppointments = async () => {
    if (!currentUser?.id) return;
    setLoadingAppointments(true);
    try {
      const data = await dataService.getAppointments({ doctorId: currentUser.id });
      setAppointments(data.map((a) => ({ ...a, id: a._id })));
    } catch (err) {
      console.error("Failed to load appointments:", err);
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  const handleScheduleAppointment = async () => {
    if (!newAppointment.patientId || !newAppointment.date || !newAppointment.time) {
      toast({
        title: "Missing fields",
        description: "Please select a patient, date, and time.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    const patient = patientsList.find((p) => p.id === newAppointment.patientId);
    try {
      await dataService.addAppointment({
        patientId: patient?.medicalId || newAppointment.patientId,
        patientName: patient?.name || "",
        doctorId: currentUser.id,
        doctorName: currentUser.name,
        type: newAppointment.type || "Consultation",
        date: newAppointment.date,
        time: newAppointment.time,
        duration: newAppointment.duration,
        location: newAppointment.location,
        reason: newAppointment.reason,
        notes: newAppointment.notes,
        status: "Scheduled",
        createdByRole: "doctor",
        createdById: currentUser.id,
      });
      toast({
        title: "Appointment Scheduled",
        description: `Appointment created for ${patient?.name || "patient"}.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setNewAppointment({
        patientId: "",
        type: "",
        date: "",
        time: "",
        duration: "30 mins",
        location: "",
        reason: "",
        notes: "",
      });
      onAddClose();
      loadAppointments();
    } catch (err) {
      toast({
        title: "Failed to schedule appointment",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Filter appointments
  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.patientName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointment.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      appointment.status.toLowerCase() === filterStatus.toLowerCase();

    let matchesDate = true;
    if (filterDate !== "all") {
      const today = new Date();
      const appointmentDate = new Date(appointment.date);

      switch (filterDate) {
        case "today":
          matchesDate = appointmentDate.toDateString() === today.toDateString();
          break;
        case "week":
          const weekFromNow = new Date(
            today.getTime() + 7 * 24 * 60 * 60 * 1000,
          );
          matchesDate =
            appointmentDate >= today && appointmentDate <= weekFromNow;
          break;
        case "month":
          const monthFromNow = new Date(
            today.getTime() + 30 * 24 * 60 * 60 * 1000,
          );
          matchesDate =
            appointmentDate >= today && appointmentDate <= monthFromNow;
          break;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    onOpen();
  };

  const handleDeleteAppointment = (appointment) => {
    setAppointmentToDelete(appointment);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    try {
      await dataService.deleteAppointment(appointmentToDelete.id);
      setAppointments(
        appointments.filter((app) => app.id !== appointmentToDelete.id),
      );
      toast({
        title: "Appointment Cancelled",
        description: `Appointment with ${appointmentToDelete.patientName} has been cancelled.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Failed to cancel appointment",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    onDeleteClose();
    setAppointmentToDelete(null);
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await dataService.updateAppointment(appointmentId, { status: newStatus });
      setAppointments(
        appointments.map((app) =>
          app.id === appointmentId ? { ...app, status: newStatus } : app,
        ),
      );
      toast({
        title: "Status Updated",
        description: `Appointment status changed to ${newStatus}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Failed to update status",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "green";
      case "scheduled":
        return "blue";
      case "pending":
        return "yellow";
      case "completed":
        return "purple";
      case "cancelled":
        return "red";
      case "urgent":
        return "red";
      default:
        return "gray";
    }
  };

  const getTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case "consultation":
        return "blue";
      case "follow-up":
        return "green";
      case "check-up":
        return "purple";
      case "emergency":
        return "red";
      default:
        return "gray";
    }
  };

  const getTodayAppointments = () => {
    const today = new Date().toDateString();
    return appointments.filter(
      (app) => new Date(app.date).toDateString() === today,
    );
  };

  const getUpcomingAppointments = () => {
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return appointments.filter((app) => {
      const appDate = new Date(app.date);
      return appDate >= today && appDate <= weekFromNow;
    });
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Box>
            <Heading size="lg" mb={2}>
              Appointments
            </Heading>
            <Text color="gray.600">
              Manage patient appointments and schedule
            </Text>
          </Box>
          <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onAddOpen}>
            Schedule Appointment
          </Button>
        </Flex>

        {/* Stats Cards */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={6}>
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <HStack>
                <Icon as={FiCalendar} w={8} h={8} color="blue.500" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="2xl" fontWeight="bold">
                    {getTodayAppointments().length}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Today's Appointments
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
                    {getUpcomingAppointments().length}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    This Week
                  </Text>
                </VStack>
              </HStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <HStack>
                <Icon as={FiActivity} w={8} h={8} color="orange.500" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="2xl" fontWeight="bold">
                    {appointments.filter((a) => a.status === "Pending").length}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Pending
                  </Text>
                </VStack>
              </HStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <HStack>
                <Icon as={FiUser} w={8} h={8} color="red.500" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="2xl" fontWeight="bold">
                    {appointments.filter((a) => a.status === "Urgent").length}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Urgent
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
                  placeholder="Search appointments by patient, reason, or type..."
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
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="urgent">Urgent</option>
              </Select>
              <Select
                placeholder="All Dates"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </Select>
            </Grid>
          </CardBody>
        </Card>

        {/* Appointments Table */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Appointment Schedule</Heading>
          </CardHeader>
          <CardBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Patient</Th>
                  <Th>Date & Time</Th>
                  <Th>Type</Th>
                  <Th>Reason</Th>
                  <Th>Status</Th>
                  <Th>Location</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredAppointments.map((appointment) => (
                  <Tr key={appointment.id}>
                    <Td>
                      <HStack>
                        <Avatar size="sm" name={appointment.patientName} />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">
                            {appointment.patientName}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {appointment.condition}
                          </Text>
                        </VStack>
                      </HStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">{appointment.date}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {appointment.time}
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          {appointment.duration}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Badge colorScheme={getTypeColor(appointment.type)}>
                        {appointment.type}
                      </Badge>
                    </Td>
                    <Td>
                      <Text maxW="200px" isTruncated>
                        {appointment.reason}
                      </Text>
                    </Td>
                    <Td>
                      <Select
                        size="sm"
                        value={appointment.status}
                        onChange={(e) =>
                          handleStatusChange(appointment.id, e.target.value)
                        }
                        w="120px"
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Urgent">Urgent</option>
                      </Select>
                    </Td>
                    <Td>{appointment.location}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          leftIcon={<FiEye />}
                          onClick={() => handleViewAppointment(appointment)}
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
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<FiTrash2 />}
                          colorScheme="red"
                          onClick={() => handleDeleteAppointment(appointment)}
                        >
                          Cancel
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

      {/* View Appointment Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Appointment Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedAppointment && (
              <VStack spacing={6} align="stretch">
                <HStack spacing={6}>
                  <Avatar size="xl" name={selectedAppointment.patientName} />
                  <VStack align="start" spacing={1}>
                    <Heading size="lg">
                      {selectedAppointment.patientName}
                    </Heading>
                    <Text color="gray.600">
                      {selectedAppointment.condition}
                    </Text>
                    <HStack>
                      <Badge
                        colorScheme={getStatusColor(selectedAppointment.status)}
                      >
                        {selectedAppointment.status}
                      </Badge>
                      <Badge
                        colorScheme={getTypeColor(selectedAppointment.type)}
                      >
                        {selectedAppointment.type}
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
                      {selectedAppointment.date} at {selectedAppointment.time}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      Duration: {selectedAppointment.duration}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      Location
                    </Text>
                    <Text>{selectedAppointment.location}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      Last Visit
                    </Text>
                    <Text>{selectedAppointment.lastVisit}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      Contact
                    </Text>
                    <VStack align="start" spacing={1}>
                      <HStack>
                        <Icon as={FiPhone} color="blue.500" />
                        <Text fontSize="sm">
                          {selectedAppointment.patientPhone}
                        </Text>
                      </HStack>
                      <HStack>
                        <Icon as={FiMail} color="green.500" />
                        <Text fontSize="sm">
                          {selectedAppointment.patientEmail}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>
                </Grid>

                <Box>
                  <Text fontWeight="bold" mb={2}>
                    Reason for Visit
                  </Text>
                  <Text color="gray.600">{selectedAppointment.reason}</Text>
                </Box>

                <Box>
                  <Text fontWeight="bold" mb={2}>
                    Notes
                  </Text>
                  <Text color="gray.600">{selectedAppointment.notes}</Text>
                </Box>

                <HStack justify="flex-end" spacing={3}>
                  <Button variant="outline" onClick={onClose}>
                    Close
                  </Button>
                  <Button colorScheme="blue" leftIcon={<FiEdit />}>
                    Edit Appointment
                  </Button>
                </HStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Add Appointment Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Schedule New Appointment</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Grid templateColumns="repeat(2, 1fr)" gap={4} w="100%">
                <FormControl>
                  <FormLabel>Patient</FormLabel>
                  <Select
                    placeholder="Select patient"
                    value={newAppointment.patientId}
                    onChange={(e) =>
                      setNewAppointment({ ...newAppointment, patientId: e.target.value })
                    }
                  >
                    {patientsList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.medicalId ? `(${p.medicalId})` : ""}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Appointment Type</FormLabel>
                  <Select
                    placeholder="Select type"
                    value={newAppointment.type}
                    onChange={(e) =>
                      setNewAppointment({ ...newAppointment, type: e.target.value })
                    }
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Check-up">Check-up</option>
                    <option value="Emergency">Emergency</option>
                  </Select>
                </FormControl>
              </Grid>

              <Grid templateColumns="repeat(3, 1fr)" gap={4} w="100%">
                <FormControl>
                  <FormLabel>Date</FormLabel>
                  <Input
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) =>
                      setNewAppointment({ ...newAppointment, date: e.target.value })
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Time</FormLabel>
                  <Input
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) =>
                      setNewAppointment({ ...newAppointment, time: e.target.value })
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Duration</FormLabel>
                  <Select
                    placeholder="Select duration"
                    value={newAppointment.duration}
                    onChange={(e) =>
                      setNewAppointment({ ...newAppointment, duration: e.target.value })
                    }
                  >
                    <option value="30 mins">30 minutes</option>
                    <option value="45 mins">45 minutes</option>
                    <option value="60 mins">1 hour</option>
                    <option value="90 mins">1.5 hours</option>
                  </Select>
                </FormControl>
              </Grid>

              <FormControl>
                <FormLabel>Location</FormLabel>
                <Select
                  placeholder="Select room"
                  value={newAppointment.location}
                  onChange={(e) =>
                    setNewAppointment({ ...newAppointment, location: e.target.value })
                  }
                >
                  <option value="Room 101">Room 101</option>
                  <option value="Room 102">Room 102</option>
                  <option value="Room 103">Room 103</option>
                  <option value="Emergency Room">Emergency Room</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Reason for Visit</FormLabel>
                <Textarea
                  placeholder="Enter reason for appointment"
                  value={newAppointment.reason}
                  onChange={(e) =>
                    setNewAppointment({ ...newAppointment, reason: e.target.value })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  placeholder="Enter any additional notes"
                  value={newAppointment.notes}
                  onChange={(e) =>
                    setNewAppointment({ ...newAppointment, notes: e.target.value })
                  }
                />
              </FormControl>

              <HStack justify="flex-end" spacing={3} w="100%">
                <Button variant="outline" onClick={onAddClose}>
                  Cancel
                </Button>
                <Button colorScheme="blue" onClick={handleScheduleAppointment}>
                  Schedule Appointment
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Cancel Appointment
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to cancel the appointment with{" "}
              <strong>{appointmentToDelete?.patientName}</strong> on{" "}
              <strong>{appointmentToDelete?.date}</strong>?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button onClick={onDeleteClose}>No, Keep It</Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                Yes, Cancel Appointment
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default DoctorAppointments;
