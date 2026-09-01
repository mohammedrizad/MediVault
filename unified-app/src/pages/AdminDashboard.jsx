import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  FiUserPlus,
  FiShield,
  FiSettings,
  FiBarChart,
  FiDatabase,
  FiActivity,
  FiServer,
} from "react-icons/fi";
import { adminAPI } from "../services/api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalDoctors: 0,
    totalNurses: 0,
    totalPatients: 0,
    totalScanCenters: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await adminAPI.getDashboardStats();
        setDashboardData(response.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Admin-specific stats using real data
  const stats = [
    {
      label: "Total Doctors",
      value: dashboardData.totalDoctors,
      change: 12,
      changeType: "increase",
      icon: FiUsers,
      color: "blue.500",
    },
    {
      label: "Total Nurses",
      value: dashboardData.totalNurses,
      change: 8,
      changeType: "increase",
      icon: FiUserPlus,
      color: "green.500",
    },
    {
      label: "Total Patients",
      value: dashboardData.totalPatients,
      change: 156,
      changeType: "increase",
      icon: FiActivity,
      color: "purple.500",
    },
    {
      label: "Scan Centers",
      value: dashboardData.totalScanCenters,
      change: 2,
      changeType: "increase",
      icon: FiServer,
      color: "orange.500",
    },
    {
      label: "System Health",
      value: "99.9%",
      change: 0.1,
      changeType: "increase",
      icon: FiShield,
      color: "green.500",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      action: "New Doctor Added",
      user: "Dr. Sarah Wilson",
      time: "2 hours ago",
      status: "completed",
    },
    {
      id: 2,
      action: "Patient Registration",
      user: "John Doe",
      time: "4 hours ago",
      status: "completed",
    },
    {
      id: 3,
      action: "System Backup",
      user: "System",
      time: "6 hours ago",
      status: "completed",
    },
    {
      id: 4,
      action: "Doctor Profile Update",
      user: "Dr. Mike Johnson",
      time: "8 hours ago",
      status: "pending",
    },
  ];

  const quickActions = [
    {
      title: "Entity Management",
      description: "Add, edit doctors, nurses, patients & scan centers",
      icon: FiDatabase,
      color: "teal",
      path: "/admin/management",
    },
    {
      title: "Manage Doctors",
      description: "Add, edit, or remove doctor accounts",
      icon: FiUserPlus,
      color: "blue",
      path: "/admin/doctors",
    },
    {
      title: "User Management",
      description: "Manage all system users",
      icon: FiUsers,
      color: "green",
      path: "/admin/users",
    },
    {
      title: "System Settings",
      description: "Configure system preferences",
      icon: FiSettings,
      color: "purple",
      path: "/admin/settings",
    },
    {
      title: "View Analytics",
      description: "System usage analytics",
      icon: FiBarChart,
      color: "orange",
      path: "/admin/analytics",
    },
  ];

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={4}>
          Admin Dashboard
        </Text>
        <Text color="gray.600">
          System administration and user management portal.
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
                  {stat.change} from last month
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
                onClick={() => navigate(action.path)}
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
                <Button colorScheme={action.color} size="sm">
                  Open
                </Button>
              </VStack>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardBody>
          <HStack justify="space-between" mb={4}>
            <Text fontSize="lg" fontWeight="semibold">
              Recent System Activity
            </Text>
            <Button colorScheme="red" size="sm">
              View Audit Logs
            </Button>
          </HStack>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Action</Th>
                <Th>User</Th>
                <Th>Time</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {recentActivity.map((activity) => (
                <Tr key={activity.id}>
                  <Td>{activity.action}</Td>
                  <Td>{activity.user}</Td>
                  <Td>{activity.time}</Td>
                  <Td>
                    <Badge
                      colorScheme={
                        activity.status === "completed" ? "green" : "yellow"
                      }
                    >
                      {activity.status}
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      {/* System Status */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Card>
          <CardBody>
            <HStack spacing={4} mb={4}>
              <Icon as={FiServer} w={6} h={6} color="green.500" />
              <Text fontSize="lg" fontWeight="semibold">
                Server Status
              </Text>
            </HStack>
            <VStack align="stretch" spacing={2}>
              <HStack justify="space-between">
                <Text>Database Connection</Text>
                <Badge colorScheme="green">Online</Badge>
              </HStack>
              <HStack justify="space-between">
                <Text>API Server</Text>
                <Badge colorScheme="green">Running</Badge>
              </HStack>
              <HStack justify="space-between">
                <Text>Storage Service</Text>
                <Badge colorScheme="green">Available</Badge>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <HStack spacing={4} mb={4}>
              <Icon as={FiActivity} w={6} h={6} color="blue.500" />
              <Text fontSize="lg" fontWeight="semibold">
                Performance Metrics
              </Text>
            </HStack>
            <VStack align="stretch" spacing={2}>
              <HStack justify="space-between">
                <Text>Response Time</Text>
                <Text fontWeight="medium">120ms</Text>
              </HStack>
              <HStack justify="space-between">
                <Text>Uptime</Text>
                <Text fontWeight="medium">99.9%</Text>
              </HStack>
              <HStack justify="space-between">
                <Text>Active Sessions</Text>
                <Text fontWeight="medium">234</Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>
    </VStack>
  );
};

export default AdminDashboard;
