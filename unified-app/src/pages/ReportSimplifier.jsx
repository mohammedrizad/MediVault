import React, { useState, useRef } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Button,
  Textarea,
  useColorModeValue,
  SimpleGrid,
  Alert,
  AlertIcon,
  AlertDescription,
  Icon,
  Badge,
  Skeleton,
  SkeletonText,
  useToast,
  Flex,
  Spacer,
  Divider,
  IconButton,
  Tooltip,
  useClipboard,
} from "@chakra-ui/react";
import {
  FiFileText,
  FiZap,
  FiCopy,
  FiCheck,
  FiUpload,
  FiTrash2,
  FiAlertCircle,
  FiBookOpen,
} from "react-icons/fi";

const SAMPLE_REPORTS = [
  {
    title: "Blood Test Report",
    text: `Complete Blood Count (CBC) Results:
WBC: 11.2 x10^9/L (Reference: 4.5-11.0) - Mildly elevated
RBC: 4.8 x10^12/L (Reference: 4.5-5.5) - Normal
Hemoglobin: 14.2 g/dL (Reference: 13.5-17.5) - Normal
Hematocrit: 42% (Reference: 38-50%) - Normal
Platelet Count: 245 x10^9/L (Reference: 150-400) - Normal
MCV: 87.5 fL (Reference: 80-100) - Normal
MCH: 29.6 pg (Reference: 27-33) - Normal
MCHC: 33.8 g/dL (Reference: 32-36) - Normal

Differential:
Neutrophils: 72% (Reference: 40-70%) - Mildly elevated
Lymphocytes: 20% (Reference: 20-40%) - Normal
Monocytes: 5% (Reference: 2-8%) - Normal
Eosinophils: 2% (Reference: 1-4%) - Normal
Basophils: 1% (Reference: 0-1%) - Normal

Impression: Mild leukocytosis with neutrophilia suggesting possible bacterial infection or inflammatory response. Recommend clinical correlation and repeat CBC in 1 week if symptoms persist.`,
  },
  {
    title: "Chest X-Ray Report",
    text: `PA and Lateral Chest Radiograph:
Clinical indication: Persistent cough x 2 weeks

Findings:
- Heart size is within normal limits. Cardiothoracic ratio 0.48.
- Mediastinal contours appear normal. No mediastinal widening.
- Bilateral lung fields show patchy airspace opacities in the right lower lobe, consistent with consolidation.
- Left lung fields are clear with no focal infiltrate.
- No pleural effusion identified bilaterally.
- Costophrenic angles are sharp.
- Osseous structures demonstrate no acute fractures or lytic lesions.
- Visualized soft tissues are unremarkable.

Impression:
1. Right lower lobe consolidation, likely representing community-acquired pneumonia in the appropriate clinical context.
2. No pleural effusion or pneumothorax.
3. Recommend follow-up imaging in 4-6 weeks to document resolution.`,
  },
  {
    title: "Lipid Panel",
    text: `Lipid Panel Results (Fasting):
Total Cholesterol: 242 mg/dL (Desirable: <200, Borderline: 200-239, High: ≥240) - HIGH
LDL Cholesterol: 165 mg/dL (Optimal: <100, Near Optimal: 100-129, Borderline: 130-159, High: 160-189) - HIGH
HDL Cholesterol: 38 mg/dL (Low: <40, Normal: 40-59, High ≥60) - LOW
Triglycerides: 195 mg/dL (Normal: <150, Borderline: 150-199, High: 200-499) - BORDERLINE HIGH
VLDL: 39 mg/dL (Reference: 5-40) - Normal
Non-HDL Cholesterol: 204 mg/dL (Reference: <130) - HIGH

Cardiovascular Risk Assessment:
Total Cholesterol/HDL Ratio: 6.4 (Desirable: <5.0) - ELEVATED RISK
10-year ASCVD Risk: 12.4% (Intermediate Risk)

Impression: Dyslipidemia with elevated LDL cholesterol, low HDL cholesterol, and borderline high triglycerides. Elevated cardiovascular risk. Recommend lifestyle modifications including dietary changes and regular exercise. Consider statin therapy per ACC/AHA guidelines given intermediate ASCVD risk.`,
  },
];

const API_BASE = "http://localhost:5002";

