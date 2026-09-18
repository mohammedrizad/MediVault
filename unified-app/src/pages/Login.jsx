import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Select,
  Alert,
  AlertIcon,
  useColorModeValue,
  Image,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Divider,
} from "@chakra-ui/react";
import { FiUser, FiCamera } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import CustomButton from "../components/common/CustomButton";
import LoadingSpinner from "../components/common/LoadingSpinner";
import FaceLogin from "../components/auth/FaceLogin";

const Login = () => {
  const navigate = useNavigate();
  const { login, faceLogin } = useAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const roles = [
    { value: "patient", label: "Patient", path: "/patient/profile" },
    { value: "doctor", label: "Doctor", path: "/doctor/dashboard" },
    { value: "nurse", label: "Nurse", path: "/nurse/patients" },
    { value: "admin", label: "Administrator", path: "/admin/dashboard" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate form
      if (!formData.email || !formData.password || !formData.role) {
        throw new Error("Please fill in all fields");
      }

      // Attempt login with correct parameters
      const result = await login(
        {
          email: formData.email,
          password: formData.password,
        },
        formData.role
      );

      if (result.success) {
        // Navigate to the redirect path returned by login function
        navigate(result.redirectTo || "/");
      } else {
        throw new Error(result.error || "Invalid credentials");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle successful face authentication
  const handleFaceSuccess = (userData) => {
    toast({
      title: "Face Authentication Successful",
      description: `Welcome back, ${userData.name || "Patient"}!`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    // Navigate to patient portal (Face login is primarily for patients)
    navigate("/patient/profile");
  };

  // Handle face authentication error
  const handleFaceError = (error) => {
    toast({
      title: "Face Authentication Failed",
      description: error || "Please try again or use email login",
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="md" py={12}>
      <VStack spacing={8}>
        {/* Logo and Header */}
        <VStack spacing={4} textAlign="center">
          <Image
            src="/logo.png"
            alt="MediVault"
            height="60px"
            fallback={
              <Box
                bg="blue.500"
                color="white"
                px={6}
                py={3}
                borderRadius="lg"
                fontWeight="bold"
                fontSize="xl"
              >
                MediVault
              </Box>
            }
          />
          <Heading size="lg" color="blue.600">
            Welcome to MediVault
          </Heading>
          <Text color="gray.600" fontSize="lg">
            Secure Healthcare Management System
          </Text>
        </VStack>

        {/* Login Options */}
        <Box
          bg={bgColor}
          p={8}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
          w="full"
          maxW="500px"
        >
          <Tabs variant="enclosed" colorScheme="blue">
            <TabList>
              <Tab>
                <HStack spacing={2}>
                  <FiUser />
                  <Text>Email Login</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <FiCamera />
                  <Text>Face Recognition</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* Email Login Tab */}
              <TabPanel px={0}>
                <form onSubmit={handleSubmit}>
                  <VStack spacing={6}>
                    <Heading size="md" textAlign="center">
                      Sign In to Your Portal
                    </Heading>

                    {error && (
                      <Alert status="error" borderRadius="md">
                        <AlertIcon />
                        {error}
                      </Alert>
                    )}

                    <FormControl isRequired>
                      <FormLabel>Email Address</FormLabel>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        size="lg"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Password</FormLabel>
                      <Input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        size="lg"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Select Portal</FormLabel>
                      <Select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        placeholder="Choose your portal"
                        size="lg"
                      >
                        {roles.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <CustomButton
                      type="submit"
                      colorScheme="blue"
                      size="lg"
                      w="full"
                      isLoading={loading}
                      loadingText="Signing In..."
                    >
                      Sign In
                    </CustomButton>
                  </VStack>
                </form>
              </TabPanel>

              {/* Face Recognition Tab */}
              <TabPanel px={0}>
                <VStack spacing={4}>
                  <Heading size="md" textAlign="center">
                    Patient Face Recognition
                  </Heading>
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    Secure login using facial recognition technology
                  </Text>

                  <FaceLogin
                    onSuccess={handleFaceSuccess}
                    onError={handleFaceError}
                  />

                  <Divider />

                  <Text fontSize="xs" color="gray.500" textAlign="center">
                    Face recognition is available for registered patients only
                  </Text>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>

        {/* Portal Information */}
        <VStack spacing={4} textAlign="center">
          <Text fontSize="sm" color="gray.500">
            Don't have an account? Contact your administrator.
          </Text>

          <HStack spacing={6} fontSize="sm" color="gray.600">
            <Text>Patient Portal</Text>
            <Text>•</Text>
            <Text>Doctor Portal</Text>
            <Text>•</Text>
            <Text>Nurse Portal</Text>
            <Text>•</Text>
            <Text>Admin Portal</Text>
          </HStack>
        </VStack>
      </VStack>

      {loading && <LoadingSpinner variant="overlay" />}
    </Container>
  );
};

export default Login;
