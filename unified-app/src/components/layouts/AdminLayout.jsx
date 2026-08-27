import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  useColorModeValue,
  Avatar,
  Badge,
} from "@chakra-ui/react";
import {
  FiMenu,
  FiHome,
  FiUsers,
  FiUserPlus,
  FiActivity,
  FiBarChart3,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import CustomButton from "../common/CustomButton";
import ConfirmDialog from "../common/ConfirmDialog";

const AdminLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const sidebarBg = useColorModeValue("purple.50", "gray.900");

  const menuItems = [
    { icon: FiHome, label: "Dashboard", path: "/admin/dashboard" },
    { icon: FiUsers, label: "Manage Users", path: "/admin/users" },
    { icon: FiUserPlus, label: "Create Doctor", path: "/admin/create-doctor" },
    { icon: FiUserPlus, label: "Create Nurse", path: "/admin/create-nurse" },
    {
      icon: FiUserPlus,
      label: "Create Scan Center",
      path: "/admin/create-scancenter",
    },
    { icon: FiActivity, label: "System Monitor", path: "/admin/monitor" },
    { icon: FiBarChart3, label: "Analytics", path: "/admin/analytics" },
    { icon: FiSettings, label: "Settings", path: "/admin/settings" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const SidebarContent = () => (
    <VStack align="stretch" spacing={1} p={4}>
      {/* User Profile Section */}
      <Box p={4} bg={bgColor} borderRadius="lg" mb={4}>
        <VStack spacing={3}>
          <Avatar size="lg" name={user?.name} src={user?.avatar} />
          <VStack spacing={1}>
            <Text fontWeight="bold" fontSize="lg">
              {user?.name || "Administrator"}
            </Text>
            <Badge colorScheme="purple" variant="subtle">
              Admin Portal
            </Badge>
          </VStack>
        </VStack>
      </Box>

      {/* Navigation Menu */}
      {menuItems.map((item) => (
        <CustomButton
          key={item.path}
          leftIcon={<item.icon />}
          variant="ghost"
          justifyContent="flex-start"
          onClick={() => {
            navigate(item.path);
            onClose();
          }}
          w="full"
        >
          {item.label}
        </CustomButton>
      ))}

      {/* Logout Button */}
      <CustomButton
        leftIcon={<FiLogOut />}
        variant="ghost"
        colorScheme="red"
        justifyContent="flex-start"
        onClick={() => setShowLogoutDialog(true)}
        w="full"
        mt={4}
      >
        Logout
      </CustomButton>
    </VStack>
  );

  return (
    <Flex h="100vh">
      {/* Desktop Sidebar */}
      <Box
        w="280px"
        bg={sidebarBg}
        borderRight="1px"
        borderColor={borderColor}
        display={{ base: "none", lg: "block" }}
        overflowY="auto"
      >
        <SidebarContent />
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg={sidebarBg}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Admin Portal</DrawerHeader>
          <DrawerBody p={0}>
            <SidebarContent />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <Flex flex={1} direction="column">
        {/* Header */}
        <Box
          bg={bgColor}
          px={6}
          py={4}
          borderBottom="1px"
          borderColor={borderColor}
        >
          <HStack justify="space-between">
            <HStack spacing={4}>
              <IconButton
                aria-label="Open menu"
                icon={<FiMenu />}
                variant="ghost"
                display={{ base: "flex", lg: "none" }}
                onClick={onOpen}
              />
              <Text fontSize="xl" fontWeight="bold">
                Admin Portal
              </Text>
            </HStack>

            <HStack spacing={4}>
              <Text
                fontSize="sm"
                color="gray.500"
                display={{ base: "none", md: "block" }}
              >
                Welcome, {user?.name || "Administrator"}
              </Text>
              <Avatar size="sm" name={user?.name} src={user?.avatar} />
            </HStack>
          </HStack>
        </Box>

        {/* Page Content */}
        <Box
          flex={1}
          overflow="auto"
          bg={useColorModeValue("gray.50", "gray.700")}
        >
          <Outlet />
        </Box>
      </Flex>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
        variant="logout"
        confirmText="Sign Out"
      />
    </Flex>
  );
};

export default AdminLayout;
