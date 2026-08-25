import React from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Icon,
  Badge,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  IconButton,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FiActivity,
  FiUsers,
  FiUser,
  FiUserPlus,
  FiShield,
  FiServer,
  FiDatabase,
  FiSettings,
  FiGlobe,
  FiLogOut,
  FiMenu,
  FiArrowLeft,
  FiRadio,
  FiBarChart2,
} from "react-icons/fi";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adminAPI } from "../services/api";
import { useState, useEffect } from "react";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, currentUser } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [counts, setCounts] = useState({
    doctors: 0,
    nurses: 0,
    patients: 0,
    scanCenters: 0,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await adminAPI.getDashboardStats();
        setCounts({
          doctors: response.data.totalDoctors,
          nurses: response.data.totalNurses,
          patients: response.data.totalPatients,
          scanCenters: response.data.totalScanCenters,
        });
      } catch (error) {
        console.error("Error fetching sidebar counts:", error);
      }
    };
    fetchCounts();
  }, []);

  const navigationItems = [
    {
      section: "DASHBOARD",
      items: [
        {
          name: "Overview",
          icon: FiActivity,
          path: "/admin/dashboard",
          badge: null,
        },
        {
          name: "Analytics",
          icon: FiBarChart2,
          path: "/admin/analytics",
          badge: null,
        },
      ],
    },
    {
      section: "ADD NEW",
      items: [
        {
          name: "Add Patient",
          icon: FiUserPlus,
          path: "/admin/add-patient",
          badge: null,
        },
        {
          name: "Add Doctor",
          icon: FiUserPlus,
          path: "/admin/add-doctor",
          badge: null,
        },
        {
          name: "Add Nurse",
          icon: FiUserPlus,
          path: "/admin/add-nurse",
          badge: null,
        },
        {
          name: "Add Scan Center",
          icon: FiServer,
          path: "/admin/add-scancenter",
          badge: null,
        },
      ],
    },
    {
      section: "MANAGE",
      items: [
        {
          name: "Doctors",
          icon: FiUsers,
          path: "/admin/doctors",
          badge: counts.doctors,
        },
        {
          name: "Nurses",
          icon: FiUserPlus,
          path: "/admin/nurses",
          badge: counts.nurses,
        },
        {
          name: "Patients",
          icon: FiUser,
          path: "/admin/patients",
          badge: counts.patients,
        },
        {
          name: "Scan Centers",
          icon: FiServer,
          path: "/admin/scancenters",
          badge: counts.scanCenters,
        },
      ],
    },
    {
      section: "SYSTEM",
      items: [
        {
          name: "Image Analysis",
          icon: FiRadio,
          path: "/admin/image-analysis",
          badge: null,
        },
        {
          name: "Cross-Hospital Access",
          icon: FiGlobe,
          path: "/admin/cross-hospital",
          badge: "3",
        },
        {
          name: "Hospital Settings",
          icon: FiSettings,
          path: "/admin/settings",
          badge: null,
        },
        {
          name: "System Audit",
          icon: FiShield,
          path: "/admin/audit",
          badge: null,
        },
        {
          name: "User Management",
          icon: FiDatabase,
          path: "/admin/users",
          badge: null,
        },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleBackNavigation = () => {
    const currentPath = location.pathname;

    // If we're on any admin page (not login), go to admin login
    if (currentPath.startsWith("/admin/") && currentPath !== "/admin/login") {
      logout(); // Clear authentication
      navigate("/admin/login");
    }
    // If we're on admin login, go to home page
    else if (currentPath === "/admin/login") {
      navigate("/");
    }
    // Default fallback - go to home
    else {
      navigate("/");
    }
  };

  const SidebarContent = () => (
    <Flex
      h="full"
      direction="column"
      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      color="white"
    >
      {/* Header */}
      <Box px={4} py={3} borderBottom="1px" borderColor="rgba(255,255,255,0.1)">
        <HStack spacing={2} justify="space-between">
          <HStack spacing={2}>
            <Box p={1.5} bg="rgba(255,255,255,0.2)" borderRadius="10px">
              <Icon as={FiShield} w={5} h={5} />
            </Box>
            <VStack align="start" spacing={0}>
              <Heading size="sm" color="white">
                MediVault
              </Heading>
              <Text fontSize="xs" color="rgba(255,255,255,0.8)">
                {currentUser?.name || "Admin"}
              </Text>
            </VStack>
          </HStack>
          <IconButton
            icon={<FiArrowLeft />}
            variant="ghost"
            size="xs"
            color="rgba(255,255,255,0.8)"
            _hover={{ bg: "rgba(255,255,255,0.1)", color: "white" }}
            borderRadius="8px"
            onClick={handleBackNavigation}
            aria-label="Go back"
            title="Back to Login"
          />
        </HStack>
      </Box>

      {/* Navigation - scrollable */}
      <Box
        flex="1"
        overflowY="auto"
        px={3}
        py={2}
        css={{
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(255,255,255,0.3)",
            borderRadius: "4px",
          },
        }}
      >
        {navigationItems.map((section, sectionIndex) => (
          <Box key={sectionIndex} mb={2}>
            <Text
              fontSize="10px"
              fontWeight="bold"
              color="rgba(255,255,255,0.5)"
              mb={1}
              px={2}
              letterSpacing="wider"
              textTransform="uppercase"
            >
              {section.section}
            </Text>

            <VStack spacing={0} align="stretch">
              {section.items.map((item, itemIndex) => {
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={itemIndex}
                    leftIcon={<Icon as={item.icon} w={4} h={4} />}
                    justifyContent="flex-start"
                    variant="ghost"
                    size="xs"
                    color={isActive ? "white" : "rgba(255,255,255,0.8)"}
                    bg={isActive ? "rgba(255,255,255,0.2)" : "transparent"}
                    _hover={{
                      bg: "rgba(255,255,255,0.1)",
                      color: "white",
                    }}
                    _active={{ bg: "rgba(255,255,255,0.2)" }}
                    borderRadius="8px"
                    h="32px"
                    px={2}
                    fontSize="13px"
                    fontWeight="500"
                    transition="all 0.15s"
                    onClick={() => navigate(item.path)}
                    rightIcon={
                      item.badge ? (
                        <Badge
                          bg="rgba(255,255,255,0.2)"
                          color="white"
                          borderRadius="full"
                          fontSize="10px"
                          px={1.5}
                          ml="auto"
                        >
                          {item.badge}
                        </Badge>
                      ) : null
                    }
                  >
                    {item.name}
                  </Button>
                );
              })}
            </VStack>
          </Box>
        ))}
      </Box>

      {/* Logout - fixed at bottom */}
      <Box px={3} py={2} borderTop="1px" borderColor="rgba(255,255,255,0.1)">
        <Button
          leftIcon={<Icon as={FiLogOut} w={4} h={4} />}
          justifyContent="flex-start"
          variant="ghost"
          size="xs"
          color="rgba(255,255,255,0.8)"
          _hover={{ bg: "rgba(255,255,255,0.1)", color: "white" }}
          borderRadius="8px"
          h="32px"
          px={2}
          fontSize="13px"
          fontWeight="500"
          width="full"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
    </Flex>
  );

  return (
    <Flex h="100vh" bg={useColorModeValue("gray.50", "gray.900")}>
      {/* Desktop Sidebar */}
      <Box
        display={{ base: "none", md: "block" }}
        w="280px"
        position="fixed"
        h="full"
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
      <Box ml={{ base: 0, md: "280px" }} w="full">
        {/* Mobile Header */}
        <Flex
          display={{ base: "flex", md: "none" }}
          bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          color="white"
          p={4}
          align="center"
          justify="space-between"
        >
          <IconButton
            icon={<FiMenu />}
            variant="ghost"
            color="white"
            onClick={onOpen}
            aria-label="Open navigation"
          />
          <Text fontSize="lg" fontWeight="bold">
            MediVault Admin
          </Text>
          <IconButton
            icon={<FiArrowLeft />}
            variant="ghost"
            color="white"
            onClick={handleBackNavigation}
            aria-label="Go back"
            title="Back to Login"
          />
        </Flex>

        {/* Page Content */}
        <Box p={6}>
          <Outlet />
        </Box>
      </Box>
    </Flex>
  );
};

export default AdminLayout;
