import React from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import ScanCenterAnalyzer from "../components/ScanCenterAnalyzer";

const ScanCenterImageAnalysis = () => {
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  return (
    <Box minH="100vh" bg={bg} py={8}>
      <Container maxW="6xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <Heading as="h1" size="2xl" mb={2}>
              Medical Image Analysis
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Advanced AI-powered analysis for medical imaging. Upload scans and
              receive instant diagnostic insights.
            </Text>
          </Box>

          {/* Main Analyzer */}
          <Box bg={cardBg} borderRadius="lg" p={6} boxShadow="md">
            <ScanCenterAnalyzer />
          </Box>

          {/* Info Section */}
          <Box bg={cardBg} borderRadius="lg" p={6} boxShadow="sm">
            <Heading size="md" mb={4}>
              About This Feature
            </Heading>
            <VStack spacing={3} align="start" fontSize="sm">
              <Text>
                <strong>Supported Formats:</strong> X-Ray, CT Scan, MRI,
                Ultrasound, and other medical imaging formats
              </Text>
              <Text>
                <strong>AI Model:</strong> Advanced AI for real-time analysis
              </Text>
              <Text>
                <strong>Accuracy:</strong> Provides high-confidence diagnostic
                support with detailed findings and recommendations
              </Text>
              <Text>
                <strong>Privacy:</strong> All analysis is performed securely and
                stored with proper HIPAA compliance
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default ScanCenterImageAnalysis;
