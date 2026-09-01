import React from "react";
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import ScanCenterAnalyzer from "../components/ScanCenterAnalyzer";

const AdminImageAnalysis = () => {
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  return (
    <Box minH="100vh" bg={bg} py={8}>
      <Container maxW="6xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <Heading as="h1" size="2xl" mb={2}>
              Medical Image Analysis Center
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Hospital-wide AI-powered medical imaging analysis and diagnostics
            </Text>
          </Box>

          {/* Analyzer */}
          <Box bg={cardBg} borderRadius="lg" p={6} boxShadow="md">
            <ScanCenterAnalyzer />
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default AdminImageAnalysis;