const ReportSimplifier = () => {
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [originalText, setOriginalText] = useState("");
  const [simplifiedText, setSimplifiedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { hasCopied: hasCopiedOriginal, onCopy: onCopyOriginal } =
    useClipboard(originalText);
  const { hasCopied: hasCopiedSimplified, onCopy: onCopySimplified } =
    useClipboard(simplifiedText);

  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const simplifiedBg = useColorModeValue("green.50", "green.900");
  const simplifiedBorder = useColorModeValue("green.200", "green.600");
  const originalBg = useColorModeValue("blue.50", "blue.900");
  const originalBorder = useColorModeValue("blue.200", "blue.600");

  const handleSimplify = async () => {
    if (!originalText.trim()) {
      toast({
        title: "No report text",
        description: "Please enter or upload a medical report to simplify.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    setError("");
    setSimplifiedText("");

    try {
      const response = await fetch(`${API_BASE}/ai/simplify-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: originalText }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      if (data.text) {
        setSimplifiedText(data.text);
        toast({
          title: "Report simplified!",
          description: "Your report has been translated to plain language.",
          status: "success",
          duration: 3000,
        });
      } else {
        throw new Error("No simplified text returned");
      }
    } catch (err) {
      console.error("Simplify error:", err);
      setError(
        err.message || "Failed to simplify report. Please try again later.",
      );
      toast({
        title: "Simplification failed",
        description: err.message || "Could not connect to AI service.",
        status: "error",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/plain" && !file.name.endsWith(".txt")) {
      toast({
        title: "Unsupported file type",
        description: "Please upload a .txt file with the report text.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setOriginalText(event.target.result);
      setSimplifiedText("");
      setError("");
      toast({
        title: "File loaded",
        description: `Loaded "${file.name}" successfully.`,
        status: "info",
        duration: 2000,
      });
    };
    reader.onerror = () => {
      toast({
        title: "File read error",
        description: "Could not read the uploaded file.",
        status: "error",
        duration: 3000,
      });
    };
    reader.readAsText(file);
  };

  const handleLoadSample = (sample) => {
    setOriginalText(sample.text);
    setSimplifiedText("");
    setError("");
    toast({
      title: "Sample loaded",
      description: `Loaded "${sample.title}" sample report.`,
      status: "info",
      duration: 2000,
    });
  };

  const handleClear = () => {
    setOriginalText("");
    setSimplifiedText("");
    setError("");
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack>
          <Icon as={FiBookOpen} boxSize={8} color="green.500" />
          <VStack align="start" spacing={1}>
            <Heading size="lg">Report Simplifier</Heading>
            <Text color="gray.600">
              AI-powered medical report simplification — understand your reports
              in plain language
            </Text>
          </VStack>
          <Spacer />
          <Badge colorScheme="green" fontSize="sm" px={3} py={1}>
            AI Powered
          </Badge>
        </HStack>

        {/* Quick Actions */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text fontWeight="semibold" fontSize="md">
                Get Started
              </Text>
              <Flex wrap="wrap" gap={3}>
                <Button
                  leftIcon={<FiUpload />}
                  colorScheme="blue"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Report (.txt)
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".txt,text/plain"
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                />
                {SAMPLE_REPORTS.map((sample, idx) => (
                  <Button
                    key={idx}
                    size="sm"
                    variant="outline"
                    colorScheme="purple"
                    onClick={() => handleLoadSample(sample)}
                  >
                    Sample: {sample.title}
                  </Button>
                ))}
                {originalText && (
                  <Button
                    leftIcon={<FiTrash2 />}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={handleClear}
                  >
                    Clear All
                  </Button>
                )}
              </Flex>
            </VStack>
          </CardBody>
        </Card>

        {/* Input Area */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardHeader pb={2}>
            <HStack>
              <Icon as={FiFileText} color="blue.500" />
              <Heading size="sm">Original Medical Report</Heading>
              <Spacer />
              <Text fontSize="xs" color="gray.500">
                {originalText.length} characters
              </Text>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            <Textarea
              placeholder="Paste your medical report text here, or use the upload/sample buttons above..."
              value={originalText}
              onChange={(e) => {
                setOriginalText(e.target.value);
                if (simplifiedText) setSimplifiedText("");
              }}
              minH="200px"
              resize="vertical"
              fontSize="sm"
              fontFamily="mono"
            />
          </CardBody>
        </Card>

        {/* Simplify Button */}
        <Flex justify="center">
          <Button
            leftIcon={<FiZap />}
            colorScheme="green"
            size="lg"
            px={10}
            onClick={handleSimplify}
            isLoading={loading}
            loadingText="Simplifying with AI..."
            isDisabled={!originalText.trim()}
            shadow="md"
            _hover={{ shadow: "lg", transform: "translateY(-1px)" }}
            transition="all 0.2s"
          >
            Simplify Report
          </Button>
        </Flex>

        {/* Error */}
        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Side-by-side comparison */}
        {(loading || simplifiedText) && (
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            {/* Original */}
            <Card
              bg={originalBg}
              borderColor={originalBorder}
              borderWidth="2px"
            >
              <CardHeader pb={2}>
                <HStack>
                  <Badge colorScheme="blue" fontSize="xs">
                    ORIGINAL
                  </Badge>
                  <Text fontWeight="semibold" fontSize="sm">
                    Medical Report
                  </Text>
                  <Spacer />
                  <Tooltip label={hasCopiedOriginal ? "Copied!" : "Copy text"}>
                    <IconButton
                      icon={hasCopiedOriginal ? <FiCheck /> : <FiCopy />}
                      size="xs"
                      variant="ghost"
                      onClick={onCopyOriginal}
                      aria-label="Copy original"
                    />
                  </Tooltip>
                </HStack>
              </CardHeader>
              <CardBody pt={0}>
                <Text
                  fontSize="sm"
                  whiteSpace="pre-wrap"
                  fontFamily="mono"
                  color="gray.700"
                >
                  {originalText}
                </Text>
              </CardBody>
            </Card>

            {/* Simplified */}
            <Card
              bg={simplifiedBg}
              borderColor={simplifiedBorder}
              borderWidth="2px"
            >
              <CardHeader pb={2}>
                <HStack>
                  <Badge colorScheme="green" fontSize="xs">
                    SIMPLIFIED
                  </Badge>
                  <Text fontWeight="semibold" fontSize="sm">
                    Patient-Friendly Version
                  </Text>
                  <Spacer />
                  {simplifiedText && (
                    <Tooltip
                      label={hasCopiedSimplified ? "Copied!" : "Copy text"}
                    >
                      <IconButton
                        icon={hasCopiedSimplified ? <FiCheck /> : <FiCopy />}
                        size="xs"
                        variant="ghost"
                        onClick={onCopySimplified}
                        aria-label="Copy simplified"
                      />
                    </Tooltip>
                  )}
                </HStack>
              </CardHeader>
              <CardBody pt={0}>
                {loading ? (
                  <VStack spacing={4} align="stretch">
                    <Skeleton height="20px" />
                    <SkeletonText noOfLines={4} spacing={3} />
                    <Skeleton height="20px" width="80%" />
                    <SkeletonText noOfLines={3} spacing={3} />
                    <Skeleton height="20px" width="60%" />
                    <SkeletonText noOfLines={2} spacing={3} />
                  </VStack>
                ) : (
                  <Text
                    fontSize="sm"
                    whiteSpace="pre-wrap"
                    lineHeight="1.7"
                    color="gray.700"
                  >
                    {simplifiedText}
                  </Text>
                )}
              </CardBody>
            </Card>
          </SimpleGrid>
        )}

        {/* Empty state guidance */}
        {!loading && !simplifiedText && !error && (
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <VStack spacing={4} py={6}>
                <Icon as={FiAlertCircle} boxSize={10} color="gray.400" />
                <Heading size="sm" color="gray.500">
                  How it works
                </Heading>
                <VStack spacing={2} maxW="lg" textAlign="center">
                  <Text fontSize="sm" color="gray.500">
                    1. Paste or upload your medical report text
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    2. Click "Simplify Report" to run AI analysis
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    3. View original and simplified versions side-by-side
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    4. Copy the simplified version to share with family or keep
                    for reference
                  </Text>
                </VStack>
                <Divider maxW="sm" />
                <Text fontSize="xs" color="gray.400" textAlign="center">
                  This tool helps you understand medical terminology but does
                  not replace professional medical advice.
                </Text>
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  );
};

export default ReportSimplifier;
