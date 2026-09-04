import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
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
} from "@chakra-ui/react";
import {
  FiUsers,
  FiCalendar,
  FiFileText,
  FiActivity,
  FiClock,
  FiTrendingUp,
  FiAlertCircle,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { doctorAPI } from "../services/api";
import DrugSafetyChecker from "../components/DrugSafetyChecker";

const DoctorDashboard = () => {
  const { currentUser } = useAuth();
  const cardBg = useColorModeValue("white", "gray.700");

  const [dashboardData, setDashboardData] = useState({
    totalPatients: 0,
    appointmentsToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await doctorAPI.getDashboardStats();
        setDashboardData(response.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Doctor-specific data using real API data
  const doctorData = {
    todayAppointments: dashboardData.appointmentsToday,
    totalPatients: dashboardData.totalPatients,
    pendingReports: 5,
    emergencies: 2,
    upcomingAppointments: [
      { id: 1, patient: "John Doe", time: "9:00 AM", type: "Consultation" },
      { id: 2, patient: "Jane Smith", time: "10:30 AM", type: "Follow-up" },
      { id: 3, patient: "Mike Johnson", time: "2:00 PM", type: "Check-up" },
    ],
    recentPatients: [
      {
        id: 1,
        name: "Alice Brown",
        lastVisit: "2 days ago",
        condition: "Hypertension",
      },
      {
        id: 2,
        name: "Bob Wilson",
        lastVisit: "1 week ago",
        condition: "Diabetes",
      },
    ],
  };

  return (
    <Box>
      {/* Welcome Section */}
      <Box mb={8}>
        <Heading size="lg" mb={2}>
          Good morning, Dr. {currentUser?.name || "Doctor"}!
        </Heading>
        <Text color="gray.600">
          You have {doctorData.todayAppointments} appointments today
        </Text>
      </Box>

      {/* Quick Stats */}
      <Grid
        templateColumns={{
          base: "1fr",
          md: "repeat(2, 1fr)",
          lg: "repeat(4, 1fr)",
        }}
        gap={6}
        mb={8}
      >
        <Card bg={cardBg}>
          <CardBody>
            <Stat>
              <StatLabel>Today's Appointments</StatLabel>
              <StatNumber>{doctorData.todayAppointments}</StatNumber>
              <StatHelpText>
                <Icon as={FiCalendar} mr={1} />
                Scheduled
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardBody>
            <Stat>
              <StatLabel>Total Patients</StatLabel>
              <StatNumber>{doctorData.totalPatients}</StatNumber>
              <StatHelpText>
                <Icon as={FiUsers} mr={1} />
                Under care
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardBody>
            <Stat>
              <StatLabel>Pending Reports</StatLabel>
              <StatNumber>{doctorData.pendingReports}</StatNumber>
              <StatHelpText>
                <Icon as={FiFileText} mr={1} />
                Need review
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardBody>
            <Stat>
              <StatLabel>Emergencies</StatLabel>
              <StatNumber color="red.500">{doctorData.emergencies}</StatNumber>
              <StatHelpText>
                <Icon as={FiAlertCircle} mr={1} color="red.500" />
                Urgent attention
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </Grid>

      {/* Main Content Grid */}
      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
        {/* Left Column */}
        <VStack spacing={6} align="stretch">
          {/* Today's Appointments */}
          <Card bg={cardBg}>
            <CardHeader>
              <Heading size="md">
                <Icon as={FiCalendar} mr={2} color="green.500" />
                Today's Appointments
              </Heading>
            </CardHeader>
            <CardBody>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Patient</Th>
                    <Th>Time</Th>
                    <Th>Type</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {doctorData.upcomingAppointments.map((appointment) => (
                    <Tr key={appointment.id}>
                      <Td>{appointment.patient}</Td>
                      <Td>{appointment.time}</Td>
                      <Td>
                        <Badge colorScheme="blue">{appointment.type}</Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </CardBody>
          </Card>

          {/* Drug Safety Checker */}
          <DrugSafetyChecker />

          {/* Recent Patients */}
          <Card bg={cardBg}>
            <CardHeader>
              <Heading size="md">
                <Icon as={FiUsers} mr={2} color="blue.500" />
                Recent Patients
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {doctorData.recentPatients.map((patient) => (
                  <Box key={patient.id} p={4} bg="gray.50" rounded="md">
                    <HStack justify="space-between">
                      <HStack>
                        <Avatar size="sm" name={patient.name} />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="semibold">{patient.name}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {patient.condition}
                          </Text>
                        </VStack>
                      </HStack>
                      <VStack align="end" spacing={0}>
                        <Text fontSize="sm" color="gray.600">
                          {patient.lastVisit}
                        </Text>
                        <Button size="xs" colorScheme="blue">
                          View Records
                        </Button>
                      </VStack>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </VStack>

        {/* Right Column */}
        <VStack spacing={6} align="stretch">
          {/* Quick Actions */}
          <Card bg={cardBg}>
            <CardHeader>
              <Heading size="md">Quick Actions</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={3}>
                <Button colorScheme="green" w="full" leftIcon={<FiUsers />}>
                  Search Patient
                </Button>
                <Button variant="outline" w="full" leftIcon={<FiCalendar />}>
                  View Schedule
                </Button>
                <Button variant="outline" w="full" leftIcon={<FiFileText />}>
                  Review Reports
                </Button>
                <Button variant="outline" w="full" leftIcon={<FiActivity />}>
                  Patient Analytics
                </Button>
              </VStack>
            </CardBody>
          </Card>

          {/* Notifications */}
          <Card bg={cardBg}>
            <CardHeader>
              <Heading size="md">
                <Icon as={FiAlertCircle} mr={2} color="orange.500" />
                Notifications
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} align="stretch">
                <Box
                  p={3}
                  bg="red.50"
                  rounded="md"
                  borderLeft="4px"
                  borderColor="red.500"
                >
                  <Text fontSize="sm" fontWeight="semibold" color="red.700">
                    Emergency Patient
                  </Text>
                  <Text fontSize="xs" color="red.600">
                    John Doe - Chest pain reported
                  </Text>
                </Box>
                <Box
                  p={3}
                  bg="yellow.50"
                  rounded="md"
                  borderLeft="4px"
                  borderColor="yellow.500"
                >
                  <Text fontSize="sm" fontWeight="semibold" color="yellow.700">
                    Lab Results Available
                  </Text>
                  <Text fontSize="xs" color="yellow.600">
                    5 new reports need review
                  </Text>
                </Box>
                <Box
                  p={3}
                  bg="blue.50"
                  rounded="md"
                  borderLeft="4px"
                  borderColor="blue.500"
                >
                  <Text fontSize="sm" fontWeight="semibold" color="blue.700">
                    Appointment Reminder
                  </Text>
                  <Text fontSize="xs" color="blue.600">
                    Next patient in 15 minutes
                  </Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Grid>
    </Box>
  );
};

export default DoctorDashboard;
