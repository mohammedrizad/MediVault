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
  Card,
  CardBody,
  CardHeader,
  List,
  ListItem,
  ListIcon,
  Spinner,
  SimpleGrid,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { Upload, X, Brain, CheckCircle, AlertTriangle } from "lucide-react";
import { analyzeImage } from "../services/geminiService";

const DoctorImageAnalyzer = ({ patientId }) => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const toast = useToast();
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const cardBg = useColorModeValue("gray.50", "gray.700");

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
    if (!image) {
      toast({
        title: "No image selected",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const analysis = await analyzeImage(image, patientId);
      setResult(analysis);
      toast({
        title: "Analysis Complete",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setImage(null);
    setResult(null);
  };

  const getSeverityColor = (severity) => {
    const severityMap = {
      Critical: "red",
      Severe: "orange",
      Moderate: "yellow",
      Mild: "blue",
      Normal: "green",
    };
    return severityMap[severity] || "gray";
  };

  return (
    <Box w="full">
      <VStack spacing={4} align="stretch">
        {/* Header */}
        <HStack spacing={3} mb={2}>
          <Icon as={Brain} color="purple.600" boxSize={6} />
          <Box>
            <Heading size="md">Patient Image Analysis</Heading>
            <Text fontSize="sm" color="gray.600">
              Analyze medical images for diagnosis support
            </Text>
          </Box>
        </HStack>

        {/* Upload Section */}
        <Card bg={bg} borderColor={borderColor} borderWidth={1}>
          <CardBody>
            {!image ? (
              <Box
                border="2px dashed"
                borderColor="gray.300"
                borderRadius="xl"
                p={6}
                textAlign="center"
                _hover={{ bg: "gray.50" }}
              >
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  display="none"
                  id="doctor-image-upload"
                />
                <label htmlFor="doctor-image-upload">
                  <VStack spacing={3} cursor="pointer">
                    <Center
                      w={16}
                      h={16}
                      bg="blue.50"
                      color="blue.500"
                      borderRadius="lg"
                    >
                      <Icon as={Upload} boxSize={8} />
                    </Center>
                    <Text fontWeight="600">Upload Medical Image</Text>
                    <Text fontSize="xs" color="gray.500">
                      X-Ray, CT Scan, MRI, Ultrasound, etc.
                    </Text>
                  </VStack>
                </label>
              </Box>
            ) : (
              <VStack spacing={4}>
                <Box position="relative" w="full">
                  <Image
                    src={image}
                    alt="Patient scan"
                    maxH="300px"
                    w="full"
                    objectFit="contain"
                    borderRadius="lg"
                  />
                  <Button
                    position="absolute"
                    top={2}
                    right={2}
                    size="sm"
                    colorScheme="red"
                    onClick={handleClear}
                  >
                    <X size={16} />
                  </Button>
                </Box>

                <HStack spacing={2} w="full">
                  <Button
                    flex={1}
                    size="sm"
                    onClick={() =>
                      document.getElementById("doctor-image-upload").click()
                    }
                  >
                    Change
                  </Button>
                  <Button
                    flex={1}
                    colorScheme="purple"
                    size="sm"
                    isLoading={loading}
                    onClick={handleAnalyze}
                  >
                    Analyze
                  </Button>
                </HStack>
              </VStack>
            )}
          </CardBody>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card bg={cardBg}>
            <CardBody>
              <VStack spacing={3}>
                <Spinner color="purple.500" />
                <Text fontSize="sm">Analyzing image...</Text>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Results */}
        {result && !loading && (
          <VStack spacing={3} align="stretch">
            {/* Summary */}
            <Card bg={bg} borderColor={borderColor} borderWidth={1}>
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="sm">Analysis Results</Heading>
                  <Badge colorScheme={getSeverityColor(result.severity)}>
                    {result.severity}
                  </Badge>
                </HStack>
              </CardHeader>
              <CardBody>
                <Text fontSize="sm" mb={3}>
                  {result.summary}
                </Text>
                <SimpleGrid columns={2} spacing={3}>
                  <Box p={2} bg={cardBg} borderRadius="md">
                    <Text fontSize="xs" color="gray.600">
                      Confidence
                    </Text>
                    <Text fontWeight="bold">
                      {((result.confidence || 0) * 100).toFixed(0)}%
                    </Text>
                  </Box>
                  <Box p={2} bg={cardBg} borderRadius="md">
                    <Text fontSize="xs" color="gray.600">
                      Severity
                    </Text>
                    <Badge
                      colorScheme={getSeverityColor(result.severity)}
                      size="sm"
                    >
                      {result.severity}
                    </Badge>
                  </Box>
                </SimpleGrid>
              </CardBody>
            </Card>

            {/* Findings */}
            {result.findings?.length > 0 && (
              <Card bg={bg} borderColor={borderColor} borderWidth={1}>
                <CardHeader>
                  <Heading size="sm">Key Findings</Heading>
                </CardHeader>
                <CardBody>
                  <List spacing={2}>
                    {result.findings.map((finding, i) => (
                      <ListItem key={i} fontSize="sm">
                        <HStack spacing={2}>
                          <Icon
                            as={CheckCircle}
                            color="orange.500"
                            boxSize={4}
                          />
                          <Text>{finding}</Text>
                        </HStack>
                      </ListItem>
                    ))}
                  </List>
                </CardBody>
              </Card>
            )}

            {/* Recommendations */}
            {result.recommendations?.length > 0 && (
              <Card bg={bg} borderColor={borderColor} borderWidth={1}>
                <CardHeader>
                  <Heading size="sm">Recommendations</Heading>
                </CardHeader>
                <CardBody>
                  <List spacing={2}>
                    {result.recommendations.map((rec, i) => (
                      <ListItem key={i} fontSize="sm">
                        <HStack spacing={2}>
                          <Icon
                            as={CheckCircle}
                            color="green.500"
                            boxSize={4}
                          />
                          <Text>{rec}</Text>
                        </HStack>
                      </ListItem>
                    ))}
                  </List>
                </CardBody>
              </Card>
            )}
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export default DoctorImageAnalyzer;
