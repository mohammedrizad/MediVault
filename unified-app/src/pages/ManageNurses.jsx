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
  Avatar,
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
  FiUsers,
  FiHeart,
  FiActivity,
} from "react-icons/fi";
import { useNurses } from "../hooks/usePortalData";

const ManageNurses = () => {
  const { nurses, loading, addNurse, updateNurse, deleteNurse } = useNurses();

  const [selectedNurse, setSelectedNurse] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    shift: "Day",
    experience: "",
    address: "",
    qualifications: "",
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
      label: "Total Nurses",
      value: nurses.length,
      color: "green.500",
      icon: FiUsers,
    },
    {
      label: "On Duty",
      value: nurses.filter((n) => n.status === "Active").length,
      color: "blue.500",
      icon: FiActivity,
    },
    {
      label: "Patients Today",
      value: nurses.reduce((sum, nurse) => sum + (nurse.patientsToday || 0), 0),
      color: "purple.500",
      icon: FiHeart,
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await updateNurse(selectedNurse._id, formData);
      } else {
        await addNurse(formData);
      }
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error saving nurse:", error);
      toast({
        title: isEditing ? "Update Failed" : "Creation Failed",
        description: "Failed to save nurse. Please try again.",
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
      department: "",
      shift: "Day",
      experience: "",
      address: "",
      qualifications: "",
      status: "Active",
    });
    setSelectedNurse(null);
    setIsEditing(false);
  };

  const handleEdit = (nurse) => {
    setSelectedNurse(nurse);
    // Map backend fields to frontend form fields
    setFormData({
      name: nurse.Doctor_name || "",
      email: nurse.Email_Address || "",
      phone: nurse.PhoneNo || "",
      department: nurse.Specialization || "",
      experience: nurse.Years_of_experience || "",
      address: nurse.Current_Address || "",
      qualifications: nurse.Qualifications || "",
      status: "Active", // Default status for existing nurses
      shift: "Day", // Default shift
      dob: nurse.DOB || "",
      gender: nurse.Gender || "",
      licenseNumber: nurse.Medical_License_Number || "",
      councilNumber: nurse.Medical_Council_Registration_Number || "",
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
      await deleteNurse(selectedNurse._id);
      onDeleteClose();
      setSelectedNurse(null);
    } catch (error) {
      console.error("Error deleting nurse:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete nurse. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const openDeleteDialog = (nurse) => {
    setSelectedNurse(nurse);
    onDeleteOpen();
  };

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Text fontSize="3xl" fontWeight="bold" color="gray.800">
              Manage Nurses
            </Text>
            <Text color="gray.600">
              View and manage nursing staff information
            </Text>
          </VStack>
          {/* Add button removed as per requirements */}
        </HStack>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
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

        {/* Nurses Table */}
        <Card bg={cardBg}>
          <CardBody>
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Nurse</Th>
                    <Th>Contact</Th>
                    <Th>Department</Th>
                    <Th>Shift</Th>
                    <Th>Experience</Th>
                    <Th>Today's Patients</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {nurses.map((nurse) => (
                    <Tr key={nurse._id}>
                      <Td>
                        <HStack spacing={3}>
                          <Avatar src={nurse.Image} size="sm" />
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="medium">{nurse.Doctor_name}</Text>
                            <Text fontSize="sm" color="gray.600">
                              ID: NUR{nurse._id?.slice(-3)}
                            </Text>
                          </VStack>
                        </HStack>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm">{nurse.Email_Address}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {nurse.PhoneNo}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Badge colorScheme="purple" variant="subtle">
                          {nurse.Specialization}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={
                            nurse.shift === "Day" ? "yellow" : "blue"
                          }
                          variant="outline"
                        >
                          {nurse.shift}
                        </Badge>
                      </Td>
                      <Td>{nurse.experience}</Td>
                      <Td>
                        <Badge colorScheme="green" variant="outline">
                          {nurse.patientsToday}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={
                            nurse.status === "Active" ? "green" : "orange"
                          }
                        >
                          {nurse.status}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="View nurse"
                            icon={<FiEye />}
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                          />
                          <IconButton
                            aria-label="Edit nurse"
                            icon={<FiEdit />}
                            size="sm"
                            variant="ghost"
                            colorScheme="green"
                            onClick={() => handleEdit(nurse)}
                          />
                          <IconButton
                            aria-label="Delete nurse"
                            icon={<FiTrash2 />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => openDeleteDialog(nurse)}
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
            {isEditing ? "Edit Nurse" : "Add New Nurse"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Alice Johnson"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="nurse@hospital.com"
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
                  <FormLabel>Department</FormLabel>
                  <Select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="Select department"
                  >
                    <option value="Emergency">Emergency</option>
                    <option value="ICU">ICU</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Surgery">Surgery</option>
                    <option value="General Ward">General Ward</option>
                    <option value="Outpatient">Outpatient</option>
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Shift</FormLabel>
                  <Select
                    name="shift"
                    value={formData.shift}
                    onChange={handleInputChange}
                  >
                    <option value="Day">Day Shift</option>
                    <option value="Night">Night Shift</option>
                    <option value="Rotating">Rotating</option>
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Experience</FormLabel>
                  <Input
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="3 years"
                  />
                </FormControl>
              </SimpleGrid>
              <FormControl>
                <FormLabel>Address</FormLabel>
                <Textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter nurse's address"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Qualifications</FormLabel>
                <Textarea
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleInputChange}
                  placeholder="BSN, RN, etc."
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
                  <option value="On Break">On Break</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleSubmit}>
              {isEditing ? "Update" : "Add"} Nurse
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Nurse
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete {selectedNurse?.name}? This action
              cannot be undone.
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

export default ManageNurses;
