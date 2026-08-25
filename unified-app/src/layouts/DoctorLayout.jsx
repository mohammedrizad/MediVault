import React from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
  Avatar,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  IconButton,
  useBreakpointValue,
  useColorModeValue,
  Badge,
} from "@chakra-ui/react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  FiMenu,
  FiHome,
  FiSearch,
  FiUser,
  FiLogOut,
  FiUsers,
  FiFileText,
  FiCalendar,
  FiActivity,
  FiTrendingUp,
  FiRadio,
  FiBell,
  FiAlertTriangle,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import NotificationCenter from "../components/NotificationCenter";

const DoctorLayout = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Responsive values
  const sidebarDisplay = useBreakpointValue({ base: "none", md: "block" });
  const sidebarWidth = "280px";

  // Color mode values
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerBg = useColorModeValue("green.500", "green.600");

  const navigationItems = [
    { name: "Dashboard", icon: FiHome, path: "/doctor/dashboard" },
    { name: "Patient Search", icon: FiSearch, path: "/doctor/search" },
    {
      name: "Emergency Override",
      icon: FiAlertTriangle,
      path: "/doctor/emergency-override",
    },
    { name: "My Patients", icon: FiUsers, path: "/doctor/patients" },
    { name: "Medical Records", icon: FiFileText, path: "/doctor/records" },
    { name: "Appointments", icon: FiCalendar, path: "/doctor/appointments" },
    { name: "Consultations", icon: FiActivity, path: "/doctor/consultations" },
    {
      name: "Image Analysis",
      icon: FiRadio,
      path: "/doctor/image-analysis",
    },
    {
      name: "Medical Summary",
      icon: FiTrendingUp,
      path: "/doctor/medical-summary",
    },
    {
      name: "Alert Dashboard",
      icon: FiBell,
      path: "/doctor/alerts",
    },
    {
      name: "Early Warning Score",
      icon: FiAlertTriangle,
      path: "/doctor/early-warning",
    },
    { name: "My Profile", icon: FiUser, path: "/doctor/profile" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const SidebarContent = () => (
    <VStack spacing={1} align="stretch" h="full">
      {/* Logo/Brand */}
      <Box p={6} borderBottom="1px" borderColor={borderColor}>
        <Text fontSize="xl" fontWeight="bold" color="green.500">
          MediVault
        </Text>
        <Text fontSize="sm" color="gray.500">
          Doctor Portal
        </Text>
      </Box>

      {/* Navigation Items */}
      <VStack spacing={1} p={4} flex="1">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Button
              key={item.path}
              variant={isActive ? "solid" : "ghost"}
              colorScheme={isActive ? "green" : "gray"}
              justifyContent="flex-start"
              leftIcon={<Icon />}
              w="full"
              onClick={() => {
                navigate(item.path);
                onClose();
              }}
              size="md"
              h="45px"
            >
              {item.name}
            </Button>
          );
        })}
      </VStack>

      {/* User Info & Logout */}
      <Box p={4} borderTop="1px" borderColor={borderColor}>
        <VStack spacing={3}>
          <HStack w="full" spacing={3}>
            <Avatar size="sm" name={currentUser?.name} />
            <VStack spacing={0} align="start" flex="1">
              <Text fontSize="sm" fontWeight="medium">
                {currentUser?.name || "Doctor"}
              </Text>
              <Badge colorScheme="green" size="sm">
                Doctor
              </Badge>
            </VStack>
          </HStack>
          <Button
            variant="outline"
            colorScheme="red"
            size="sm"
            leftIcon={<FiLogOut />}
            onClick={handleLogout}
            w="full"
          >
            Logout
          </Button>
        </VStack>
      </Box>
    </VStack>
  );

  return (
    <Flex h="100vh">
      {/* Desktop Sidebar */}
      <Box
        display={sidebarDisplay}
        w={sidebarWidth}
        bg={bg}
        borderRight="1px"
        borderColor={borderColor}
        position="fixed"
        h="full"
        overflowY="auto"
        zIndex={10}
      >
        <SidebarContent />
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody p={0}>
            <SidebarContent />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <Box
        ml={{ base: 0, md: sidebarWidth }}
        flex="1"
        minH="100vh"
        bg="gray.50"
      >
        {/* Header */}
        <Flex
          bg={headerBg}
          color="white"
          p={4}
          align="center"
          justify="space-between"
          boxShadow="sm"
        >
          <HStack spacing={3}>
            <IconButton
              icon={<FiMenu />}
              variant="ghost"
              color="white"
              onClick={onOpen}
              display={{ base: "flex", md: "none" }}
              aria-label="Open menu"
            />
            <Text fontSize="lg" fontWeight="semibold">
              Doctor Dashboard
            </Text>
          </HStack>

          <HStack spacing={3}>
            <NotificationCenter colorScheme="green" />
            <Text fontSize="sm" display={{ base: "none", md: "block" }}>
              Welcome, {currentUser?.name || "Doctor"}
            </Text>
            <Avatar size="sm" name={currentUser?.name} />
          </HStack>
        </Flex>

        {/* Page Content */}
        <Box p={6}>
          <Outlet />
        </Box>
      </Box>
    </Flex>
  );
};

export default DoctorLayout;
