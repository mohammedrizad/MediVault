import React, { useState } from "react";
import {
  Box,
  Button,
  Image,
  Text,
  VStack,
  HStack,
  Icon,
  useToast,
  Input,
  Heading,
  useColorModeValue,
  Center,
  Badge,
} from "@chakra-ui/react";
import { Upload, X, Brain, CheckCircle } from "lucide-react";
import { analyzeImage } from "../services/geminiService";
import { MOCK_PATIENT } from "../data";

const ImageAnalyzer = ({ patientId }) => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const toast = useToast();
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const activePatientId = patientId || MOCK_PATIENT.id;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const analysis = await analyzeImage(image, activePatientId);
      setResult(analysis);
    } catch (error) {
      console.error("Analysis Error:", error);
      toast({
        title: "Analysis failed",
        description: error.message || "Unknown error",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      bg={bg}
      borderRadius="2xl"
      boxShadow="sm"
      border="1px"
      borderColor={borderColor}
      p={6}
    >
      <HStack mb={4} spacing={2}>
        <Icon as={Brain} color="purple.600" boxSize={6} />
        <Heading size="md">AI X-Ray/Scan Analyzer</Heading>
      </HStack>

      {!image ? (
        <Box
          border="2px dashed"
          borderColor="gray.300"
          borderRadius="xl"
          p={8}
          textAlign="center"
          _hover={{ bg: "gray.50" }}
          transition="background 0.2s"
        >
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            display="none"
            id="xray-upload"
          />
          <label htmlFor="xray-upload" style={{ cursor: "pointer" }}>
            <VStack spacing={4}>
              <Center
                w={16}
                h={16}
                bg="blue.50"
                color="blue.500"
                borderRadius="full"
              >
                <Icon as={Upload} boxSize={8} />
              </Center>
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                Click to upload X-Ray or Scan
              </Text>
              <Text fontSize="xs" color="gray.400">
                Supports PNG, JPG
              </Text>
            </VStack>
          </label>
        </Box>
      ) : (
        <VStack spacing={4} align="stretch">
          <Box
            position="relative"
            borderRadius="xl"
            overflow="hidden"
            border="1px"
            borderColor="gray.200"
            bg="black"
          >
            <Image
              src={image}
              alt="Uploaded Scan"
              maxH="64"
              mx="auto"
              objectFit="contain"
            />
            <Button
              position="absolute"
              top={2}
              right={2}
              size="sm"
              colorScheme="whiteAlpha"
              onClick={() => {
                setImage(null);
                setResult(null);
              }}
              borderRadius="full"
              p={1}
            >
              <Icon as={X} boxSize={4} />
            </Button>
          </Box>

          {!result && (
            <Button
              onClick={handleAnalyze}
              isLoading={loading}
              loadingText="Analyzing..."
              colorScheme="purple"
              size="lg"
              w="full"
              leftIcon={<Icon as={Brain} />}
            >
              Analyze Scan
            </Button>
          )}
        </VStack>
      )}

      {result && (
        <Box mt={6} animation="fade-in 0.5s">
          <Box
            p={4}
            borderRadius="xl"
            borderLeft="4px solid"
            borderColor={
              result.severity === "Normal"
                ? "green.500"
                : result.severity === "Critical"
                ? "red.500"
                : "yellow.500"
            }
            bg={
              result.severity === "Normal"
                ? "green.50"
                : result.severity === "Critical"
                ? "red.50"
                : "yellow.50"
            }
          >
            <HStack justify="space-between" align="start" mb={2}>
              <Heading size="sm" color="gray.800">
                Analysis Results
              </Heading>
              {result.confidence && (
                <Badge colorScheme="gray" variant="solid">
                  Conf: {(result.confidence * 100).toFixed(0)}%
                </Badge>
              )}
            </HStack>
            <Text fontWeight="medium" mb={2} color="gray.900">
              {result.summary}
            </Text>

            <VStack align="stretch" spacing={2}>
              {result.findings?.map((finding, i) => (
                <HStack key={i} align="start" spacing={2}>
                  <Icon as={CheckCircle} color="gray.400" mt={1} boxSize={4} />
                  <Text fontSize="sm" color="gray.700">
                    {finding}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ImageAnalyzer;
