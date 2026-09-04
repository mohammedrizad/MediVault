import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Grid,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Select,
  InputGroup,
  InputLeftElement,
  Flex,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  useToast,
  FormControl,
  FormLabel,
  Textarea,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  Spinner,
} from "@chakra-ui/react";
import {
  FiFileText,
  FiSearch,
  FiFilter,
  FiEye,
  FiDownload,
  FiUpload,
  FiCalendar,
  FiUser,
  FiActivity,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiFile,
} from "react-icons/fi";

const MedicalRecords = () => {
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterPatient, setFilterPatient] = useState("all");
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();

  // Real medical records — every patient's History entries, flattened
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";
        const res = await fetch(`${API_URL}/patient/getall`);
        const data = await res.json();
        const patients = data.result || [];
        const withHistory = await Promise.all(
          patients.map(async (p) => {
            try {
              const r = await fetch(`${API_URL}/patient/search/${p.MedicalId}`);
              const j = await r.json();
              return j.data;
            } catch {
              return null;
            }
          }),
        );
        const flattened = [];
        withHistory.filter(Boolean).forEach((patient) => {
          (patient.History || []).forEach((h) => {
            flattened.push({
              id: h._id,
              patientId: patient.MedicalId,
              patientName: patient.Name,
              type: "Consultation",
              title: h.disease || "Clinical entry",
              date: h.Date || "",
              doctor: (
                (typeof h.DoctorDetails === "object" && h.DoctorDetails?.name) ||
                patient.assignedDoctor ||
                "Unknown"
              ).replace(/^Dr\.?\s*/i, ""),
              status: "Final",
              category: "Consultation",
              description: h.disease || "",
              findings: h.notes || "",
              recommendations: "",
              fileUrl: "#",
              hasFile: Boolean(h.report?.files?.length),
            });
          });
        });
        setRecords(flattened.sort((a, b) => (a.date < b.date ? 1 : -1)));
      } catch (err) {
        console.error("Failed to load medical records:", err);
      }
    };
    loadRecords();
  }, []);

  // Get unique patients for filter
  const uniquePatients = [...new Set(records.map((r) => r.patientName))];

  // Filter records
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      filterType === "all" ||
      record.type.toLowerCase() === filterType.toLowerCase();
    const matchesPatient =
      filterPatient === "all" || record.patientName === filterPatient;
    return matchesSearch && matchesType && matchesPatient;
  });

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    onOpen();
  };

  const handleDownloadRecord = (record) => {
    if (record.hasFile) {
      toast({
        title: "Download Started",
        description: `Downloading ${record.title}`,
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "No File Available",
        description: "This record doesn't have an attached file.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5002";
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${API_BASE}/records/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        },
      );

      setIsUploading(false);
      toast({
        title: "File Uploaded (Encrypted)",
        description: `${file.name} → SHA-256 hashed & AES-256 encrypted. Hash: ${response.data.fileHash?.substring(0, 16)}...`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      setIsUploading(false);
      toast({
        title: "Upload Failed",
        description: err.response?.data?.msg || err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "final":
        return "green";
      case "active":
        return "blue";
      case "pending":
        return "yellow";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
      case "laboratory":
        return "purple";
      case "radiology":
        return "blue";
      case "consultation":
        return "green";
      case "medication":
        return "orange";
      default:
        return "gray";
    }
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Box>
            <Heading size="lg" mb={2}>
              Medical Records
            </Heading>
            <Text color="gray.600">
              Manage patient medical records and documents
            </Text>
          </Box>
          <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onAddOpen}>
            Add Record
          </Button>
        </Flex>

        {/* Stats Cards */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={6}>
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <HStack>
                <Icon as={FiFileText} w={8} h={8} color="blue.500" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="2xl" fontWeight="bold">
                    {records.length}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Total Records
                  </Text>
                </VStack>
              </HStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <HStack>
                <Icon as={FiActivity} w={8} h={8} color="purple.500" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="2xl" fontWeight="bold">
                    {records.filter((r) => r.category === "Laboratory").length}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Lab Reports
                  </Text>
                </VStack>
              </HStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <HStack>
                <Icon as={FiFile} w={8} h={8} color="green.500" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="2xl" fontWeight="bold">
                    {records.filter((r) => r.category === "Radiology").length}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Imaging
                  </Text>
                </VStack>
              </HStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <HStack>
                <Icon as={FiUser} w={8} h={8} color="orange.500" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="2xl" fontWeight="bold">
                    {
                      records.filter((r) => r.category === "Consultation")
                        .length
                    }
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Consultations
                  </Text>
                </VStack>
              </HStack>
            </CardBody>
          </Card>
        </Grid>

        {/* Search and Filter */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Grid templateColumns={{ base: "1fr", md: "2fr 1fr 1fr" }} gap={4}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search records by title, patient, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              <Select
                placeholder="All Types"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="lab report">Lab Report</option>
                <option value="imaging">Imaging</option>
                <option value="consultation">Consultation</option>
                <option value="prescription">Prescription</option>
              </Select>
              <Select
                placeholder="All Patients"
                value={filterPatient}
                onChange={(e) => setFilterPatient(e.target.value)}
              >
                <option value="all">All Patients</option>
                {uniquePatients.map((patient) => (
                  <option key={patient} value={patient}>
                    {patient}
                  </option>
                ))}
              </Select>
            </Grid>
          </CardBody>
        </Card>

        {/* File Upload Section */}
        {isUploading && (
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={4}>
                <HStack>
                  <Spinner size="sm" />
                  <Text>Uploading file...</Text>
                </HStack>
                <Progress w="100%" colorScheme="blue" isIndeterminate />
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Records Table */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Medical Records</Heading>
          </CardHeader>
          <CardBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Record Details</Th>
                  <Th>Patient</Th>
                  <Th>Type</Th>
                  <Th>Category</Th>
                  <Th>Date</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredRecords.map((record) => (
                  <Tr key={record.id}>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">{record.title}</Text>
                        <Text fontSize="sm" color="gray.500">
                          Dr. {record.doctor}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>{record.patientName}</Td>
                    <Td>{record.type}</Td>
                    <Td>
                      <Badge colorScheme={getCategoryColor(record.category)}>
                        {record.category}
                      </Badge>
                    </Td>
                    <Td>{record.date}</Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          leftIcon={<FiEye />}
                          onClick={() => handleViewRecord(record)}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<FiDownload />}
                          onClick={() => handleDownloadRecord(record)}
                          isDisabled={!record.hasFile}
                        >
                          Download
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </VStack>

      {/* View Record Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Medical Record Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedRecord && (
              <VStack spacing={6} align="stretch">
                <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      Record Title
                    </Text>
                    <Text>{selectedRecord.title}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      Patient
                    </Text>
                    <Text>{selectedRecord.patientName}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      Type
                    </Text>
                    <Text>{selectedRecord.type}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      Date
                    </Text>
                    <Text>{selectedRecord.date}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      Doctor
                    </Text>
                    <Text>{selectedRecord.doctor}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      Status
                    </Text>
                    <Badge colorScheme={getStatusColor(selectedRecord.status)}>
                      {selectedRecord.status}
                    </Badge>
                  </Box>
                </Grid>

                <Divider />

                <Box>
                  <Text fontWeight="bold" mb={2}>
                    Description
                  </Text>
                  <Text color="gray.600">{selectedRecord.description}</Text>
                </Box>

                <Box>
                  <Text fontWeight="bold" mb={2}>
                    Key Findings
                  </Text>
                  <Text color="gray.600">{selectedRecord.findings}</Text>
                </Box>

                <Box>
                  <Text fontWeight="bold" mb={2}>
                    Recommendations
                  </Text>
                  <Text color="gray.600">{selectedRecord.recommendations}</Text>
                </Box>

                {selectedRecord.hasFile && (
                  <Alert status="info">
                    <AlertIcon />
                    <AlertTitle>File Available!</AlertTitle>
                    <AlertDescription>
                      This record has an attached file that can be downloaded.
                    </AlertDescription>
                  </Alert>
                )}

                <HStack justify="flex-end" spacing={3}>
                  <Button variant="outline" onClick={onClose}>
                    Close
                  </Button>
                  {selectedRecord.hasFile && (
                    <Button
                      leftIcon={<FiDownload />}
                      colorScheme="blue"
                      onClick={() => handleDownloadRecord(selectedRecord)}
                    >
                      Download File
                    </Button>
                  )}
                </HStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Add Record Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Medical Record</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Grid templateColumns="repeat(2, 1fr)" gap={4} w="100%">
                <FormControl>
                  <FormLabel>Patient</FormLabel>
                  <Select placeholder="Select patient">
                    {uniquePatients.map((patient) => (
                      <option key={patient} value={patient}>
                        {patient}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Record Type</FormLabel>
                  <Select placeholder="Select type">
                    <option value="lab-report">Lab Report</option>
                    <option value="imaging">Imaging</option>
                    <option value="consultation">Consultation</option>
                    <option value="prescription">Prescription</option>
                  </Select>
                </FormControl>
              </Grid>

              <FormControl>
                <FormLabel>Record Title</FormLabel>
                <Input placeholder="Enter record title" />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea placeholder="Enter record description" />
              </FormControl>

              <FormControl>
                <FormLabel>Key Findings</FormLabel>
                <Textarea placeholder="Enter key findings" />
              </FormControl>

              <FormControl>
                <FormLabel>Recommendations</FormLabel>
                <Textarea placeholder="Enter recommendations" />
              </FormControl>

              <FormControl>
                <FormLabel>Attach File</FormLabel>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  onChange={handleFileUpload}
                />
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Supported formats: PDF, DOC, DOCX, JPG, PNG
                </Text>
              </FormControl>

              <HStack justify="flex-end" spacing={3} w="100%">
                <Button variant="outline" onClick={onAddClose}>
                  Cancel
                </Button>
                <Button colorScheme="blue">Add Record</Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MedicalRecords;
