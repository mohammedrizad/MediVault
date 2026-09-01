import React, { useState } from "react";
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
  Stat,
  StatLabel,
  StatNumber,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
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
  Input,
  Select,
  Textarea,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiCamera,
  FiActivity,
  FiClock,
  FiServer,
} from "react-icons/fi";
import { useScanCenters } from "../hooks/usePortalData";

const ManageScanCenters = () => {
  const {
    scanCenters,
    loading,
    createScanCenter,
    updateScanCenter,
    deleteScanCenter,
  } = useScanCenters();

  const [selectedCenter, setSelectedCenter] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    equipment: "",
    capacity: "",
    technician: "",
    operatingHours: "",
    description: "",
    specifications: "",
    status: "Active",
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const toast = useToast();
  const cardBg = useColorModeValue("white", "gray.700");

  const stats = [
    {
      label: "Total Centers",
      value: scanCenters.length,
      color: "blue.500",
      icon: FiServer,
    },
    {
      label: "Active Centers",
      value: scanCenters.filter((c) => c.status === "Active").length,
      color: "green.500",
      icon: FiActivity,
    },
    {
      label: "Today's Scans",
      value: scanCenters.reduce((sum, center) => sum + (center.todayScans || 0), 0),
      color: "purple.500",
      icon: FiCamera,
    },
    {
      label: "Pending Results",
      value: scanCenters.reduce(
        (sum, center) => sum + (center.pendingResults || 0),
        0,
      ),
      color: "orange.500",
      icon: FiClock,
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await updateScanCenter(selectedCenter._id, formData);
      } else {
        await createScanCenter(formData);
      }
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error saving scan center:", error);
      toast({
        title: isEditing ? "Update Failed" : "Creation Failed",
        description: "Failed to save scan center. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      location: "",
      equipment: "",
      capacity: "",
      technician: "",
      operatingHours: "",
      description: "",
      specifications: "",
      status: "Active",
    });
    setSelectedCenter(null);
    setIsEditing(false);
  };

  const handleEdit = (center) => {
    setSelectedCenter(center);
    // Map backend fields to frontend form fields
    setFormData({
      name: center.username || "",
      email: center.Email_Address || "",
      phone: center.PhoneNo || "",
      location: center.Current_Address || "",
      equipment: center.Qualifications || "",
      capacity: center.capacity || "",
      technician: center.technician || "",
      operatingHours: center.operatingHours || "",
      description: center.description || "",
      specifications: center.Qualifications || "",
      status: "Active", // Default status for existing centers
      experience: center.Years_of_experience || "",
      dob: center.DOB || "",
      gender: center.Gender || "",
      licenseNumber: center.Medical_License_Number || "",
      councilNumber: center.Medical_Council_Registration_Number || "",
    });
    setIsEditing(true);
    onOpen();
  };

  const handleAdd = () => {
    resetForm();
    onOpen();
  };

  const handleDelete = async () => {
    try {
      await deleteScanCenter(selectedCenter._id);
      onDeleteClose();
      setSelectedCenter(null);
    } catch (error) {
      console.error("Error deleting scan center:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete scan center. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const openDeleteDialog = (center) => {
    setSelectedCenter(center);
    onDeleteOpen();
  };

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Text fontSize="3xl" fontWeight="bold" color="gray.800">
              Manage Scan Centers
            </Text>
            <Text color="gray.600">
              View and manage scan center information
            </Text>
          </VStack>
          {/* Add button removed as per requirements */}
        </HStack>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
          {stats.map((stat, index) => (
            <Card key={index} bg={cardBg}>
              <CardBody>
                <Stat>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <StatLabel color="gray.600">{stat.label}</StatLabel>
                      <StatNumber color={stat.color} fontSize="2xl">
                        {stat.value}
                      </StatNumber>
                    </VStack>
                    <Box
                      p={3}
                      bg={`${stat.color.split(".")[0]}.100`}
                      borderRadius="full"
                    >
                      <stat.icon color={stat.color} size="24px" />
                    </Box>
                  </HStack>
                </Stat>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {/* Scan Centers Table */}
        <Card bg={cardBg}>
          <CardBody>
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Center</Th>
                    <Th>Contact</Th>
                    <Th>Location</Th>
                    <Th>Equipment</Th>
                    <Th>Capacity</Th>
                    <Th>Today's Scans</Th>
                    <Th>Pending</Th>
                    <Th>Technician</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {scanCenters.map((center) => (
                    <Tr key={center._id}>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">{center.username}</Text>
                          <Text fontSize="sm" color="gray.600">
                            ID: SC{center._id?.slice(-3)}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm">{center.Email_Address}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {center.PhoneNo}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm">{center.Current_Address}</Text>
                      </Td>
                      <Td>
                        <Badge colorScheme="blue" variant="subtle">
                          {center.equipment}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme="gray" variant="outline">
                          {center.capacity}/day
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme="green" variant="solid">
                          {center.todayScans}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme="orange" variant="outline">
                          {center.pendingResults}
                        </Badge>
                      </Td>
                      <Td>
                        <Text fontSize="sm" color="gray.600">
                          {center.technician}
                        </Text>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={
                            center.status === "Active"
                              ? "green"
                              : center.status === "Maintenance"
                                ? "orange"
                                : "red"
                          }
                        >
                          {center.status}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="View center"
                            icon={<FiEye />}
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                            onClick={() => {
                              setSelectedCenter(center);
                              toast({
                                title: "Scan Center Details",
                                description: `${center.username || "Center"} - ${center.equipment || "N/A"} equipment, ${center.capacity || "N/A"}/day capacity`,
                                status: "info",
                                duration: 3000,
                                isClosable: true,
                              });
                            }}
                          />
                          <IconButton
                            aria-label="Edit center"
                            icon={<FiEdit />}
                            size="sm"
                            variant="ghost"
                            colorScheme="green"
                            onClick={() => handleEdit(center)}
                          />
                          <IconButton
                            aria-label="Delete center"
                            icon={<FiTrash2 />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => openDeleteDialog(center)}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </CardBody>
        </Card>
      </VStack>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? "Edit Scan Center" : "Add New Scan Center"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Center Name</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="MRI Center - Building A"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="center@hospital.com"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Phone</FormLabel>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 234-567-8900"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Location</FormLabel>
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Building A, Floor 2"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Equipment Type</FormLabel>
                  <Select
                    name="equipment"
                    value={formData.equipment}
                    onChange={handleInputChange}
                    placeholder="Select equipment"
                  >
                    <option value="MRI Machine">MRI Machine</option>
                    <option value="CT Scanner">CT Scanner</option>
                    <option value="Digital X-Ray">Digital X-Ray</option>
                    <option value="Ultrasound">Ultrasound</option>
                    <option value="PET Scanner">PET Scanner</option>
                    <option value="Mammography">Mammography</option>
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Daily Capacity</FormLabel>
                  <Input
                    name="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    placeholder="20"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Chief Technician</FormLabel>
                  <Input
                    name="technician"
                    value={formData.technician}
                    onChange={handleInputChange}
                    placeholder="Dr. Tech Smith"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Operating Hours</FormLabel>
                  <Select
                    name="operatingHours"
                    value={formData.operatingHours}
                    onChange={handleInputChange}
                    placeholder="Select hours"
                  >
                    <option value="8:00 AM - 6:00 PM">8:00 AM - 6:00 PM</option>
                    <option value="24/7">24/7</option>
                    <option value="6:00 AM - 10:00 PM">
                      6:00 AM - 10:00 PM
                    </option>
                    <option value="Emergency Only">Emergency Only</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of the scan center"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Equipment Specifications</FormLabel>
                <Textarea
                  name="specifications"
                  value={formData.specifications}
                  onChange={handleInputChange}
                  placeholder="Technical specifications and features"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Status</FormLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="Active">Active</option>
                  <option value="Maintenance">Under Maintenance</option>
                  <option value="Inactive">Inactive</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="purple" onClick={handleSubmit}>
              {isEditing ? "Update" : "Add"} Center
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Scan Center
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete {selectedCenter?.name}? This
              action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={onDeleteClose}>Cancel</Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
};

export default ManageScanCenters;
