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
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  LineChart,
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "@chakra-ui/react";
import {
  FiActivity,
  FiHeart,
  FiThermometer,
  FiTrendingUp,
  FiTrendingDown,
  FiPlus,
  FiCalendar,
} from "react-icons/fi";

const PatientHealthMonitoring = () => {
  const toast = useToast();
  const [healthData, setHealthData] = useState({});
  const [loading, setLoading] = useState(true);

  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    // Simulate loading health data
    setTimeout(() => {
      setHealthData({
        vitals: {
          heartRate: { current: 72, status: "normal", trend: "stable" },
          bloodPressure: { current: "120/80", status: "normal", trend: "down" },
          temperature: { current: 98.6, status: "normal", trend: "stable" },
          weight: { current: 150, status: "normal", trend: "down" },
        },
        metrics: {
          steps: 8500,
          calories: 2100,
          sleep: 7.5,
          water: 6,
        },
        goals: {
          steps: 10000,
          calories: 2200,
          sleep: 8,
          water: 8,
        },
        chartData: [
          { date: "Mon", heartRate: 70, steps: 8000 },
          { date: "Tue", heartRate: 68, steps: 8500 },
          { date: "Wed", heartRate: 72, steps: 9200 },
          { date: "Thu", heartRate: 75, steps: 7800 },
          { date: "Fri", heartRate: 71, steps: 8500 },
          { date: "Sat", heartRate: 69, steps: 9800 },
          { date: "Sun", heartRate: 72, steps: 8500 },
        ],
      });
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "normal":
        return "green";
      case "warning":
        return "yellow";
      case "critical":
        return "red";
      default:
        return "gray";
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return FiTrendingUp;
      case "down":
        return FiTrendingDown;
      default:
        return FiActivity;
    }
  };

  const calculateProgress = (current, goal) => {
    return Math.min((current / goal) * 100, 100);
  };

  if (loading) {
    return (
      <Box p={6}>
        <Alert status="info">
          <AlertIcon />
          Loading health monitoring data...
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack>
          <Icon as={FiActivity} boxSize={8} color="blue.500" />
          <VStack align="start" spacing={1}>
            <Heading size="lg">Health Monitoring</Heading>
            <Text color="gray.600">
              Track your vital signs and health metrics
            </Text>
          </VStack>
          <Spacer />
          <Button leftIcon={<FiPlus />} colorScheme="blue">
            Add Reading
          </Button>
        </HStack>

        {/* Vital Signs */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Current Vital Signs</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
              <Stat>
                <HStack mb={2}>
                  <Icon as={FiHeart} color="red.500" />
                  <StatLabel>Heart Rate</StatLabel>
                </HStack>
                <StatNumber>
                  {healthData.vitals.heartRate.current} bpm
                </StatNumber>
                <StatHelpText>
                  <StatArrow
                    type={
                      healthData.vitals.heartRate.trend === "up"
                        ? "increase"
                        : "decrease"
                    }
                  />
                  <Badge
                    colorScheme={getStatusColor(
                      healthData.vitals.heartRate.status
                    )}
                  >
                    {healthData.vitals.heartRate.status}
                  </Badge>
                </StatHelpText>
              </Stat>

              <Stat>
                <HStack mb={2}>
                  <Icon as={FiActivity} color="blue.500" />
                  <StatLabel>Blood Pressure</StatLabel>
                </HStack>
                <StatNumber>
                  {healthData.vitals.bloodPressure.current} mmHg
                </StatNumber>
                <StatHelpText>
                  <StatArrow
                    type={
                      healthData.vitals.bloodPressure.trend === "up"
                        ? "increase"
                        : "decrease"
                    }
                  />
                  <Badge
                    colorScheme={getStatusColor(
                      healthData.vitals.bloodPressure.status
                    )}
                  >
                    {healthData.vitals.bloodPressure.status}
                  </Badge>
                </StatHelpText>
              </Stat>

              <Stat>
                <HStack mb={2}>
                  <Icon as={FiThermometer} color="orange.500" />
                  <StatLabel>Temperature</StatLabel>
                </HStack>
                <StatNumber>
                  {healthData.vitals.temperature.current}°F
                </StatNumber>
                <StatHelpText>
                  <Badge
                    colorScheme={getStatusColor(
                      healthData.vitals.temperature.status
                    )}
                  >
                    {healthData.vitals.temperature.status}
                  </Badge>
                </StatHelpText>
              </Stat>

              <Stat>
                <HStack mb={2}>
                  <Icon as={FiTrendingUp} color="purple.500" />
                  <StatLabel>Weight</StatLabel>
                </HStack>
                <StatNumber>{healthData.vitals.weight.current} lbs</StatNumber>
                <StatHelpText>
                  <StatArrow
                    type={
                      healthData.vitals.weight.trend === "up"
                        ? "increase"
                        : "decrease"
                    }
                  />
                  <Badge
                    colorScheme={getStatusColor(
                      healthData.vitals.weight.status
                    )}
                  >
                    {healthData.vitals.weight.status}
                  </Badge>
                </StatHelpText>
              </Stat>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Daily Goals Progress */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Daily Goals Progress</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <VStack align="stretch" spacing={4}>
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="medium">Steps</Text>
                    <Text fontSize="sm" color="gray.600">
                      {healthData.metrics.steps} / {healthData.goals.steps}
                    </Text>
                  </HStack>
                  <Progress
                    value={calculateProgress(
                      healthData.metrics.steps,
                      healthData.goals.steps
                    )}
                    colorScheme="blue"
                    size="lg"
                    borderRadius="full"
                  />
                </Box>

                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="medium">Calories Burned</Text>
                    <Text fontSize="sm" color="gray.600">
                      {healthData.metrics.calories} /{" "}
                      {healthData.goals.calories}
                    </Text>
                  </HStack>
                  <Progress
                    value={calculateProgress(
                      healthData.metrics.calories,
                      healthData.goals.calories
                    )}
                    colorScheme="orange"
                    size="lg"
                    borderRadius="full"
                  />
                </Box>
              </VStack>

              <VStack align="stretch" spacing={4}>
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="medium">Sleep Hours</Text>
                    <Text fontSize="sm" color="gray.600">
                      {healthData.metrics.sleep} / {healthData.goals.sleep} hrs
                    </Text>
                  </HStack>
                  <Progress
                    value={calculateProgress(
                      healthData.metrics.sleep,
                      healthData.goals.sleep
                    )}
                    colorScheme="purple"
                    size="lg"
                    borderRadius="full"
                  />
                </Box>

                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="medium">Water Intake</Text>
                    <Text fontSize="sm" color="gray.600">
                      {healthData.metrics.water} / {healthData.goals.water}{" "}
                      glasses
                    </Text>
                  </HStack>
                  <Progress
                    value={calculateProgress(
                      healthData.metrics.water,
                      healthData.goals.water
                    )}
                    colorScheme="cyan"
                    size="lg"
                    borderRadius="full"
                  />
                </Box>
              </VStack>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Health Trends */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <Card bg={cardBg} borderColor={borderColor}>
            <CardHeader>
              <Heading size="md">Weekly Heart Rate</Heading>
            </CardHeader>
            <CardBody>
              <Box h="300px">
                <Text fontSize="sm" color="gray.600" mb={4}>
                  Heart rate trend over the past week
                </Text>
                <SimpleGrid columns={7} spacing={2} textAlign="center">
                  {healthData.chartData.map((day, index) => (
                    <VStack key={index}>
                      <Text fontSize="xs" color="gray.500">
                        {day.date}
                      </Text>
                      <Box
                        h={`${(day.heartRate / 100) * 150}px`}
                        bg="red.400"
                        borderRadius="md"
                        minH="20px"
                      />
                      <Text fontSize="xs" fontWeight="medium">
                        {day.heartRate}
                      </Text>
                    </VStack>
                  ))}
                </SimpleGrid>
              </Box>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor}>
            <CardHeader>
              <Heading size="md">Weekly Steps</Heading>
            </CardHeader>
            <CardBody>
              <Box h="300px">
                <Text fontSize="sm" color="gray.600" mb={4}>
                  Daily steps over the past week
                </Text>
                <SimpleGrid columns={7} spacing={2} textAlign="center">
                  {healthData.chartData.map((day, index) => (
                    <VStack key={index}>
                      <Text fontSize="xs" color="gray.500">
                        {day.date}
                      </Text>
                      <Box
                        h={`${(day.steps / 12000) * 150}px`}
                        bg="blue.400"
                        borderRadius="md"
                        minH="20px"
                      />
                      <Text fontSize="xs" fontWeight="medium">
                        {(day.steps / 1000).toFixed(1)}k
                      </Text>
                    </VStack>
                  ))}
                </SimpleGrid>
              </Box>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Health Reminders */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Health Reminders</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              <Alert status="info" borderRadius="lg">
                <AlertIcon />
                <Box>
                  <Text fontWeight="medium">Medication Reminder</Text>
                  <Text fontSize="sm">Take your daily vitamin at 8:00 PM</Text>
                </Box>
              </Alert>

              <Alert status="warning" borderRadius="lg">
                <AlertIcon />
                <Box>
                  <Text fontWeight="medium">Water Intake</Text>
                  <Text fontSize="sm">
                    You're behind on your daily water goal. Drink 2 more
                    glasses!
                  </Text>
                </Box>
              </Alert>

              <Alert status="success" borderRadius="lg">
                <AlertIcon />
                <Box>
                  <Text fontWeight="medium">Great Job!</Text>
                  <Text fontSize="sm">
                    You've been consistently meeting your step goals this week.
                  </Text>
                </Box>
              </Alert>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default PatientHealthMonitoring;
