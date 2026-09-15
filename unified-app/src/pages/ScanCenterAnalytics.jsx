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
  StatHelpText,
  StatArrow,
  Icon,
  Select,
  useColorModeValue,
  useToast,
  Progress,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
} from "@chakra-ui/react";
import {
  FiBarChart,
  FiTrendingUp,
  FiTrendingDown,
  FiCalendar,
  FiUsers,
  FiActivity,
  FiClock,
  FiCamera,
  FiTarget,
} from "react-icons/fi";

const ScanCenterAnalytics = () => {
  const [timeFilter, setTimeFilter] = useState("month");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Sample analytics data
  const performanceMetrics = [
    {
      label: "Total Scans",
      value: 1247,
      change: 12.5,
      trend: "up",
      color: "blue.500",
      period: "This Month",
    },
    {
      label: "Patient Satisfaction",
      value: "94.8%",
      change: 2.1,
      trend: "up",
      color: "green.500",
      period: "Average Rating",
    },
    {
      label: "Equipment Utilization",
      value: "78.3%",
      change: -3.2,
      trend: "down",
      color: "orange.500",
      period: "Overall Average",
    },
    {
      label: "Report Turnaround",
      value: "2.4hrs",
      change: -15.3,
      trend: "up",
      color: "purple.500",
      period: "Average Time",
    },
  ];

  const scanTypeData = [
    { type: "MRI", count: 342, percentage: 27.4, color: "blue.500" },
    { type: "CT Scan", count: 298, percentage: 23.9, color: "green.500" },
    { type: "X-Ray", count: 287, percentage: 23.0, color: "orange.500" },
    { type: "Ultrasound", count: 198, percentage: 15.9, color: "purple.500" },
    { type: "Mammography", count: 89, percentage: 7.1, color: "pink.500" },
    { type: "Nuclear Medicine", count: 33, percentage: 2.6, color: "teal.500" },
  ];

  const equipmentPerformance = [
    {
      name: "MRI Machine 1",
      utilization: 85,
      scans: 156,
      downtime: "2.1hrs",
      efficiency: 92,
      status: "Excellent",
    },
    {
      name: "CT Scanner 1",
      utilization: 78,
      scans: 189,
      downtime: "1.5hrs",
      efficiency: 88,
      status: "Good",
    },
    {
      name: "X-Ray Room 1",
      utilization: 91,
      scans: 143,
      downtime: "0.8hrs",
      efficiency: 95,
      status: "Excellent",
    },
    {
      name: "Ultrasound Room 1",
      utilization: 73,
      scans: 98,
      downtime: "3.2hrs",
      efficiency: 82,
      status: "Fair",
    },
    {
      name: "MRI Machine 2",
      utilization: 45,
      scans: 67,
      downtime: "8.5hrs",
      efficiency: 68,
      status: "Needs Attention",
    },
  ];

  const monthlyTrends = [
    { month: "Jan", scans: 1150, revenue: 287500, satisfaction: 93.2 },
    { month: "Feb", scans: 1089, revenue: 272250, satisfaction: 94.1 },
    { month: "Mar", scans: 1234, revenue: 308500, satisfaction: 93.8 },
    { month: "Apr", scans: 1187, revenue: 296750, satisfaction: 94.5 },
    { month: "May", scans: 1298, revenue: 324500, satisfaction: 94.2 },
    { month: "Jun", scans: 1356, revenue: 339000, satisfaction: 95.1 },
    { month: "Jul", scans: 1289, revenue: 322250, satisfaction: 94.7 },
    { month: "Aug", scans: 1234, revenue: 308500, satisfaction: 94.3 },
    { month: "Sep", scans: 1178, revenue: 294500, satisfaction: 94.9 },
    { month: "Oct", scans: 1267, revenue: 316750, satisfaction: 94.6 },
    { month: "Nov", scans: 1247, revenue: 311750, satisfaction: 94.8 },
  ];

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 90) return "green";
    if (efficiency >= 80) return "blue";
    if (efficiency >= 70) return "orange";
    return "red";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Excellent":
        return "green";
      case "Good":
        return "blue";
      case "Fair":
        return "orange";
      case "Needs Attention":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={2}>
          Analytics Dashboard
        </Text>
        <Text color="gray.600">
          Performance metrics, trends, and insights for scan center operations
        </Text>
      </Box>

      {/* Filters */}
      <Card>
        <CardBody>
          <HStack spacing={4} wrap="wrap">
            <HStack>
              <Text fontWeight="medium">Time Period:</Text>
              <Select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                maxW="150px"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </Select>
            </HStack>

            <HStack>
              <Text fontWeight="medium">Department:</Text>
              <Select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                maxW="150px"
              >
                <option value="all">All Departments</option>
                <option value="radiology">Radiology</option>
                <option value="cardiology">Cardiology</option>
                <option value="neurology">Neurology</option>
              </Select>
            </HStack>

            <Button
              colorScheme="teal"
              leftIcon={<FiBarChart />}
              onClick={() =>
                toast({
                  title: "Report Exported",
                  description: `Analytics report for ${timeFilter === "week" ? "this week" : timeFilter === "month" ? "this month" : timeFilter === "quarter" ? "this quarter" : "this year"} exported successfully`,
                  status: "success",
                  duration: 2000,
                  isClosable: true,
                })
              }
            >
              Export Report
            </Button>
          </HStack>
        </CardBody>
      </Card>

      {/* Key Performance Metrics */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        {performanceMetrics.map((metric, index) => (
          <Card key={index}>
            <CardBody>
              <Stat>
                <StatLabel>{metric.label}</StatLabel>
                <StatNumber color={metric.color}>{metric.value}</StatNumber>
                <StatHelpText>
                  <StatArrow type={metric.trend} />
                  {Math.abs(metric.change)}%{" "}
                  {metric.trend === "up" ? "increase" : "decrease"}
                </StatHelpText>
                <Text fontSize="xs" color="gray.500">
                  {metric.period}
                </Text>
              </Stat>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      <Tabs>
        <TabList>
          <Tab>Scan Types</Tab>
          <Tab>Equipment Performance</Tab>
          <Tab>Monthly Trends</Tab>
          <Tab>Productivity</Tab>
        </TabList>

        <TabPanels>
          {/* Scan Types Analysis */}
          <TabPanel>
            <Card>
              <CardHeader>
                <Text fontSize="lg" fontWeight="semibold">
                  Scan Distribution by Type
                </Text>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {scanTypeData.map((scan, index) => (
                    <Box key={index}>
                      <HStack justify="space-between" mb={2}>
                        <HStack>
                          <Box w={4} h={4} bg={scan.color} borderRadius="sm" />
                          <Text fontWeight="medium">{scan.type}</Text>
                        </HStack>
                        <VStack align="end" spacing={0}>
                          <Text fontWeight="bold">{scan.count}</Text>
                          <Text fontSize="sm" color="gray.500">
                            {scan.percentage}%
                          </Text>
                        </VStack>
                      </HStack>
                      <Progress
                        value={scan.percentage}
                        colorScheme={scan.color.split(".")[0]}
                        size="sm"
                      />
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Equipment Performance */}
          <TabPanel>
            <Card>
              <CardHeader>
                <Text fontSize="lg" fontWeight="semibold">
                  Equipment Performance Overview
                </Text>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {equipmentPerformance.map((equipment, index) => (
                    <Card key={index} variant="outline">
                      <CardBody>
                        <HStack justify="space-between" mb={4}>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold">{equipment.name}</Text>
                            <HStack>
                              <Text fontSize="sm" color="gray.500">
                                {equipment.scans} scans this month
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                •
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                {equipment.downtime} downtime
                              </Text>
                            </HStack>
                          </VStack>
                          <Badge colorScheme={getStatusColor(equipment.status)}>
                            {equipment.status}
                          </Badge>
                        </HStack>

                        <SimpleGrid columns={2} spacing={4}>
                          <Box>
                            <Text fontSize="sm" color="gray.600" mb={1}>
                              Utilization
                            </Text>
                            <HStack>
                              <Progress
                                value={equipment.utilization}
                                size="sm"
                                flex={1}
                              />
                              <Text fontSize="sm" fontWeight="medium">
                                {equipment.utilization}%
                              </Text>
                            </HStack>
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="gray.600" mb={1}>
                              Efficiency
                            </Text>
                            <HStack>
                              <Progress
                                value={equipment.efficiency}
                                size="sm"
                                flex={1}
                                colorScheme={getEfficiencyColor(
                                  equipment.efficiency,
                                )}
                              />
                              <Text fontSize="sm" fontWeight="medium">
                                {equipment.efficiency}%
                              </Text>
                            </HStack>
                          </Box>
                        </SimpleGrid>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Monthly Trends */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              <Card>
                <CardHeader>
                  <Text fontSize="lg" fontWeight="semibold">
                    Monthly Scan Volume
                  </Text>
                </CardHeader>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    {monthlyTrends.slice(-6).map((trend, index) => (
                      <HStack key={index} justify="space-between">
                        <Text fontWeight="medium">{trend.month}</Text>
                        <HStack>
                          <Text fontSize="sm" color="gray.500">
                            {trend.scans} scans
                          </Text>
                          <Box w={20}>
                            <Progress
                              value={(trend.scans / 1400) * 100}
                              size="sm"
                              colorScheme="blue"
                            />
                          </Box>
                        </HStack>
                      </HStack>
                    ))}
                  </VStack>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <Text fontSize="lg" fontWeight="semibold">
                    Patient Satisfaction Trends
                  </Text>
                </CardHeader>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    {monthlyTrends.slice(-6).map((trend, index) => (
                      <HStack key={index} justify="space-between">
                        <Text fontWeight="medium">{trend.month}</Text>
                        <HStack>
                          <Text fontSize="sm" color="gray.500">
                            {trend.satisfaction}%
                          </Text>
                          <Box w={20}>
                            <Progress
                              value={trend.satisfaction}
                              size="sm"
                              colorScheme="green"
                            />
                          </Box>
                        </HStack>
                      </HStack>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>

          {/* Productivity Metrics */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              <Card>
                <CardBody textAlign="center">
                  <Icon as={FiUsers} boxSize={12} color="blue.500" mb={4} />
                  <Stat>
                    <StatNumber>42</StatNumber>
                    <StatLabel>Avg Daily Patients</StatLabel>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      8% from last month
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card>
                <CardBody textAlign="center">
                  <Icon as={FiClock} boxSize={12} color="green.500" mb={4} />
                  <Stat>
                    <StatNumber>18 min</StatNumber>
                    <StatLabel>Avg Wait Time</StatLabel>
                    <StatHelpText>
                      <StatArrow type="decrease" />
                      12% improvement
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card>
                <CardBody textAlign="center">
                  <Icon as={FiTarget} boxSize={12} color="purple.500" mb={4} />
                  <Stat>
                    <StatNumber>96.2%</StatNumber>
                    <StatLabel>On-Time Performance</StatLabel>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      3% improvement
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card>
                <CardBody textAlign="center">
                  <Icon
                    as={FiActivity}
                    boxSize={12}
                    color="orange.500"
                    mb={4}
                  />
                  <Stat>
                    <StatNumber>24.5 min</StatNumber>
                    <StatLabel>Avg Scan Duration</StatLabel>
                    <StatHelpText>
                      <StatArrow type="decrease" />
                      5% faster
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card>
                <CardBody textAlign="center">
                  <Icon as={FiBarChart} boxSize={12} color="teal.500" mb={4} />
                  <Stat>
                    <StatNumber>$311.7K</StatNumber>
                    <StatLabel>Monthly Revenue</StatLabel>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      6% increase
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card>
                <CardBody textAlign="center">
                  <Icon
                    as={FiTrendingUp}
                    boxSize={12}
                    color="pink.500"
                    mb={4}
                  />
                  <Stat>
                    <StatNumber>98.1%</StatNumber>
                    <StatLabel>Quality Score</StatLabel>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      1.2% improvement
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};

export default ScanCenterAnalytics;
