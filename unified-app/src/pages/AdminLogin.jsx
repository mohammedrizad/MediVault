import React, { useState } from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
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
  Flex,
  Image,
  Heading,
  Stack,
  usePrefersReducedMotion,
} from "@chakra-ui/react";
import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiUser,
  FiShield,
  FiCheckCircle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Animation styles
const floatAnimation = {
  animation: "float 6s ease-in-out infinite",
  "@keyframes float": {
    "0%": { transform: "translateY(0px)" },
    "50%": { transform: "translateY(-20px)" },
    "100%": { transform: "translateY(0px)" },
  },
};

const slideInAnimation = {
  animation: "slideIn 0.8s ease-out",
  "@keyframes slideIn": {
    "0%": { transform: "translateX(-100px)", opacity: 0 },
    "100%": { transform: "translateX(0)", opacity: 1 },
  },
};

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { login } = useAuth();
  const prefersReducedMotion = usePrefersReducedMotion();

  const animation = prefersReducedMotion
    ? undefined
    : "float 6s ease-in-out infinite";
  const slideAnimation = prefersReducedMotion
    ? undefined
    : "slideIn 0.8s ease-out";

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
      const result = await login(
        { email: formData.email, password: formData.password },
        "admin"
      );

      console.log("Login result:", result);

      if (result && result.success) {
        console.log("✅ Navigating to dashboard");
        navigate("/admin/dashboard");
      } else {
        throw new Error("Login failed - no success response");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
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
    <Box minH="100vh" position="relative" overflow="hidden">
      {/* Gradient Background */}
      <Box
        position="absolute"
        top="0"
        left="0"
        w="100%"
        h="100%"
        bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
        opacity="0.1"
      />
      <Box
        position="absolute"
        top="0"
        left="0"
        w="100%"
        h="100%"
        bgGradient="linear(135deg, #f093fb 0%, #f5576c 100%)"
      />

      {/* Floating shapes */}
      <Box
        position="absolute"
        top="10%"
        left="10%"
        w="100px"
        h="100px"
        borderRadius="50%"
        bg="rgba(255,255,255,0.1)"
        animation={animation}
      />
      <Box
        position="absolute"
        bottom="20%"
        right="15%"
        w="150px"
        h="150px"
        borderRadius="20px"
        bg="rgba(255,255,255,0.08)"
        animation={animation}
        animationDelay="2s"
      />

      <Flex
        minH="100vh"
        align="center"
        justify="center"
        position="relative"
        zIndex="1"
      >
        <Container maxW="6xl">
          <Flex
            direction={{ base: "column", lg: "row" }}
            align="center"
            justify="center"
            gap={12}
          >
            {/* Left Side - Branding */}
            <Box
              flex="1"
              textAlign={{ base: "center", lg: "left" }}
              animation={slideAnimation}
            >
              <VStack spacing={6} align={{ base: "center", lg: "flex-start" }}>
                <HStack>
                  <Box
                    p={3}
                    bg="rgba(255,255,255,0.2)"
                    borderRadius="16px"
                    backdropFilter="blur(10px)"
                  >
                    <Icon as={FiShield} w={8} h={8} color="white" />
                  </Box>
                  <Heading color="white" size="xl">
                    MediVault
                  </Heading>
                </HStack>

                <Heading color="white" size="2xl" lineHeight="1.2" maxW="500px">
                  Administrator Portal
                </Heading>

                <Text color="rgba(255,255,255,0.9)" fontSize="lg" maxW="400px">
                  Comprehensive healthcare management system with advanced
                  analytics and real-time monitoring
                </Text>

                <VStack
                  spacing={4}
                  align={{ base: "center", lg: "flex-start" }}
                >
                  <HStack color="rgba(255,255,255,0.9)">
                    <Icon as={FiCheckCircle} />
                    <Text>System Administration</Text>
                  </HStack>
                  <HStack color="rgba(255,255,255,0.9)">
                    <Icon as={FiCheckCircle} />
                    <Text>User Management</Text>
                  </HStack>
                  <HStack color="rgba(255,255,255,0.9)">
                    <Icon as={FiCheckCircle} />
                    <Text>Advanced Analytics</Text>
                  </HStack>
                </VStack>
              </VStack>
            </Box>

            {/* Right Side - Login Form */}
            <Box
              flex="1"
              maxW={{ base: "400px", lg: "450px" }}
              w="full"
              animation={slideAnimation}
              animationDelay="0.2s"
            >
              <Box
                bg="rgba(255,255,255,0.95)"
                backdropFilter="blur(20px)"
                p={8}
                borderRadius="24px"
                shadow="2xl"
                border="1px solid rgba(255,255,255,0.3)"
              >
                <form onSubmit={handleSubmit}>
                  <VStack spacing={6}>
                    <VStack spacing={2} textAlign="center" w="full">
                      <Icon
                        as={FiUser}
                        w={12}
                        h={12}
                        color="purple.500"
                        p={2}
                        bg="purple.50"
                        borderRadius="12px"
                      />
                      <Heading size="lg" color="gray.800">
                        Welcome Back
                      </Heading>
                      <Text color="gray.600">
                        Sign in to access your admin panel
                      </Text>
                    </VStack>

                    <FormControl isRequired>
                      <FormLabel color="gray.700" fontWeight="600">
                        Email Address
                      </FormLabel>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="admin@medivault.com"
                        size="lg"
                        borderRadius="12px"
                        border="2px solid"
                        borderColor="gray.200"
                        _hover={{ borderColor: "purple.300" }}
                        _focus={{
                          borderColor: "purple.500",
                          boxShadow: "0 0 0 1px #805ad5",
                        }}
                        bg="white"
                        transition="all 0.2s"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color="gray.700" fontWeight="600">
                        Password
                      </FormLabel>
                      <InputGroup>
                        <Input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Enter your password"
                          size="lg"
                          borderRadius="12px"
                          border="2px solid"
                          borderColor="gray.200"
                          _hover={{ borderColor: "purple.300" }}
                          _focus={{
                            borderColor: "purple.500",
                            boxShadow: "0 0 0 1px #805ad5",
                          }}
                          bg="white"
                          transition="all 0.2s"
                        />
                        <InputRightElement h="full">
                          <IconButton
                            variant="ghost"
                            icon={showPassword ? <FiEyeOff /> : <FiEye />}
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label="Toggle password visibility"
                            color="gray.500"
                            _hover={{ color: "purple.500" }}
                          />
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>

                    <Button
                      type="submit"
                      size="lg"
                      w="full"
                      isLoading={loading}
                      loadingText="Signing in..."
                      borderRadius="12px"
                      bgGradient="linear(to-r, purple.500, pink.500)"
                      color="white"
                      _hover={{
                        bgGradient: "linear(to-r, purple.600, pink.600)",
                        transform: "translateY(-2px)",
                        boxShadow: "lg",
                      }}
                      _active={{
                        transform: "translateY(0)",
                      }}
                      transition="all 0.2s"
                      fontWeight="600"
                    >
                      Sign In
                    </Button>

                    <Text fontSize="sm" color="gray.500" textAlign="center">
                      Use any valid email and password to login
                    </Text>
                  </VStack>
                </form>
              </Box>
            </Box>
          </Flex>
        </Container>
      </Flex>
    </Box>
  );
};

export default AdminLogin;
