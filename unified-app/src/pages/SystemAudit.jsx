import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Input,
  Select,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
  Flex,
  Icon,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import {
  FiSearch,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiShield,
  FiActivity,
  FiAlertTriangle,
  FiUser,
  FiCalendar,
  FiClock,
} from "react-icons/fi";

const SystemAudit = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [stats, setStats] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const API_BASE =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5002";

  const getToken = () => localStorage.getItem("authToken");

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 50 });
      if (filterSeverity !== "all") params.set("severity", filterSeverity);
      if (filterType !== "all") params.set("action", filterType);
      if (searchTerm) params.set("search", searchTerm);

      const res = await fetch(`${API_BASE}/audit/logs?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();

      if (data.logs) {
        setAuditLogs(
          data.logs.map((log, i) => ({
            id: log._id || i,
            timestamp: new Date(log.timestamp).toLocaleString(),
            user: log.user,
            action: log.action,
            resource: log.resource,
            ip: log.ip,
            severity: log.severity,
            status: log.status,
            details: log.details,
          })),
        );
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE, page, filterSeverity, filterType, searchTerm]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/audit/stats`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();

      setStats([
        {
          title: "Total Logs Today",
          value: String(data.totalToday || 0),
          icon: FiActivity,
          color: "blue",
        },
        {
          title: "Security Events",
          value: String(data.securityEvents || 0),
          icon: FiShield,
          color: "red",
        },
        {
          title: "Failed Logins",
          value: String(data.failedLogins || 0),
          icon: FiAlertTriangle,
          color: "orange",
        },
        {
          title: "Active Users",
          value: String(data.activeUsers || 0),
          icon: FiUser,
          color: "green",
        },
      ]);
    } catch (err) {
      console.error("Failed to fetch audit stats:", err);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [fetchLogs, fetchStats]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "red";
      case "medium":
        return "orange";
      case "low":
      case "info":
        return "blue";
      default:
        return "gray";
    }
  };

  const getStatusColor = (status) => {
    return status === "success" ? "green" : "red";
  };

  const filteredLogs = auditLogs;

  const handleRefresh = () => {
    fetchLogs();
    fetchStats();
  };

  const handleExport = () => {
    // Mock export functionality
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `audit_logs_${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Container maxW="full" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Text fontSize="3xl" fontWeight="bold">
              System Audit Logs
            </Text>
            <Text color="gray.600">
              Monitor system activities and security events
            </Text>
          </VStack>
          <HStack spacing={3}>
            <Button
              leftIcon={<FiRefreshCw />}
              onClick={handleRefresh}
              isLoading={loading}
            >
              Refresh
            </Button>
            <Button
              leftIcon={<FiDownload />}
              colorScheme="blue"
              onClick={handleExport}
            >
              Export
            </Button>
          </HStack>
        </Flex>

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          {stats.map((stat, index) => (
            <Card key={index} bg={cardBg}>
              <CardBody>
                <HStack spacing={4}>
                  <Box p={3} bg={`${stat.color}.100`} borderRadius="full">
                    <Icon
                      as={stat.icon}
                      color={`${stat.color}.500`}
                      boxSize={6}
                    />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="2xl" fontWeight="bold">
                      {stat.value}
                    </Text>
                    <Text color="gray.600" fontSize="sm">
                      {stat.title}
                    </Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {/* Security Alert */}
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Security Notice!</AlertTitle>
            <AlertDescription>
              8 failed login attempts detected in the last hour. Consider
              reviewing access logs.
            </AlertDescription>
          </Box>
        </Alert>

        {/* Filters */}
        <Card bg={cardBg}>
          <CardHeader>
            <Text fontSize="lg" fontWeight="semibold">
              Filter Audit Logs
            </Text>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>

              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Actions</option>
                <option value="login">Login Events</option>
                <option value="access">Access Events</option>
                <option value="update">Update Events</option>
                <option value="creation">Creation Events</option>
              </Select>

              <Select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
              >
                <option value="all">All Severity</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="info">Info</option>
              </Select>

              <Button
                leftIcon={<FiFilter />}
                colorScheme="blue"
                variant="outline"
              >
                Advanced Filters
              </Button>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Audit Logs Table */}
        <Card bg={cardBg}>
          <CardHeader>
            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="semibold">
                Recent Audit Events ({filteredLogs.length})
              </Text>
              <HStack spacing={2}>
                <Icon as={FiClock} color="gray.500" />
                <Text fontSize="sm" color="gray.600">
                  Last updated: {new Date().toLocaleTimeString()}
                </Text>
              </HStack>
            </HStack>
          </CardHeader>
          <CardBody>
            {loading ? (
              <Flex justify="center" py={8}>
                <Spinner size="lg" color="blue.500" />
              </Flex>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Timestamp</Th>
                      <Th>User</Th>
                      <Th>Action</Th>
                      <Th>Resource</Th>
                      <Th>IP Address</Th>
                      <Th>Severity</Th>
                      <Th>Status</Th>
                      <Th>Details</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredLogs.map((log) => (
                      <Tr key={log.id} _hover={{ bg: "gray.50" }}>
                        <Td>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm" fontWeight="medium">
                              {log.timestamp.split(" ")[0]}
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                              {log.timestamp.split(" ")[1]}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Text fontSize="sm" fontWeight="medium">
                            {log.user}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm">{log.action}</Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm">{log.resource}</Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm" fontFamily="mono">
                            {log.ip}
                          </Text>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={getSeverityColor(log.severity)}
                            variant="subtle"
                          >
                            {log.severity.toUpperCase()}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={getStatusColor(log.status)}
                            variant="subtle"
                          >
                            {log.status.toUpperCase()}
                          </Badge>
                        </Td>
                        <Td>
                          <Text
                            fontSize="sm"
                            color="gray.600"
                            maxW="200px"
                            noOfLines={2}
                          >
                            {log.details}
                          </Text>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
            {totalPages > 1 && (
              <HStack justify="center" mt={4}>
                <Button
                  size="sm"
                  isDisabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Text fontSize="sm">
                  Page {page} of {totalPages}
                </Text>
                <Button
                  size="sm"
                  isDisabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </HStack>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default SystemAudit;
