import React from "react";
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import DoctorImageAnalyzer from "../components/DoctorImageAnalyzer";

const DoctorImageAnalysis = () => {
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  return (
    <Box minH="100vh" bg={bg} py={8}>
      <Container maxW="6xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <Heading as="h1" size="2xl" mb={2}>
              Patient Image Analysis
            </Heading>
            <Text color="gray.600" fontSize="lg">
              AI-powered diagnostic support for medical imaging analysis
            </Text>
          </Box>

          {/* Analyzer */}
          <Box bg={cardBg} borderRadius="lg" p={6} boxShadow="md">
            <DoctorImageAnalyzer />
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default DoctorImageAnalysis;
