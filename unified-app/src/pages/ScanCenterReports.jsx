import React, { useState } from "react";
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import {
  FiFileText,
  FiDownload,
  FiEye,
  FiSearch,
  FiCalendar,
  FiUser,
  FiCamera,
  FiPrinter,
  FiSend,
  FiFilter,
  FiBarChart,
} from "react-icons/fi";

const ScanCenterReports = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Sample reports data
  const reportsData = [
    {
      id: 1,
      reportId: "RPT-2025-001",
      patientName: "Sarah Johnson",
      patientId: "P001",
      scanType: "MRI Brain",
      scanDate: "2025-11-08",
      reportDate: "2025-11-08",
      radiologist: "Dr. Michael Roberts",
      status: "Completed",
      priority: "Urgent",
      findings:
        "Normal brain anatomy with no acute abnormalities. White matter appears normal for age. No evidence of hemorrhage, mass effect, or midline shift.",
      impression: "Normal MRI brain study",
      recommendations:
        "No further imaging required at this time. Clinical correlation recommended.",
      referringDoctor: "Dr. Wilson",
      reportType: "Final Report",
    },
    {
      id: 2,
      reportId: "RPT-2025-002",
      patientName: "Michael Brown",
      patientId: "P002",
      scanType: "CT Chest",
      scanDate: "2025-11-08",
      reportDate: "2025-11-08",
      radiologist: "Dr. Sarah Chen",
      status: "Pending",
      priority: "Standard",
      findings:
        "Chest CT shows clear lung fields bilaterally. No focal consolidation, pleural effusion, or pneumothorax.",
      impression: "Normal chest CT",
      recommendations: "Routine follow-up as clinically indicated",
      referringDoctor: "Dr. Lee",
      reportType: "Preliminary Report",
    },
    {
      id: 3,
      reportId: "RPT-2025-003",
      patientName: "Emily Wilson",
      patientId: "P003",
      scanType: "X-Ray Chest",
      scanDate: "2025-11-08",
      reportDate: "2025-11-08",
      radiologist: "Dr. James Park",
      status: "Completed",
      priority: "Standard",
      findings:
        "Frontal and lateral chest radiographs demonstrate clear lung fields. Heart size is normal. No acute cardiopulmonary abnormalities.",
      impression: "Normal chest X-ray",
      recommendations: "No further imaging required",
      referringDoctor: "Dr. Brown",
      reportType: "Final Report",
    },
    {
      id: 4,
      reportId: "RPT-2025-004",
      patientName: "David Lee",
      patientId: "P004",
      scanType: "Ultrasound Abdomen",
      scanDate: "2025-11-08",
      reportDate: "2025-11-08",
      radiologist: "Dr. Lisa Kim",
      status: "In Review",
      priority: "High",
      findings:
        "Abdominal ultrasound shows normal liver echogenicity and size. Gallbladder appears normal without stones or wall thickening.",
      impression: "Normal abdominal ultrasound",
      recommendations: "Clinical correlation advised",
      referringDoctor: "Dr. Martinez",
      reportType: "Draft Report",
    },
    {
      id: 5,
      reportId: "RPT-2025-005",
      patientName: "Lisa Anderson",
      patientId: "P005",
      scanType: "MRI Spine",
      scanDate: "2025-11-07",
      reportDate: "2025-11-08",
      radiologist: "Dr. Michael Roberts",
      status: "Completed",
      priority: "Standard",
      findings:
        "Lumbar spine MRI demonstrates normal vertebral body alignment. Intervertebral discs show age-appropriate changes. No significant canal stenosis.",
      impression: "Mild degenerative changes, no acute abnormalities",
      recommendations:
        "Conservative management. Repeat imaging if symptoms worsen",
      referringDoctor: "Dr. Thompson",
      reportType: "Final Report",
    },
  ];

  // Report statistics
  const reportStats = [
    {
      label: "Total Reports",
      value: reportsData.length,
      color: "blue.500",
    },
    {
      label: "Completed",
      value: reportsData.filter((r) => r.status === "Completed").length,
      color: "green.500",
    },
    {
      label: "Pending",
      value: reportsData.filter(
        (r) => r.status === "Pending" || r.status === "In Review",
      ).length,
      color: "orange.500",
    },
    {
      label: "Urgent",
      value: reportsData.filter((r) => r.priority === "Urgent").length,
      color: "red.500",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "green";
      case "Pending":
        return "orange";
      case "In Review":
        return "blue";
      case "Draft":
        return "gray";
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

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={2}>
          Scan Reports
        </Text>
        <Text color="gray.600">
          View, manage, and distribute radiology reports
        </Text>
      </Box>

      {/* Statistics */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        {reportStats.map((stat, index) => (
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

      {/* Search and Filters */}
      <Card>
        <CardBody>
          <HStack spacing={4} mb={4} wrap="wrap">
            <HStack>
              <Icon as={FiSearch} color="teal.500" />
              <Input
                placeholder="Search reports, patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                maxW="250px"
              />
            </HStack>

            <HStack>
              <Text fontWeight="medium">Status:</Text>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                maxW="150px"
              >
                <option value="all">All Status</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="In Review">In Review</option>
              </Select>
            </HStack>

            <HStack>
              <Text fontWeight="medium">Date:</Text>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                maxW="150px"
              />
            </HStack>

            <Button
              colorScheme="teal"
              leftIcon={<FiBarChart />}
              onClick={() =>
                toast({
                  title: "Summary Generated",
                  description: "Report summary has been generated successfully",
                  status: "success",
                  duration: 2000,
                  isClosable: true,
                })
              }
            >
              Generate Summary
            </Button>
          </HStack>
        </CardBody>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <Text fontSize="lg" fontWeight="semibold">
            Radiology Reports
          </Text>
        </CardHeader>
        <CardBody>
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Report ID</Th>
                  <Th>Patient</Th>
                  <Th>Scan Type</Th>
                  <Th>Date</Th>
                  <Th>Radiologist</Th>
                  <Th>Priority</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {reportsData
                  .filter((report) => {
                    const matchesSearch =
                      !searchTerm ||
                      report.patientName
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      report.reportId
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      report.patientId
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase());
                    const matchesStatus =
                      statusFilter === "all" || report.status === statusFilter;
                    const matchesDate =
                      !dateFilter || report.scanDate === dateFilter;
                    return matchesSearch && matchesStatus && matchesDate;
                  })
                  .map((report) => (
                    <Tr key={report.id}>
                      <Td>
                        <Text fontWeight="medium" color="teal.500">
                          {report.reportId}
                        </Text>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">{report.patientName}</Text>
                          <Text fontSize="sm" color="gray.500">
                            ID: {report.patientId}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm">{report.scanType}</Text>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm">{report.scanDate}</Text>
                          <Text fontSize="xs" color="gray.500">
                            Report: {report.reportDate}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm">{report.radiologist}</Text>
                      </Td>
                      <Td>
                        <Badge colorScheme={getPriorityColor(report.priority)}>
                          {report.priority}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            leftIcon={<FiEye />}
                            onClick={() => {
                              setSelectedReport(report);
                              onOpen();
                            }}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<FiDownload />}
                            onClick={() =>
                              toast({
                                title: "Downloading PDF",
                                description: `Downloading ${report.reportId} as PDF`,
                                status: "info",
                                duration: 2000,
                                isClosable: true,
                              })
                            }
                          >
                            PDF
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<FiSend />}
                            onClick={() =>
                              toast({
                                title: "Report Sent",
                                description: `Report ${report.reportId} sent to ${report.referringDoctor}`,
                                status: "success",
                                duration: 2000,
                                isClosable: true,
                              })
                            }
                          >
                            Send
                          </Button>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
              </Tbody>
            </Table>
          </Box>
        </CardBody>
      </Card>

      {/* Report Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Radiology Report - {selectedReport?.reportId}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedReport && (
              <VStack spacing={6} align="stretch">
                {/* Patient Info */}
                <Card variant="outline">
                  <CardBody>
                    <SimpleGrid columns={2} spacing={4}>
                      <Box>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color="gray.600"
                        >
                          Patient
                        </Text>
                        <Text>{selectedReport.patientName}</Text>
                      </Box>
                      <Box>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color="gray.600"
                        >
                          Patient ID
                        </Text>
                        <Text>{selectedReport.patientId}</Text>
                      </Box>
                      <Box>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color="gray.600"
                        >
                          Scan Type
                        </Text>
                        <Text>{selectedReport.scanType}</Text>
                      </Box>
                      <Box>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color="gray.600"
                        >
                          Scan Date
                        </Text>
                        <Text>{selectedReport.scanDate}</Text>
                      </Box>
                      <Box>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color="gray.600"
                        >
                          Radiologist
                        </Text>
                        <Text>{selectedReport.radiologist}</Text>
                      </Box>
                      <Box>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color="gray.600"
                        >
                          Referring Doctor
                        </Text>
                        <Text>{selectedReport.referringDoctor}</Text>
                      </Box>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* Report Content */}
                <Tabs>
                  <TabList>
                    <Tab>Findings</Tab>
                    <Tab>Impression</Tab>
                    <Tab>Recommendations</Tab>
                  </TabList>

                  <TabPanels>
                    <TabPanel>
                      <Box p={4} bg="gray.50" borderRadius="md">
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color="gray.600"
                          mb={2}
                        >
                          Clinical Findings:
                        </Text>
                        <Text>{selectedReport.findings}</Text>
                      </Box>
                    </TabPanel>

                    <TabPanel>
                      <Box p={4} bg="blue.50" borderRadius="md">
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color="gray.600"
                          mb={2}
                        >
                          Radiological Impression:
                        </Text>
                        <Text fontWeight="medium">
                          {selectedReport.impression}
                        </Text>
                      </Box>
                    </TabPanel>

                    <TabPanel>
                      <Box p={4} bg="green.50" borderRadius="md">
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color="gray.600"
                          mb={2}
                        >
                          Recommendations:
                        </Text>
                        <Text>{selectedReport.recommendations}</Text>
                      </Box>
                    </TabPanel>
                  </TabPanels>
                </Tabs>

                {/* Report Status */}
                <HStack
                  justify="space-between"
                  p={4}
                  bg="gray.50"
                  borderRadius="md"
                >
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" fontWeight="medium" color="gray.600">
                      Report Status
                    </Text>
                    <Badge colorScheme={getStatusColor(selectedReport.status)}>
                      {selectedReport.status}
                    </Badge>
                  </VStack>
                  <VStack align="end" spacing={1}>
                    <Text fontSize="sm" fontWeight="medium" color="gray.600">
                      Report Type
                    </Text>
                    <Badge variant="outline">{selectedReport.reportType}</Badge>
                  </VStack>
                </HStack>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              colorScheme="teal"
              leftIcon={<FiDownload />}
              mr={3}
              onClick={() =>
                toast({
                  title: "PDF Downloaded",
                  description: `${selectedReport?.reportId} downloaded as PDF`,
                  status: "success",
                  duration: 2000,
                  isClosable: true,
                })
              }
            >
              Download PDF
            </Button>
            <Button
              colorScheme="blue"
              leftIcon={<FiSend />}
              onClick={() =>
                toast({
                  title: "Report Sent",
                  description: `Report sent to ${selectedReport?.referringDoctor}`,
                  status: "success",
                  duration: 2000,
                  isClosable: true,
                })
              }
            >
              Send Report
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default ScanCenterReports;
