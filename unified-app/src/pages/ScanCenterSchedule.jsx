import React, { useState, useEffect } from "react";
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
  Avatar,
  Icon,
  Input,
  Select,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  FormControl,
  FormLabel,
  Textarea,
} from "@chakra-ui/react";
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiCamera,
  FiPlus,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiCheck,
  FiX,
  FiAlertCircle,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import dataService from "../services/DataService";

const ScanCenterSchedule = () => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const [scheduledScans, setScheduledScans] = useState([]);
  const [newScan, setNewScan] = useState({
    patientMedicalId: "",
    scanType: "",
    date: "",
    time: "",
    equipment: "",
    priority: "Standard",
    referringDoctor: "",
    notes: "",
  });

  const loadScans = async () => {
    if (!currentUser?.id) return;
    const data = await dataService.getAppointments({ scanCenterId: currentUser.id });
    setScheduledScans(
      data.map((a) => ({
        id: a._id,
        patientName: a.patientName,
        patientId: a.patientId,
        scanType: a.scanType,
        date: a.date,
        time: a.time,
        duration: a.duration,
        priority: a.priority || "Standard",
        status: a.status,
        equipment: a.location || "",
        technician: currentUser.name,
        notes: a.notes,
        referringDoctor: a.doctorName,
      })),
    );
  };

  useEffect(() => {
    loadScans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  const handleScheduleScan = async () => {
    if (!newScan.patientMedicalId || !newScan.scanType || !newScan.date || !newScan.time) {
      toast({
        title: "Missing fields",
        description: "Please fill in patient ID, scan type, date, and time.",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    try {
      await dataService.addAppointment({
        patientId: newScan.patientMedicalId,
        scanCenterId: currentUser.id,
        scanCenterName: currentUser.name,
        scanType: newScan.scanType,
        date: newScan.date,
        time: newScan.time,
        location: newScan.equipment,
        priority: newScan.priority,
        doctorName: newScan.referringDoctor,
        notes: newScan.notes,
        type: "Scan",
        status: "Scheduled",
        createdByRole: "scancenter",
        createdById: currentUser.id,
      });
      toast({
        title: "Scan Scheduled",
        description: "New scan has been added to the schedule",
        status: "success",
        duration: 3000,
      });
      setNewScan({
        patientMedicalId: "",
        scanType: "",
        date: "",
        time: "",
        equipment: "",
        priority: "Standard",
        referringDoctor: "",
        notes: "",
      });
      onClose();
      loadScans();
    } catch (err) {
      toast({
        title: "Failed to schedule scan",
        description: err.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleScanStatusChange = async (scan, newStatus) => {
    try {
      await dataService.updateAppointment(scan.id, { status: newStatus });
      toast({
        title: newStatus === "In Progress" ? "Scan Started" : "Scan Completed",
        description: `${scan.scanType} for ${scan.patientName} is now ${newStatus}`,
        status: "success",
        duration: 3000,
      });
      loadScans();
    } catch (err) {
      toast({
        title: "Failed to update scan",
        description: err.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  // Statistics
  const stats = [
    {
      label: "Today's Scans",
      value: scheduledScans.length,
      color: "blue.500",
    },
    {
      label: "Completed",
      value: scheduledScans.filter((s) => s.status === "Completed").length,
      color: "green.500",
    },
    {
      label: "In Progress",
      value: scheduledScans.filter((s) => s.status === "In Progress").length,
      color: "orange.500",
    },
    {
      label: "Urgent Scans",
      value: scheduledScans.filter((s) => s.priority === "Urgent").length,
      color: "red.500",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Scheduled":
        return "blue";
      case "In Progress":
        return "orange";
      case "Completed":
        return "green";
      case "Cancelled":
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

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={2}>
          Scan Scheduling
        </Text>
        <Text color="gray.600">
          Manage patient scan appointments and equipment scheduling
        </Text>
      </Box>

      {/* Statistics */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        {stats.map((stat, index) => (
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
                placeholder="Search patients or scan types..."
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
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
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

            <Button colorScheme="teal" leftIcon={<FiPlus />} onClick={onOpen}>
              Schedule New Scan
            </Button>
          </HStack>
        </CardBody>
      </Card>

      {/* Scheduled Scans Table */}
      <Card>
        <CardHeader>
          <Text fontSize="lg" fontWeight="semibold">
            Today's Scheduled Scans
          </Text>
        </CardHeader>
        <CardBody>
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Patient</Th>
                  <Th>Scan Type</Th>
                  <Th>Time</Th>
                  <Th>Equipment</Th>
                  <Th>Technician</Th>
                  <Th>Priority</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {scheduledScans
                  .filter((s) => {
                    const matchesSearch =
                      !searchTerm ||
                      s.patientName
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      s.patientId
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      s.scanType
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase());
                    const matchesStatus =
                      statusFilter === "all" || s.status === statusFilter;
                    const matchesDate = !dateFilter || s.date === dateFilter;
                    return matchesSearch && matchesStatus && matchesDate;
                  })
                  .map((scan) => (
                    <Tr key={scan.id}>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">{scan.patientName}</Text>
                          <Text fontSize="sm" color="gray.500">
                            ID: {scan.patientId}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">{scan.scanType}</Text>
                          <Text fontSize="sm" color="gray.500">
                            {scan.duration}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">{scan.time}</Text>
                          <Text fontSize="sm" color="gray.500">
                            {scan.date}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm">{scan.equipment}</Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm">{scan.technician}</Text>
                      </Td>
                      <Td>
                        <Badge colorScheme={getPriorityColor(scan.priority)}>
                          {scan.priority}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(scan.status)}>
                          {scan.status}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          {scan.status === "Scheduled" && (
                            <Button
                              size="sm"
                              colorScheme="green"
                              leftIcon={<FiCheck />}
                              onClick={() => handleScanStatusChange(scan, "In Progress")}
                            >
                              Start
                            </Button>
                          )}
                          {scan.status === "In Progress" && (
                            <Button
                              size="sm"
                              colorScheme="orange"
                              leftIcon={<FiCheck />}
                              onClick={() => handleScanStatusChange(scan, "Completed")}
                            >
                              Complete
                            </Button>
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
              </Tbody>
            </Table>
          </Box>
        </CardBody>
      </Card>

      {/* Schedule New Scan Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Schedule New Scan</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl>
                  <FormLabel>Patient UHID</FormLabel>
                  <Input
                    placeholder="e.g. UHID-1001"
                    value={newScan.patientMedicalId}
                    onChange={(e) => setNewScan({ ...newScan, patientMedicalId: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Scan Type</FormLabel>
                  <Select
                    placeholder="Select scan type"
                    value={newScan.scanType}
                    onChange={(e) => setNewScan({ ...newScan, scanType: e.target.value })}
                  >
                    <option value="MRI Brain">MRI Brain</option>
                    <option value="MRI Spine">MRI Spine</option>
                    <option value="CT Chest">CT Chest</option>
                    <option value="CT Abdomen">CT Abdomen</option>
                    <option value="X-Ray Chest">X-Ray Chest</option>
                    <option value="Ultrasound Abdomen">
                      Ultrasound Abdomen
                    </option>
                    <option value="Ultrasound Pelvis">Ultrasound Pelvis</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Date</FormLabel>
                  <Input
                    type="date"
                    value={newScan.date}
                    onChange={(e) => setNewScan({ ...newScan, date: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Time</FormLabel>
                  <Input
                    type="time"
                    value={newScan.time}
                    onChange={(e) => setNewScan({ ...newScan, time: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Equipment</FormLabel>
                  <Select
                    placeholder="Select equipment"
                    value={newScan.equipment}
                    onChange={(e) => setNewScan({ ...newScan, equipment: e.target.value })}
                  >
                    <option value="MRI Machine 1">MRI Machine 1</option>
                    <option value="MRI Machine 2">MRI Machine 2</option>
                    <option value="CT Scanner 1">CT Scanner 1</option>
                    <option value="CT Scanner 2">CT Scanner 2</option>
                    <option value="X-Ray Room 1">X-Ray Room 1</option>
                    <option value="Ultrasound Room 1">Ultrasound Room 1</option>
                    <option value="Ultrasound Room 2">Ultrasound Room 2</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    value={newScan.priority}
                    onChange={(e) => setNewScan({ ...newScan, priority: e.target.value })}
                  >
                    <option value="Low">Low</option>
                    <option value="Standard">Standard</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
              <FormControl>
                <FormLabel>Referring Doctor</FormLabel>
                <Input
                  placeholder="Enter referring doctor name"
                  value={newScan.referringDoctor}
                  onChange={(e) => setNewScan({ ...newScan, referringDoctor: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Special Notes</FormLabel>
                <Textarea
                  placeholder="Any special instructions or patient notes..."
                  value={newScan.notes}
                  onChange={(e) => setNewScan({ ...newScan, notes: e.target.value })}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" onClick={handleScheduleScan}>
              Schedule Scan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default ScanCenterSchedule;
