import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  Icon,
  Badge,
  Button,
  Input,
  FormControl,
  FormLabel,
  VStack,
  HStack,
  Divider,
  Spinner,
  Alert,
  AlertIcon,
  Select,
  Textarea,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  useColorModeValue,
  useToast,
  Skeleton,
  Tooltip,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tag,
  TagLabel,
  TagLeftIcon,
  IconButton,
  Collapse,
  useDisclosure,
} from "@chakra-ui/react";
import {
  FiHeart,
  FiActivity,
  FiThermometer,
  FiWind,
  FiDroplet,
  FiAlertTriangle,
  FiCheckCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiTrendingDown,
  FiRefreshCw,
  FiDownload,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiUser,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
  Legend,
} from "recharts";
import PropTypes from "prop-types";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";

// ─── Risk Level Colors ───
const RISK_COLORS = {
  Low: { bg: "green.50", color: "green.600", scheme: "green", hex: "#22c55e" },
  Medium: {
    bg: "yellow.50",
    color: "yellow.600",
    scheme: "yellow",
    hex: "#eab308",
  },
  High: {
    bg: "orange.50",
    color: "orange.600",
    scheme: "orange",
    hex: "#f97316",
  },
  Critical: { bg: "red.50", color: "red.600", scheme: "red", hex: "#ef4444" },
};

const STATUS_COLORS = {
  Normal: "green",
  Borderline: "yellow",
  Concerning: "orange",
  Critical: "red",
};

const VITAL_ICONS = {
  "Heart Rate": FiHeart,
  "Blood Pressure (Systolic)": FiActivity,
  Temperature: FiThermometer,
  "Respiratory Rate": FiWind,
  "Oxygen Saturation": FiDroplet,
};

// ─── VitalInput Component ───
const VitalInput = ({ label, value, onChange, unit, min, max, step, icon }) => {
  const borderColor = useColorModeValue("gray.200", "gray.600");
  return (
    <FormControl>
      <FormLabel fontSize="sm" fontWeight="medium" mb={1}>
        <HStack spacing={1}>
          <Icon as={icon} color="gray.500" />
          <Text>{label}</Text>
          <Text fontSize="xs" color="gray.400">
            ({unit})
          </Text>
        </HStack>
      </FormLabel>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        step={step || 1}
        borderColor={borderColor}
        _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
        size="lg"
        fontWeight="bold"
        textAlign="center"
      />
    </FormControl>
  );
};

VitalInput.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  unit: PropTypes.string.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  icon: PropTypes.elementType,
};

// ─── VitalBreakdownRow Component ───
const VitalBreakdownRow = ({ item }) => {
  const VIcon = VITAL_ICONS[item.name] || FiActivity;
  return (
    <Tr>
      <Td>
        <HStack spacing={2}>
          <Icon as={VIcon} color={`${STATUS_COLORS[item.status]}.500`} />
          <Text fontWeight="medium">{item.name}</Text>
        </HStack>
      </Td>
      <Td isNumeric fontWeight="bold">
        {item.value} {item.unit}
      </Td>
      <Td>
        <Badge
          colorScheme={STATUS_COLORS[item.status]}
          variant="subtle"
          px={2}
          py={1}
          borderRadius="md"
        >
          {item.status}
        </Badge>
      </Td>
      <Td isNumeric>
        <Text
          fontWeight="bold"
          color={
            item.score === 0
              ? "green.500"
              : item.score === 1
                ? "yellow.600"
                : item.score === 2
                  ? "orange.500"
                  : "red.500"
          }
        >
          {item.score}/3
        </Text>
      </Td>
    </Tr>
  );
};

VitalBreakdownRow.propTypes = {
  item: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    unit: PropTypes.string.isRequired,
    score: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
  }).isRequired,
};

// ─── RiskBadge Component ───
const RiskBadge = ({ level, size }) => {
  const config = RISK_COLORS[level] || RISK_COLORS.Low;
  const iconType =
    level === "Low"
      ? FiCheckCircle
      : level === "Medium"
        ? FiAlertCircle
        : FiAlertTriangle;
  return (
    <Tag
      size={size || "lg"}
      colorScheme={config.scheme}
      variant="subtle"
      px={3}
      py={2}
      borderRadius="full"
    >
      <TagLeftIcon as={iconType} />
      <TagLabel fontWeight="bold">{level} Risk</TagLabel>
    </Tag>
  );
};

