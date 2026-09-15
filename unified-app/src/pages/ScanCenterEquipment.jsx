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
  Progress,
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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import {
  FiCamera,
  FiActivity,
  FiAlertTriangle,
  FiCheck,
  FiX,
  FiSettings,
  FiTool,
  FiRefreshCw,
  FiClock,
  FiBarChart,
} from "react-icons/fi";

const ScanCenterEquipment = () => {
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Sample equipment data
  const equipmentData = [
    {
      id: 1,
      name: "MRI Machine 1",
      type: "MRI",
      model: "Siemens Magnetom Vida 3T",
      location: "Room 101",
      status: "Operational",
      utilization: 85,
      lastMaintenance: "2025-10-15",
      nextMaintenance: "2025-12-15",
      totalScans: 1245,
      todayScans: 8,
      avgScanTime: "45 mins",
      alerts: [],
      specifications: {
        fieldStrength: "3.0 Tesla",
        bore: "70cm",
        maxWeight: "250kg",
        sliceThickness: "0.5mm",
      },
    },
    {
      id: 2,
      name: "CT Scanner 1",
      type: "CT",
      model: "GE Revolution CT",
      location: "Room 102",
      status: "Operational",
      utilization: 72,
      lastMaintenance: "2025-11-01",
      nextMaintenance: "2025-01-01",
      totalScans: 2156,
      todayScans: 12,
      avgScanTime: "15 mins",
      alerts: ["Routine calibration due"],
      specifications: {
        slices: "256-slice",
        rotation: "0.28s",
        coverage: "16cm",
        resolution: "0.23mm",
      },
    },
    {
      id: 3,
      name: "X-Ray Room 1",
      type: "X-Ray",
      model: "Philips DigitalDiagnost C90",
      location: "Room 103",
      status: "Maintenance",
      utilization: 0,
      lastMaintenance: "2025-11-08",
      nextMaintenance: "2026-02-08",
      totalScans: 3421,
      todayScans: 0,
      avgScanTime: "5 mins",
      alerts: ["Under maintenance - scheduled completion 2PM"],
      specifications: {
        generator: "80kW",
        detector: "35cm x 43cm",
        resolution: "3.5 lp/mm",
        exposure: "0.1-1000mAs",
      },
    },
    {
      id: 4,
      name: "Ultrasound Room 1",
      type: "Ultrasound",
      model: "Mindray DC-80",
      location: "Room 104",
      status: "Operational",
      utilization: 91,
      lastMaintenance: "2025-09-20",
      nextMaintenance: "2025-12-20",
      totalScans: 1876,
      todayScans: 15,
      avgScanTime: "25 mins",
      alerts: ["High utilization - consider scheduling optimization"],
      specifications: {
        probes: "Multiple frequency probes",
        penetration: "Up to 30cm",
        frequency: "2-15 MHz",
        display: "21.5 inch LED",
      },
    },
    {
      id: 5,
      name: "MRI Machine 2",
      type: "MRI",
      model: "Philips Ingenia 1.5T",
      location: "Room 105",
      status: "Alert",
      utilization: 45,
      lastMaintenance: "2025-08-10",
      nextMaintenance: "2025-11-10",
      totalScans: 987,
      todayScans: 3,
      avgScanTime: "50 mins",
      alerts: ["Cooling system temperature high", "Maintenance overdue"],
      specifications: {
        fieldStrength: "1.5 Tesla",
        bore: "70cm",
        maxWeight: "227kg",
        sliceThickness: "1.0mm",
      },
    },
  ];

  // Equipment statistics
  const equipmentStats = [
    {
      label: "Total Equipment",
      value: equipmentData.length,
      color: "blue.500",
    },
    {
      label: "Operational",
      value: equipmentData.filter((e) => e.status === "Operational").length,
      color: "green.500",
    },
    {
      label: "Maintenance",
      value: equipmentData.filter((e) => e.status === "Maintenance").length,
      color: "orange.500",
    },
    {
      label: "Alerts",
      value: equipmentData.filter((e) => e.alerts.length > 0).length,
      color: "red.500",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Operational":
        return "green";
      case "Maintenance":
        return "orange";
      case "Alert":
        return "red";
      case "Offline":
        return "gray";
      default:
        return "gray";
    }
  };

  const getUtilizationColor = (utilization) => {
    if (utilization >= 90) return "red";
    if (utilization >= 75) return "orange";
    if (utilization >= 50) return "blue";
    return "green";
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={2}>
          Equipment Management
        </Text>
        <Text color="gray.600">
          Monitor and manage scan center equipment status and performance
        </Text>
      </Box>

      {/* Statistics */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        {equipmentStats.map((stat, index) => (
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

      {/* Equipment Grid */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {equipmentData.map((equipment) => (
          <Card key={equipment.id}>
            <CardHeader>
              <HStack justify="space-between">
                <HStack>
                  <Icon as={FiCamera} color="teal.500" boxSize={6} />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold" fontSize="lg">
                      {equipment.name}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {equipment.model} • {equipment.location}
                    </Text>
                  </VStack>
                </HStack>
                <Badge colorScheme={getStatusColor(equipment.status)}>
                  {equipment.status}
                </Badge>
              </HStack>
            </CardHeader>

            <CardBody pt={0}>
              <VStack spacing={4} align="stretch">
                {/* Alerts */}
                {equipment.alerts.length > 0 && (
                  <Alert status="warning" size="sm" borderRadius="md">
                    <AlertIcon boxSize="4" />
                    <Box>
                      <AlertTitle fontSize="sm">Attention Required!</AlertTitle>
                      <AlertDescription fontSize="xs">
                        {equipment.alerts[0]}
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}

                {/* Utilization */}
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm" fontWeight="medium">
                      Utilization
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {equipment.utilization}%
                    </Text>
                  </HStack>
                  <Progress
                    value={equipment.utilization}
                    colorScheme={getUtilizationColor(equipment.utilization)}
                    size="sm"
                    borderRadius="md"
                  />
                </Box>

                {/* Key Metrics */}
                <SimpleGrid columns={3} spacing={4}>
                  <Box textAlign="center">
                    <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                      {equipment.todayScans}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Today's Scans
                    </Text>
                  </Box>
                  <Box textAlign="center">
                    <Text fontSize="2xl" fontWeight="bold" color="green.500">
                      {equipment.totalScans}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Total Scans
                    </Text>
                  </Box>
                  <Box textAlign="center">
                    <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                      {equipment.avgScanTime}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Avg Time
                    </Text>
                  </Box>
                </SimpleGrid>

                {/* Maintenance Info */}
                <Box p={3} bg="gray.50" borderRadius="md">
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Maintenance Schedule
                  </Text>
                  <SimpleGrid columns={2} spacing={2}>
                    <Box>
                      <Text fontSize="xs" color="gray.600">
                        Last Service:
                      </Text>
                      <Text fontSize="sm">{equipment.lastMaintenance}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.600">
                        Next Service:
                      </Text>
                      <Text fontSize="sm">{equipment.nextMaintenance}</Text>
                    </Box>
                  </SimpleGrid>
                </Box>

                {/* Action Buttons */}
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    colorScheme="teal"
                    leftIcon={<FiBarChart />}
                    onClick={() => {
                      setSelectedEquipment(equipment);
                      onOpen();
                    }}
                  >
                    Details
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<FiSettings />}
                    onClick={() =>
                      toast({
                        title: "Configuration",
                        description: `Opening configuration for ${equipment.name}`,
                        status: "info",
                        duration: 2000,
                        isClosable: true,
                      })
                    }
                  >
                    Configure
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<FiTool />}
                    onClick={() =>
                      toast({
                        title: "Maintenance Request",
                        description: `Maintenance request submitted for ${equipment.name}`,
                        status: "success",
                        duration: 2000,
                        isClosable: true,
                      })
                    }
                  >
                    Maintenance
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Equipment Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedEquipment?.name} - Detailed Information
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedEquipment && (
              <Tabs>
                <TabList>
                  <Tab>Overview</Tab>
                  <Tab>Specifications</Tab>
                  <Tab>Performance</Tab>
                  <Tab>Maintenance</Tab>
                </TabList>

                <TabPanels>
                  {/* Overview Tab */}
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <SimpleGrid columns={2} spacing={4}>
                        <Box>
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color="gray.600"
                          >
                            Model
                          </Text>
                          <Text>{selectedEquipment.model}</Text>
                        </Box>
                        <Box>
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color="gray.600"
                          >
                            Location
                          </Text>
                          <Text>{selectedEquipment.location}</Text>
                        </Box>
                        <Box>
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color="gray.600"
                          >
                            Status
                          </Text>
                          <Badge
                            colorScheme={getStatusColor(
                              selectedEquipment.status,
                            )}
                          >
                            {selectedEquipment.status}
                          </Badge>
                        </Box>
                        <Box>
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color="gray.600"
                          >
                            Utilization
                          </Text>
                          <Text>{selectedEquipment.utilization}%</Text>
                        </Box>
                      </SimpleGrid>

                      {selectedEquipment.alerts.length > 0 && (
                        <Box>
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color="gray.600"
                            mb={2}
                          >
                            Active Alerts
                          </Text>
                          <VStack spacing={2}>
                            {selectedEquipment.alerts.map((alert, idx) => (
                              <Alert key={idx} status="warning" size="sm">
                                <AlertIcon />
                                <Text fontSize="sm">{alert}</Text>
                              </Alert>
                            ))}
                          </VStack>
                        </Box>
                      )}
                    </VStack>
                  </TabPanel>

                  {/* Specifications Tab */}
                  <TabPanel>
                    <SimpleGrid columns={2} spacing={4}>
                      {Object.entries(selectedEquipment.specifications).map(
                        ([key, value]) => (
                          <Box key={key}>
                            <Text
                              fontSize="sm"
                              fontWeight="medium"
                              color="gray.600"
                            >
                              {key
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                            </Text>
                            <Text>{value}</Text>
                          </Box>
                        ),
                      )}
                    </SimpleGrid>
                  </TabPanel>

                  {/* Performance Tab */}
                  <TabPanel>
                    <SimpleGrid columns={2} spacing={4}>
                      <Box>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color="gray.600"
                        >
                          Total Scans
                        </Text>
                        <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                          {selectedEquipment.totalScans}
                        </Text>
                      </Box>
                      <Box>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color="gray.600"
                        >
                          Today's Scans
                        </Text>
                        <Text
                          fontSize="2xl"
                          fontWeight="bold"
                          color="green.500"
                        >
                          {selectedEquipment.todayScans}
                        </Text>
                      </Box>
                      <Box>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color="gray.600"
                        >
                          Average Scan Time
                        </Text>
                        <Text
                          fontSize="2xl"
                          fontWeight="bold"
                          color="purple.500"
                        >
                          {selectedEquipment.avgScanTime}
                        </Text>
                      </Box>
                      <Box>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color="gray.600"
                        >
                          Utilization Rate
                        </Text>
                        <Text
                          fontSize="2xl"
                          fontWeight="bold"
                          color="orange.500"
                        >
                          {selectedEquipment.utilization}%
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </TabPanel>

                  {/* Maintenance Tab */}
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <SimpleGrid columns={2} spacing={4}>
                        <Box>
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color="gray.600"
                          >
                            Last Maintenance
                          </Text>
                          <Text>{selectedEquipment.lastMaintenance}</Text>
                        </Box>
                        <Box>
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color="gray.600"
                          >
                            Next Maintenance
                          </Text>
                          <Text>{selectedEquipment.nextMaintenance}</Text>
                        </Box>
                      </SimpleGrid>

                      <Box>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color="gray.600"
                          mb={2}
                        >
                          Maintenance Actions
                        </Text>
                        <VStack spacing={2}>
                          <Button
                            width="full"
                            leftIcon={<FiTool />}
                            colorScheme="orange"
                            onClick={() =>
                              toast({
                                title: "Maintenance Scheduled",
                                description: `Maintenance has been scheduled for ${selectedEquipment?.name}`,
                                status: "success",
                                duration: 2000,
                                isClosable: true,
                              })
                            }
                          >
                            Schedule Maintenance
                          </Button>
                          <Button
                            width="full"
                            leftIcon={<FiRefreshCw />}
                            variant="outline"
                            onClick={() =>
                              toast({
                                title: "Calibration Requested",
                                description: `Calibration request submitted for ${selectedEquipment?.name}`,
                                status: "info",
                                duration: 2000,
                                isClosable: true,
                              })
                            }
                          >
                            Request Calibration
                          </Button>
                          <Button
                            width="full"
                            leftIcon={<FiActivity />}
                            variant="outline"
                            onClick={() =>
                              toast({
                                title: "Maintenance History",
                                description: `Loading maintenance history for ${selectedEquipment?.name}`,
                                status: "info",
                                duration: 2000,
                                isClosable: true,
                              })
                            }
                          >
                            View Maintenance History
                          </Button>
                        </VStack>
                      </Box>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default ScanCenterEquipment;
