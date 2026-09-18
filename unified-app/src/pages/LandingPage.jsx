import React from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  useColorModeValue,
  Icon,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  FiUser,
  FiHeart,
  FiCalendar,
  FiFileText,
  FiCamera,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  const portals = [
    {
      title: "Patient Portal",
      description: "Access your medical records and appointments",
      icon: FiUser,
      color: "blue",
      path: "/patient/login",
    },
    {
      title: "Doctor Portal",
      description: "Manage patients and view medical records",
      icon: FiHeart,
      color: "green",
      path: "/doctor/login",
    },
    {
      title: "Nurse Portal",
      description: "Register patients and upload medical records",
      icon: FiCalendar,
      color: "purple",
      path: "/nurse/login",
    },
    {
      title: "Admin Portal",
      description: "System administration and user management",
      icon: FiFileText,
      color: "red",
      path: "/admin/login",
    },
    {
      title: "Scan Center Portal",
      description: "Medical imaging and diagnostic services",
      icon: FiCamera,
      color: "teal",
      path: "/scancenter/login",
    },
  ];

  return (
    <Box minH="100vh" bg={bg}>
      <Container maxW="6xl" py={20}>
        <VStack spacing={10} textAlign="center">
          <VStack spacing={4}>
            <Text fontSize="5xl" fontWeight="bold" color="blue.500">
              MediVault
            </Text>
            <Text fontSize="xl" color="gray.600" maxW="2xl">
              Secure Medical Records Management System
            </Text>
            <Text color="gray.500">
              Choose your portal to access the system
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={8} w="full">
            {portals.map((portal, index) => (
              <Box
                key={index}
                bg={cardBg}
                p={8}
                rounded="xl"
                shadow="lg"
                border="1px"
                borderColor="gray.200"
                cursor="pointer"
                transition="all 0.3s"
                _hover={{
                  transform: "translateY(-5px)",
                  shadow: "xl",
                  borderColor: `${portal.color}.300`,
                }}
                onClick={() => navigate(portal.path)}
              >
                <VStack spacing={4}>
                  <Icon
                    as={portal.icon}
                    w={12}
                    h={12}
                    color={`${portal.color}.500`}
                  />
                  <Text fontSize="xl" fontWeight="bold">
                    {portal.title}
                  </Text>
                  <Text color="gray.600" textAlign="center" fontSize="sm">
                    {portal.description}
                  </Text>
                  <Button
                    colorScheme={portal.color}
                    size="sm"
                    w="full"
                    onClick={() => navigate(portal.path)}
                  >
                    Access Portal
                  </Button>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
};

export default LandingPage;