RiskBadge.propTypes = {
  level: PropTypes.string.isRequired,
  size: PropTypes.string,
};

// ═══════════════════════════════════════════════════════════
//                   MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
const EarlyWarningScore = () => {
  const toast = useToast();
  const resultRef = useRef(null);
  const { isOpen: historyOpen, onToggle: toggleHistory } = useDisclosure({
    defaultIsOpen: false,
  });

  // ─── State ───
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [patientName, setPatientName] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Vital sign inputs
  const [heartRate, setHeartRate] = useState("");
  const [systolicBP, setSystolicBP] = useState("");
  const [diastolicBP, setDiastolicBP] = useState("");
  const [temperature, setTemperature] = useState("");
  const [respiratoryRate, setRespiratoryRate] = useState("");
  const [oxygenSaturation, setOxygenSaturation] = useState("");

  // Colors
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.100", "gray.600");

  // ─── Fetch patients for dropdown ───
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch(`${API_URL}/pews/pews-patients`);
        if (!res.ok) throw new Error("Failed to fetch patients");
        const data = await res.json();
        setPatients(data.patients || []);

        // also add demo patient
        setPatients((prev) => {
          const hasDemo = prev.some((p) => p.id === "demo-patient-001");
          if (!hasDemo) {
            return [
              {
                id: "demo-patient-001",
                name: "John Doe (Demo)",
                medicalId: "DEMO001",
              },
              ...prev,
            ];
          }
          return prev;
        });
      } catch (err) {
        console.error("Failed to load patients:", err);
        // Provide demo fallback
        setPatients([
          {
            id: "demo-patient-001",
            name: "John Doe (Demo)",
            medicalId: "DEMO001",
          },
        ]);
      } finally {
        setLoadingPatients(false);
      }
    };
    fetchPatients();
  }, []);

  // ─── Seed demo data on mount ───
  useEffect(() => {
    const seedDemo = async () => {
      try {
        await fetch(`${API_URL}/pews/pews-seed-demo`, { method: "POST" });
      } catch (err) {
        // ignore
      }
    };
    seedDemo();
  }, []);

  // ─── Fetch history when patient changes ───
  const fetchHistory = useCallback(async (pid) => {
    if (!pid) {
      setHistory([]);
      return;
    }
    setLoadingHistory(true);
    try {
      const res = await fetch(`${API_URL}/pews/pews-history/${pid}?limit=20`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error("History fetch error:", err);
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchHistory(selectedPatient);
    }
  }, [selectedPatient, fetchHistory]);

  // ─── Handle patient selection ───
  const handlePatientChange = (e) => {
    const pid = e.target.value;
    setSelectedPatient(pid);
    const found = patients.find((p) => p.id === pid);
    setPatientName(found ? found.name : "");
    setResult(null);
  };

  // ─── Load sample vitals ───
  const loadSampleVitals = (preset) => {
    switch (preset) {
      case "normal":
        setHeartRate("72");
        setSystolicBP("120");
        setDiastolicBP("80");
        setTemperature("36.8");
        setRespiratoryRate("16");
        setOxygenSaturation("98");
        break;
      case "moderate":
        setHeartRate("105");
        setSystolicBP("148");
        setDiastolicBP("92");
        setTemperature("38.2");
        setRespiratoryRate("24");
        setOxygenSaturation("93");
        break;
      case "critical":
        setHeartRate("135");
        setSystolicBP("185");
        setDiastolicBP("110");
        setTemperature("39.5");
        setRespiratoryRate("32");
        setOxygenSaturation("85");
        break;
      default:
        break;
    }
  };

  // ─── Calculate Score ───
  const handleCalculate = async () => {
    if (!selectedPatient) {
      toast({
        title: "Select a patient first",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    if (
      !heartRate ||
      !systolicBP ||
      !diastolicBP ||
      !temperature ||
      !respiratoryRate ||
      !oxygenSaturation
    ) {
      toast({
        title: "All vital signs are required",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/pews/early-warning-score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatient,
          patientName,
          doctorId: "current-doctor",
          doctorName: "Dr. Current",
          heartRate,
          systolicBP,
          diastolicBP,
          temperature,
          respiratoryRate,
          oxygenSaturation,
          notes,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.msg || "Calculation failed");
      }

      const data = await res.json();
      setResult(data.score);

      // Refresh history
      fetchHistory(selectedPatient);

      // Show toast
      const riskLevel = data.score.riskLevel;
      toast({
        title: `Score: ${data.score.totalScore}/15 — ${riskLevel} Risk`,
        description: data.score.recommendation,
        status:
          riskLevel === "Low"
            ? "success"
            : riskLevel === "Medium"
              ? "warning"
              : "error",
        duration: 5000,
        isClosable: true,
      });

      // Notification if risk changed
      if (data.score.riskChanged) {
        toast({
          title: "Risk Level Changed!",
          description: `Changed from ${data.score.previousRiskLevel} to ${riskLevel}`,
          status: "info",
          duration: 7000,
          isClosable: true,
        });
      }

      // Scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 200);
    } catch (err) {
      toast({
        title: "Calculation Error",
        description: err.message,
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // ─── Export PDF (as printable text report) ───
  const handleExportReport = () => {
    if (!result) return;

    const riskLevel = result.riskLevel;
    const lines = [
      "═══════════════════════════════════════════════════",
      "     PREDICTIVE EARLY WARNING SCORE (PEWS) REPORT",
      "═══════════════════════════════════════════════════",
      "",
      `Patient:        ${patientName}`,
      `Date:           ${new Date(result.timestamp).toLocaleString()}`,
      `Total Score:    ${result.totalScore}/15`,
      `Risk Level:     ${riskLevel}`,
      `Recommendation: ${result.recommendation}`,
      "",
      "─── VITAL SIGNS BREAKDOWN ───",
      "",
    ];

    result.breakdown.forEach((b) => {
      const pad = b.name.padEnd(30);
      lines.push(
        `  ${pad} ${String(b.value).padEnd(8)} ${b.unit.padEnd(14)} Score: ${b.score}/3  (${b.status})`,
      );
    });

    lines.push("");
    lines.push("─── SCORING GUIDE ───");
    lines.push("  0-2:  Low Risk      — Patient stable, routine monitoring");
    lines.push("  3-5:  Medium Risk   — Increased monitoring recommended");
    lines.push("  6-9:  High Risk     — Urgent medical review required");
    lines.push("  10+:  Critical Risk — Immediate intervention needed");
    lines.push("");
    if (notes) {
      lines.push(`Notes: ${notes}`);
      lines.push("");
    }
    if (result.alertGenerated) {
      lines.push("⚠️  ALERT WAS AUTOMATICALLY GENERATED FOR THIS ASSESSMENT");
      lines.push("");
    }
    lines.push("═══════════════════════════════════════════════════");
    lines.push("Generated by MediVault PEWS System");

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PEWS_Report_${patientName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: "Report exported", status: "success", duration: 2000 });
  };

  // ─── Prepare chart data ───
  const chartData = history.map((h) => ({
    date: new Date(h.timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    score: h.totalScore,
    riskLevel: h.riskLevel,
  }));

  return (
    <Box p={{ base: 4, md: 8 }} maxW="1400px" mx="auto">
      {/* ─── Header ─── */}
      <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
        <Box>
          <Heading size="lg" mb={1}>
            Early Warning Score (PEWS)
          </Heading>
          <Text color="gray.500">
            Predictive scoring system for patient risk assessment
          </Text>
        </Box>
        {result && (
          <Button
            leftIcon={<FiDownload />}
            colorScheme="green"
            variant="outline"
            onClick={handleExportReport}
            size="sm"
          >
            Export Report
          </Button>
        )}
      </Flex>

      {/* ─── Patient Selection ─── */}
      <Box
        bg={cardBg}
        p={6}
        borderRadius="xl"
        boxShadow="lg"
        border="1px"
        borderColor={borderColor}
        mb={6}
      >
        <Heading size="sm" mb={4}>
          <HStack>
            <Icon as={FiUser} />
            <Text>Patient Selection</Text>
          </HStack>
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl>
            <FormLabel fontSize="sm">Select Patient</FormLabel>
            {loadingPatients ? (
              <Skeleton height="40px" borderRadius="md" />
            ) : (
              <Select
                placeholder="Choose a patient..."
                value={selectedPatient}
                onChange={handlePatientChange}
                size="lg"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.medicalId ? `(${p.medicalId})` : ""}
                  </option>
                ))}
              </Select>
            )}
          </FormControl>
          <FormControl>
            <FormLabel fontSize="sm">Notes (optional)</FormLabel>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Clinical observations..."
              rows={2}
            />
          </FormControl>
        </SimpleGrid>
      </Box>

      {/* ─── Vital Signs Input ─── */}
      <Box
        bg={cardBg}
        p={6}
        borderRadius="xl"
        boxShadow="lg"
        border="1px"
        borderColor={borderColor}
        mb={6}
      >
        <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={2}>
          <Heading size="sm">
            <HStack>
              <Icon as={FiActivity} />
              <Text>Vital Signs</Text>
            </HStack>
          </Heading>
          <HStack spacing={2} flexWrap="wrap">
            <Text fontSize="xs" color="gray.400">
              Load sample:
            </Text>
            <Button
              size="xs"
              colorScheme="green"
              variant="outline"
              onClick={() => loadSampleVitals("normal")}
            >
              Normal
            </Button>
            <Button
              size="xs"
              colorScheme="yellow"
              variant="outline"
              onClick={() => loadSampleVitals("moderate")}
            >
              Moderate
            </Button>
            <Button
              size="xs"
              colorScheme="red"
              variant="outline"
              onClick={() => loadSampleVitals("critical")}
            >
              Critical
            </Button>
          </HStack>
        </Flex>

        <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4} mb={6}>
          <VitalInput
            label="Heart Rate"
            value={heartRate}
            onChange={setHeartRate}
            unit="bpm"
            min={20}
            max={220}
            icon={FiHeart}
          />
          <VitalInput
            label="Systolic BP"
            value={systolicBP}
            onChange={setSystolicBP}
            unit="mmHg"
            min={40}
            max={250}
            icon={FiActivity}
          />
          <VitalInput
            label="Diastolic BP"
            value={diastolicBP}
            onChange={setDiastolicBP}
            unit="mmHg"
            min={20}
            max={160}
            icon={FiActivity}
          />
          <VitalInput
            label="Temperature"
            value={temperature}
            onChange={setTemperature}
            unit="°C"
            min={30}
            max={44}
            step={0.1}
            icon={FiThermometer}
          />
          <VitalInput
            label="Resp. Rate"
            value={respiratoryRate}
            onChange={setRespiratoryRate}
            unit="/min"
            min={0}
            max={60}
            icon={FiWind}
          />
          <VitalInput
            label="SpO2"
            value={oxygenSaturation}
            onChange={setOxygenSaturation}
            unit="%"
            min={50}
            max={100}
            icon={FiDroplet}
          />
        </SimpleGrid>

        <Button
          colorScheme="blue"
          size="lg"
          w="full"
          onClick={handleCalculate}
          isLoading={loading}
          loadingText="Calculating..."
          leftIcon={<FiActivity />}
        >
          Calculate Early Warning Score
        </Button>
      </Box>

      {/* ─── Result Display ─── */}
      {result && (
        <Box ref={resultRef}>
          {/* Score summary card */}
          <Box
            bg={RISK_COLORS[result.riskLevel]?.bg || "gray.50"}
            p={6}
            borderRadius="xl"
            boxShadow="lg"
            border="2px"
            borderColor={RISK_COLORS[result.riskLevel]?.color || "gray.300"}
            mb={6}
          >
            <Flex
              justify="space-between"
              align="center"
              mb={4}
              wrap="wrap"
              gap={4}
            >
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color="gray.500" fontWeight="medium">
                  TOTAL EARLY WARNING SCORE
                </Text>
                <HStack spacing={4} align="baseline">
                  <Text
                    fontSize="5xl"
                    fontWeight="bold"
                    color={RISK_COLORS[result.riskLevel]?.color}
                  >
                    {result.totalScore}
                  </Text>
                  <Text fontSize="xl" color="gray.500">
                    / 15
                  </Text>
                </HStack>
              </VStack>
              <VStack align="end" spacing={2}>
                <RiskBadge level={result.riskLevel} size="lg" />
                {result.riskChanged && (
                  <Badge colorScheme="purple" variant="subtle" px={2}>
                    Changed from {result.previousRiskLevel}
                  </Badge>
                )}
              </VStack>
            </Flex>

            <Progress
              value={(result.totalScore / 15) * 100}
              colorScheme={RISK_COLORS[result.riskLevel]?.scheme || "gray"}
              size="lg"
              borderRadius="full"
              mb={4}
              hasStripe={result.riskLevel === "Critical"}
              isAnimated={result.riskLevel === "Critical"}
            />

            <Alert
              status={
                result.riskLevel === "Low"
                  ? "success"
                  : result.riskLevel === "Medium"
                    ? "warning"
                    : "error"
              }
              borderRadius="lg"
              variant="left-accent"
            >
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">{result.recommendation}</Text>
                {result.alertGenerated && (
                  <Text fontSize="sm" mt={1}>
                    An automatic alert has been generated and sent to the
                    attending physician.
                  </Text>
                )}
              </Box>
            </Alert>
          </Box>

          {/* Vital signs breakdown table */}
          <Box
            bg={cardBg}
            p={6}
            borderRadius="xl"
            boxShadow="lg"
            border="1px"
            borderColor={borderColor}
            mb={6}
          >
            <Heading size="sm" mb={4}>
              Vital Signs Breakdown
            </Heading>
            <Box overflowX="auto">
              <Table variant="simple" size="md">
                <Thead>
                  <Tr>
                    <Th>Vital Sign</Th>
                    <Th isNumeric>Value</Th>
                    <Th>Status</Th>
                    <Th isNumeric>Score</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {result.breakdown.map((item) => (
                    <VitalBreakdownRow key={item.name} item={item} />
                  ))}
                </Tbody>
              </Table>
            </Box>

            {/* Visual indicators per vital */}
            <SimpleGrid columns={{ base: 2, md: 5 }} spacing={3} mt={6}>
              {result.breakdown.map((item) => {
                const VIcon = VITAL_ICONS[item.name] || FiActivity;
                const colorScheme = STATUS_COLORS[item.status] || "gray";
                return (
                  <Box
                    key={item.name}
                    p={3}
                    borderRadius="lg"
                    bg={`${colorScheme}.50`}
                    border="1px"
                    borderColor={`${colorScheme}.200`}
                    textAlign="center"
                  >
                    <Icon
                      as={VIcon}
                      w={5}
                      h={5}
                      color={`${colorScheme}.500`}
                      mb={1}
                    />
                    <Text
                      fontSize="xs"
                      fontWeight="medium"
                      color="gray.600"
                      noOfLines={1}
                    >
                      {item.name.replace(" (Systolic)", "")}
                    </Text>
                    <Text
                      fontSize="lg"
                      fontWeight="bold"
                      color={`${colorScheme}.700`}
                    >
                      {item.value}
                    </Text>
                    <Badge colorScheme={colorScheme} size="sm">
                      {item.status}
                    </Badge>
                  </Box>
                );
              })}
            </SimpleGrid>
          </Box>
        </Box>
      )}

      {/* ─── Trend History ─── */}
      {selectedPatient && (
        <Box
          bg={cardBg}
          p={6}
          borderRadius="xl"
          boxShadow="lg"
          border="1px"
          borderColor={borderColor}
          mb={6}
        >
          <Flex justify="space-between" align="center" mb={2}>
            <Heading size="sm">
              <HStack>
                <Icon as={FiTrendingUp} />
                <Text>Score Trend History</Text>
                {history.length > 0 && (
                  <Badge colorScheme="blue" variant="subtle">
                    {history.length} records
                  </Badge>
                )}
              </HStack>
            </Heading>
            <HStack>
              <IconButton
                icon={<FiRefreshCw />}
                size="sm"
                variant="ghost"
                aria-label="Refresh history"
                onClick={() => fetchHistory(selectedPatient)}
                isLoading={loadingHistory}
              />
              <Button
                size="sm"
                variant="ghost"
                rightIcon={historyOpen ? <FiChevronUp /> : <FiChevronDown />}
                onClick={toggleHistory}
              >
                {historyOpen ? "Hide" : "Show"} Details
              </Button>
            </HStack>
          </Flex>

          {loadingHistory ? (
            <Skeleton height="300px" borderRadius="lg" />
          ) : history.length === 0 ? (
            <Alert status="info" borderRadius="lg">
              <AlertIcon />
              No history yet. Calculate the first score above.
            </Alert>
          ) : (
            <>
              {/* Line chart */}
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient
                      id="pewsGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 15]} tick={{ fontSize: 12 }} />
                  <RTooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                    formatter={(value, name) => [
                      `${value}/15`,
                      name === "score" ? "PEWS Score" : name,
                    ]}
                  />
                  <Legend />
                  {/* Risk zone reference lines */}
                  <ReferenceLine
                    y={3}
                    stroke="#eab308"
                    strokeDasharray="4 4"
                    label={{ value: "Medium", position: "right", fontSize: 10 }}
                  />
                  <ReferenceLine
                    y={6}
                    stroke="#f97316"
                    strokeDasharray="4 4"
                    label={{ value: "High", position: "right", fontSize: 10 }}
                  />
                  <ReferenceLine
                    y={10}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    label={{
                      value: "Critical",
                      position: "right",
                      fontSize: 10,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    name="PEWS Score"
                    stroke="#6366f1"
                    fill="url(#pewsGradient)"
                    strokeWidth={2}
                    dot={{ r: 5, fill: "#6366f1" }}
                    activeDot={{ r: 7 }}
                  />
                </AreaChart>
              </ResponsiveContainer>

              {/* Collapsible history table */}
              <Collapse in={historyOpen} animateOpacity>
                <Box mt={4} overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Date</Th>
                        <Th isNumeric>Score</Th>
                        <Th>Risk</Th>
                        <Th>HR</Th>
                        <Th>BP</Th>
                        <Th>Temp</Th>
                        <Th>RR</Th>
                        <Th>SpO2</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {history
                        .slice()
                        .reverse()
                        .map((h) => (
                          <Tr key={h._id}>
                            <Td>
                              <HStack spacing={1}>
                                <Icon
                                  as={FiClock}
                                  color="gray.400"
                                  boxSize={3}
                                />
                                <Text fontSize="sm">
                                  {new Date(h.timestamp).toLocaleDateString()}{" "}
                                  {new Date(h.timestamp).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </Text>
                              </HStack>
                            </Td>
                            <Td isNumeric fontWeight="bold">
                              {h.totalScore}/15
                            </Td>
                            <Td>
                              <RiskBadge level={h.riskLevel} size="sm" />
                            </Td>
                            <Td>{h.vitals.heartRate} bpm</Td>
                            <Td>
                              {h.vitals.systolicBP}/{h.vitals.diastolicBP}
                            </Td>
                            <Td>{h.vitals.temperature}°C</Td>
                            <Td>{h.vitals.respiratoryRate}/min</Td>
                            <Td>{h.vitals.oxygenSaturation}%</Td>
                          </Tr>
                        ))}
                    </Tbody>
                  </Table>
                </Box>
              </Collapse>
            </>
          )}
        </Box>
      )}

      {/* ─── Scoring Reference ─── */}
      <Box
        bg={cardBg}
        p={6}
        borderRadius="xl"
        boxShadow="lg"
        border="1px"
        borderColor={borderColor}
      >
        <Heading size="sm" mb={4}>
          Scoring Reference
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          {[
            {
              level: "Low",
              range: "0–2",
              desc: "Patient stable, routine monitoring",
            },
            {
              level: "Medium",
              range: "3–5",
              desc: "Increased monitoring recommended",
            },
            {
              level: "High",
              range: "6–9",
              desc: "Urgent medical review required",
            },
            {
              level: "Critical",
              range: "10–15",
              desc: "Immediate intervention needed",
            },
          ].map((item) => (
            <Box
              key={item.level}
              p={4}
              borderRadius="lg"
              bg={RISK_COLORS[item.level].bg}
              border="1px"
              borderColor={RISK_COLORS[item.level].color}
            >
              <HStack justify="space-between" mb={2}>
                <Badge
                  colorScheme={RISK_COLORS[item.level].scheme}
                  variant="solid"
                >
                  {item.level}
                </Badge>
                <Text fontWeight="bold" color={RISK_COLORS[item.level].color}>
                  {item.range}
                </Text>
              </HStack>
              <Text fontSize="sm" color="gray.600">
                {item.desc}
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default EarlyWarningScore;
