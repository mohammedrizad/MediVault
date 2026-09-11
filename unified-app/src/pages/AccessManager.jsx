import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
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
  AlertDescription,
  Icon,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Flex,
  Spacer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  Skeleton,
  SkeletonText,
  Tooltip,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import {
  FiShield,
  FiAlertTriangle,
  FiCheck,
  FiX,
  FiClock,
  FiSearch,
  FiRefreshCw,
  FiSlash,
  FiDatabase,
} from "react-icons/fi";

const API_BASE = "http://localhost:5002";

// ─── Status badge component ────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const colorMap = {
    Approved: "green",
    Pending: "yellow",
    Rejected: "red",
    Revoked: "orange",
  };

  const iconMap = {
    Approved: FiCheck,
    Pending: FiClock,
    Rejected: FiX,
    Revoked: FiSlash,
  };

  return (
    <Badge
      colorScheme={colorMap[status] || "gray"}
      display="flex"
      alignItems="center"
      gap={1}
      px={2}
      py={1}
      borderRadius="md"
    >
      <Icon as={iconMap[status] || FiClock} boxSize={3} />
      {status}
    </Badge>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.oneOf(["Approved", "Pending", "Rejected", "Revoked"])
    .isRequired,
};

// ─── Revoke confirmation modal ─────────────────────────────────────────
const RevokeModal = ({ isOpen, onClose, request, onConfirm, isLoading }) => {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirm(request?._id, reason);
    setReason("");
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  if (!request) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color="red.600">
          <HStack>
            <Icon as={FiAlertTriangle} />
            <Text>Revoke Access</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <AlertDescription fontSize="sm">
                This will immediately remove access for the requesting hospital.
                This action can be reversed by re-approving the request.
              </AlertDescription>
            </Alert>

            <Box bg="gray.50" p={3} borderRadius="md">
              <VStack align="start" spacing={1}>
                <HStack>
                  <Text fontWeight="bold" fontSize="sm" color="gray.600">
                    Hospital:
                  </Text>
                  <Text fontSize="sm">{request.requestingHospital}</Text>
                </HStack>
                <HStack>
                  <Text fontWeight="bold" fontSize="sm" color="gray.600">
                    Doctor:
                  </Text>
                  <Text fontSize="sm">{request.requestingDoctor}</Text>
                </HStack>
                <HStack>
                  <Text fontWeight="bold" fontSize="sm" color="gray.600">
                    Reason:
                  </Text>
                  <Text fontSize="sm">{request.reason}</Text>
                </HStack>
              </VStack>
            </Box>

            <Box>
              <Text fontWeight="medium" mb={2} fontSize="sm">
                Reason for revoking (optional):
              </Text>
              <Textarea
                placeholder="e.g., Treatment completed, no longer needed..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                size="sm"
                rows={3}
              />
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter gap={3}>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            colorScheme="red"
            onClick={handleConfirm}
            isLoading={isLoading}
            loadingText="Revoking..."
            leftIcon={<FiSlash />}
          >
            Revoke Access
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

RevokeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  request: PropTypes.shape({
    _id: PropTypes.string,
    requestingHospital: PropTypes.string,
    requestingDoctor: PropTypes.string,
    reason: PropTypes.string,
  }),
  onConfirm: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

RevokeModal.defaultProps = {
  request: null,
  isLoading: false,
};

// ─── Main Access Manager page ──────────────────────────────────────────
const AccessManager = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [accessList, setAccessList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const revokedRowBg = useColorModeValue("orange.50", "orange.900");
  const approvedRowBg = useColorModeValue("green.50", "green.900");

  // Get patient info from localStorage
  const getPatientInfo = () => {
    try {
      const raw = localStorage.getItem("patientData");
      if (raw) {
        const data = JSON.parse(raw);
        return {
          patientId: data.MedicalId || data._id || "",
          patientName: data.Name || data.name || "",
        };
      }
    } catch {
      // ignore parse errors
    }
    // Fallback: also try generic user data
    try {
      const raw = localStorage.getItem("userData");
      if (raw) {
        const data = JSON.parse(raw);
        return {
          patientId: data.MedicalId || data._id || "",
          patientName: data.Name || data.name || "",
        };
      }
    } catch {
      // ignore
    }
    return { patientId: "", patientName: "" };
  };

  const fetchAccessList = useCallback(async () => {
    setLoading(true);
    try {
      const { patientId, patientName } = getPatientInfo();

      let url = `${API_BASE}/access/patient-access?`;
      if (patientId) {
        url += `patientId=${encodeURIComponent(patientId)}`;
      } else if (patientName) {
        url += `patientName=${encodeURIComponent(patientName)}`;
      } else {
        // If no patient data, fetch all (demo mode)
        url = `${API_BASE}/access/requests`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setAccessList(data.data || []);
      } else {
        throw new Error(data.message || "Failed to fetch access list");
      }
    } catch (err) {
      console.error("Fetch access list error:", err);
      toast({
        title: "Failed to load access history",
        description: err.message,
        status: "error",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAccessList();
  }, [fetchAccessList]);

  const handleRevokeClick = (request) => {
    setSelectedRequest(request);
    onOpen();
  };

  const handleRevokeConfirm = async (requestId, reason) => {
    setRevoking(true);
    try {
      const res = await fetch(
        `${API_BASE}/access/request/${requestId}/revoke`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            revokedBy: "Patient",
            revokeReason: reason || "Access revoked by patient",
          }),
        },
      );

      const data = await res.json();

      if (data.success) {
        toast({
          title: "Access Revoked",
          description: `Access for ${selectedRequest?.requestingHospital} has been revoked successfully.`,
          status: "success",
          duration: 4000,
        });
        onClose();
        // Refresh the list
        await fetchAccessList();
      } else {
        throw new Error(data.message || "Revocation failed");
      }
    } catch (err) {
      console.error("Revoke error:", err);
      toast({
        title: "Revocation Failed",
        description: err.message,
        status: "error",
        duration: 4000,
      });
    } finally {
      setRevoking(false);
    }
  };

  const handleSeedDemo = async () => {
    try {
      const res = await fetch(`${API_BASE}/access/seed-demo`, {
        method: "POST",
      });
      const data = await res.json();
      toast({
        title: data.message,
        status: "info",
        duration: 3000,
      });
      await fetchAccessList();
    } catch (err) {
      toast({
        title: "Seed failed",
        description: err.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  // Filtered list
  const filteredList = accessList.filter((item) => {
    const matchStatus = filterStatus === "all" || item.status === filterStatus;
    const matchSearch =
      !searchQuery ||
      item.requestingHospital
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.requestingDoctor
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.reason?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Stats
  const stats = {
    total: accessList.length,
    approved: accessList.filter((a) => a.status === "Approved").length,
    pending: accessList.filter((a) => a.status === "Pending").length,
    revoked: accessList.filter((a) => a.status === "Revoked").length,
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack>
          <Icon as={FiShield} boxSize={8} color="purple.500" />
          <VStack align="start" spacing={1}>
            <Heading size="lg">Access Manager</Heading>
            <Text color="gray.600">
              View and manage who has access to your medical records
            </Text>
          </VStack>
          <Spacer />
          <HStack>
            <Tooltip label="Refresh list">
              <Button
                leftIcon={<FiRefreshCw />}
                variant="outline"
                size="sm"
                onClick={fetchAccessList}
                isLoading={loading}
              >
                Refresh
              </Button>
            </Tooltip>
            <Tooltip label="Load sample data for testing">
              <Button
                leftIcon={<FiDatabase />}
                variant="outline"
                colorScheme="purple"
                size="sm"
                onClick={handleSeedDemo}
              >
                Seed Demo
              </Button>
            </Tooltip>
          </HStack>
        </HStack>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody textAlign="center" py={4}>
              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                {stats.total}
              </Text>
              <Text fontSize="sm" color="gray.600">
                Total Requests
              </Text>
            </CardBody>
          </Card>
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody textAlign="center" py={4}>
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                {stats.approved}
              </Text>
              <Text fontSize="sm" color="gray.600">
                Active Access
              </Text>
            </CardBody>
          </Card>
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody textAlign="center" py={4}>
              <Text fontSize="2xl" fontWeight="bold" color="yellow.500">
                {stats.pending}
              </Text>
              <Text fontSize="sm" color="gray.600">
                Pending
              </Text>
            </CardBody>
          </Card>
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody textAlign="center" py={4}>
              <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                {stats.revoked}
              </Text>
              <Text fontSize="sm" color="gray.600">
                Revoked
              </Text>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Filters */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Flex gap={4} direction={{ base: "column", md: "row" }}>
              <InputGroup maxW={{ md: "300px" }}>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search hospital or doctor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="md"
                />
              </InputGroup>
              <Select
                maxW={{ md: "200px" }}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="Approved">Active (Approved)</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
                <option value="Revoked">Revoked</option>
              </Select>
              <Spacer />
              <Text fontSize="sm" color="gray.500" alignSelf="center">
                Showing {filteredList.length} of {accessList.length}
              </Text>
            </Flex>
          </CardBody>
        </Card>

        {/* Access Table */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardHeader>
            <Heading size="md">Access History</Heading>
          </CardHeader>
          <CardBody pt={0}>
            {loading ? (
              <VStack spacing={4} align="stretch">
                {[1, 2, 3].map((i) => (
                  <Box key={i}>
                    <Skeleton height="20px" mb={2} />
                    <SkeletonText noOfLines={2} spacing={2} />
                  </Box>
                ))}
              </VStack>
            ) : filteredList.length === 0 ? (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <AlertDescription>
                  {accessList.length === 0
                    ? 'No access requests found. Click "Seed Demo" to add sample data for testing.'
                    : "No requests match your filters."}
                </AlertDescription>
              </Alert>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Hospital</Th>
                      <Th>Doctor</Th>
                      <Th>Reason</Th>
                      <Th>Requested</Th>
                      <Th>Status</Th>
                      <Th>Revoked At</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredList.map((item) => (
                      <Tr
                        key={item._id}
                        bg={
                          item.status === "Revoked"
                            ? revokedRowBg
                            : item.status === "Approved"
                              ? approvedRowBg
                              : "transparent"
                        }
                      >
                        <Td fontWeight="medium" maxW="200px" isTruncated>
                          {item.requestingHospital}
                        </Td>
                        <Td>{item.requestingDoctor}</Td>
                        <Td maxW="250px" isTruncated>
                          <Tooltip label={item.reason}>
                            <Text fontSize="sm">{item.reason}</Text>
                          </Tooltip>
                        </Td>
                        <Td fontSize="sm">{formatDate(item.requestDate)}</Td>
                        <Td>
                          <StatusBadge status={item.status} />
                        </Td>
                        <Td fontSize="sm">
                          {item.status === "Revoked" ? (
                            <VStack align="start" spacing={0}>
                              <Text>{formatDate(item.revokedAt)}</Text>
                              {item.revokeReason && (
                                <Tooltip label={item.revokeReason}>
                                  <Text
                                    fontSize="xs"
                                    color="orange.600"
                                    isTruncated
                                    maxW="150px"
                                  >
                                    {item.revokeReason}
                                  </Text>
                                </Tooltip>
                              )}
                            </VStack>
                          ) : (
                            "—"
                          )}
                        </Td>
                        <Td>
                          {item.status === "Approved" ? (
                            <Button
                              size="xs"
                              colorScheme="red"
                              variant="outline"
                              leftIcon={<FiSlash />}
                              onClick={() => handleRevokeClick(item)}
                            >
                              Revoke
                            </Button>
                          ) : item.status === "Revoked" ? (
                            <Badge colorScheme="orange" fontSize="xs">
                              Access Revoked
                            </Badge>
                          ) : (
                            <Text fontSize="xs" color="gray.400">
                              —
                            </Text>
                          )}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </CardBody>
        </Card>

        {/* Info card */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <VStack spacing={3}>
              <Icon as={FiShield} boxSize={8} color="gray.400" />
              <Heading size="sm" color="gray.500">
                About Access Management
              </Heading>
              <Divider maxW="sm" />
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} maxW="lg">
                <HStack align="start">
                  <Icon as={FiCheck} color="green.400" mt={1} />
                  <Text fontSize="sm" color="gray.500">
                    <strong>Approved</strong> — Hospital can currently view your
                    records
                  </Text>
                </HStack>
                <HStack align="start">
                  <Icon as={FiClock} color="yellow.500" mt={1} />
                  <Text fontSize="sm" color="gray.500">
                    <strong>Pending</strong> — Waiting for admin approval
                  </Text>
                </HStack>
                <HStack align="start">
                  <Icon as={FiSlash} color="orange.400" mt={1} />
                  <Text fontSize="sm" color="gray.500">
                    <strong>Revoked</strong> — Access was removed after being
                    approved
                  </Text>
                </HStack>
                <HStack align="start">
                  <Icon as={FiX} color="red.400" mt={1} />
                  <Text fontSize="sm" color="gray.500">
                    <strong>Rejected</strong> — Request was denied by admin
                  </Text>
                </HStack>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      {/* Revoke Confirmation Modal */}
      <RevokeModal
        isOpen={isOpen}
        onClose={onClose}
        request={selectedRequest}
        onConfirm={handleRevokeConfirm}
        isLoading={revoking}
      />
    </Box>
  );
};

export default AccessManager;
