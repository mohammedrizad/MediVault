import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Button,
  useColorModeValue,
  SimpleGrid,
  Alert,
  AlertIcon,
  Icon,
  useToast,
  Flex,
  Spacer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Image,
} from "@chakra-ui/react";
import {
  FiCamera,
  FiCalendar,
  FiMapPin,
  FiPlus,
  FiDownload,
  FiEye,
  FiClock,
  FiFileText,
} from "react-icons/fi";

const PatientScanCenter = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [scans, setScans] = useState([]);
  const [scanCenters, setScanCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newScan, setNewScan] = useState({
    type: "",
    scanCenter: "",
    date: "",
    time: "",
    notes: "",
  });

  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    // Simulate loading scan data
    setTimeout(() => {
      setScanCenters([
        {
          id: 1,
          name: "City Medical Imaging",
          address: "123 Medical Drive, City, ST 12345",
          phone: "+1-234-567-8910",
          services: ["MRI", "CT Scan", "X-Ray", "Ultrasound"],
        },
        {
          id: 2,
          name: "Advanced Diagnostic Center",
          address: "456 Health Plaza, City, ST 12345",
          phone: "+1-234-567-8911",
          services: ["PET Scan", "MRI", "CT Scan", "Mammography"],
        },
        {
          id: 3,
          name: "Quick Scan Express",
          address: "789 Care Blvd, City, ST 12345",
          phone: "+1-234-567-8912",
          services: ["X-Ray", "Ultrasound", "DEXA Scan"],
        },
      ]);

      setScans([
        {
          id: 1,
          type: "Chest X-Ray",
          scanCenter: "City Medical Imaging",
          date: "2024-11-01",
          time: "10:00 AM",
          status: "Completed",
          report: "Available",
          notes: "Routine chest examination",
          result: "Normal findings, no abnormalities detected",
        },
        {
          id: 2,
          type: "MRI Brain",
          scanCenter: "Advanced Diagnostic Center",
          date: "2024-10-25",
          time: "2:30 PM",
          status: "Completed",
          report: "Available",
          notes: "Headache investigation",
          result: "No significant abnormalities",
        },
        {
          id: 3,
          type: "Abdominal CT",
          scanCenter: "City Medical Imaging",
          date: "2024-11-15",
          time: "11:00 AM",
          status: "Scheduled",
          report: "Pending",
          notes: "Abdominal pain evaluation",
          result: "Pending scan completion",
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "green";
      case "scheduled":
        return "blue";
      case "cancelled":
        return "red";
      case "pending":
        return "yellow";
      default:
        return "gray";
    }
  };

  const handleBookScan = () => {
    const selectedCenter = scanCenters.find(
      (c) => c.name === newScan.scanCenter,
    );

    const scan = {
      id: scans.length + 1,
      type: newScan.type,
      scanCenter: newScan.scanCenter,
      date: newScan.date,
      time: newScan.time,
      status: "Scheduled",
      report: "Pending",
      notes: newScan.notes,
      result: "Pending scan completion",
    };

    setScans([...scans, scan]);
    setNewScan({ type: "", scanCenter: "", date: "", time: "", notes: "" });
    onClose();

    toast({
      title: "Scan Booked Successfully!",
      description: `Your ${newScan.type} has been scheduled at ${newScan.scanCenter}`,
      status: "success",
      duration: 3000,
    });
  };

  const handleDownloadReport = (scan) => {
    if (scan.report === "Available") {
      toast({
        title: "Downloading Report",
        description: `${scan.type} report from ${scan.date}`,
        status: "info",
        duration: 2000,
      });
    } else {
      toast({
        title: "Report Not Available",
        description: "The scan report is not ready yet.",
        status: "warning",
        duration: 2000,
      });
    }
  };

  const handleViewReport = (scan) => {
    if (scan.report === "Available") {
      toast({
        title: "Opening Report",
        description: `Viewing ${scan.type} report`,
        status: "info",
        duration: 2000,
      });
    } else {
      toast({
        title: "Report Not Available",
        description: "The scan report is not ready yet.",
        status: "warning",
        duration: 2000,
      });
    }
  };

  const upcomingScans = scans.filter((scan) => scan.status === "Scheduled");
  const completedScans = scans.filter((scan) => scan.status === "Completed");

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack>
          <Icon as={FiCamera} boxSize={8} color="blue.500" />
          <VStack align="start" spacing={1}>
            <Heading size="lg">Scan Center</Heading>
            <Text color="gray.600">
              Book diagnostic scans and view your imaging reports
            </Text>
          </VStack>
          <Spacer />
          <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onOpen}>
            Book Scan
          </Button>
        </HStack>

        {/* Summary Cards */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <VStack spacing={2}>
                <Icon as={FiCamera} boxSize={6} color="blue.500" />
                <Text fontSize="2xl" fontWeight="bold">
                  {scans.length}
                </Text>
                <Text color="gray.600">Total Scans</Text>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <VStack spacing={2}>
                <Icon as={FiCalendar} boxSize={6} color="green.500" />
                <Text fontSize="2xl" fontWeight="bold">
                  {upcomingScans.length}
                </Text>
                <Text color="gray.600">Upcoming</Text>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <VStack spacing={2}>
                <Icon as={FiFileText} boxSize={6} color="purple.500" />
                <Text fontSize="2xl" fontWeight="bold">
                  {completedScans.length}
                </Text>
                <Text color="gray.600">Completed</Text>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <VStack spacing={2}>
                <Icon as={FiMapPin} boxSize={6} color="orange.500" />
                <Text fontSize="2xl" fontWeight="bold">
                  {scanCenters.length}
                </Text>
                <Text color="gray.600">Centers</Text>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Available Scan Centers */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Available Scan Centers</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {scanCenters.map((center) => (
                <Card key={center.id} variant="outline">
                  <CardBody>
                    <VStack align="start" spacing={3}>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold" fontSize="lg">
                          {center.name}
                        </Text>
                        <HStack>
                          <Icon as={FiMapPin} color="gray.500" size="sm" />
                          <Text fontSize="sm" color="gray.600">
                            {center.address}
                          </Text>
                        </HStack>
                        <HStack>
                          <Icon as={FiCamera} color="gray.500" size="sm" />
                          <Text fontSize="sm" color="gray.600">
                            {center.phone}
                          </Text>
                        </HStack>
                      </VStack>

                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>
                          Available Services:
                        </Text>
                        <Flex wrap="wrap" gap={1}>
                          {center.services.map((service, index) => (
                            <Badge key={index} colorScheme="blue" size="sm">
                              {service}
                            </Badge>
                          ))}
                        </Flex>
                      </Box>

                      <Button
                        size="sm"
                        colorScheme="blue"
                        variant="outline"
                        w="full"
                        onClick={() =>
                          toast({
                            title: center.name,
                            description: `${center.address} | Phone: ${center.phone} | Services: ${center.services.join(", ")}`,
                            status: "info",
                            duration: 4000,
                            isClosable: true,
                          })
                        }
                      >
                        View Details
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* My Scans */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">My Scans</Heading>
          </CardHeader>
          <CardBody>
            {loading ? (
              <Alert status="info">
                <AlertIcon />
                Loading scan history...
              </Alert>
            ) : (
              <VStack spacing={4} align="stretch">
                {scans.map((scan) => (
                  <Card key={scan.id} variant="outline">
                    <CardBody>
                      <Flex direction={{ base: "column", md: "row" }}>
                        <VStack align="start" flex={1} spacing={3}>
                          <HStack>
                            <Badge
                              colorScheme={getStatusColor(scan.status)}
                              fontSize="sm"
                            >
                              {scan.status}
                            </Badge>
                            <Text fontSize="lg" fontWeight="medium">
                              {scan.type}
                            </Text>
                          </HStack>

                          <SimpleGrid
                            columns={{ base: 1, md: 3 }}
                            spacing={4}
                            w="full"
                          >
                            <HStack>
                              <Icon as={FiCalendar} color="gray.500" />
                              <VStack align="start" spacing={0}>
                                <Text fontSize="sm" fontWeight="medium">
                                  {scan.date}
                                </Text>
                                <Text fontSize="xs" color="gray.600">
                                  {scan.time}
                                </Text>
                              </VStack>
                            </HStack>

                            <HStack>
                              <Icon as={FiMapPin} color="gray.500" />
                              <VStack align="start" spacing={0}>
                                <Text fontSize="sm" fontWeight="medium">
                                  {scan.scanCenter}
                                </Text>
                                <Text fontSize="xs" color="gray.600">
                                  Scan Center
                                </Text>
                              </VStack>
                            </HStack>

                            <HStack>
                              <Icon as={FiFileText} color="gray.500" />
                              <VStack align="start" spacing={0}>
                                <Text fontSize="sm" fontWeight="medium">
                                  {scan.report}
                                </Text>
                                <Text fontSize="xs" color="gray.600">
                                  Report Status
                                </Text>
                              </VStack>
                            </HStack>
                          </SimpleGrid>

                          {scan.notes && (
                            <Box>
                              <Text fontSize="sm" fontWeight="medium">
                                Notes:
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                {scan.notes}
                              </Text>
                            </Box>
                          )}

                          {scan.result && scan.status === "Completed" && (
                            <Box>
                              <Text fontSize="sm" fontWeight="medium">
                                Result:
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                {scan.result}
                              </Text>
                            </Box>
                          )}
                        </VStack>

                        <VStack spacing={2} mt={{ base: 4, md: 0 }}>
                          <Button
                            size="sm"
                            leftIcon={<FiEye />}
                            variant="outline"
                            onClick={() => handleViewReport(scan)}
                            isDisabled={scan.report !== "Available"}
                          >
                            View Report
                          </Button>
                          <Button
                            size="sm"
                            leftIcon={<FiDownload />}
                            colorScheme="blue"
                            variant="outline"
                            onClick={() => handleDownloadReport(scan)}
                            isDisabled={scan.report !== "Available"}
                          >
                            Download
                          </Button>
                          {scan.status === "Scheduled" && (
                            <Button
                              size="sm"
                              colorScheme="red"
                              variant="outline"
                              onClick={() => {
                                setScans((prev) =>
                                  prev.map((s) =>
                                    s.id === scan.id
                                      ? { ...s, status: "Cancelled" }
                                      : s,
                                  ),
                                );
                                toast({
                                  title: "Scan Cancelled",
                                  description: `${scan.type} at ${scan.scanCenter} has been cancelled`,
                                  status: "warning",
                                  duration: 2000,
                                  isClosable: true,
                                });
                              }}
                            >
                              Cancel
                            </Button>
                          )}
                        </VStack>
                      </Flex>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            )}
          </CardBody>
        </Card>
      </VStack>

      {/* Book Scan Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Book New Scan</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Scan Type</FormLabel>
                <Select
                  placeholder="Select scan type"
                  value={newScan.type}
                  onChange={(e) =>
                    setNewScan({ ...newScan, type: e.target.value })
                  }
                >
                  <option value="X-Ray">X-Ray</option>
                  <option value="CT Scan">CT Scan</option>
                  <option value="MRI">MRI</option>
                  <option value="Ultrasound">Ultrasound</option>
                  <option value="PET Scan">PET Scan</option>
                  <option value="Mammography">Mammography</option>
                  <option value="DEXA Scan">DEXA Scan</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Scan Center</FormLabel>
                <Select
                  placeholder="Select scan center"
                  value={newScan.scanCenter}
                  onChange={(e) =>
                    setNewScan({ ...newScan, scanCenter: e.target.value })
                  }
                >
                  {scanCenters.map((center) => (
                    <option key={center.id} value={center.name}>
                      {center.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <HStack w="full">
                <FormControl>
                  <FormLabel>Preferred Date</FormLabel>
                  <Input
                    type="date"
                    value={newScan.date}
                    onChange={(e) =>
                      setNewScan({ ...newScan, date: e.target.value })
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Preferred Time</FormLabel>
                  <Input
                    type="time"
                    value={newScan.time}
                    onChange={(e) =>
                      setNewScan({ ...newScan, time: e.target.value })
                    }
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Notes (Optional)</FormLabel>
                <Textarea
                  placeholder="Any specific requirements or symptoms..."
                  value={newScan.notes}
                  onChange={(e) =>
                    setNewScan({ ...newScan, notes: e.target.value })
                  }
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleBookScan}>
              Book Scan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PatientScanCenter;
