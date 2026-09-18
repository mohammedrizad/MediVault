import React, { useState } from "react";
import {
  Box,
  Button,
  VStack,
  HStack,
  useToast,
  Heading,
  Container,
  Text,
  Image,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Spinner,
  Input,
  FormControl,
  FormLabel,
  Progress,
  Grid,
  GridItem,
  Icon,
} from "@chakra-ui/react";
import { Upload, X, Search, Lightbulb } from "lucide-react";
import { analyzeImage } from "../services/geminiService";

// Mock data for different image types - VARIED DATA
const MOCK_ANALYSIS_DATA = {
  chest: {
    summary:
      "Right lower lobe infiltrate measuring approximately 3cm with increased bronchial markings in bilateral lower fields.",
    findings: [
      "Right lower lobe infiltrate measuring approximately 3cm",
      "Increased bronchial markings in bilateral lower fields",
      "Cardiothoracic ratio: 0.48 (Normal)",
      "No visible pleural effusion",
      "Costophrenic angles are sharp bilaterally",
      "Mild elevation of right hemidiaphragm",
    ],
    recommendations: [
      "Follow-up chest X-ray in 2-3 weeks",
      "Consider antibiotic therapy",
      "Clinical correlation recommended",
    ],
    confidence: 0.89,
    severity: "Moderate",
  },
  lung: {
    summary:
      "Acute pneumonia with bilateral lower lobe consolidation. Significant respiratory compromise evident.",
    findings: [
      "Bilateral lower lobe consolidation",
      "Air bronchograms visible",
      "Increased bronchovascular markings",
      "Slight hyperinflation bilaterally",
      "No pleural effusion detected",
      "Heart silhouette within normal limits",
    ],
    recommendations: [
      "Hospitalization recommended",
      "Aggressive antibiotic therapy",
      "Daily monitoring required",
      "Consider ICU admission if O2 sat drops",
    ],
    confidence: 0.94,
    severity: "Severe",
  },
  normal: {
    summary:
      "Completely normal chest X-ray with no acute cardiopulmonary findings. Excellent prognosis.",
    findings: [
      "Both lungs clear and well-aerated",
      "Heart size normal and unremarkable",
      "No mediastinal widening",
      "No pleural or pericardial effusion",
      "All ribs intact without fracture",
      "Diaphragm position normal",
    ],
    recommendations: [
      "Continue normal activities",
      "No follow-up needed",
      "Maintain good respiratory health",
    ],
    confidence: 0.98,
    severity: "Normal",
  },
  spine: {
    summary:
      "Severe cervical spondylosis with significant central canal stenosis at C4-C5 and C5-C6 levels.",
    findings: [
      "Severe degenerative disc disease C4-C5",
      "Severe stenosis C5-C6 with cord compression",
      "Multiple osteophytes causing canal narrowing",
      "Loss of cervical lordosis",
      "Vertebral subluxation at C5-C6",
      "Ligamentous hypertrophy noted",
    ],
    recommendations: [
      "Urgent MRI for cord signal assessment",
      "Neurosurgery consultation",
      "Consider surgical intervention",
      "Avoid neck trauma",
    ],
    confidence: 0.91,
    severity: "Severe",
  },
  abdomen: {
    summary:
      "Acute small bowel obstruction with transition point visible. Surgical intervention likely needed.",
    findings: [
      "Marked small bowel dilatation to 4cm",
      "Clear transition point at terminal ileum",
      "Collapsed colon distal to transition",
      "Multiple air-fluid levels present",
      "No free intraperitoneal air",
      "Possible adhesions at transition point",
    ],
    recommendations: [
      "Emergency surgical consult",
      "NPO status immediately",
      "Place NG tube",
      "IV fluid resuscitation",
      "Prepare for urgent surgery",
    ],
    confidence: 0.93,
    severity: "Severe",
  },
  brain: {
    summary:
      "Acute ischemic stroke in left middle cerebral artery distribution with significant edema.",
    findings: [
      "Hypodensity in left MCA territory",
      "Significant cerebral edema with midline shift",
      "Loss of gray-white matter differentiation",
      "Possible mass effect on lateral ventricles",
      "No hemorrhage identified",
      "Right hemisphere unremarkable",
    ],
    recommendations: [
      "Immediate ICU admission",
      "Neurology consult STAT",
      "Consider thrombolytic therapy",
      "Continuous neuro monitoring",
      "Imaging follow-up in 24 hours",
    ],
    confidence: 0.96,
    severity: "Critical",
  },
  pelvis: {
    summary:
      "Acetabular fracture on left side with intra-articular hip joint involvement. Unstable fracture.",
    findings: [
      "Left acetabular fracture with displacement",
      "Femoral head partially displaced",
      "Intra-articular bone fragments",
      "Hip joint space narrowed",
      "Soft tissue swelling present",
      "Possible labral involvement",
    ],
    recommendations: [
      "Orthopedic surgery consultation",
      "Consider CT for surgical planning",
      "Weight bearing precautions",
      "Possible open reduction internal fixation",
      "Traction may be needed initially",
    ],
    confidence: 0.9,
    severity: "Severe",
  },
};

