import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  VStack,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
} from "@chakra-ui/react";
import DataCard from "../components/common/DataCard";
import EmptyState from "../components/common/EmptyState";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useFetch } from "../hooks/useFetch";
import {
  adminAPI,
  doctorAPI,
  nurseAPI,
  patientAPI,
  scanCenterAPI,
} from "../services/api";

const Dashboard = ({ userRole = "admin" }) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const [hospitalInfo, setHospitalInfo] = useState({});
  const [loadingHospital, setLoadingHospital] = useState(true);

  // Load hospital info from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const hospitalName = localStorage.getItem("HospitalName");
    const hospitalImage = localStorage.getItem("HospitalImage");

    if (token && hospitalName && hospitalImage) {
      setHospitalInfo({ name: hospitalName, image: hospitalImage });
    } else {
      console.warn("No login info found in localStorage");
    }
    setLoadingHospital(false);
  }, []);

  // Select API function for dashboard stats
  const getAPIFunction = (role) => {
    switch (role) {
      case "admin":
        return adminAPI.getDashboardStats;
      case "doctor":
        return doctorAPI.getDashboardStats;
      case "nurse":
        return nurseAPI.getDashboardStats;
      case "patient":
        return patientAPI.getDashboardStats;
      case "scancenter":
        return scanCenterAPI.getDashboardStats;
      default:
        return adminAPI.getDashboardStats;
    }
  };

  // Fetch dashboard stats
  const { data: stats, loading, error } = useFetch(getAPIFunction(userRole));

  const getDashboardContent = (role) => {
    switch (role) {
      case "admin":
        return {
          title: "Admin Dashboard",
          stats: [
            { label: "Total Patients", value: stats?.totalPatients || 0, trend: "+12%" },
            { label: "Active Doctors", value: stats?.activeDoctors || 0, trend: "+5%" },
            { label: "Registered Nurses", value: stats?.totalNurses || 0, trend: "+8%" },
            { label: "Scan Centers", value: stats?.scanCenters || 0, trend: "+2%" },
          ],
        };
      case "doctor":
        return {
          title: "Doctor Dashboard",
          stats: [
            { label: "My Patients", value: stats?.myPatients || 0, trend: "+3%" },
            { label: "Today's Appointments", value: stats?.todayAppointments || 0, trend: "0%" },
            { label: "Pending Reports", value: stats?.pendingReports || 0, trend: "-5%" },
            { label: "Completed Cases", value: stats?.completedCases || 0, trend: "+15%" },
          ],
        };
      case "nurse":
        return {
          title: "Nurse Dashboard",
          stats: [
            { label: "Assigned Patients", value: stats?.assignedPatients || 0, trend: "+7%" },
            { label: "Today's Tasks", value: stats?.todayTasks || 0, trend: "0%" },
            { label: "Vitals Recorded", value: stats?.vitalsRecorded || 0, trend: "+12%" },
            { label: "Shift Hours", value: stats?.shiftHours || 0, trend: "+2%" },
          ],
        };
      case "patient":
        return {
          title: "Patient Dashboard",
          stats: [
            { label: "Upcoming Appointments", value: stats?.upcomingAppointments || 0, trend: "0%" },
            { label: "Medical Records", value: stats?.medicalRecords || 0, trend: "+1%" },
            { label: "Prescriptions", value: stats?.prescriptions || 0, trend: "+2%" },
            { label: "Test Results", value: stats?.testResults || 0, trend: "+3%" },
          ],
        };
      default:
        return { title: "Dashboard", stats: [] };
    }
  };

  const content = getDashboardContent(userRole);

  if (loading || loadingHospital)
    return <LoadingSpinner message="Loading dashboard..." fullPage />;

  if (error)
    return (
      <Container maxW="7xl" py={8}>
        <EmptyState
          title="Unable to load dashboard"
          description="There was an error loading the dashboard data. Please try again."
          variant="data"
        />
      </Container>
    );

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Hospital Info */}
        {hospitalInfo.name && (
          <Box display="flex" alignItems="center" mb={4}>
            <img
              src={hospitalInfo.image}
              alt={hospitalInfo.name}
              style={{ width: 80, height: 80, borderRadius: "50%", marginRight: 16 }}
            />
            <Heading size="md">{hospitalInfo.name}</Heading>
          </Box>
        )}

        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>
            {content.title}
          </Heading>
          <Text color="gray.600">Welcome back! Here's what's happening today.</Text>
        </Box>

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          {content.stats.map((stat, index) => (
            <Box
              key={index}
              bg={bgColor}
              p={6}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <Stat>
                <StatLabel>{stat.label}</StatLabel>
                <StatNumber fontSize="2xl">{stat.value}</StatNumber>
                <StatHelpText
                  color={stat.trend.startsWith("+") ? "green.500" : "red.500"}
                >
                  {stat.trend} from last month
                </StatHelpText>
              </Stat>
            </Box>
          ))}
        </SimpleGrid>

        {/* Recent Activity */}
        <Box>
          <Heading size="md" mb={4}>
            Recent Activity
          </Heading>
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            <DataCard
              title="Latest Updates"
              subtitle="Recent system activity"
              variant="detailed"
              data={{
                "Last Login": new Date().toLocaleDateString(),
                "System Status": "Online",
                "Data Sync": "Up to date",
              }}
            />
            <DataCard title="Quick Actions" subtitle="Commonly used features">
              <VStack spacing={3} align="stretch">
                <Text fontSize="sm" color="gray.600">
                  Your most frequently accessed features will appear here.
                </Text>
              </VStack>
            </DataCard>
          </SimpleGrid>
        </Box>
      </VStack>
    </Container>
  );
};

export default Dashboard;
