import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Button,
  IconButton,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Card,
  CardBody,
  Spinner,
  Center,
  useToast,
  useColorModeValue,
  SimpleGrid,
  Icon,
  Flex,
  InputGroup,
  InputLeftElement,
  Tooltip,
  Tag,
  TagLabel,
  TagLeftIcon,
} from "@chakra-ui/react";
import {
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Bell,
  Activity,
  Shield,
  Clock,
  Pill,
  TrendingUp,
  FileText,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API_BASE = "http://localhost:5002";

const SEVERITY_CONFIG = {
  Critical: {
    color: "red",
    bg: "red.50",
    border: "red.200",
    icon: AlertTriangle,
  },
  High: {
    color: "orange",
    bg: "orange.50",
    border: "orange.200",
    icon: AlertTriangle,
  },
  Medium: {
    color: "yellow",
    bg: "yellow.50",
    border: "yellow.200",
    icon: Activity,
  },
  Low: {
    color: "green",
    bg: "green.50",
    border: "green.200",
    icon: CheckCircle,
  },
};

const ALERT_TYPE_CONFIG = {
  LAB_RESULT: { label: "Lab Result", icon: FileText, color: "purple" },
  DRUG_INTERACTION: { label: "Drug Interaction", icon: Pill, color: "red" },
  HEALTH_TREND: { label: "Health Trend", icon: TrendingUp, color: "orange" },
  FOLLOW_UP: { label: "Follow-up", icon: Clock, color: "blue" },
  EMAIL: { label: "Email Alert", icon: Bell, color: "cyan" },
  SMS: { label: "SMS Alert", icon: Bell, color: "teal" },
  SYSTEM: { label: "System", icon: Shield, color: "gray" },
};

const AlertDashboard = () => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalAlerts: 0,
    perPage: 15,
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [ackFilter, setAckFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Colors
  const cardBg = useColorModeValue("white", "gray.800");
  const tableBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const criticalRowBg = useColorModeValue("red.50", "red.900");

  const fetchAlerts = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", page);
        params.set("limit", "15");
        params.set("sortBy", "timestamp");
        params.set("sortOrder", "desc");
        if (searchTerm) params.set("search", searchTerm);
        if (severityFilter) params.set("severity", severityFilter);
        if (typeFilter) params.set("alertType", typeFilter);
        if (ackFilter) params.set("acknowledged", ackFilter);
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);

        const response = await axios.get(
          `${API_BASE}/alerts/history?${params.toString()}`,
        );
        setAlerts(response.data.alerts);
        setPagination(response.data.pagination);
      } catch (error) {
        console.error("Error fetching alerts:", error);
        toast({
          title: "Failed to load alerts",
          description: error.message,
          status: "error",
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      searchTerm,
      severityFilter,
      typeFilter,
      ackFilter,
      startDate,
      endDate,
      toast,
    ],
  );

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/alerts/stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchAlerts(1);
    fetchStats();
  }, [fetchAlerts, fetchStats]);

  const handleAcknowledge = async (alertId) => {
    try {
      await axios.patch(`${API_BASE}/alerts/${alertId}/acknowledge`, {
        acknowledgedBy: currentUser?.name || currentUser?.email || "Doctor",
      });
      toast({
        title: "Alert Acknowledged",
        status: "success",
        duration: 2000,
      });
      fetchAlerts(pagination.currentPage);
      fetchStats();
    } catch (error) {
      toast({
        title: "Failed to acknowledge",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleSeedDemo = async () => {
    try {
      const response = await axios.post(`${API_BASE}/alerts/seed-demo`);
      toast({
        title: "Demo Data",
        description: response.data.message,
        status: "info",
        duration: 3000,
      });
      fetchAlerts(1);
      fetchStats();
    } catch (error) {
      toast({
        title: "Seed failed",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSeverityFilter("");
    setTypeFilter("");
    setAckFilter("");
    setStartDate("");
    setEndDate("");
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSeverityBadge = (severity) => {
    const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.Medium;
    return (
      <Badge
        colorScheme={config.color}
        px={2}
        py={1}
        borderRadius="md"
        fontSize="xs"
        fontWeight="700"
      >
        {severity}
      </Badge>
    );
  };

  const getAlertTypeTag = (type) => {
    const config = ALERT_TYPE_CONFIG[type] || ALERT_TYPE_CONFIG.SYSTEM;
    return (
      <Tag size="sm" colorScheme={config.color} borderRadius="full">
        <TagLeftIcon as={config.icon} boxSize={3} />
        <TagLabel>{config.label}</TagLabel>
      </Tag>
    );
  };

  return (
    <Box p={6}>
      {/* Page Header */}
      <HStack justify="space-between" mb={6} flexWrap="wrap" gap={3}>
        <VStack align="start" spacing={1}>
          <HStack>
            <Icon as={Bell} boxSize={7} color="red.500" />
            <Heading size="lg">Alert Dashboard</Heading>
          </HStack>
          <Text color="gray.500" fontSize="sm">
            Monitor and manage critical patient alerts
          </Text>
        </VStack>
        <HStack spacing={2}>
          <Tooltip label="Refresh alerts">
            <IconButton
              icon={<Icon as={RefreshCw} boxSize={4} />}
              onClick={() => {
                fetchAlerts(pagination.currentPage);
                fetchStats();
              }}
              size="sm"
              variant="outline"
              aria-label="Refresh"
            />
          </Tooltip>
          <Button
            size="sm"
            colorScheme="blue"
            variant="outline"
            onClick={handleSeedDemo}
          >
            Seed Demo Data
          </Button>
        </HStack>
      </HStack>

      {/* Stats Cards */}
      {stats && (
        <SimpleGrid columns={[2, 4]} spacing={4} mb={6}>
          <Card bg={cardBg} borderLeft="4px" borderColor="blue.400">
            <CardBody py={4} px={5}>
              <Text
                fontSize="xs"
                color="gray.500"
                textTransform="uppercase"
                fontWeight="600"
              >
                Total Alerts
              </Text>
              <HStack mt={1}>
                <Heading size="lg">{stats.total}</Heading>
                <Icon as={Bell} color="blue.400" boxSize={5} />
              </HStack>
            </CardBody>
          </Card>
          <Card bg={cardBg} borderLeft="4px" borderColor="red.400">
            <CardBody py={4} px={5}>
              <Text
                fontSize="xs"
                color="gray.500"
                textTransform="uppercase"
                fontWeight="600"
              >
                Critical
              </Text>
              <HStack mt={1}>
                <Heading size="lg" color="red.600">
                  {stats.critical}
                </Heading>
                <Icon as={AlertTriangle} color="red.400" boxSize={5} />
              </HStack>
            </CardBody>
          </Card>
          <Card bg={cardBg} borderLeft="4px" borderColor="orange.400">
            <CardBody py={4} px={5}>
              <Text
                fontSize="xs"
                color="gray.500"
                textTransform="uppercase"
                fontWeight="600"
              >
                Unacknowledged
              </Text>
              <HStack mt={1}>
                <Heading size="lg" color="orange.600">
                  {stats.unacknowledged}
                </Heading>
                <Icon as={Clock} color="orange.400" boxSize={5} />
              </HStack>
            </CardBody>
          </Card>
          <Card bg={cardBg} borderLeft="4px" borderColor="green.400">
            <CardBody py={4} px={5}>
              <Text
                fontSize="xs"
                color="gray.500"
                textTransform="uppercase"
                fontWeight="600"
              >
                Acknowledged
              </Text>
              <HStack mt={1}>
                <Heading size="lg" color="green.600">
                  {stats.total - stats.unacknowledged}
                </Heading>
                <Icon as={CheckCircle} color="green.400" boxSize={5} />
              </HStack>
            </CardBody>
          </Card>
        </SimpleGrid>
      )}

      {/* Filters */}
      <Card bg={cardBg} mb={6}>
        <CardBody>
          <HStack mb={3} spacing={2}>
            <Icon as={Filter} boxSize={4} color="gray.500" />
            <Text fontWeight="600" fontSize="sm">
              Filters
            </Text>
            {(searchTerm ||
              severityFilter ||
              typeFilter ||
              ackFilter ||
              startDate ||
              endDate) && (
              <Button
                size="xs"
                variant="ghost"
                colorScheme="red"
                onClick={clearFilters}
              >
                Clear All
              </Button>
            )}
          </HStack>
          <SimpleGrid columns={[1, 2, 3, 6]} spacing={3}>
            <InputGroup size="sm">
              <InputLeftElement>
                <Icon as={Search} boxSize={3.5} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                borderRadius="md"
              />
            </InputGroup>
            <Select
              size="sm"
              placeholder="All Severities"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              borderRadius="md"
            >
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </Select>
            <Select
              size="sm"
              placeholder="All Types"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              borderRadius="md"
            >
              <option value="LAB_RESULT">Lab Result</option>
              <option value="DRUG_INTERACTION">Drug Interaction</option>
              <option value="HEALTH_TREND">Health Trend</option>
              <option value="FOLLOW_UP">Follow-up</option>
              <option value="EMAIL">Email</option>
              <option value="SMS">SMS</option>
            </Select>
            <Select
              size="sm"
              placeholder="All Status"
              value={ackFilter}
              onChange={(e) => setAckFilter(e.target.value)}
              borderRadius="md"
            >
              <option value="false">Unacknowledged</option>
              <option value="true">Acknowledged</option>
            </Select>
            <Input
              size="sm"
              type="date"
              placeholder="Start date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              borderRadius="md"
            />
            <Input
              size="sm"
              type="date"
              placeholder="End date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              borderRadius="md"
            />
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Alerts Table */}
      <Card bg={tableBg} overflow="hidden">
        <Box overflowX="auto">
          {isLoading ? (
            <Center py={16}>
              <VStack spacing={3}>
                <Spinner size="lg" color="blue.500" />
                <Text color="gray.500">Loading alerts...</Text>
              </VStack>
            </Center>
          ) : alerts.length === 0 ? (
            <Center py={16} flexDirection="column">
              <Icon as={Bell} boxSize={12} color="gray.300" mb={3} />
              <Text color="gray.500" fontWeight="500">
                No alerts found
              </Text>
              <Text color="gray.400" fontSize="sm">
                {searchTerm || severityFilter || typeFilter
                  ? "Try adjusting your filters"
                  : "Click 'Seed Demo Data' to add sample alerts"}
              </Text>
            </Center>
          ) : (
            <Table variant="simple" size="sm">
              <Thead bg={headerBg}>
                <Tr>
                  <Th fontSize="xs" py={3}>
                    Severity
                  </Th>
                  <Th fontSize="xs" py={3}>
                    Patient Name
                  </Th>
                  <Th fontSize="xs" py={3}>
                    Alert Type
                  </Th>
                  <Th fontSize="xs" py={3}>
                    Value
                  </Th>
                  <Th fontSize="xs" py={3}>
                    Message
                  </Th>
                  <Th fontSize="xs" py={3}>
                    Timestamp
                  </Th>
                  <Th fontSize="xs" py={3}>
                    Status
                  </Th>
                  <Th fontSize="xs" py={3} textAlign="center">
                    Action
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {alerts.map((alert) => {
                  return (
                    <Tr
                      key={alert._id}
                      _hover={{ bg: hoverBg }}
                      bg={
                        alert.severity === "Critical" && !alert.acknowledged
                          ? criticalRowBg
                          : undefined
                      }
                      borderLeft="3px solid"
                      borderColor={
                        alert.severity === "Critical"
                          ? "red.400"
                          : alert.severity === "High"
                            ? "orange.400"
                            : "transparent"
                      }
                    >
                      <Td py={3}>{getSeverityBadge(alert.severity)}</Td>
                      <Td py={3}>
                        <Text fontWeight="600" fontSize="sm">
                          {alert.patientName}
                        </Text>
                      </Td>
                      <Td py={3}>{getAlertTypeTag(alert.alertType)}</Td>
                      <Td py={3}>
                        <Text
                          fontSize="xs"
                          color="gray.600"
                          maxW="120px"
                          isTruncated
                        >
                          {alert.value || "—"}
                        </Text>
                      </Td>
                      <Td py={3}>
                        <Tooltip label={alert.message}>
                          <Text
                            fontSize="xs"
                            color="gray.600"
                            maxW="250px"
                            noOfLines={2}
                          >
                            {alert.message}
                          </Text>
                        </Tooltip>
                      </Td>
                      <Td py={3}>
                        <Text fontSize="xs" color="gray.500">
                          {formatDate(alert.timestamp)}
                        </Text>
                      </Td>
                      <Td py={3}>
                        {alert.acknowledged ? (
                          <VStack align="start" spacing={0}>
                            <Badge colorScheme="green" fontSize="xs">
                              Acknowledged
                            </Badge>
                            {alert.acknowledgedBy && (
                              <Text fontSize="10px" color="gray.400">
                                by {alert.acknowledgedBy}
                              </Text>
                            )}
                          </VStack>
                        ) : (
                          <Badge colorScheme="orange" fontSize="xs">
                            Pending
                          </Badge>
                        )}
                      </Td>
                      <Td py={3} textAlign="center">
                        {!alert.acknowledged ? (
                          <Button
                            size="xs"
                            colorScheme="green"
                            variant="solid"
                            onClick={() => handleAcknowledge(alert._id)}
                            leftIcon={<Icon as={CheckCircle} boxSize={3} />}
                          >
                            Ack
                          </Button>
                        ) : (
                          <Icon
                            as={CheckCircle}
                            color="green.400"
                            boxSize={4}
                          />
                        )}
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          )}
        </Box>

        {/* Pagination */}
        {!isLoading && alerts.length > 0 && (
          <Flex
            justify="space-between"
            align="center"
            px={6}
            py={4}
            borderTop="1px"
            borderColor={borderColor}
          >
            <Text fontSize="sm" color="gray.500">
              Showing {(pagination.currentPage - 1) * pagination.perPage + 1}–
              {Math.min(
                pagination.currentPage * pagination.perPage,
                pagination.totalAlerts,
              )}{" "}
              of {pagination.totalAlerts} alerts
            </Text>
            <HStack spacing={2}>
              <IconButton
                icon={<Icon as={ChevronLeft} boxSize={4} />}
                size="sm"
                variant="outline"
                isDisabled={!pagination.hasPrev}
                onClick={() => fetchAlerts(pagination.currentPage - 1)}
                aria-label="Previous page"
              />
              {Array.from(
                { length: Math.min(pagination.totalPages, 5) },
                (_, i) => {
                  const startPage = Math.max(
                    1,
                    Math.min(
                      pagination.currentPage - 2,
                      pagination.totalPages - 4,
                    ),
                  );
                  const pageNum = startPage + i;
                  if (pageNum > pagination.totalPages) return null;
                  return (
                    <Button
                      key={pageNum}
                      size="sm"
                      variant={
                        pageNum === pagination.currentPage ? "solid" : "outline"
                      }
                      colorScheme={
                        pageNum === pagination.currentPage ? "blue" : "gray"
                      }
                      onClick={() => fetchAlerts(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                },
              )}
              <IconButton
                icon={<Icon as={ChevronRight} boxSize={4} />}
                size="sm"
                variant="outline"
                isDisabled={!pagination.hasNext}
                onClick={() => fetchAlerts(pagination.currentPage + 1)}
                aria-label="Next page"
              />
            </HStack>
          </Flex>
        )}
      </Card>
    </Box>
  );
};

export default AlertDashboard;
