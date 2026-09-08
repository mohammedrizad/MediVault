import React, { useState, useEffect } from "react";
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
} from "@chakra-ui/react";
import {
  FiUsers,
  FiCalendar,
  FiActivity,
  FiHeart,
  FiPlus,
  FiCamera,
  FiFileText,
} from "react-icons/fi";
import { nurseAPI } from "../services/api";
import { useNavigate } from "react-router-dom";

const NurseDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    patientsRegistered: 0,
    todayAdmissions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await nurseAPI.getDashboardStats();
        setDashboardData(response.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Nurse-specific stats using real data
  const stats = [
    {
      label: "Patients Registered",
      value: dashboardData.patientsRegistered,
      change: 12,
      changeType: "increase",
      icon: FiUsers,
      color: "green.500",
    },
    {
      label: "Today Admissions",
      value: dashboardData.todayAdmissions,
      change: 5,
      changeType: "increase",
      icon: FiActivity,
      color: "blue.500",
    },
    {
      label: "Records Uploaded",
      value: 18,
      change: 5,
      changeType: "increase",
    },
    {
      label: "Verifications Done",
      value: 42,
      change: 8,
      changeType: "increase",
    },
  ];

  const recentPatients = [
    {
      id: 1,
      name: "John Doe",
      uhid: "UH001234",
      status: "Registered",
      time: "10:30 AM",
    },
    {
      id: 2,
      name: "Jane Smith",
      uhid: "UH001235",
      status: "Pending",
      time: "11:15 AM",
    },
    {
      id: 3,
      name: "Mike Johnson",
      uhid: "UH001236",
      status: "Verified",
      time: "12:00 PM",
    },
  ];

  const handleQuickAction = (action) => {
    switch (action) {
      case "register":
        navigate("/nurse/patients");
        break;
      case "verify":
        navigate("/nurse/patients");
        break;
      case "upload":
        navigate("/nurse/records");
        break;
      case "schedule":
        navigate("/nurse/appointments");
        break;
      default:
        break;
    }
  };

  const quickActions = [
    {
      title: "Register New Patient",
      description: "Register a new patient with facial recognition",
      icon: FiUsers,
      color: "blue",
      action: "register",
    },
    {
      title: "Verify Patient",
      description: "Verify patient identity using face scan",
      icon: FiCamera,
      color: "green",
      action: "verify",
    },
    {
      title: "Upload Records",
      description: "Upload medical records and documents",
      icon: FiFileText,
      color: "purple",
      action: "upload",
    },
    {
      title: "Schedule Appointment",
      description: "Book new patient appointment",
      icon: FiCalendar,
      color: "orange",
      action: "schedule",
    },
  ];

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={4}>
          Nurse Dashboard
        </Text>
        <Text color="gray.600">
          Welcome to your nursing portal. Manage patient registrations and
          records.
        </Text>
      </Box>

      {/* Statistics Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardBody>
              <Stat>
                <StatLabel>{stat.label}</StatLabel>
                <StatNumber>{stat.value}</StatNumber>
                <StatHelpText>
                  <StatArrow type={stat.changeType} />
                  {stat.change} from yesterday
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Quick Actions */}
      <Card>
        <CardBody>
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            Quick Actions
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
            {quickActions.map((action, index) => (
              <VStack
                key={index}
                p={4}
                border="1px"
                borderColor="gray.200"
                borderRadius="md"
                cursor="pointer"
                transition="all 0.2s"
                _hover={{
                  borderColor: `${action.color}.300`,
                  bg: `${action.color}.50`,
                }}
                onClick={() => handleQuickAction(action.action)}
              >
                <Icon
                  as={action.icon}
                  w={8}
                  h={8}
                  color={`${action.color}.500`}
                />
                <Text fontWeight="medium" textAlign="center">
                  {action.title}
                </Text>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  {action.description}
                </Text>
                <Button
                  colorScheme={action.color}
                  size="sm"
                  leftIcon={<FiPlus />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickAction(action.action);
                  }}
                >
                  {action.title.split(" ")[0]}
                </Button>
              </VStack>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Recent Patients */}
      <Card>
        <CardBody>
          <HStack justify="space-between" mb={4}>
            <Text fontSize="lg" fontWeight="semibold">
              Recent Patient Activities
            </Text>
            <Button
              colorScheme="purple"
              size="sm"
              onClick={() => navigate("/nurse/patients")}
            >
              View All
            </Button>
          </HStack>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Patient Name</Th>
                <Th>UHID</Th>
                <Th>Status</Th>
                <Th>Time</Th>
              </Tr>
            </Thead>
            <Tbody>
              {recentPatients.map((patient) => (
                <Tr key={patient.id}>
                  <Td>{patient.name}</Td>
                  <Td>{patient.uhid}</Td>
                  <Td>
                    <Badge
                      colorScheme={
                        patient.status === "Verified"
                          ? "green"
                          : patient.status === "Pending"
                            ? "yellow"
                            : "blue"
                      }
                    >
                      {patient.status}
                    </Badge>
                  </Td>
                  <Td>{patient.time}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default NurseDashboard;
