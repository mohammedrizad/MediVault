import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Badge,
  Spinner,
  Select,
  HStack,
  VStack,
  useColorModeValue,
  Skeleton,
  Alert,
  AlertIcon,
  Button,
  Tooltip,
} from "@chakra-ui/react";
import {
  FiUsers,
  FiActivity,
  FiDatabase,
  FiShield,
  FiRefreshCw,
  FiTrendingUp,
  FiCpu,
  FiAlertCircle,
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import PropTypes from "prop-types";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";

const PIE_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#a78bfa",
  "#c4b5fd",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#06b6d4",
];

const SEVERITY_COLORS = {
  Normal: "#22c55e",
  Mild: "#84cc16",
  Moderate: "#eab308",
  Severe: "#f97316",
  Critical: "#ef4444",
  Unknown: "#94a3b8",
};

// ─────────────────────── Stat Card ───────────────────────
const StatCard = ({ label, value, icon, color, helpText, trend }) => {
  const bg = useColorModeValue("white", "gray.700");
  return (
    <Box
      bg={bg}
      p={6}
      borderRadius="xl"
      boxShadow="lg"
      border="1px"
      borderColor={useColorModeValue("gray.100", "gray.600")}
      transition="all 0.2s"
      _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
    >
      <Flex justify="space-between" align="center">
        <Stat>
          <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">
            {label}
          </StatLabel>
          <StatNumber fontSize="3xl" fontWeight="bold" color={color}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </StatNumber>
          {helpText && (
            <StatHelpText mb={0}>
              {trend && <StatArrow type={trend} />}
              {helpText}
            </StatHelpText>
          )}
        </Stat>
        <Box p={3} bg={`${color}15`} borderRadius="xl">
          <Icon as={icon} w={7} h={7} color={color} />
        </Box>
      </Flex>
    </Box>
  );
};

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  icon: PropTypes.elementType.isRequired,
  color: PropTypes.string.isRequired,
  helpText: PropTypes.string,
  trend: PropTypes.string,
};

// ─────────────────── Chart Wrapper ───────────────────
const ChartCard = ({ title, subtitle, children, span }) => {
  const bg = useColorModeValue("white", "gray.700");
  return (
    <Box
      bg={bg}
      p={6}
      borderRadius="xl"
      boxShadow="lg"
      border="1px"
      borderColor={useColorModeValue("gray.100", "gray.600")}
      gridColumn={span ? `span ${span}` : undefined}
    >
      <VStack align="start" spacing={1} mb={4}>
        <Heading size="md">{title}</Heading>
        {subtitle && (
          <Text fontSize="sm" color="gray.500">
            {subtitle}
          </Text>
        )}
      </VStack>
      {children}
    </Box>
  );
};

ChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node.isRequired,
  span: PropTypes.number,
};

// ─────────────────── Custom Pie Label ───────────────────
const renderCustomLabel = ({ name, percent }) => {
  if (percent < 0.05) return null;
  return `${name} ${(percent * 100).toFixed(0)}%`;
};

