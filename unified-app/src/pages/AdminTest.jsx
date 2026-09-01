import React from "react";
import { Box, Text, VStack, Button } from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminTest = () => {
  const { isAuthenticated, currentUser, userRole } = useAuth();
  const navigate = useNavigate();

  return (
    <Box p={8}>
      <VStack spacing={4} align="start">
        <Text fontSize="2xl" fontWeight="bold">
          Admin Test Page
        </Text>

        <Text>
          Authentication Status:{" "}
          {isAuthenticated ? "✅ Authenticated" : "❌ Not Authenticated"}
        </Text>
        <Text>User Role: {userRole || "None"}</Text>
        <Text>
          Current User:{" "}
          {currentUser ? JSON.stringify(currentUser, null, 2) : "None"}
        </Text>

        <Button colorScheme="blue" onClick={() => navigate("/admin/dashboard")}>
          Go to Admin Dashboard
        </Button>

        <Button colorScheme="green" onClick={() => navigate("/admin/login")}>
          Go to Admin Login
        </Button>

        <Button colorScheme="red" onClick={() => navigate("/")}>
          Go to Home
        </Button>
      </VStack>
    </Box>
  );
};

export default AdminTest;
