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
  useToast,
  Flex,
  Spacer,
  Input,
  Select,
  Skeleton,
  Tooltip,
} from "@chakra-ui/react";
import {
  FiClock,
  FiCheck,
  FiSlash,
  FiX,
  FiLoader,
  FiRefreshCw,
  FiDownload,
  FiDatabase,
  FiFilter,
  FiShield,
} from "react-icons/fi";

const API_BASE = "http://localhost:5002";

// ─── Timeline Event component ──────────────────────────────────────────
const TimelineEvent = ({ event, isLast }) => {
  const lineBg = useColorModeValue("gray.200", "gray.600");

  const statusConfig = {
    Approved: {
      color: "green.500",
      bg: "green.50",
      darkBg: "green.900",
      icon: FiCheck,
      label: "Access Granted",
      badgeColor: "green",
    },
    Revoked: {
      color: "orange.500",
      bg: "orange.50",
      darkBg: "orange.900",
      icon: FiSlash,
      label: "Access Revoked",
      badgeColor: "orange",
    },
    Pending: {
      color: "yellow.500",
      bg: "yellow.50",
      darkBg: "yellow.900",
      icon: FiLoader,
      label: "Pending Review",
      badgeColor: "yellow",
    },
    Rejected: {
      color: "red.500",
      bg: "red.50",
      darkBg: "red.900",
      icon: FiX,
      label: "Access Denied",
      badgeColor: "red",
    },
  };

  const config = statusConfig[event.status] || statusConfig.Pending;
  const cardBg = useColorModeValue(config.bg, config.darkBg);
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate access duration for revoked entries
  const getDuration = () => {
    if (event.status !== "Revoked" || !event.approvalDate || !event.revokedAt)
      return null;
    const start = new Date(event.approvalDate);
    const end = new Date(event.revokedAt);
    const diffMs = end - start;
    const diffDays = Math.floor(diffMs / 86400000);
    const diffHrs = Math.floor((diffMs % 86400000) / 3600000);

    if (diffDays > 0)
      return `${diffDays} day${diffDays !== 1 ? "s" : ""}${
        diffHrs > 0 ? `, ${diffHrs}h` : ""
      }`;
    return `${diffHrs} hour${diffHrs !== 1 ? "s" : ""}`;
  };

  const duration = getDuration();

  return (
    <Flex gap={4}>
      {/* Timeline line + dot */}
      <Flex direction="column" align="center" minW="40px">
        <Box
          w="14px"
          h="14px"
          borderRadius="full"
          bg={config.color}
          border="3px solid"
          borderColor={useColorModeValue("white", "gray.800")}
          boxShadow={`0 0 0 2px ${config.color}`}
          zIndex={1}
          flexShrink={0}
        />
        {!isLast && <Box w="2px" flex={1} bg={lineBg} minH="20px" />}
      </Flex>

      {/* Content card */}
      <Card
        bg={cardBg}
        borderColor={borderColor}
        borderWidth="1px"
        borderLeftWidth="4px"
        borderLeftColor={config.color}
        mb={isLast ? 0 : 4}
        flex={1}
        size="sm"
      >
        <CardBody py={3} px={4}>
          <VStack align="stretch" spacing={2}>
            <HStack justify="space-between" flexWrap="wrap" gap={2}>
              <HStack>
                <Icon as={config.icon} color={config.color} />
                <Badge colorScheme={config.badgeColor} fontSize="xs">
                  {config.label}
                </Badge>
              </HStack>
              <Text fontSize="xs" color="gray.500">
                {formatDateTime(
                  event.status === "Revoked"
                    ? event.revokedAt
                    : event.status === "Approved"
                      ? event.approvalDate
                      : event.requestDate,
                )}
              </Text>
            </HStack>

            <HStack spacing={4} flexWrap="wrap">
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" color="gray.500" fontWeight="bold">
                  Hospital
                </Text>
                <Text fontSize="sm" fontWeight="medium">
                  {event.requestingHospital}
                </Text>
              </VStack>
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" color="gray.500" fontWeight="bold">
                  Doctor
                </Text>
                <Text fontSize="sm">{event.requestingDoctor}</Text>
              </VStack>
            </HStack>

            <Text fontSize="xs" color="gray.600">
              <Text as="span" fontWeight="bold">
                Reason:{" "}
              </Text>
              {event.reason}
            </Text>

            <HStack spacing={4} flexWrap="wrap">
              {event.approvalDate && (
                <Text fontSize="xs" color="gray.500">
                  Approved: {formatDate(event.approvalDate)}
                  {event.approvedBy && ` by ${event.approvedBy}`}
                </Text>
              )}
              {duration && (
                <Tooltip label="Duration of active access">
                  <Badge variant="outline" colorScheme="orange" fontSize="xs">
                    <HStack spacing={1}>
                      <Icon as={FiClock} boxSize={3} />
                      <Text>{duration}</Text>
                    </HStack>
                  </Badge>
                </Tooltip>
              )}
              {event.revokeReason && (
                <Text fontSize="xs" color="orange.600">
                  Revoke reason: {event.revokeReason}
                </Text>
              )}
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </Flex>
  );
};

