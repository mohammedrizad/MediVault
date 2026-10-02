import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  Button,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Icon,
  Badge,
  Input,
  Select,
  FormControl,
  FormLabel,
  Textarea,
  useColorModeValue,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Image,
} from "@chakra-ui/react";
import {
  FiUpload,
  FiFile,
  FiImage,
  FiCheck,
  FiClock,
  FiX,
  FiEye,
  FiDownload,
  FiUser,
  FiCalendar,
  FiCamera,
  FiSend,
} from "react-icons/fi";

const ScanCenterUpload = () => {
  const { currentUser } = useAuth();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [scanType, setScanType] = useState("");
  const [findings, setFindings] = useState("");
  const [uploadedResults, setUploadedResults] = useState([]);
  const fileInputRef = useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const loadResults = async () => {
    if (!currentUser?.name) return;
    try {
      const authToken = localStorage.getItem("authToken");
      const res = await fetch(
        `${API_URL}/patient/scanresults/${encodeURIComponent(currentUser.name)}`,
        { headers: authToken ? { Authorization: `Bearer ${authToken}` } : {} },
      );
      const data = await res.json();
      setUploadedResults(
        (data.results || []).map((r) => ({
          id: r.id,
          patientName: r.patientName,
          patientId: r.patientId,
          scanType: r.scanType,
          uploadDate: r.uploadDate,
          status: "Completed",
          technician: currentUser.name,
          filesCount: r.filesCount,
          findings: r.findings || "No findings recorded",
        })),
      );
    } catch (err) {
      console.error("Failed to load scan results:", err);
    }
  };

  useEffect(() => {
    loadResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.name]);

  // Upload statistics
  const uploadStats = [
    {
      label: "Total Uploads",
      value: uploadedResults.length,
      color: "blue.500",
    },
    {
      label: "Completed",
      value: uploadedResults.filter((r) => r.status === "Completed").length,
      color: "green.500",
    },
    {
      label: "Pending Review",
      value: uploadedResults.filter((r) => r.status === "Pending Review")
        .length,
      color: "orange.500",
    },
    {
      label: "Files Attached",
      value: uploadedResults.reduce((sum, r) => sum + (r.filesCount || 0), 0),
      color: "purple.500",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "green";
      case "Pending Review":
        return "orange";
      case "In Progress":
        return "blue";
      case "Failed":
        return "red";
      default:
        return "gray";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Urgent":
        return "red";
      case "High":
        return "orange";
      case "Standard":
        return "blue";
      case "Low":
        return "gray";
      default:
        return "gray";
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (!patientId || !scanType) {
      toast({
        title: "Missing fields",
        description: "Please enter a patient ID and select a scan type.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    try {
      const authToken = localStorage.getItem("authToken");
      const authHeader = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      const uploadedFiles = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`${API_URL}/records/upload`, {
          method: "POST",
          headers: authHeader,
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || `Failed to upload ${file.name}`);

        uploadedFiles.push({
          name: data.originalName,
          url: data.url,
          uploadDate: new Date().toISOString(),
          fileHash: data.fileHash,
          encryptionIV: data.encryptionIV,
          encrypted: true,
        });
        setUploadProgress(Math.round(((i + 1) / Math.max(selectedFiles.length, 1)) * 90));
      }

      const resultRes = await fetch(`${API_URL}/patient/scanresult`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({
          patientId,
          scanType,
          findings,
          files: uploadedFiles,
        }),
      });
      const resultData = await resultRes.json();
      if (!resultRes.ok) {
        throw new Error(resultData.msg || "Failed to attach scan result to patient");
      }

      setUploadProgress(100);
      toast({
        title: "Scan Results Uploaded",
        description: `${scanType} results for ${resultData.patient.name} have been encrypted, stored, and attached to their record.`,
        status: "success",
        duration: 4000,
      });

      setPatientId("");
      setScanType("");
      setFindings("");
      setSelectedFiles([]);
      loadResults();
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err.message,
        status: "error",
        duration: 4000,
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1500);
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={2}>
          Upload Scan Results
        </Text>
        <Text color="gray.600">
          Upload and manage patient scan results and reports
        </Text>
      </Box>

      {/* Statistics */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        {uploadStats.map((stat, index) => (
          <Card key={index}>
            <CardBody>
              <Stat>
                <StatLabel>{stat.label}</StatLabel>
                <StatNumber color={stat.color}>{stat.value}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <Text fontSize="lg" fontWeight="semibold">
            Upload New Scan Results
          </Text>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Patient ID</FormLabel>
                <Input
                  placeholder="Enter patient ID"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Scan Type</FormLabel>
                <Select
                  placeholder="Select scan type"
                  value={scanType}
                  onChange={(e) => setScanType(e.target.value)}
                >
                  <option value="MRI Brain">MRI Brain</option>
                  <option value="MRI Spine">MRI Spine</option>
                  <option value="CT Chest">CT Chest</option>
                  <option value="CT Abdomen">CT Abdomen</option>
                  <option value="X-Ray Chest">X-Ray Chest</option>
                  <option value="Ultrasound Abdomen">Ultrasound Abdomen</option>
                  <option value="Ultrasound Pelvis">Ultrasound Pelvis</option>
                </Select>
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel>Initial Findings</FormLabel>
              <Textarea
                placeholder="Enter initial findings or notes..."
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
              />
            </FormControl>

            {/* File Upload Area */}
            <Box
              border="2px"
              borderColor="gray.300"
              borderStyle="dashed"
              borderRadius="md"
              p={8}
              textAlign="center"
              bg="gray.50"
              cursor="pointer"
              onClick={() => fileInputRef.current?.click()}
              _hover={{ bg: "gray.100" }}
            >
              <VStack spacing={4}>
                <Icon as={FiUpload} boxSize={12} color="gray.400" />
                <VStack spacing={2}>
                  <Text fontWeight="medium">
                    Drop files here or click to browse
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Supports DICOM, PNG, JPG, PDF files up to 100MB each
                  </Text>
                </VStack>
                <Input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".dcm,.png,.jpg,.jpeg,.pdf"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />
              </VStack>
            </Box>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <Box>
                <Text fontWeight="medium" mb={2}>
                  Selected Files ({selectedFiles.length})
                </Text>
                <VStack spacing={2} align="stretch">
                  {selectedFiles.map((file, index) => (
                    <HStack key={index} p={3} bg="blue.50" borderRadius="md">
                      <Icon as={FiFile} color="blue.500" />
                      <VStack align="start" spacing={0} flex={1}>
                        <Text fontSize="sm" fontWeight="medium">
                          {file.name}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </Text>
                      </VStack>
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => {
                          setSelectedFiles((prev) =>
                            prev.filter((_, i) => i !== index),
                          );
                          toast({
                            title: "File Removed",
                            description: `${file.name} has been removed`,
                            status: "info",
                            duration: 2000,
                            isClosable: true,
                          });
                        }}
                      >
                        <Icon as={FiX} />
                      </Button>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}

            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="medium">
                    Uploading...
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {uploadProgress}%
                  </Text>
                </HStack>
                <Progress
                  value={uploadProgress}
                  colorScheme="teal"
                  size="sm"
                  borderRadius="md"
                />
              </Box>
            )}

            {/* Upload Success */}
            {uploadProgress === 100 && (
              <Alert status="success" borderRadius="md">
                <AlertIcon />
                <AlertTitle>Upload Complete!</AlertTitle>
                <AlertDescription>
                  Files uploaded successfully and sent for review.
                </AlertDescription>
              </Alert>
            )}

            <HStack spacing={3}>
              <Button
                colorScheme="teal"
                leftIcon={<FiUpload />}
                isDisabled={
                  selectedFiles.length === 0 || !patientId || !scanType
                }
                isLoading={isUploading}
                loadingText="Uploading..."
                onClick={handleUpload}
              >
                Upload Results
              </Button>
              <Button
                variant="outline"
                leftIcon={<FiSend />}
                onClick={() =>
                  toast({
                    title: "Sent for Review",
                    description:
                      "Scan results have been sent for radiologist review",
                    status: "success",
                    duration: 2000,
                    isClosable: true,
                  })
                }
              >
                Send for Review
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Recent Uploads */}
      <Card>
        <CardHeader>
          <Text fontSize="lg" fontWeight="semibold">
            Recent Uploads
          </Text>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            {uploadedResults.map((result) => (
              <Card key={result.id} variant="outline">
                <CardBody>
                  <HStack justify="space-between" wrap="wrap">
                    <HStack spacing={4}>
                      <Icon as={FiImage} boxSize={6} color="teal.500" />
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold">{result.patientName}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {result.patientId} • {result.scanType}
                        </Text>
                        <HStack spacing={4}>
                          <Text fontSize="sm" color="gray.500">
                            {result.uploadDate}
                          </Text>
                        </HStack>
                      </VStack>
                    </HStack>

                    <VStack align="end" spacing={2}>
                      <Badge colorScheme={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          leftIcon={<FiEye />}
                          colorScheme="blue"
                          onClick={() =>
                            toast({
                              title: "Viewing Results",
                              description: `Opening scan results for ${result.patientName}`,
                              status: "info",
                              duration: 2000,
                              isClosable: true,
                            })
                          }
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          leftIcon={<FiDownload />}
                          variant="outline"
                          onClick={() =>
                            toast({
                              title: "Downloading",
                              description: `Downloading ${result.scanType} results (${result.filesCount} file${result.filesCount === 1 ? "" : "s"})`,
                              status: "info",
                              duration: 2000,
                              isClosable: true,
                            })
                          }
                        >
                          Download
                        </Button>
                      </HStack>
                    </VStack>
                  </HStack>

                  <Box mt={4} p={3} bg="gray.50" borderRadius="md">
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                      <Box>
                        <Text fontSize="xs" color="gray.600">
                          Files
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {result.filesCount}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.600">
                          Scan Center
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {result.technician}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.600">
                          Encryption
                        </Text>
                        <Badge size="sm" colorScheme="green">
                          AES-256
                        </Badge>
                      </Box>
                    </SimpleGrid>
                  </Box>

                  {result.findings && (
                    <Box mt={3}>
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color="gray.600"
                        mb={1}
                      >
                        Findings:
                      </Text>
                      <Text fontSize="sm">{result.findings}</Text>
                    </Box>
                  )}
                </CardBody>
              </Card>
            ))}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default ScanCenterUpload;
