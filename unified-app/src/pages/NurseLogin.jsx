import React, { useState } from "react";
import {
  Box,
  Container,
  VStack,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement,
  IconButton,
  useToast,
  useColorModeValue,
  Icon,
} from "@chakra-ui/react";
import { FiShield, FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NurseLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { login } = useAuth();
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      await login(
        {
          email: formData.email,
          password: formData.password,
        },
        "nurse"
      );
      navigate("/nurse/dashboard");
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Box minH="100vh" bg={bg} display="flex" alignItems="center">
      <Container maxW="md">
        <VStack spacing={8}>
          <VStack spacing={4} textAlign="center">
            <Icon as={FiShield} w={16} h={16} color="purple.500" />
            <Text fontSize="3xl" fontWeight="bold">
              Nurse Portal
            </Text>
            <Text color="gray.600">
              Register patients and manage medical records
            </Text>
          </VStack>

          <Box bg={cardBg} p={8} rounded="xl" shadow="lg" w="full">
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                <Text fontSize="xl" fontWeight="semibold">
                  Nurse Login
                </Text>

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
                  <InputGroup>
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      size="lg"
                    />
                    <InputRightElement h="full">
                      <IconButton
                        variant="ghost"
                        icon={showPassword ? <FiEyeOff /> : <FiEye />}
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Toggle password visibility"
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="purple"
                  size="lg"
                  w="full"
                  isLoading={loading}
                  loadingText="Logging in..."
                >
                  Login
                </Button>

                <Text fontSize="sm" color="gray.500" textAlign="center">
                  Forgot your password? Contact system administrator.
                </Text>
              </VStack>
            </form>
          </Box>

          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            colorScheme="gray"
          >
            Back to Portal Selection
          </Button>
        </VStack>
      </Container>
    </Box>
  );
};

export default NurseLogin;
