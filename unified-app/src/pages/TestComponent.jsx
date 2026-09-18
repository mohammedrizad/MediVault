import React from "react";
import { Box, Text, VStack } from "@chakra-ui/react";

const TestComponent = () => {
  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="green.50"
    >
      <VStack spacing={4}>
        <Text fontSize="4xl" fontWeight="bold" color="green.600">
          🎉 SUCCESS! 🎉
        </Text>
        <Text fontSize="xl" color="green.800">
          React Router is working correctly!
        </Text>
        <Text color="green.600">
          If you can see this page, the routing is functioning properly.
        </Text>
      </VStack>
    </Box>
  );
};

export default TestComponent;
