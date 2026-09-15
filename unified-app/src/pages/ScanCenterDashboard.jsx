import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Icon,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import {
  FiActivity,
  FiCamera,
  FiFileText,
  FiClock,
  FiUsers,
  FiCalendar,
  FiBarChart,
  FiUpload,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { scanCenterAPI } from "../services/api";

const ScanCenterDashboard = () => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue("white", "gray.800");
  const statBg = useColorModeValue("gray.50", "gray.700");

  const [dashboardData, setDashboardData] = useState({
    totalScans: 0,
    pendingResults: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await scanCenterAPI.getDashboardStats();
        setDashboardData(response.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsData = [
    {
      label: "Total Scans",
      number: dashboardData.totalScans,
      change: "+12%",
      isIncrease: true,
      icon: FiCamera,
      color: "blue.500",
    },
    {
      label: "Pending Results",
      number: dashboardData.pendingResults,
      change: "-5%",
      isIncrease: false,
      icon: FiClock,
      color: "orange.500",
    },
    {
      label: "Completed Today",
      number: "23",
      change: "+8%",
      isIncrease: true,
      icon: FiActivity,
      color: "teal",
    },
    {
      label: "Pending Reports",
      number: "7",
      change: "-3",
      isIncrease: false,
      icon: FiFileText,
      color: "orange",
    },
    {
      label: "Equipment Online",
      number: "15/16",
      change: "94%",
      isIncrease: true,
      icon: FiCamera,
      color: "green",
    },
    {
      label: "Average Wait Time",
      number: "12 min",
      change: "-5 min",
      isIncrease: false,
      icon: FiClock,
      color: "blue",
    },
  ];

  const quickActions = [
    {
      title: "Schedule Scan",
      description: "Schedule new patient scan",
      icon: FiCalendar,
      color: "teal",
      path: "/scancenter/schedule",
    },
    {
      title: "Upload Results",
      description: "Upload scan results",
      icon: FiUpload,
      color: "blue",
      path: "/scancenter/upload",
    },
    {
      title: "Equipment Status",
      description: "Check equipment status",
      icon: FiCamera,
      color: "green",
      path: "/scancenter/equipment",
    },
    {
      title: "Reports",
      description: "View scan reports",
      icon: FiBarChart,
      color: "purple",
      path: "/scancenter/reports",
    },
  ];

  const todayScans = [
    {
      time: "09:00 AM",
      patient: "John Doe",
      uhid: "UH001",
      scanType: "CT Scan",
      status: "completed",
      doctor: "Dr. Smith",
    },
    {
      time: "10:30 AM",
      patient: "Jane Smith",
      uhid: "UH002",
      scanType: "MRI",
      status: "in-progress",
      doctor: "Dr. Johnson",
    },
    {
      time: "11:15 AM",
      patient: "Robert Wilson",
      uhid: "UH003",
      scanType: "X-Ray",
      status: "scheduled",
      doctor: "Dr. Brown",
    },
    {
      time: "02:00 PM",
      patient: "Maria Garcia",
      uhid: "UH004",
      scanType: "Ultrasound",
      status: "scheduled",
      doctor: "Dr. Davis",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "green";
      case "in-progress":
        return "blue";
      case "scheduled":
        return "orange";
      default:
        return "gray";
    }
  };

  return (
    <Container maxW="6xl" p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Text fontSize="3xl" fontWeight="bold" color="teal.500">
            Scan Center Dashboard
          </Text>
          <Text color="gray.600">
            Medical imaging and diagnostic services management
          </Text>
        </Box>

        {/* Statistics Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          {statsData.map((stat, index) => (
            <Card key={index} bg={statBg}>
              <CardBody>
                <Stat>
                  <HStack justify="space-between">
                    <Box>
                      <StatLabel fontSize="sm">{stat.label}</StatLabel>
                      <StatNumber fontSize="2xl">{stat.number}</StatNumber>
                      <StatHelpText mb={0}>
                        {stat.label !== "Equipment Online" && (
                          <StatArrow
                            type={stat.isIncrease ? "increase" : "decrease"}
                          />
                        )}
                        {stat.change}
                      </StatHelpText>
                    </Box>
                    <Icon
                      as={stat.icon}
                      w={8}
                      h={8}
                      color={`${stat.color}.500`}
                    />
                  </HStack>
                </Stat>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {/* Quick Actions */}
        <Card bg={cardBg}>
          <CardHeader>
            <Text fontSize="xl" fontWeight="bold">
              Quick Actions
            </Text>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {quickActions.map((action, index) => (
                <Card
                  key={index}
                  variant="outline"
                  cursor="pointer"
                  _hover={{ shadow: "md", borderColor: `${action.color}.300` }}
                  onClick={() => navigate(action.path)}
                >
                  <CardBody>
                    <HStack spacing={4}>
                      <Icon
                        as={action.icon}
                        w={8}
                        h={8}
                        color={`${action.color}.500`}
                      />
                      <VStack align="start" spacing={1} flex={1}>
                        <Text fontWeight="semibold">{action.title}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {action.description}
                        </Text>
                      </VStack>
                    </HStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Today's Scan Schedule */}
        <Card bg={cardBg}>
          <CardHeader>
            <HStack justify="space-between">
              <Text fontSize="xl" fontWeight="bold">
                Today's Scan Schedule
              </Text>
              <Button
                size="sm"
                variant="outline"
                colorScheme="teal"
                onClick={() => navigate("/scancenter/schedule")}
              >
                View All
              </Button>
            </HStack>
          </CardHeader>
          <CardBody>
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Time</Th>
                    <Th>Patient</Th>
                    <Th>UHID</Th>
                    <Th>Scan Type</Th>
                    <Th>Doctor</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {todayScans.map((scan, index) => (
                    <Tr key={index}>
                      <Td fontWeight="medium">{scan.time}</Td>
                      <Td>{scan.patient}</Td>
                      <Td>{scan.uhid}</Td>
                      <Td>{scan.scanType}</Td>
                      <Td>{scan.doctor}</Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(scan.status)}>
                          {scan.status}
                        </Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default ScanCenterDashboard;
