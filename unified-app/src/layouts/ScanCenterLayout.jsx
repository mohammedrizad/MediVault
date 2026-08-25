import React from "react";
import {
  Box,
  Flex,
  Text,
  IconButton,
  VStack,
  HStack,
  useDisclosure,
  Drawer,
  DrawerContent,
  useColorModeValue,
  Button,
  Icon,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  FiHome,
  FiCalendar,
  FiCamera,
  FiFileText,
  FiBarChart,
  FiSettings,
  FiUpload,
  FiUser,
  FiLogOut,
  FiMenu,
  FiRadio,
} from "react-icons/fi";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const ScanCenterLayout = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarBg = useColorModeValue("teal.600", "teal.800");
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const isMobile = useBreakpointValue({ base: true, md: false });

  const menuItems = [
    { name: "Dashboard", icon: FiHome, path: "/scancenter/dashboard" },
    { name: "Schedule Scan", icon: FiCalendar, path: "/scancenter/schedule" },
    { name: "Equipment", icon: FiCamera, path: "/scancenter/equipment" },
    { name: "Upload Results", icon: FiUpload, path: "/scancenter/upload" },
    {
      name: "Image Analysis",
      icon: FiRadio,
      path: "/scancenter/image-analysis",
    },
    { name: "Reports", icon: FiFileText, path: "/scancenter/reports" },
    { name: "Analytics", icon: FiBarChart, path: "/scancenter/analytics" },
    { name: "Settings", icon: FiSettings, path: "/scancenter/settings" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    navigate("/");
  };

  const SidebarContent = ({ onClose, ...rest }) => {
    return (
      <Box
        bg={sidebarBg}
        color="white"
        w={{ base: "full", md: 60 }}
        pos="fixed"
        h="full"
        {...rest}
      >
        <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
          <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
            MediVault
          </Text>
          <Text fontSize="sm" bg="teal.700" px={2} py={1} borderRadius="md">
            Scan Center
          </Text>
        </Flex>
        <VStack align="stretch" spacing={0} mt={4}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.name}
                leftIcon={<Icon as={item.icon} />}
                justifyContent="flex-start"
                variant="ghost"
                color={isActive ? "white" : "teal.100"}
                bg={isActive ? "teal.700" : "transparent"}
                _hover={{
                  bg: isActive ? "teal.700" : "teal.700",
                  color: "white",
                }}
                borderRadius="none"
                py={6}
                px={8}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) onClose();
                }}
              >
                {item.name}
              </Button>
            );
          })}
        </VStack>

        <Box position="absolute" bottom={4} left={0} right={0} px={4}>
          <VStack spacing={2}>
            <Button
              leftIcon={<Icon as={FiUser} />}
              justifyContent="flex-start"
              variant="ghost"
              color="teal.100"
              _hover={{ bg: "teal.700", color: "white" }}
              borderRadius="md"
              width="full"
              onClick={() => navigate("/scancenter/profile")}
            >
              Profile
            </Button>
            <Button
              leftIcon={<Icon as={FiLogOut} />}
              justifyContent="flex-start"
              variant="ghost"
              color="teal.100"
              _hover={{ bg: "red.600", color: "white" }}
              borderRadius="md"
              width="full"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </VStack>
        </Box>
      </Box>
    );
  };

  return (
    <Box minH="100vh" bg={bgColor}>
      <SidebarContent
        onClose={onClose}
        display={{ base: "none", md: "block" }}
      />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <Box ml={{ base: 0, md: 60 }}>
        {/* Mobile Header */}
        <Flex
          display={{ base: "flex", md: "none" }}
          alignItems="center"
          bg="white"
          borderBottomWidth="1px"
          borderBottomColor="gray.200"
          py={4}
          px={4}
        >
          <IconButton
            variant="ghost"
            onClick={onOpen}
            aria-label="open menu"
            icon={<FiMenu />}
            mr={4}
          />
          <Text fontSize="xl" fontWeight="bold" color="teal.600">
            MediVault - Scan Center
          </Text>
        </Flex>

        {/* Page Content */}
        <Box p={{ base: 4, md: 6 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default ScanCenterLayout;
