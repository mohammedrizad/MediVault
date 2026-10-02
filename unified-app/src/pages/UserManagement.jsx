import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dataService from "../services/DataService";
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Input,
  Select,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
  Flex,
  Icon,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Switch,
  Tooltip,
} from "@chakra-ui/react";
import {
  FiSearch,
  FiPlus,
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiShield,
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiMail,
  FiCalendar,
  FiActivity,
  FiEye,
  FiLock,
} from "react-icons/fi";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);

  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onClose: onViewClose,
  } = useDisclosure();

  const cardBg = useColorModeValue("white", "gray.700");
  const toast = useToast();

  const navigate = useNavigate();

  const stats = [
    {
      title: "Total Users",
      value: users.length.toString(),
      icon: FiUsers,
      color: "blue",
      change: "+12 this month",
    },
    {
      title: "Active Users",
      value: users.filter((u) => u.status === "active").length.toString(),
      icon: FiUserCheck,
      color: "green",
      change: "98% uptime",
    },
    {
      title: "Inactive Users",
      value: users.filter((u) => u.status === "inactive").length.toString(),
      icon: FiUserX,
      color: "red",
      change: "-2 this week",
    },
    {
      title: "Admin Users",
      value: users.filter((u) => u.role === "admin").length.toString(),
      icon: FiShield,
      color: "purple",
      change: "Security level: High",
    },
  ];

  const loadUsers = async () => {
    setLoading(true);
    try {
      const [doctors, nurses, scanCenters, patients] = await Promise.all([
        dataService.getDoctors(),
        dataService.getNurses(),
        dataService.getScanCenters(),
        dataService.getPatients(),
      ]);

      const combined = [
        ...doctors.map((d) => ({
          id: d._id,
          name: d.Doctor_name,
          email: d.Email_Address,
          role: "doctor",
          status: "active",
          lastLogin: "N/A",
          createdAt: d.Date_Joined || "N/A",
          department: d.Specialization || "N/A",
          phone: d.PhoneNo || "N/A",
          avatar: null,
          permissions: ["read_patients", "write_patients", "read_reports"],
        })),
        ...nurses.map((n) => ({
          id: n._id,
          name: n.Doctor_name,
          email: n.Email_Address,
          role: "nurse",
          status: "active",
          lastLogin: "N/A",
          createdAt: n.Date_Joined || "N/A",
          department: n.Specialization || "N/A",
          phone: n.PhoneNo || "N/A",
          avatar: null,
          permissions: ["read_patients", "update_vitals", "register_patients"],
        })),
        ...scanCenters.map((s) => ({
          id: s._id,
          name: s.username,
          email: s.Email_Address,
          role: "scancenter",
          status: "active",
          lastLogin: "N/A",
          createdAt: s.Date_Joined || "N/A",
          department: s.Specialization || "N/A",
          phone: "N/A",
          avatar: null,
          permissions: ["upload_scans", "read_scan_requests", "update_reports"],
        })),
        ...patients.map((p) => ({
          id: p._id,
          name: p.name || "N/A",
          email: p.email || "N/A",
          role: "patient",
          status: (p.status || "Active").toLowerCase(),
          lastLogin: "N/A",
          createdAt: "N/A",
          department: p.condition || "N/A",
          phone: p.phone || "N/A",
          avatar: null,
          permissions: ["read_own_records", "book_appointments"],
        })),
      ];

      setUsers(combined);
    } catch (err) {
      console.error("Failed to load users:", err);
      toast({
        title: "Failed to load users",
        description: err.message,
        status: "error",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "purple";
      case "doctor":
        return "blue";
      case "nurse":
        return "green";
      case "patient":
        return "orange";
      case "scancenter":
        return "teal";
      default:
        return "gray";
    }
  };

  const getStatusColor = (status) => {
    return status === "active" ? "green" : "red";
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus =
      filterStatus === "all" || user.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Patients have a real `status` field in the schema; doctors/nurses/
  // scan centers don't, so toggling is only meaningful (and persisted)
  // for patients.
  const handleToggleStatus = async (user) => {
    if (user.role !== "patient") {
      toast({
        title: "Not supported",
        description: `${user.role}s don't have an active/inactive status field yet.`,
        status: "info",
        duration: 3000,
      });
      return;
    }
    const newStatus = user.status === "active" ? "Inactive" : "Active";
    try {
      await dataService.updatePatient(user.id, { status: newStatus });
      toast({
        title: "Status Updated",
        description: `${user.name}'s status is now ${newStatus}.`,
        status: "success",
        duration: 3000,
      });
      loadUsers();
    } catch (err) {
      toast({
        title: "Failed to update status",
        description: err.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Delete ${user.name}? This cannot be undone.`)) return;
    try {
      if (user.role === "doctor") await dataService.deleteDoctor(user.id);
      else if (user.role === "nurse") await dataService.deleteNurse(user.id);
      else if (user.role === "scancenter")
        await dataService.deleteScanCenter(user.id);
      else if (user.role === "patient") await dataService.deletePatient(user.id);
      else {
        toast({
          title: "Cannot delete",
          description: "Admin users can't be deleted from here.",
          status: "warning",
          duration: 3000,
        });
        return;
      }
      toast({
        title: "User Deleted",
        description: `${user.name} has been removed successfully.`,
        status: "success",
        duration: 3000,
      });
      loadUsers();
    } catch (err) {
      toast({
        title: "Failed to delete user",
        description: err.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    onViewOpen();
  };

  const MANAGE_ROUTE_BY_ROLE = {
    doctor: "/admin/doctors",
    nurse: "/admin/nurses",
    scancenter: "/admin/scancenters",
    patient: "/admin/patients",
  };

  const handleEditUser = (user) => {
    const route = MANAGE_ROUTE_BY_ROLE[user.role];
    if (!route) {
      toast({
        title: "Cannot edit",
        description: "Admin users can't be edited from here.",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    toast({
      title: "Opening management page",
      description: `Edit ${user.name} from the ${user.role} management page.`,
      status: "info",
      duration: 2500,
    });
    navigate(route);
  };

  return (
    <Container maxW="full" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Text fontSize="3xl" fontWeight="bold">
              User Management
            </Text>
            <Text color="gray.600">
              Manage system users, roles, and permissions
            </Text>
          </VStack>
          <Menu>
            <MenuButton as={Button} leftIcon={<FiPlus />} colorScheme="blue">
              Add New User
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => navigate("/admin/add-doctor")}>
                Add Doctor
              </MenuItem>
              <MenuItem onClick={() => navigate("/admin/add-nurse")}>
                Add Nurse
              </MenuItem>
              <MenuItem onClick={() => navigate("/admin/add-scancenter")}>
                Add Scan Center
              </MenuItem>
              <MenuItem onClick={() => navigate("/admin/add-patient")}>
                Add Patient
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          {stats.map((stat, index) => (
            <Card key={index} bg={cardBg}>
              <CardBody>
                <HStack spacing={4}>
                  <Box p={3} bg={`${stat.color}.100`} borderRadius="full">
                    <Icon
                      as={stat.icon}
                      color={`${stat.color}.500`}
                      boxSize={6}
                    />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="2xl" fontWeight="bold">
                      {stat.value}
                    </Text>
                    <Text color="gray.600" fontSize="sm">
                      {stat.title}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {stat.change}
                    </Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {/* Security Notice */}
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Security Reminder!</AlertTitle>
            <AlertDescription>
              Regular user access reviews are recommended. Last review was
              conducted 30 days ago.
            </AlertDescription>
          </Box>
        </Alert>

        {/* Filters */}
        <Card bg={cardBg}>
          <CardHeader>
            <Text fontSize="lg" fontWeight="semibold">
              Filter Users
            </Text>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>

              <Select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="patient">Patient</option>
                <option value="scancenter">Scan Center</option>
              </Select>

              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Users Table */}
        <Card bg={cardBg}>
          <CardHeader>
            <Text fontSize="lg" fontWeight="semibold">
              Users ({filteredUsers.length})
            </Text>
          </CardHeader>
          <CardBody>
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>User</Th>
                    <Th>Role</Th>
                    <Th>Department</Th>
                    <Th>Status</Th>
                    <Th>Last Login</Th>
                    <Th>Login Count</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredUsers.map((user) => (
                    <Tr key={user.id} _hover={{ bg: "gray.50" }}>
                      <Td>
                        <HStack spacing={3}>
                          <Avatar size="sm" name={user.name} />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm" fontWeight="medium">
                              {user.name}
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                              {user.email}
                            </Text>
                          </VStack>
                        </HStack>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={getRoleColor(user.role)}
                          variant="subtle"
                        >
                          {user.role.toUpperCase()}
                        </Badge>
                      </Td>
                      <Td>
                        <Text fontSize="sm">{user.department}</Text>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Badge
                            colorScheme={getStatusColor(user.status)}
                            variant="subtle"
                          >
                            {user.status.toUpperCase()}
                          </Badge>
                          <Switch
                            size="sm"
                            isChecked={user.status === "active"}
                            onChange={() => handleToggleStatus(user)}
                          />
                        </HStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm" color="gray.500">
                          Not tracked
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm" color="gray.500">
                          Not tracked
                        </Text>
                      </Td>
                      <Td>
                        <Menu>
                          <MenuButton
                            as={Button}
                            size="sm"
                            variant="ghost"
                            leftIcon={<FiMoreVertical />}
                          />
                          <MenuList>
                            <MenuItem
                              icon={<FiEye />}
                              onClick={() => handleViewUser(user)}
                            >
                              View Details
                            </MenuItem>
                            <MenuItem
                              icon={<FiEdit />}
                              onClick={() => handleEditUser(user)}
                            >
                              Edit User
                            </MenuItem>
                            <MenuItem
                              icon={<FiTrash2 />}
                              color="red.500"
                              onClick={() => handleDeleteUser(user)}
                            >
                              Delete User
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </CardBody>
        </Card>

        {/* Add User Modal */}
        {/* View User Modal */}
        <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>User Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedUser && (
                <VStack spacing={4} align="stretch">
                  <HStack spacing={4}>
                    <Avatar size="lg" name={selectedUser.name} />
                    <VStack align="start" spacing={1}>
                      <Text fontSize="xl" fontWeight="bold">
                        {selectedUser.name}
                      </Text>
                      <Text color="gray.600">{selectedUser.email}</Text>
                      <Badge colorScheme={getRoleColor(selectedUser.role)}>
                        {selectedUser.role.toUpperCase()}
                      </Badge>
                    </VStack>
                  </HStack>

                  <SimpleGrid columns={2} spacing={4}>
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" color="gray.600">
                        Department
                      </Text>
                      <Text>{selectedUser.department}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" color="gray.600">
                        Phone
                      </Text>
                      <Text>{selectedUser.phone}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" color="gray.600">
                        Status
                      </Text>
                      <Badge colorScheme={getStatusColor(selectedUser.status)}>
                        {selectedUser.status.toUpperCase()}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" color="gray.600">
                        Created
                      </Text>
                      <Text>{selectedUser.createdAt}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" color="gray.600">
                        Last Login
                      </Text>
                      <Text color="gray.500">Not tracked</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" color="gray.600">
                        Login Count
                      </Text>
                      <Text color="gray.500">Not tracked</Text>
                    </Box>
                  </SimpleGrid>

                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color="gray.600"
                      mb={2}
                    >
                      Permissions
                    </Text>
                    <Flex wrap="wrap" gap={2}>
                      {selectedUser.permissions.map((permission, index) => (
                        <Badge key={index} colorScheme="blue" variant="subtle">
                          {permission}
                        </Badge>
                      ))}
                    </Flex>
                  </Box>
                </VStack>
              )}
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" onClick={onViewClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  );
};

export default UserManagement;
