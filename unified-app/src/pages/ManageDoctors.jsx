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
  CardHeader,
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
  FiCalendar,
  FiActivity,
} from "react-icons/fi";
import { useDoctors } from "../hooks/usePortalData";

const ManageDoctors = () => {
  const { doctors, loading, addDoctor, updateDoctor, deleteDoctor } =
    useDoctors();

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
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
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const validDoctors = doctors.filter(
    (doctor) => doctor.Doctor_name && doctor.Email_Address
  );

  const stats = [
    {
      label: "Total Doctors",
      value: validDoctors.length,
      color: "blue.500",
      icon: FiUsers,
    },
    {
      label: "Active Doctors",
      value: validDoctors.filter((d) => d.status === "Active").length,
      color: "green.500",
      icon: FiActivity,
    },
    {
      label: "Total Patients",
      value: validDoctors.reduce(
        (sum, doctor) => sum + (doctor.patients || 0),
        0
      ),
      color: "purple.500",
      icon: FiCalendar,
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      // Debug: Log form data before submission
      console.log("[ManageDoctors] Form submission data:", formData);

      // Validate required fields
      const requiredFields = ["name", "email", "phone", "specialization"];
      const missingFields = requiredFields.filter(
        (field) => !formData[field] || formData[field].trim() === ""
      );

      if (missingFields.length > 0) {
        toast({
          title: "Validation Error",
          description: `Please fill in all required fields: ${missingFields.join(
            ", "
          )}`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      if (isEditing) {
        await updateDoctor(selectedDoctor._id, formData);
        toast({
          title: "Doctor Updated",
          description: "Doctor information has been updated successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        console.log("[ManageDoctors] Adding new doctor with data:", formData);
        await addDoctor(formData);
        toast({
          title: "Doctor Added",
          description: "New doctor has been added successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error saving doctor:", error);
      toast({
        title: isEditing ? "Update Failed" : "Creation Failed",
        description: "Failed to save doctor. Please try again.",
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
      specialization: "",
      experience: "",
      address: "",
      qualifications: "",
      status: "Active",
    });
    setSelectedDoctor(null);
    setIsEditing(false);
  };

  const handleEdit = (doctor) => {
    setSelectedDoctor(doctor);
    // Map backend fields to frontend form fields
    setFormData({
      name: doctor.Doctor_name || "",
      email: doctor.Email_Address || "",
      phone: doctor.PhoneNo || "",
      specialization: doctor.Specialization || "",
      experience: doctor.Years_of_experience || "",
      address: doctor.Current_Address || "",
      qualifications: doctor.Qualifications || "",
      status: "Active", // Default status for existing doctors
      dob: doctor.DOB || "",
      gender: doctor.Gender || "",
      licenseNumber: doctor.Medical_License_Number || "",
      councilNumber: doctor.Medical_Council_Registration_Number || "",
      contractType: doctor.Contract_type || "",
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
      await deleteDoctor(selectedDoctor._id);
      onDeleteClose();
      setSelectedDoctor(null);
    } catch (error) {
      console.error("Error deleting doctor:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete doctor. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const openDeleteDialog = (doctor) => {
    setSelectedDoctor(doctor);
    onDeleteOpen();
  };

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Text fontSize="3xl" fontWeight="bold" color="gray.800">
              Manage Doctors
            </Text>
            <Text color="gray.600">View and manage doctor information</Text>
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

        {/* Doctors Table */}
        <Card bg={cardBg}>
          <CardHeader>
            <Text fontSize="xl" fontWeight="semibold">
              Doctors List
            </Text>
          </CardHeader>
          <CardBody>
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Doctor</Th>
                    <Th>Contact</Th>
                    <Th>Specialization</Th>
                    <Th>Experience</Th>
                    <Th>Patients</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {doctors
                    .filter(
                      (doctor) => doctor.Doctor_name && doctor.Email_Address
                    )
                    .map((doctor) => (
                      <Tr key={doctor._id}>
                        <Td>
                          <HStack spacing={3}>
                            <Avatar src={doctor.Image} size="sm" />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium">
                                {doctor.Doctor_name}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                ID: DOC{doctor._id?.slice(-3)}
                              </Text>
                            </VStack>
                          </HStack>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm">{doctor.Email_Address}</Text>
                            <Text fontSize="sm" color="gray.600">
                              {doctor.PhoneNo}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Badge colorScheme="blue" variant="subtle">
                            {doctor.Specialization}
                          </Badge>
                        </Td>
                        <Td>{doctor.Years_of_experience}</Td>
                        <Td>
                          <Badge colorScheme="green" variant="outline">
                            {doctor.patients}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={
                              doctor.status === "Active" ? "green" : "orange"
                            }
                          >
                            {doctor.status}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              aria-label="View doctor"
                              icon={<FiEye />}
                              size="sm"
                              variant="ghost"
                              colorScheme="blue"
                            />
                            <IconButton
                              aria-label="Edit doctor"
                              icon={<FiEdit />}
                              size="sm"
                              variant="ghost"
                              colorScheme="green"
                              onClick={() => handleEdit(doctor)}
                            />
                            <IconButton
                              aria-label="Delete doctor"
                              icon={<FiTrash2 />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => openDeleteDialog(doctor)}
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
            {isEditing ? "Edit Doctor" : "Add New Doctor"}
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
                    placeholder="Dr. John Smith"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="doctor@hospital.com"
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
                  <FormLabel>Specialization</FormLabel>
                  <Select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    placeholder="Select specialization"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="General Medicine">General Medicine</option>
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Experience</FormLabel>
                  <Input
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="5 years"
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
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
              <FormControl>
                <FormLabel>Address</FormLabel>
                <Textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter doctor's address"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Qualifications</FormLabel>
                <Textarea
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleInputChange}
                  placeholder="MBBS, MD, etc."
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSubmit}>
              {isEditing ? "Update" : "Add"} Doctor
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Doctor
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete {selectedDoctor?.name}? This
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

export default ManageDoctors;