const getAnalysisType = (imageName) => {
  const name = imageName.toLowerCase();
  if (name.includes("chest")) return "chest";
  if (name.includes("lung")) return "lung";
  if (name.includes("spine") || name.includes("cervical")) return "spine";
  if (name.includes("abd") || name.includes("abdom")) return "abdomen";
  if (name.includes("brain") || name.includes("head") || name.includes("ct"))
    return "brain";
  if (name.includes("pelvis") || name.includes("hip")) return "pelvis";
  return "normal";
};

const XRayAnalyzer = () => {
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const toast = useToast();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file",
          description: "Please select an image file",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setImageName(file.name);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) {
      toast({
        title: "No image selected",
        description: "Please select an X-ray image to analyze",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      try {
        const analysisType = getAnalysisType(imageName);
        const mockData = MOCK_ANALYSIS_DATA[analysisType];

        setResult({
          ...mockData,
          timestamp: new Date().toLocaleString(),
        });

        toast({
          title: "Analysis Complete",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: "Analysis failed",
          description: error.message || "Please try again",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    }, 2000);
  };

  const handleClear = () => {
    setImage(null);
    setImageName("");
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
    <Box
      minH="100vh"
      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      py={3}
      px={2}
    >
      <Container maxW="6xl">
        {/* Header */}
        <Box textAlign="center" color="white" mb={4}>
          <Heading size="lg" mb={1}>
            🔬 MediVault AI Image Analyzer
          </Heading>
          <Text fontSize="sm">Advanced Medical Image Analysis</Text>
        </Box>

        {/* Main Content */}
        <Grid
          templateColumns={{ base: "1fr", md: "350px 1fr" }}
          gap={4}
          maxH="85vh"
        >
          {/* Left Column - Upload */}
          <GridItem>
            <Card bg="white" shadow="lg" h="100%">
              <CardHeader pb={3}>
                <Heading size="sm">📷 Medical Image</Heading>
              </CardHeader>
              <CardBody display="flex" flexDirection="column" gap={3} p={3}>
                {image ? (
                  <Box position="relative" w="full">
                    <Image
                      src={image}
                      alt="X-ray preview"
                      borderRadius="md"
                      maxH="220px"
                      w="full"
                      objectFit="contain"
                      bg="black"
                    />
                    <Button
                      size="xs"
                      colorScheme="red"
                      position="absolute"
                      top={1}
                      right={1}
                      leftIcon={<X size={12} />}
                      onClick={() => setImage(null)}
                    >
                      Remove
                    </Button>
                  </Box>
                ) : (
                  <Box
                    border="2px dashed"
                    borderColor="gray.300"
                    borderRadius="md"
                    p={4}
                    textAlign="center"
                    cursor="pointer"
                    _hover={{ bg: "gray.50", borderColor: "blue.400" }}
                    as="label"
                  >
                    <VStack spacing={2}>
                      <Icon as={Upload} boxSize={8} color="blue.500" />
                      <Text fontSize="xs" fontWeight="bold">
                        Click to upload
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        PNG, JPG, JPEG
                      </Text>
                    </VStack>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      display="none"
                    />
                  </Box>
                )}

                <HStack spacing={2} w="full">
                  <Button
                    w="full"
                    bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    color="white"
                    isLoading={loading}
                    loadingText="..."
                    onClick={handleAnalyze}
                    isDisabled={!image}
                    size="sm"
                    fontSize="xs"
                    leftIcon={<Icon as={Search} />}
                  >
                    Analyze
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClear}
                    isDisabled={!image && !result}
                    fontSize="xs"
                  >
                    Clear
                  </Button>
                </HStack>
              </CardBody>
            </Card>
          </GridItem>

          {/* Right Column - Results */}
          <GridItem
            overflowY="auto"
            css={{
              "&::-webkit-scrollbar": { width: "6px" },
              "&::-webkit-scrollbar-track": { bg: "transparent" },
              "&::-webkit-scrollbar-thumb": {
                bg: "#cbd5e0",
                borderRadius: "3px",
              },
            }}
          >
            {loading && (
              <Card bg="white" shadow="lg">
                <CardBody
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  py={6}
                >
                  <VStack spacing={2}>
                    <Spinner color="purple.500" size="md" thickness={3} />
                    <Text fontSize="xs" fontWeight="bold" color="gray.700">
                      Analyzing...
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            )}

            {result && !loading && (
              <VStack spacing={3}>
                {/* Summary Card */}
                <Card bg="white" shadow="lg">
                  <CardHeader pb={2}>
                    <HStack justify="space-between" w="full">
                      <Text fontSize="xs" fontWeight="bold">
                        Summary
                      </Text>
                      <Badge
                        colorScheme={getSeverityColor(result.severity)}
                        fontSize="xs"
                      >
                        {result.severity}
                      </Badge>
                    </HStack>
                  </CardHeader>
                  <CardBody pt={0}>
                    <Text fontSize="xs" color="gray.700" lineHeight="1.4">
                      {result.summary}
                    </Text>
                  </CardBody>
                </Card>

                {/* Metrics */}
                <Grid templateColumns="1fr 1fr" gap={2} w="full">
                  <Card bg="white" shadow="lg">
                    <CardBody p={2}>
                      <Text fontSize="xs" color="gray.600" mb={1}>
                        Confidence
                      </Text>
                      <Text
                        fontSize="sm"
                        fontWeight="bold"
                        color="purple.600"
                        mb={1}
                      >
                        {(result.confidence * 100).toFixed(0)}%
                      </Text>
                      <Progress
                        value={result.confidence * 100}
                        size="xs"
                        colorScheme={
                          result.confidence > 0.8
                            ? "green"
                            : result.confidence > 0.6
                              ? "yellow"
                              : "orange"
                        }
                      />
                    </CardBody>
                  </Card>
                  <Card bg="white" shadow="lg">
                    <CardBody p={2}>
                      <Text fontSize="xs" color="gray.600" mb={1}>
                        Severity
                      </Text>
                      <Badge
                        colorScheme={getSeverityColor(result.severity)}
                        fontSize="xs"
                      >
                        {result.severity}
                      </Badge>
                    </CardBody>
                  </Card>
                </Grid>

                {/* Findings */}
                <Card bg="white" shadow="lg" w="full">
                  <CardHeader pb={2}>
                    <Heading size="xs">
                      🔍 Findings ({result.findings.length})
                    </Heading>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack align="stretch" spacing={1}>
                      {result.findings.slice(0, 4).map((finding, idx) => (
                        <HStack key={idx} spacing={1} align="flex-start">
                          <Text fontSize="xs" color="blue.500">
                            •
                          </Text>
                          <Text fontSize="xs" color="gray.700">
                            {finding}
                          </Text>
                        </HStack>
                      ))}
                      {result.findings.length > 4 && (
                        <Text fontSize="xs" color="gray.500" fontStyle="italic">
                          +{result.findings.length - 4} more...
                        </Text>
                      )}
                    </VStack>
                  </CardBody>
                </Card>

                {/* Recommendations */}
                <Card bg="white" shadow="lg" w="full">
                  <CardHeader pb={2}>
                    <Heading size="xs">💡 Recommendations</Heading>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack align="stretch" spacing={1}>
                      {result.recommendations.slice(0, 3).map((rec, idx) => (
                        <HStack key={idx} spacing={1} align="flex-start">
                          <Text fontSize="xs" color="orange.500">
                            →
                          </Text>
                          <Text fontSize="xs" color="gray.700">
                            {rec}
                          </Text>
                        </HStack>
                      ))}
                      {result.recommendations.length > 3 && (
                        <Text fontSize="xs" color="gray.500" fontStyle="italic">
                          +{result.recommendations.length - 3} more...
                        </Text>
                      )}
                    </VStack>
                  </CardBody>
                </Card>

                {/* Timestamp */}
                <Text
                  fontSize="xs"
                  color="gray.500"
                  textAlign="center"
                  w="full"
                >
                  Analysis: {result.timestamp}
                </Text>

                {/* Action Buttons */}
                <HStack spacing={2} w="full">
                  <Button colorScheme="green" flex={1} size="xs" fontSize="xs">
                    Save
                  </Button>
                  <Button colorScheme="blue" flex={1} size="xs" fontSize="xs">
                    Print
                  </Button>
                  <Button
                    variant="outline"
                    flex={1}
                    size="xs"
                    onClick={handleClear}
                    fontSize="xs"
                  >
                    New
                  </Button>
                </HStack>
              </VStack>
            )}

            {!result && !loading && image && (
              <Card bg="white" shadow="lg">
                <CardBody
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  py={8}
                >
                  <Text
                    fontSize="sm"
                    color="gray.600"
                    fontWeight="bold"
                    textAlign="center"
                  >
                    Click "Analyze" to start
                  </Text>
                </CardBody>
              </Card>
            )}

            {!result && !loading && !image && (
              <Card bg="white" shadow="lg">
                <CardBody
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  py={8}
                >
                  <Text fontSize="sm" color="gray.400" textAlign="center">
                    Upload an image to begin
                  </Text>
                </CardBody>
              </Card>
            )}
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
};

export default XRayAnalyzer;