TimelineEvent.propTypes = {
  event: PropTypes.shape({
    _id: PropTypes.string,
    requestingHospital: PropTypes.string.isRequired,
    requestingDoctor: PropTypes.string.isRequired,
    reason: PropTypes.string,
    status: PropTypes.oneOf(["Pending", "Approved", "Rejected", "Revoked"])
      .isRequired,
    requestDate: PropTypes.string,
    approvalDate: PropTypes.string,
    approvedBy: PropTypes.string,
    revokedAt: PropTypes.string,
    revokedBy: PropTypes.string,
    revokeReason: PropTypes.string,
  }).isRequired,
  isLast: PropTypes.bool,
};

TimelineEvent.defaultProps = {
  isLast: false,
};

// ─── Date Marker ───────────────────────────────────────────────────────
const DateMarker = ({ date }) => {
  const bg = useColorModeValue("gray.100", "gray.700");
  return (
    <Box py={2} px={3} bg={bg} borderRadius="md" mb={3}>
      <Text
        fontSize="xs"
        fontWeight="bold"
        color="gray.500"
        letterSpacing="wide"
      >
        {new Date(date).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </Text>
    </Box>
  );
};

DateMarker.propTypes = {
  date: PropTypes.string.isRequired,
};

// ─── Main Timeline Page ────────────────────────────────────────────────
const AccessTimeline = () => {
  const toast = useToast();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterHospital, setFilterHospital] = useState("all");
  const [filterDateStart, setFilterDateStart] = useState("");
  const [filterDateEnd, setFilterDateEnd] = useState("");

  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const getPatientInfo = () => {
    try {
      const raw =
        localStorage.getItem("patientData") || localStorage.getItem("userData");
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

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const { patientId, patientName } = getPatientInfo();
      let url = `${API_BASE}/access/patient-access?`;
      if (patientId) {
        url += `patientId=${encodeURIComponent(patientId)}`;
      } else if (patientName) {
        url += `patientName=${encodeURIComponent(patientName)}`;
      } else {
        url = `${API_BASE}/access/requests`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setEvents(data.data || []);
      } else {
        throw new Error(data.message || "Failed to fetch");
      }
    } catch (err) {
      toast({
        title: "Failed to load timeline",
        description: err.message,
        status: "error",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSeedDemo = async () => {
    try {
      const res = await fetch(`${API_BASE}/access/seed-demo`, {
        method: "POST",
      });
      const data = await res.json();
      toast({ title: data.message, status: "info", duration: 3000 });
      await fetchEvents();
    } catch (err) {
      toast({
        title: "Seed failed",
        description: err.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  // Build a timeline-ordered list (most recent first)
  // For revoked items, show two entries: one for approval, one for revocation
  const buildTimeline = () => {
    const timelineItems = [];

    events.forEach((ev) => {
      // Always add the primary event
      timelineItems.push({
        ...ev,
        _sortDate:
          ev.status === "Revoked"
            ? ev.revokedAt || ev.requestDate
            : ev.status === "Approved"
              ? ev.approvalDate || ev.requestDate
              : ev.requestDate,
      });
    });

    return timelineItems.sort(
      (a, b) => new Date(b._sortDate) - new Date(a._sortDate),
    );
  };

  // Unique hospitals for filter
  const hospitals = [
    ...new Set(events.map((e) => e.requestingHospital).filter(Boolean)),
  ];

  // Apply filters
  const filteredTimeline = buildTimeline().filter((ev) => {
    if (filterHospital !== "all" && ev.requestingHospital !== filterHospital)
      return false;
    if (filterDateStart) {
      const eventDate = new Date(ev._sortDate);
      const startDate = new Date(filterDateStart);
      if (eventDate < startDate) return false;
    }
    if (filterDateEnd) {
      const eventDate = new Date(ev._sortDate);
      const endDate = new Date(filterDateEnd);
      endDate.setHours(23, 59, 59);
      if (eventDate > endDate) return false;
    }
    return true;
  });

  // Group by date for date markers
  const groupedByDate = [];
  let lastDateKey = "";
  filteredTimeline.forEach((ev) => {
    const dateKey = new Date(ev._sortDate).toISOString().split("T")[0];
    if (dateKey !== lastDateKey) {
      groupedByDate.push({ type: "marker", date: dateKey });
      lastDateKey = dateKey;
    }
    groupedByDate.push({ type: "event", data: ev });
  });

  // Export to text/PDF placeholder
  const handleExport = () => {
    const lines = [
      "ACCESS HISTORY TIMELINE",
      "========================",
      `Generated: ${new Date().toLocaleString()}`,
      "",
    ];

    filteredTimeline.forEach((ev) => {
      lines.push(`[${ev.status}] ${ev.requestingHospital}`);
      lines.push(`  Doctor: ${ev.requestingDoctor}`);
      lines.push(`  Reason: ${ev.reason}`);
      lines.push(
        `  Requested: ${new Date(ev.requestDate).toLocaleDateString()}`,
      );
      if (ev.approvalDate) {
        lines.push(
          `  Approved: ${new Date(ev.approvalDate).toLocaleDateString()}`,
        );
      }
      if (ev.revokedAt) {
        lines.push(`  Revoked: ${new Date(ev.revokedAt).toLocaleDateString()}`);
        if (ev.revokeReason) lines.push(`  Revoke Reason: ${ev.revokeReason}`);
      }
      lines.push("");
    });

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `access-history-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Timeline exported",
      description: "Access history has been downloaded as a text file.",
      status: "success",
      duration: 3000,
    });
  };

  // Stats
  const stats = {
    total: events.length,
    active: events.filter((e) => e.status === "Approved").length,
    revoked: events.filter((e) => e.status === "Revoked").length,
    pending: events.filter((e) => e.status === "Pending").length,
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack>
          <Icon as={FiClock} boxSize={8} color="teal.500" />
          <VStack align="start" spacing={1}>
            <Heading size="lg">Access Timeline</Heading>
            <Text color="gray.600">
              Chronological view of all cross-hospital access to your records
            </Text>
          </VStack>
          <Spacer />
          <HStack>
            <Button
              leftIcon={<FiDownload />}
              variant="outline"
              size="sm"
              onClick={handleExport}
              isDisabled={filteredTimeline.length === 0}
            >
              Export
            </Button>
            <Button
              leftIcon={<FiRefreshCw />}
              variant="outline"
              size="sm"
              onClick={fetchEvents}
              isLoading={loading}
            >
              Refresh
            </Button>
            <Button
              leftIcon={<FiDatabase />}
              variant="outline"
              colorScheme="purple"
              size="sm"
              onClick={handleSeedDemo}
            >
              Seed Demo
            </Button>
          </HStack>
        </HStack>

        {/* Stats */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody textAlign="center" py={3}>
              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                {stats.total}
              </Text>
              <Text fontSize="xs" color="gray.600">
                Total Events
              </Text>
            </CardBody>
          </Card>
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody textAlign="center" py={3}>
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                {stats.active}
              </Text>
              <Text fontSize="xs" color="gray.600">
                Active Access
              </Text>
            </CardBody>
          </Card>
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody textAlign="center" py={3}>
              <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                {stats.revoked}
              </Text>
              <Text fontSize="xs" color="gray.600">
                Revoked
              </Text>
            </CardBody>
          </Card>
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody textAlign="center" py={3}>
              <Text fontSize="2xl" fontWeight="bold" color="yellow.500">
                {stats.pending}
              </Text>
              <Text fontSize="xs" color="gray.600">
                Pending
              </Text>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Filters */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <HStack mb={2}>
              <Icon as={FiFilter} color="gray.500" />
              <Text fontWeight="semibold" fontSize="sm">
                Filters
              </Text>
            </HStack>
            <Flex gap={4} direction={{ base: "column", md: "row" }}>
              <Select
                maxW={{ md: "250px" }}
                size="sm"
                value={filterHospital}
                onChange={(e) => setFilterHospital(e.target.value)}
              >
                <option value="all">All Hospitals</option>
                {hospitals.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </Select>
              <HStack>
                <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
                  From:
                </Text>
                <Input
                  type="date"
                  size="sm"
                  maxW="180px"
                  value={filterDateStart}
                  onChange={(e) => setFilterDateStart(e.target.value)}
                />
              </HStack>
              <HStack>
                <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
                  To:
                </Text>
                <Input
                  type="date"
                  size="sm"
                  maxW="180px"
                  value={filterDateEnd}
                  onChange={(e) => setFilterDateEnd(e.target.value)}
                />
              </HStack>
              <Spacer />
              <Text fontSize="xs" color="gray.500" alignSelf="center">
                {filteredTimeline.length} events
              </Text>
            </Flex>
          </CardBody>
        </Card>

        {/* Timeline */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardHeader>
            <HStack>
              <Icon as={FiShield} color="teal.500" />
              <Heading size="md">Timeline</Heading>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            {loading ? (
              <VStack spacing={4} align="stretch">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} height="80px" borderRadius="md" />
                ))}
              </VStack>
            ) : filteredTimeline.length === 0 ? (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <AlertDescription>
                  {events.length === 0
                    ? 'No access events found. Click "Seed Demo" to add sample data.'
                    : "No events match your filters. Try adjusting the date range or hospital."}
                </AlertDescription>
              </Alert>
            ) : (
              <VStack align="stretch" spacing={0}>
                {groupedByDate.map((item, idx) => {
                  if (item.type === "marker") {
                    return (
                      <DateMarker key={`m-${item.date}`} date={item.date} />
                    );
                  }

                  // Find if this is the last event
                  const isLast =
                    idx === groupedByDate.length - 1 ||
                    (idx < groupedByDate.length - 1 &&
                      groupedByDate[idx + 1]?.type === "marker" &&
                      idx + 1 === groupedByDate.length - 1);

                  // Actually determine if last event overall
                  const nextEvents = groupedByDate
                    .slice(idx + 1)
                    .filter((x) => x.type === "event");
                  const isLastEvent = nextEvents.length === 0;

                  return (
                    <TimelineEvent
                      key={item.data._id || idx}
                      event={item.data}
                      isLast={isLastEvent}
                    />
                  );
                })}
              </VStack>
            )}
          </CardBody>
        </Card>

        {/* Legend */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <VStack spacing={3}>
              <Heading size="sm" color="gray.500">
                Legend
              </Heading>
              <Divider maxW="sm" />
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                <HStack>
                  <Box w="12px" h="12px" borderRadius="full" bg="green.500" />
                  <Text fontSize="sm">Access Granted</Text>
                </HStack>
                <HStack>
                  <Box w="12px" h="12px" borderRadius="full" bg="orange.500" />
                  <Text fontSize="sm">Access Revoked</Text>
                </HStack>
                <HStack>
                  <Box w="12px" h="12px" borderRadius="full" bg="yellow.500" />
                  <Text fontSize="sm">Pending Review</Text>
                </HStack>
                <HStack>
                  <Box w="12px" h="12px" borderRadius="full" bg="red.500" />
                  <Text fontSize="sm">Access Denied</Text>
                </HStack>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default AccessTimeline;
