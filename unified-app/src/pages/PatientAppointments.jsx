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
  useToast,
  Flex,
  Spacer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
} from "@chakra-ui/react";
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiPlus,
  FiPhone,
  FiMapPin,
  FiEdit,
  FiTrash,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import dataService from "../services/DataService";

const PatientAppointments = () => {
  const toast = useToast();
  const { currentUser } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorsList, setDoctorsList] = useState([]);
  const [newAppointment, setNewAppointment] = useState({
    doctorId: "",
    date: "",
    time: "",
    type: "",
    notes: "",
  });

  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const medicalId = currentUser?.MedicalId || currentUser?.medicalId;

  const loadAppointments = async () => {
    if (!medicalId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await dataService.getAppointments({ patientId: medicalId });
    setAppointments(
      data.map((a) => ({
        id: a._id,
        doctor: a.doctorName || "Unassigned",
        specialty: a.type,
        date: a.date,
        time: a.time,
        type: a.type,
        status: a.status,
        location: a.location || "TBD",
        phone: "",
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";
        const res = await fetch(`${API_URL}/doctor/getall`);
        const data = await res.json();
        setDoctorsList(data.doctors || []);
      } catch (err) {
        console.error("Failed to load doctors:", err);
      }
    };
    fetchDoctors();
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medicalId]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "green";
      case "pending":
        return "yellow";
      case "completed":
        return "blue";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  const handleBookAppointment = async () => {
    if (!newAppointment.doctorId || !newAppointment.date || !newAppointment.time) {
      toast({
        title: "Missing fields",
        description: "Please select a doctor, date, and time.",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    const doctor = doctorsList.find((d) => d._id === newAppointment.doctorId);
    try {
      await dataService.addAppointment({
        patientId: medicalId,
        patientName: currentUser.name || currentUser.Name,
        doctorId: newAppointment.doctorId,
        doctorName: doctor?.Doctor_name || "",
        type: newAppointment.type || "Consultation",
        date: newAppointment.date,
        time: newAppointment.time,
        reason: newAppointment.notes,
        status: "Pending",
        createdByRole: "patient",
        createdById: medicalId,
      });
      setNewAppointment({ doctorId: "", date: "", time: "", type: "", notes: "" });
      onClose();
      toast({
        title: "Appointment Booked!",
        description: "Your appointment has been scheduled successfully.",
        status: "success",
        duration: 3000,
      });
      loadAppointments();
    } catch (err) {
      toast({
        title: "Failed to book appointment",
        description: err.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await dataService.updateAppointment(appointmentId, { status: "Cancelled" });
      setAppointments(
        appointments.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: "Cancelled" } : apt
        )
      );
      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been cancelled.",
        status: "info",
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: "Failed to cancel",
        description: err.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === "Confirmed" || apt.status === "Pending"
  );

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack>
          <Icon as={FiCalendar} boxSize={8} color="blue.500" />
          <VStack align="start" spacing={1}>
            <Heading size="lg">My Appointments</Heading>
            <Text color="gray.600">
              Manage your medical appointments and consultations
            </Text>
          </VStack>
          <Spacer />
          <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onOpen}>
            Book Appointment
          </Button>
        </HStack>

        {/* Summary Cards */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <VStack spacing={2}>
                <Icon as={FiCalendar} boxSize={6} color="blue.500" />
                <Text fontSize="2xl" fontWeight="bold">
                  {appointments.length}
                </Text>
                <Text color="gray.600">Total</Text>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <VStack spacing={2}>
                <Icon as={FiClock} boxSize={6} color="green.500" />
                <Text fontSize="2xl" fontWeight="bold">
                  {upcomingAppointments.length}
                </Text>
                <Text color="gray.600">Upcoming</Text>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <VStack spacing={2}>
                <Icon as={FiUser} boxSize={6} color="purple.500" />
                <Text fontSize="2xl" fontWeight="bold">
                  {
                    appointments.filter((apt) => apt.status === "Pending")
                      .length
                  }
                </Text>
                <Text color="gray.600">Pending</Text>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <VStack spacing={2}>
                <Icon as={FiCalendar} boxSize={6} color="orange.500" />
                <Text fontSize="2xl" fontWeight="bold">
                  {
                    appointments.filter((apt) => apt.status === "Completed")
                      .length
                  }
                </Text>
                <Text color="gray.600">Completed</Text>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Appointments List */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Your Appointments</Heading>
          </CardHeader>
          <CardBody>
            {loading ? (
              <Alert status="info">
                <AlertIcon />
                Loading appointments...
              </Alert>
            ) : (
              <VStack spacing={4} align="stretch">
                {appointments.map((appointment) => (
                  <Card key={appointment.id} variant="outline">
                    <CardBody>
                      <Flex direction={{ base: "column", md: "row" }}>
                        <VStack align="start" flex={1} spacing={3}>
                          <HStack>
                            <Badge
                              colorScheme={getStatusColor(appointment.status)}
                              fontSize="sm"
                            >
                              {appointment.status}
                            </Badge>
                            <Text fontSize="lg" fontWeight="medium">
                              {appointment.doctor}
                            </Text>
                          </HStack>

                          <SimpleGrid
                            columns={{ base: 1, md: 3 }}
                            spacing={4}
                            w="full"
                          >
                            <HStack>
                              <Icon as={FiCalendar} color="gray.500" />
                              <VStack align="start" spacing={0}>
                                <Text fontSize="sm" fontWeight="medium">
                                  {appointment.date}
                                </Text>
                                <Text fontSize="xs" color="gray.600">
                                  {appointment.time}
                                </Text>
                              </VStack>
                            </HStack>

                            <HStack>
                              <Icon as={FiUser} color="gray.500" />
                              <VStack align="start" spacing={0}>
                                <Text fontSize="sm" fontWeight="medium">
                                  {appointment.specialty}
                                </Text>
                                <Text fontSize="xs" color="gray.600">
                                  {appointment.type}
                                </Text>
                              </VStack>
                            </HStack>

                            <HStack>
                              <Icon as={FiMapPin} color="gray.500" />
                              <VStack align="start" spacing={0}>
                                <Text fontSize="sm" fontWeight="medium">
                                  {appointment.location}
                                </Text>
                                <Text fontSize="xs" color="gray.600">
                                  {appointment.phone}
                                </Text>
                              </VStack>
                            </HStack>
                          </SimpleGrid>
                        </VStack>

                        <VStack spacing={2} mt={{ base: 4, md: 0 }}>
                          <Button
                            size="sm"
                            leftIcon={<FiPhone />}
                            colorScheme="green"
                            variant="outline"
                          >
                            Call Doctor
                          </Button>
                          <Button
                            size="sm"
                            leftIcon={<FiEdit />}
                            variant="outline"
                          >
                            Reschedule
                          </Button>
                          {appointment.status !== "Completed" && (
                            <Button
                              size="sm"
                              leftIcon={<FiTrash />}
                              colorScheme="red"
                              variant="outline"
                              onClick={() =>
                                handleCancelAppointment(appointment.id)
                              }
                            >
                              Cancel
                            </Button>
                          )}
                        </VStack>
                      </Flex>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            )}
          </CardBody>
        </Card>
      </VStack>

      {/* Book Appointment Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Book New Appointment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Doctor</FormLabel>
                <Select
                  placeholder="Select a doctor"
                  value={newAppointment.doctorId}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      doctorId: e.target.value,
                    })
                  }
                >
                  {doctorsList.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.Doctor_name} - {d.Specialization}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <HStack w="full">
                <FormControl>
                  <FormLabel>Date</FormLabel>
                  <Input
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) =>
                      setNewAppointment({
                        ...newAppointment,
                        date: e.target.value,
                      })
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Time</FormLabel>
                  <Input
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) =>
                      setNewAppointment({
                        ...newAppointment,
                        time: e.target.value,
                      })
                    }
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Appointment Type</FormLabel>
                <Select
                  placeholder="Select type"
                  value={newAppointment.type}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      type: e.target.value,
                    })
                  }
                >
                  <option value="Consultation">Consultation</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Checkup">Checkup</option>
                  <option value="Emergency">Emergency</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Notes (Optional)</FormLabel>
                <Textarea
                  placeholder="Any additional notes or symptoms..."
                  value={newAppointment.notes}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      notes: e.target.value,
                    })
                  }
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleBookAppointment}>
              Book Appointment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PatientAppointments;
