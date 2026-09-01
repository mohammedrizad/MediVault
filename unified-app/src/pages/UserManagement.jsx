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
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onClose: onViewClose,
  } = useDisclosure();

  const cardBg = useColorModeValue("white", "gray.700");
  const toast = useToast();

  // Mock users data
  const mockUsers = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      email: "dr.johnson@medivault.com",
      role: "doctor",
      status: "active",
      lastLogin: "2024-11-01 14:30:00",
      createdAt: "2024-01-15",
      department: "Cardiology",
      phone: "+1 (555) 123-4567",
      avatar: null,
      loginCount: 234,
      permissions: ["read_patients", "write_patients", "read_reports"],
    },
    {
      id: 2,
      name: "Admin User",
      email: "admin@medivault.com",
      role: "admin",
      status: "active",
      lastLogin: "2024-11-01 15:00:00",
      createdAt: "2024-01-01",
      department: "Administration",
      phone: "+1 (555) 987-6543",
      avatar: null,
      loginCount: 567,
      permissions: ["full_access"],
    },
    {
      id: 3,
      name: "Nurse Maria Garcia",
      email: "nurse.garcia@medivault.com",
      role: "nurse",
      status: "active",
      lastLogin: "2024-11-01 13:45:00",
      createdAt: "2024-02-20",
      department: "Emergency",
      phone: "+1 (555) 456-7890",
      avatar: null,
      loginCount: 189,
      permissions: ["read_patients", "update_vitals", "register_patients"],
    },
    {
      id: 4,
      name: "John Smith",
      email: "patient.smith@medivault.com",
      role: "patient",
      status: "active",
      lastLogin: "2024-11-01 12:30:00",
      createdAt: "2024-03-10",
      department: "N/A",
      phone: "+1 (555) 321-0987",
      avatar: null,
      loginCount: 45,
      permissions: ["read_own_records", "book_appointments"],
    },
    {
      id: 5,
      name: "RadiCare Center",
      email: "scan@radicare.com",
      role: "scancenter",
      status: "active",
      lastLogin: "2024-11-01 11:15:00",
      createdAt: "2024-02-05",
      department: "Radiology",
      phone: "+1 (555) 654-3210",
      avatar: null,
      loginCount: 123,
      permissions: ["upload_scans", "read_scan_requests", "update_reports"],
    },
    {
      id: 6,
      name: "Dr. Michael Brown",
      email: "dr.brown@medivault.com",
      role: "doctor",
      status: "inactive",
      lastLogin: "2024-10-25 16:20:00",
      createdAt: "2024-01-30",
      department: "Neurology",
      phone: "+1 (555) 111-2222",
      avatar: null,
      loginCount: 156,
      permissions: ["read_patients", "write_patients"],
    },
  ];

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "doctor",
    department: "",
    phone: "",
    permissions: [],
  });

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

  useEffect(() => {
    // Simulate loading users
    const timer = setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
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

  const handleAddUser = () => {
    const user = {
      id: Date.now(),
      ...newUser,
      status: "active",
      lastLogin: "Never",
      createdAt: new Date().toISOString().split("T")[0],
      avatar: null,
      loginCount: 0,
      permissions: newUser.permissions || [],
    };

    setUsers([...users, user]);
    setNewUser({
      name: "",
      email: "",
      role: "doctor",
      department: "",
      phone: "",
      permissions: [],
    });
    onAddClose();

    toast({
      title: "User Added",
      description: `${user.name} has been added successfully.`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleToggleStatus = (userId) => {
    setUsers(
      users.map((user) =>
        user.id === userId
          ? {
              ...user,
              status: user.status === "active" ? "inactive" : "active",
            }
          : user
      )
    );

    toast({
      title: "Status Updated",
      description: "User status has been updated successfully.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleDeleteUser = (userId) => {
    setUsers(users.filter((user) => user.id !== userId));

    toast({
      title: "User Deleted",
      description: "User has been removed successfully.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    onViewOpen();
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setNewUser(user);
    onEditOpen();
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
          <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onAddOpen}>
            Add New User
          </Button>
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
                            onChange={() => handleToggleStatus(user.id)}
                          />
                        </HStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm">
                          {user.lastLogin === "Never"
                            ? "Never"
                            : new Date(user.lastLogin).toLocaleDateString()}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm" fontWeight="medium">
                          {user.loginCount}
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
                            <MenuItem icon={<FiLock />}>
                              Reset Password
                            </MenuItem>
                            <MenuItem
                              icon={<FiTrash2 />}
                              color="red.500"
                              onClick={() => handleDeleteUser(user.id)}
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
        <Modal isOpen={isAddOpen} onClose={onAddClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add New User</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    placeholder="Enter full name"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    placeholder="Enter email address"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Role</FormLabel>
                  <Select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
                  >
                    <option value="doctor">Doctor</option>
                    <option value="nurse">Nurse</option>
                    <option value="admin">Admin</option>
                    <option value="scancenter">Scan Center</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Department</FormLabel>
                  <Input
                    value={newUser.department}
                    onChange={(e) =>
                      setNewUser({ ...newUser, department: e.target.value })
                    }
                    placeholder="Enter department"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Phone</FormLabel>
                  <Input
                    value={newUser.phone}
                    onChange={(e) =>
                      setNewUser({ ...newUser, phone: e.target.value })
                    }
                    placeholder="Enter phone number"
                  />
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onAddClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={handleAddUser}>
                Add User
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

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
                      <Text>{selectedUser.lastLogin}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" color="gray.600">
                        Login Count
                      </Text>
                      <Text>{selectedUser.loginCount}</Text>
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
