import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Icon,
  useColorModeValue,
  Grid,
  Avatar,
} from "@chakra-ui/react";
import {
  FiUser,
  FiActivity,
  FiCalendar,
  FiHeart,
  FiShield,
  FiPhone,
} from "react-icons/fi";
import EmergencyQR from "../components/common/EmergencyQR"; // 🆕 Import QR Component

const PatientDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [patientProfile, setPatientProfile] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [vitals, setVitals] = useState({});
  const [dashboardData] = useState({
    totalRecords: 24,
    upcomingAppointments: 3,
    activePrescriptions: 5,
    lastCheckupScore: 95,
  });

  // Theme colors
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgGradient = useColorModeValue(
    "linear(to-br, blue.50, cyan.50, white)",
    "linear(to-br, gray.900, blue.900)"
  );

  // Load patient data from localStorage or use default
  useEffect(() => {
    const loadPatientData = () => {
      const savedPatientData = localStorage.getItem("patientData");

      if (savedPatientData) {
        const data = JSON.parse(savedPatientData);
        console.log("Dashboard loaded patient data:", data);
        setPatientProfile({
          id: data.MedicalId || data.medicalId || data.id || "PAT001",
          name: data.Name || data.name || "Jane Doe",
          phone: data.Mobile_no || data.phone || "9876543210",
          email: data.Email || data.email || "jane.doe@example.com",
          age: data.Age || data.age || 28,
          bloodType: data.BloodGroup || data.bloodType || "O+",
          photo: data.Photo || data.photo || "",
          insurance: "Blue Cross Blue Shield Premium",
          recentRecords: [
            {
              type: "Blood Test Report",
              doctor: "Dr. Smith",
              department: "Pathology",
              date: "Dec 15, 2024",
              status: "normal",
            },
            {
              type: "Chest X-Ray",
              doctor: "Dr. Johnson",
              department: "Radiology",
              date: "Dec 10, 2024",
              status: "normal",
            },
          ],
        });
      } else {
        // Default patient data
        setPatientProfile({
          id: "PAT001",
          name: "Jane Doe",
          phone: "9876543210",
          email: "jane.doe@example.com",
          age: 28,
          bloodType: "O+",
          insurance: "Blue Cross Blue Shield Premium",
          recentRecords: [
            {
              type: "Blood Test Report",
              doctor: "Dr. Smith",
              department: "Pathology",
              date: "Dec 15, 2024",
              status: "normal",
            },
          ],
        });
      }

      setPrescriptions([
        {
          medication: "Metformin",
          dosage: "500mg",
          frequency: "Twice daily",
          doctor: "Dr. Smith",
          status: "active",
          refillsLeft: 3,
        },
        {
          medication: "Lisinopril",
          dosage: "10mg",
          frequency: "Once daily",
          doctor: "Dr. Johnson",
          status: "active",
          refillsLeft: 2,
        },
      ]);

      setAppointments([
        {
          doctor: "Dr. Sarah Johnson",
          type: "Follow-up Consultation",
          department: "Cardiology",
          date: "Dec 20, 2024",
          time: "10:00 AM",
          status: "confirmed",
          location: "Room 301",
        },
        {
          doctor: "Dr. Michael Brown",
          type: "Annual Physical",
          department: "General Medicine",
          date: "Jan 5, 2025",
          time: "2:00 PM",
          status: "pending",
          location: "Room 105",
        },
      ]);

      setVitals({
        heartRate: { value: "72 bpm", status: "normal" },
        bloodPressure: { value: "120/80 mmHg", status: "normal" },
        temperature: { value: "98.6°F", status: "normal" },
        weight: { value: "65 kg", status: "stable" },
      });

      setLoading(false);
    };

    loadPatientData();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "normal":
      case "confirmed":
        return "green";
      case "pending":
      case "stable":
        return "yellow";
      case "inactive":
      case "high":
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  if (loading) {
    return (
      <Box p={6}>
        <Alert status="info">
          <AlertIcon />
          Loading patient dashboard...
        </Alert>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      <Container maxW="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box textAlign="center">
            <Heading
              size="2xl"
              bgGradient="linear(to-r, blue.500, cyan.500)"
              bgClip="text"
              mb={2}
            >
              Welcome back, {patientProfile.name}!
            </Heading>
            <Text fontSize="lg" color="gray.600" mb={4}>
              Here's your complete health overview
            </Text>
            {/* 🆕 Add Emergency QR Button with Correct ID */}
            <EmergencyQR medicalId={patientProfile?.id} />
          </Box>

          {/* Patient Profile Card */}
          <Card bg={cardBg} borderColor={borderColor} shadow="xl">
            <CardHeader>
              <HStack spacing={4}>
                <Avatar
                  size="lg"
                  src={patientProfile.photo}
                  name={patientProfile.name}
                  border="2px solid"
                  borderColor="blue.500"
                />
                <VStack align="start" spacing={0}>
                  <Heading size="md">{patientProfile.name}</Heading>
                  <Text fontSize="sm" color="gray.500">
                    {patientProfile.email}
                  </Text>
                </VStack>
              </HStack>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.500">
                    Patient ID
                  </Text>
                  <Text fontWeight="medium">{patientProfile.id}</Text>
                </VStack>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.500">
                    Blood Type
                  </Text>
                  <Badge colorScheme="red" variant="subtle">
                    {patientProfile.bloodType}
                  </Badge>
                </VStack>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.500">
                    Age
                  </Text>
                  <Text fontWeight="medium">{patientProfile.age} years</Text>
                </VStack>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.500">
                    Insurance
                  </Text>
                  <Text fontWeight="medium" fontSize="sm">
                    {patientProfile.insurance}
                  </Text>
                </VStack>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Quick Stats */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <Card bg={cardBg} borderColor={borderColor} shadow="lg">
              <CardBody textAlign="center">
                <VStack spacing={2}>
                  <Icon as={FiActivity} boxSize={8} color="blue.500" />
                  <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                    {dashboardData.totalRecords}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Total Records
                  </Text>
                </VStack>
              </CardBody>
            </Card>
            <Card bg={cardBg} borderColor={borderColor} shadow="lg">
              <CardBody textAlign="center">
                <VStack spacing={2}>
                  <Icon as={FiCalendar} boxSize={8} color="green.500" />
                  <Text fontSize="2xl" fontWeight="bold" color="green.600">
                    {dashboardData.upcomingAppointments}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Upcoming Appointments
                  </Text>
                </VStack>
              </CardBody>
            </Card>
            <Card bg={cardBg} borderColor={borderColor} shadow="lg">
              <CardBody textAlign="center">
                <VStack spacing={2}>
                  <Icon as={FiHeart} boxSize={8} color="red.500" />
                  <Text fontSize="2xl" fontWeight="bold" color="red.600">
                    {dashboardData.activePrescriptions}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Active Prescriptions
                  </Text>
                </VStack>
              </CardBody>
            </Card>
            <Card bg={cardBg} borderColor={borderColor} shadow="lg">
              <CardBody textAlign="center">
                <VStack spacing={2}>
                  <Icon as={FiShield} boxSize={8} color="purple.500" />
                  <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                    {dashboardData.lastCheckupScore}%
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Health Score
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Main Content Grid */}
          <Grid templateColumns={{ base: "1fr", xl: "2fr 1fr" }} gap={8}>
            {/* Left Column */}
            <VStack spacing={8} align="stretch">
              {/* Active Prescriptions */}
              <Card bg={cardBg} borderColor={borderColor} shadow="xl">
                <CardHeader>
                  <HStack justify="space-between">
                    <HStack spacing={3}>
                      <Icon as={FiHeart} boxSize={6} color="blue.500" />
                      <Heading size="md">Active Prescriptions</Heading>
                    </HStack>
                    <Badge colorScheme="blue" variant="subtle">
                      {prescriptions.length} Active
                    </Badge>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {prescriptions.map((prescription, index) => (
                      <Box
                        key={index}
                        p={4}
                        bg="blue.50"
                        borderRadius="lg"
                        borderLeft="4px solid"
                        borderLeftColor="blue.400"
                      >
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold" color="blue.800">
                              {prescription.medication}
                            </Text>
                            <Text fontSize="sm" color="blue.600">
                              {prescription.dosage} • {prescription.frequency}
                            </Text>
                            <Text fontSize="xs" color="blue.500">
                              Prescribed by Dr. {prescription.doctor}
                            </Text>
                          </VStack>
                          <VStack spacing={2} align="end">
                            <Badge
                              colorScheme={getStatusColor(prescription.status)}
                            >
                              {prescription.status}
                            </Badge>
                            <Text fontSize="xs" color="blue.500">
                              {prescription.refillsLeft} refills left
                            </Text>
                          </VStack>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                </CardBody>
              </Card>

              {/* Upcoming Appointments */}
              <Card bg={cardBg} borderColor={borderColor} shadow="xl">
                <CardHeader>
                  <HStack justify="space-between">
                    <HStack spacing={3}>
                      <Icon as={FiCalendar} boxSize={6} color="green.500" />
                      <Heading size="md">Upcoming Appointments</Heading>
                    </HStack>
                    <Badge colorScheme="green" variant="subtle">
                      {appointments.length} Scheduled
                    </Badge>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {appointments.map((appointment, index) => (
                      <Box
                        key={index}
                        p={4}
                        bg="green.50"
                        borderRadius="lg"
                        borderLeft="4px solid"
                        borderLeftColor="green.400"
                      >
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold" color="green.800">
                              {appointment.doctor}
                            </Text>
                            <Text fontSize="sm" color="green.600">
                              {appointment.type} • {appointment.department}
                            </Text>
                            <Text fontSize="xs" color="green.500">
                              {appointment.date} at {appointment.time}
                            </Text>
                          </VStack>
                          <VStack spacing={2} align="end">
                            <Badge
                              colorScheme={getStatusColor(appointment.status)}
                            >
                              {appointment.status}
                            </Badge>
                            <Text fontSize="xs" color="green.500">
                              {appointment.location}
                            </Text>
                          </VStack>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            </VStack>

            {/* Right Column */}
            <VStack spacing={8} align="stretch">
              {/* Current Vitals */}
              <Card bg={cardBg} borderColor={borderColor} shadow="xl">
                <CardHeader>
                  <HStack spacing={3}>
                    <Icon as={FiActivity} boxSize={6} color="red.500" />
                    <Heading size="md">Current Vitals</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack
                      justify="space-between"
                      p={3}
                      bg="red.50"
                      borderRadius="lg"
                    >
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="red.600" fontWeight="medium">
                          Heart Rate
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" color="red.800">
                          {vitals.heartRate?.value}
                        </Text>
                      </VStack>
                      <Badge
                        colorScheme={getStatusColor(vitals.heartRate?.status)}
                      >
                        {vitals.heartRate?.status}
                      </Badge>
                    </HStack>

                    <HStack
                      justify="space-between"
                      p={3}
                      bg="blue.50"
                      borderRadius="lg"
                    >
                      <VStack align="start" spacing={0}>
                        <Text
                          fontSize="sm"
                          color="blue.600"
                          fontWeight="medium"
                        >
                          Blood Pressure
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" color="blue.800">
                          {vitals.bloodPressure?.value}
                        </Text>
                      </VStack>
                      <Badge
                        colorScheme={getStatusColor(
                          vitals.bloodPressure?.status
                        )}
                      >
                        {vitals.bloodPressure?.status}
                      </Badge>
                    </HStack>

                    <HStack
                      justify="space-between"
                      p={3}
                      bg="orange.50"
                      borderRadius="lg"
                    >
                      <VStack align="start" spacing={0}>
                        <Text
                          fontSize="sm"
                          color="orange.600"
                          fontWeight="medium"
                        >
                          Temperature
                        </Text>
                        <Text
                          fontSize="lg"
                          fontWeight="bold"
                          color="orange.800"
                        >
                          {vitals.temperature?.value}
                        </Text>
                      </VStack>
                      <Badge
                        colorScheme={getStatusColor(vitals.temperature?.status)}
                      >
                        {vitals.temperature?.status}
                      </Badge>
                    </HStack>

                    <HStack
                      justify="space-between"
                      p={3}
                      bg="purple.50"
                      borderRadius="lg"
                    >
                      <VStack align="start" spacing={0}>
                        <Text
                          fontSize="sm"
                          color="purple.600"
                          fontWeight="medium"
                        >
                          Weight
                        </Text>
                        <Text
                          fontSize="lg"
                          fontWeight="bold"
                          color="purple.800"
                        >
                          {vitals.weight?.value}
                        </Text>
                      </VStack>
                      <Badge
                        colorScheme={getStatusColor(vitals.weight?.status)}
                      >
                        {vitals.weight?.status}
                      </Badge>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Emergency Contacts */}
              <Card bg={cardBg} borderColor={borderColor} shadow="xl">
                <CardHeader>
                  <HStack spacing={3}>
                    <Icon as={FiPhone} boxSize={6} color="orange.500" />
                    <Heading size="md">Emergency Contacts</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <Text fontWeight="bold">Sarah Johnson</Text>
                      <Text fontSize="sm" color="gray.600">
                        Mother
                      </Text>
                      <Text fontSize="sm" color="blue.600">
                        +1 (555) 123-4567
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold">Michael Johnson</Text>
                      <Text fontSize="sm" color="gray.600">
                        Father
                      </Text>
                      <Text fontSize="sm" color="blue.600">
                        +1 (555) 123-4568
                      </Text>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </Grid>

          {/* Health Status Alert */}
          <Alert status="success" borderRadius="lg">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <AlertTitle>Health Status: Good</AlertTitle>
              <AlertDescription>
                All your vital signs are within normal ranges. Keep up the great
                work with your medication adherence and upcoming appointments!
              </AlertDescription>
            </VStack>
          </Alert>
        </VStack>
      </Container>
    </Box>
  );
};

export default PatientDashboard;
