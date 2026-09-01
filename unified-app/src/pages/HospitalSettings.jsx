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
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Avatar,
  useToast,
  Divider,
  IconButton,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import {
  FiSettings,
  FiEdit,
  FiSave,
  FiEye,
  FiEyeOff,
  FiUpload,
  FiHome,
  FiMail,
  FiLock,
} from "react-icons/fi";

const HospitalSettings = () => {
  const [hospitalData, setHospitalData] = useState({
    name: "MediVault General Hospital",
    address: "123 Healthcare Avenue, Medical District, City 12345",
    phone: "+1 (555) 123-4567",
    email: "info@medivault-hospital.com",
    website: "www.medivault-hospital.com",
    license: "HOS-2024-001234",
    established: "1985",
    description:
      "A leading healthcare institution providing comprehensive medical services with state-of-the-art facilities and experienced medical professionals.",
    logo: "https://placehold.co/150x150/2563eb/ffffff?text=MV",
  });

  const [adminData, setAdminData] = useState({
    email: "admin@medivault-hospital.com",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const cardBg = useColorModeValue("white", "gray.700");

  const handleHospitalChange = (e) => {
    const { name, value } = e.target;
    setHospitalData({ ...hospitalData, [name]: value });
  };

  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setAdminData({ ...adminData, [name]: value });
  };

  const handleSaveHospitalInfo = () => {
    toast({
      title: "Hospital information updated",
      description: "Hospital details have been saved successfully.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    if (adminData.newPassword !== adminData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirm password do not match.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (adminData.newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    toast({
      title: "Password updated",
      description: "Admin password has been changed successfully.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    setAdminData({
      ...adminData,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    onClose();
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setHospitalData({ ...hospitalData, logo: e.target.result });
        toast({
          title: "Logo uploaded",
          description: "Hospital logo has been updated successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field],
    });
  };

  return (
    <Container maxW="6xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Text fontSize="3xl" fontWeight="bold" color="gray.800">
              Hospital Settings
            </Text>
            <Text color="gray.600">
              Configure hospital information and admin settings
            </Text>
          </VStack>
          <HStack spacing={3}>
            <Button
              leftIcon={<FiLock />}
              colorScheme="orange"
              variant="outline"
              onClick={onOpen}
            >
              Change Password
            </Button>
            {isEditing ? (
              <Button
                leftIcon={<FiSave />}
                colorScheme="green"
                onClick={handleSaveHospitalInfo}
              >
                Save Changes
              </Button>
            ) : (
              <Button
                leftIcon={<FiEdit />}
                colorScheme="blue"
                onClick={() => setIsEditing(true)}
              >
                Edit Settings
              </Button>
            )}
          </HStack>
        </HStack>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
          {/* Hospital Information */}
          <Card bg={cardBg}>
            <CardHeader>
              <HStack spacing={3}>
                <Box p={3} bg="blue.100" borderRadius="full">
                  <FiHome color="blue.500" size="24px" />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontSize="xl" fontWeight="semibold">
                    Hospital Information
                  </Text>
                  <Text color="gray.600" fontSize="sm">
                    Basic hospital details and configuration
                  </Text>
                </VStack>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={6}>
                {/* Logo Section */}
                <VStack spacing={4}>
                  <Text fontWeight="medium" alignSelf="start">
                    Hospital Logo
                  </Text>
                  <HStack spacing={4}>
                    <Avatar
                      src={hospitalData.logo}
                      size="xl"
                      name={hospitalData.name}
                      bg="blue.500"
                    />
                    <VStack align="start" spacing={2}>
                      <Text fontSize="sm" color="gray.600">
                        Upload a new logo for your hospital
                      </Text>
                      <Button
                        leftIcon={<FiUpload />}
                        size="sm"
                        variant="outline"
                        as="label"
                        cursor="pointer"
                        isDisabled={!isEditing}
                      >
                        Upload Logo
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          hidden
                        />
                      </Button>
                    </VStack>
                  </HStack>
                </VStack>

                <Divider />

                {/* Hospital Details */}
                <VStack spacing={4} w="full">
                  <SimpleGrid columns={1} spacing={4} w="full">
                    <FormControl>
                      <FormLabel>Hospital Name</FormLabel>
                      <Input
                        name="name"
                        value={hospitalData.name}
                        onChange={handleHospitalChange}
                        isReadOnly={!isEditing}
                        bg={isEditing ? "white" : "gray.50"}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Address</FormLabel>
                      <Textarea
                        name="address"
                        value={hospitalData.address}
                        onChange={handleHospitalChange}
                        isReadOnly={!isEditing}
                        bg={isEditing ? "white" : "gray.50"}
                        rows={3}
                      />
                    </FormControl>

                    <SimpleGrid columns={2} spacing={4}>
                      <FormControl>
                        <FormLabel>Phone Number</FormLabel>
                        <Input
                          name="phone"
                          value={hospitalData.phone}
                          onChange={handleHospitalChange}
                          isReadOnly={!isEditing}
                          bg={isEditing ? "white" : "gray.50"}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Email</FormLabel>
                        <Input
                          name="email"
                          type="email"
                          value={hospitalData.email}
                          onChange={handleHospitalChange}
                          isReadOnly={!isEditing}
                          bg={isEditing ? "white" : "gray.50"}
                        />
                      </FormControl>
                    </SimpleGrid>

                    <SimpleGrid columns={2} spacing={4}>
                      <FormControl>
                        <FormLabel>Website</FormLabel>
                        <Input
                          name="website"
                          value={hospitalData.website}
                          onChange={handleHospitalChange}
                          isReadOnly={!isEditing}
                          bg={isEditing ? "white" : "gray.50"}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>License Number</FormLabel>
                        <Input
                          name="license"
                          value={hospitalData.license}
                          onChange={handleHospitalChange}
                          isReadOnly={!isEditing}
                          bg={isEditing ? "white" : "gray.50"}
                        />
                      </FormControl>
                    </SimpleGrid>

                    <FormControl>
                      <FormLabel>Established Year</FormLabel>
                      <Input
                        name="established"
                        value={hospitalData.established}
                        onChange={handleHospitalChange}
                        isReadOnly={!isEditing}
                        bg={isEditing ? "white" : "gray.50"}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Description</FormLabel>
                      <Textarea
                        name="description"
                        value={hospitalData.description}
                        onChange={handleHospitalChange}
                        isReadOnly={!isEditing}
                        bg={isEditing ? "white" : "gray.50"}
                        rows={4}
                      />
                    </FormControl>
                  </SimpleGrid>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Admin Configuration */}
          <Card bg={cardBg}>
            <CardHeader>
              <HStack spacing={3}>
                <Box p={3} bg="green.100" borderRadius="full">
                  <FiSettings color="green.500" size="24px" />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontSize="xl" fontWeight="semibold">
                    Admin Configuration
                  </Text>
                  <Text color="gray.600" fontSize="sm">
                    System administrator settings
                  </Text>
                </VStack>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={6}>
                {/* Current Admin Info */}
                <VStack spacing={4} w="full">
                  <Text fontWeight="medium" alignSelf="start">
                    Administrator Details
                  </Text>

                  <FormControl>
                    <FormLabel>Admin Email</FormLabel>
                    <InputGroup>
                      <Input
                        name="email"
                        type="email"
                        value={adminData.email}
                        onChange={handleAdminChange}
                        bg="gray.50"
                        isReadOnly
                      />
                      <InputRightElement>
                        <FiMail color="gray.400" />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <Text fontSize="sm" color="gray.600" alignSelf="start">
                    To change the admin email, please contact system support.
                  </Text>
                </VStack>

                <Divider />

                {/* System Information */}
                <VStack spacing={4} w="full">
                  <Text fontWeight="medium" alignSelf="start">
                    System Information
                  </Text>

                  <SimpleGrid columns={1} spacing={3} w="full">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        Version:
                      </Text>
                      <Text fontSize="sm" fontWeight="medium">
                        MediVault v2.1.0
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        Last Login:
                      </Text>
                      <Text fontSize="sm" fontWeight="medium">
                        Today, 10:30 AM
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        Database Status:
                      </Text>
                      <Text fontSize="sm" fontWeight="medium" color="green.500">
                        Online
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        Server Status:
                      </Text>
                      <Text fontSize="sm" fontWeight="medium" color="green.500">
                        Running
                      </Text>
                    </HStack>
                  </SimpleGrid>
                </VStack>

                <Divider />

                {/* Security Settings */}
                <VStack spacing={4} w="full">
                  <Text fontWeight="medium" alignSelf="start">
                    Security Settings
                  </Text>

                  <VStack spacing={3} w="full">
                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm">Two-Factor Authentication</Text>
                      <Button size="sm" variant="outline" colorScheme="blue">
                        Enable
                      </Button>
                    </HStack>
                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm">Session Timeout</Text>
                      <Text fontSize="sm" color="gray.600">
                        30 minutes
                      </Text>
                    </HStack>
                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm">Password Change</Text>
                      <Button size="sm" variant="outline" onClick={onOpen}>
                        Change
                      </Button>
                    </HStack>
                  </VStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>

      {/* Change Password Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change Admin Password</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Current Password</FormLabel>
                <InputGroup>
                  <Input
                    name="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={adminData.currentPassword}
                    onChange={handleAdminChange}
                    placeholder="Enter current password"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label="Toggle password visibility"
                      icon={showPasswords.current ? <FiEyeOff /> : <FiEye />}
                      size="sm"
                      variant="ghost"
                      onClick={() => togglePasswordVisibility("current")}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>New Password</FormLabel>
                <InputGroup>
                  <Input
                    name="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={adminData.newPassword}
                    onChange={handleAdminChange}
                    placeholder="Enter new password"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label="Toggle password visibility"
                      icon={showPasswords.new ? <FiEyeOff /> : <FiEye />}
                      size="sm"
                      variant="ghost"
                      onClick={() => togglePasswordVisibility("new")}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Confirm New Password</FormLabel>
                <InputGroup>
                  <Input
                    name="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={adminData.confirmPassword}
                    onChange={handleAdminChange}
                    placeholder="Confirm new password"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label="Toggle password visibility"
                      icon={showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
                      size="sm"
                      variant="ghost"
                      onClick={() => togglePasswordVisibility("confirm")}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <Text fontSize="sm" color="gray.600">
                Password must be at least 8 characters long and contain a mix of
                letters, numbers, and special characters.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleChangePassword}>
              Update Password
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default HospitalSettings;
