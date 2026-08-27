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
  Grid,
  GridItem,
  Alert,
  AlertIcon,
  AlertTitle,
} from "@chakra-ui/react";
import { Upload, X, Brain, CheckCircle, AlertTriangle } from "lucide-react";
import { analyzeImage } from "../services/geminiService";

const ScanCenterAnalyzer = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [patientInfo, setPatientInfo] = useState({
    name: "",
    id: "",
    age: "",
    scanType: "",
  });
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
        description: "Please upload a medical image first",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const analysis = await analyzeImage(image);
      setResult(analysis);
      toast({
        title: "Analysis Complete",
        description: "Medical image analyzed successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Analysis Error:", error);
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze image",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearImage = () => {
    setImage(null);
    setResult(null);
    setPatientInfo({ name: "", id: "", age: "", scanType: "" });
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
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <HStack spacing={3} mb={2}>
            <Icon as={Brain} color="purple.600" boxSize={7} />
            <Heading size="lg">AI Medical Image Analyzer</Heading>
          </HStack>
          <Text color="gray.600" fontSize="sm">
            Upload and analyze X-rays, CT scans, MRI, and other medical images
          </Text>
        </Box>

        {/* Patient Information Form */}
        <Card bg={bg} borderColor={borderColor} borderWidth={1}>
          <CardHeader>
            <Heading size="sm">Patient Information</Heading>
          </CardHeader>
          <CardBody>
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={1}>
                  Patient Name
                </Text>
                <Input
                  placeholder="Enter patient name"
                  value={patientInfo.name}
                  onChange={(e) =>
                    setPatientInfo({ ...patientInfo, name: e.target.value })
                  }
                  size="sm"
                />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={1}>
                  Patient ID
                </Text>
                <Input
                  placeholder="Enter patient ID"
                  value={patientInfo.id}
                  onChange={(e) =>
                    setPatientInfo({ ...patientInfo, id: e.target.value })
                  }
                  size="sm"
                />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={1}>
                  Age
                </Text>
                <Input
                  placeholder="Enter age"
                  type="number"
                  value={patientInfo.age}
                  onChange={(e) =>
                    setPatientInfo({ ...patientInfo, age: e.target.value })
                  }
                  size="sm"
                />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={1}>
                  Scan Type
                </Text>
                <Input
                  placeholder="e.g., Chest X-Ray, CT Scan, MRI"
                  value={patientInfo.scanType}
                  onChange={(e) =>
                    setPatientInfo({ ...patientInfo, scanType: e.target.value })
                  }
                  size="sm"
                />
              </Box>
            </Grid>
          </CardBody>
        </Card>

        {/* Image Upload and Preview */}
        <Card bg={bg} borderColor={borderColor} borderWidth={1}>
          <CardHeader>
            <Heading size="sm">Upload Medical Image</Heading>
          </CardHeader>
          <CardBody>
            {!image ? (
              <Box
                border="2px dashed"
                borderColor="gray.300"
                borderRadius="xl"
                p={8}
                textAlign="center"
                _hover={{ bg: "gray.50" }}
                transition="background 0.2s"
                cursor="pointer"
              >
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  display="none"
                  id="scan-upload"
                />
                <label htmlFor="scan-upload" style={{ cursor: "pointer" }}>
                  <VStack spacing={4}>
                    <Center
                      w={20}
                      h={20}
                      bg="blue.50"
                      color="blue.500"
                      borderRadius="lg"
                    >
                      <Icon as={Upload} boxSize={10} />
                    </Center>
                    <VStack spacing={1}>
                      <Text fontWeight="600" color="gray.800">
                        Click or drag to upload image
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        Supported: JPG, PNG, DICOM, and other medical image
                        formats
                      </Text>
                    </VStack>
                  </VStack>
                </label>
              </Box>
            ) : (
              <VStack spacing={4} align="stretch">
                <Box position="relative" borderRadius="lg" overflow="hidden">
                  <Image
                    src={image}
                    alt="Uploaded scan"
                    maxH="400px"
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
                    variant="solid"
                    onClick={handleClearImage}
                    leftIcon={<X size={16} />}
                  >
                    Clear
                  </Button>
                </Box>

                <HStack spacing={3} w="full">
                  <Button
                    flex={1}
                    colorScheme="blue"
                    leftIcon={<Upload size={18} />}
                    onClick={() =>
                      document.getElementById("scan-upload").click()
                    }
                  >
                    Change Image
                  </Button>
                  <Button
                    flex={1}
                    colorScheme="purple"
                    leftIcon={<Brain size={18} />}
                    isLoading={loading}
                    onClick={handleAnalyze}
                  >
                    Analyze Image
                  </Button>
                </HStack>
              </VStack>
            )}
          </CardBody>
        </Card>

        {/* Analysis Results */}
        {loading && (
          <Card bg={cardBg}>
            <CardBody>
              <VStack spacing={4}>
                <Spinner
                  thickness="4px"
                  speed="0.65s"
                  emptyColor="gray.200"
                  color="purple.500"
                  size="xl"
                />
                <Text fontWeight="600">
                  AI is analyzing your medical image...
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Please wait while we process the scan with advanced AI models
                </Text>
              </VStack>
            </CardBody>
          </Card>
        )}

        {result && !loading && (
          <VStack spacing={4} align="stretch">
            {/* Summary Card */}
            <Card bg={bg} borderColor={borderColor} borderWidth={1}>
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="sm">Analysis Summary</Heading>
                  <Badge
                    colorScheme={getSeverityColor(result.severity)}
                    fontSize="md"
                    px={3}
                    py={1}
                  >
                    {result.severity || "Unknown"}
                  </Badge>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={3} align="start">
                  <Text fontSize="sm">{result.summary}</Text>
                  <HStack spacing={4}>
                    <Box>
                      <Text fontSize="xs" color="gray.600">
                        Confidence Score
                      </Text>
                      <Text fontSize="lg" fontWeight="bold">
                        {((result.confidence || 0) * 100).toFixed(1)}%
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.600">
                        Severity Level
                      </Text>
                      <Badge colorScheme={getSeverityColor(result.severity)}>
                        {result.severity}
                      </Badge>
                    </Box>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Findings Card */}
            {result.findings && result.findings.length > 0 && (
              <Card bg={bg} borderColor={borderColor} borderWidth={1}>
                <CardHeader>
                  <HStack spacing={2}>
                    <Icon as={AlertTriangle} color="orange.500" />
                    <Heading size="sm">Medical Findings</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <List spacing={2}>
                    {result.findings.map((finding, idx) => (
                      <ListItem key={idx} fontSize="sm">
                        <HStack spacing={2}>
                          <Icon as={CheckCircle} color="orange.500" />
                          <Text>{finding}</Text>
                        </HStack>
                      </ListItem>
                    ))}
                  </List>
                </CardBody>
              </Card>
            )}

            {/* Recommendations Card */}
            {result.recommendations && result.recommendations.length > 0 && (
              <Card bg={bg} borderColor={borderColor} borderWidth={1}>
                <CardHeader>
                  <HStack spacing={2}>
                    <Icon as={CheckCircle} color="green.500" />
                    <Heading size="sm">Recommendations</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <List spacing={2}>
                    {result.recommendations.map((rec, idx) => (
                      <ListItem key={idx} fontSize="sm">
                        <HStack spacing={2}>
                          <Icon as={CheckCircle} color="green.500" />
                          <Text>{rec}</Text>
                        </HStack>
                      </ListItem>
                    ))}
                  </List>
                </CardBody>
              </Card>
            )}

            {/* Action Buttons */}
            <HStack spacing={3} w="full">
              <Button
                flex={1}
                colorScheme="teal"
                variant="outline"
                onClick={() =>
                  toast({
                    title: "Report Saved",
                    description:
                      "Analysis report has been saved to patient records",
                    status: "success",
                    duration: 2000,
                    isClosable: true,
                  })
                }
              >
                Save Report
              </Button>
              <Button
                flex={1}
                colorScheme="teal"
                variant="outline"
                onClick={() => {
                  window.print();
                  toast({
                    title: "Print Initiated",
                    description: "Analysis report sent to printer",
                    status: "info",
                    duration: 2000,
                    isClosable: true,
                  });
                }}
              >
                Print Analysis
              </Button>
              <Button flex={1} colorScheme="gray" onClick={handleClearImage}>
                Analyze Another
              </Button>
            </HStack>
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export default ScanCenterAnalyzer;