// ═══════════════════════════════════════════════════════════
//                   MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/analytics/summary`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      setData(json);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + auto-refresh every 30s
  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  // ─── Loading skeleton ───
  if (loading && !data) {
    return (
      <Box p={8}>
        <Skeleton height="40px" width="300px" mb={6} />
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height="130px" borderRadius="xl" />
          ))}
        </SimpleGrid>
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height="350px" borderRadius="xl" />
          ))}
        </SimpleGrid>
      </Box>
    );
  }

  // ─── Error state ───
  if (error && !data) {
    return (
      <Box p={8}>
        <Alert status="error" borderRadius="xl" mb={4}>
          <AlertIcon />
          Failed to load analytics: {error}
        </Alert>
        <Button
          leftIcon={<FiRefreshCw />}
          colorScheme="purple"
          onClick={fetchAnalytics}
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (!data) return null;

  const {
    counts,
    monthlyData,
    typeDistribution,
    severityData,
    accessByStatus,
  } = data;

  // Build access pie data
  const accessPieData = Object.entries(accessByStatus || {}).map(
    ([name, value]) => ({ name, value }),
  );

  return (
    <Box p={8} maxW="1600px" mx="auto">
      {/* Header */}
      <Flex justify="space-between" align="center" mb={8} wrap="wrap" gap={4}>
        <Box>
          <Heading size="lg" mb={1}>
            Analytics Dashboard
          </Heading>
          <Text color="gray.500">
            Real-time system metrics and usage analytics
          </Text>
        </Box>
        <HStack spacing={3}>
          {lastRefresh && (
            <Text fontSize="xs" color="gray.400">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </Text>
          )}
          <Tooltip label="Auto-refreshes every 30s">
            <Badge colorScheme="green" variant="subtle" px={2} py={1}>
              LIVE
            </Badge>
          </Tooltip>
          <Button
            size="sm"
            leftIcon={<FiRefreshCw />}
            colorScheme="purple"
            variant="outline"
            onClick={fetchAnalytics}
            isLoading={loading}
          >
            Refresh
          </Button>
        </HStack>
      </Flex>

      {/* ─── Stat Cards ─── */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={6} mb={8}>
        <StatCard
          label="Total Patients"
          value={counts.totalPatients}
          icon={FiUsers}
          color="#6366f1"
          helpText="Registered patients"
          trend="increase"
        />
        <StatCard
          label="Medical Records"
          value={counts.totalRecords}
          icon={FiDatabase}
          color="#8b5cf6"
          helpText="Patient history entries"
        />
        <StatCard
          label="AI Analyses"
          value={counts.totalAIAnalyses}
          icon={FiCpu}
          color="#3b82f6"
          helpText="Scans & reports analyzed"
          trend="increase"
        />
        <StatCard
          label="Active Staff"
          value={counts.totalDoctors + counts.totalNurses}
          icon={FiActivity}
          color="#22c55e"
          helpText={`${counts.totalDoctors} doctors, ${counts.totalNurses} nurses`}
        />
      </SimpleGrid>

      {/* Secondary stats row */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={6} mb={8}>
        <StatCard
          label="Doctors"
          value={counts.totalDoctors}
          icon={FiUsers}
          color="#0ea5e9"
        />
        <StatCard
          label="Scan Centers"
          value={counts.totalScanCenters}
          icon={FiShield}
          color="#f59e0b"
        />
        <StatCard
          label="Access Requests"
          value={counts.totalAccessRequests}
          icon={FiTrendingUp}
          color="#ec4899"
        />
        <StatCard
          label="System Alerts"
          value={counts.totalAlerts}
          icon={FiAlertCircle}
          color="#ef4444"
        />
      </SimpleGrid>

      {/* ─── Charts Grid ─── */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
        {/* Bar Chart - Monthly Activity */}
        <ChartCard
          title="Monthly Activity"
          subtitle="Patient registrations, doctor activity & AI analyses over 6 months"
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <RTooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              />
              <Legend />
              <Bar
                dataKey="patients"
                name="Patients"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="doctors"
                name="Doctors"
                fill="#8b5cf6"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="aiAnalyses"
                name="AI Analyses"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Pie Chart - AI Analysis Types */}
        <ChartCard
          title="AI Analysis Distribution"
          subtitle="Breakdown by analysis type"
        >
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={typeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={110}
                dataKey="value"
              >
                {typeDistribution.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <RTooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Area Chart - AI Usage Trend */}
        <ChartCard
          title="AI Usage Trend"
          subtitle="AI analysis volume over the last 6 months"
        >
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="aiGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <RTooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              />
              <Area
                type="monotone"
                dataKey="aiAnalyses"
                name="AI Analyses"
                stroke="#3b82f6"
                fill="url(#aiGradient)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="patients"
                name="Patients"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Pie Chart - Severity Distribution */}
        <ChartCard
          title="Analysis Severity"
          subtitle="AI findings severity distribution"
        >
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={110}
                dataKey="value"
                label={renderCustomLabel}
                labelLine={false}
              >
                {severityData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={SEVERITY_COLORS[entry.name] || "#94a3b8"}
                  />
                ))}
              </Pie>
              <RTooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </SimpleGrid>

      {/* ─── Access Requests Breakdown ─── */}
      <SimpleGrid columns={{ base: 1 }} spacing={6}>
        <ChartCard
          title="Access Request Status"
          subtitle="Cross-hospital access request breakdown by status"
        >
          <Flex
            direction={{ base: "column", md: "row" }}
            gap={8}
            align="center"
          >
            <Box flex="1" maxW="350px">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={accessPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={renderCustomLabel}
                    labelLine={false}
                  >
                    {accessPieData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <VStack align="start" spacing={3} flex="1">
              {accessPieData.map((item, i) => (
                <HStack key={item.name} spacing={3}>
                  <Box
                    w={3}
                    h={3}
                    borderRadius="full"
                    bg={PIE_COLORS[i % PIE_COLORS.length]}
                  />
                  <Text fontWeight="medium">{item.name}</Text>
                  <Badge colorScheme="purple" variant="subtle">
                    {item.value}
                  </Badge>
                </HStack>
              ))}
              <Text fontSize="sm" color="gray.500" mt={2}>
                Total: {accessPieData.reduce((s, d) => s + d.value, 0)} requests
              </Text>
            </VStack>
          </Flex>
        </ChartCard>
      </SimpleGrid>
    </Box>
  );
};

export default AnalyticsDashboard;
