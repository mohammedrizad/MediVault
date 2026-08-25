import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

// Landing and login pages
import LandingPage from "./pages/LandingPage";
import PatientLogin from "./pages/PatientLogin";
import PatientCombinedLogin from "./pages/PatientCombinedLogin";
import DoctorLogin from "./pages/DoctorLogin";
import NurseLogin from "./pages/NurseLogin";
import AdminLogin from "./pages/AdminLogin";
import ScanCenterLogin from "./pages/ScanCenterLogin";
import EmergencyAccess from "./pages/EmergencyAccess"; // 🆕 Emergency Access Page

// Dashboard pages
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import NurseDashboard from "./pages/NurseDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ScanCenterDashboard from "./pages/ScanCenterDashboard";
import Profile from "./pages/Profile";
import DoctorSearch from "./pages/DoctorSearch";

// Patient Portal pages
import PatientHistory from "./pages/PatientHistory";
import PatientAppointments from "./pages/PatientAppointments";
import PatientHealthMonitoring from "./pages/PatientHealthMonitoring";
import PatientProfile from "./pages/PatientProfile";
import PatientScanCenter from "./pages/PatientScanCenter";
import ReportSimplifier from "./pages/ReportSimplifier";
import AccessManager from "./pages/AccessManager";
import AccessTimeline from "./pages/AccessTimeline";
import FeatureTestPage from "./pages/FeatureTestPage";
import AIFeaturesPage from "./pages/AIFeaturesPage";
import TestAdminForms from "./pages/TestAdminForms";

// Doctor Portal pages
import MyPatients from "./pages/MyPatients";
import MedicalRecords from "./pages/MedicalRecords";
import DoctorAppointments from "./pages/DoctorAppointments";
import DoctorConsultations from "./pages/DoctorConsultations";
import MedicalSummaryReport from "./pages/MedicalSummaryReport";
import DoctorProfile from "./pages/DoctorProfile";
import AlertDashboard from "./pages/AlertDashboard";
import EarlyWarningScore from "./pages/EarlyWarningScore";
import DoctorEmergencyOverride from "./pages/DoctorEmergencyOverride";
import DoctorPatientDetails from "./pages/DoctorPatientDetails";

// Admin Management pages
import ManageDoctors from "./pages/ManageDoctors";
import ManageNurses from "./pages/ManageNurses";
import ManagePatients from "./pages/ManagePatients";
import ManageScanCenters from "./pages/ManageScanCenters";
import HospitalSettings from "./pages/HospitalSettings";
import SystemAudit from "./pages/SystemAudit";
import UserManagement from "./pages/UserManagement";
import CrossHospitalAccess from "./pages/CrossHospitalAccess";
import AdminManagement from "./pages/AdminManagement";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import AddPatient from "./pages/AddPatient";
import AddDoctor from "./pages/AddDoctor";
import AddNurse from "./pages/AddNurse";
import AddScanCenter from "./pages/AddScanCenter";

// Nurse Portal pages
import NurseAppointments from "./pages/NurseAppointments";
import NurseHealthRecords from "./pages/NurseHealthRecords";
import NurseMedication from "./pages/NurseMedication";
import NursePatientCare from "./pages/NursePatientCare";

// Scan Center Portal pages
import ScanCenterSchedule from "./pages/ScanCenterSchedule";
import ScanCenterEquipment from "./pages/ScanCenterEquipment";
import ScanCenterUpload from "./pages/ScanCenterUpload";
import ScanCenterReports from "./pages/ScanCenterReports";
import ScanCenterAnalytics from "./pages/ScanCenterAnalytics";
import ScanCenterSettings from "./pages/ScanCenterSettings";
import ScanCenterImageAnalysis from "./pages/ScanCenterImageAnalysis";

// AI Image Analysis pages
import DoctorImageAnalysis from "./pages/DoctorImageAnalysis";
import NurseImageAnalysis from "./pages/NurseImageAnalysis";
import PatientImageAnalysis from "./pages/PatientImageAnalysis";
import AdminImageAnalysis from "./pages/AdminImageAnalysis";
import XRayAnalyzer from "./pages/XRayAnalyzer";

// Layout components
import PatientLayout from "./layouts/PatientLayout";
import DoctorLayout from "./layouts/DoctorLayout";
import NurseLayout from "./layouts/NurseLayout";
import AdminLayout from "./layouts/AdminLayout";
import ScanCenterLayout from "./layouts/ScanCenterLayout";

// Auth context and protected routes
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Chakra UI theme
const theme = extendTheme({
  config: { initialColorMode: "light", useSystemColorMode: false },
  colors: {
    brand: { 50: "#f0f9ff", 500: "#0ea5e9", 900: "#0c4a6e" },
  },
  fonts: { heading: "Inter, sans-serif", body: "Inter, sans-serif" },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              {/* Landing Page */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/test-features" element={<FeatureTestPage />} />
              <Route path="/ai-suite" element={<AIFeaturesPage />} />
              <Route path="/test-admin" element={<TestAdminForms />} />

              {/* 🆕 X-Ray Analyzer - Public Access */}
              <Route path="/xray-analyzer" element={<XRayAnalyzer />} />

              {/* Patient Portal */}
              <Route path="/patient/login" element={<PatientLogin />} />
              <Route
                path="/patient-combined-login"
                element={<PatientCombinedLogin />}
              />
              <Route
                path="/patient/*"
                element={
                  <ProtectedRoute requiredRole="patient">
                    <PatientLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<PatientDashboard />} />
                <Route path="history" element={<PatientHistory />} />
                <Route path="appointments" element={<PatientAppointments />} />
                <Route
                  path="monitoring"
                  element={<PatientHealthMonitoring />}
                />
                <Route path="scancenter" element={<PatientScanCenter />} />
                <Route
                  path="image-analysis"
                  element={<PatientImageAnalysis />}
                />
                <Route
                  path="report-simplifier"
                  element={<ReportSimplifier />}
                />
                <Route path="access-manager" element={<AccessManager />} />
                <Route path="access-timeline" element={<AccessTimeline />} />
                <Route path="profile" element={<PatientProfile />} />
              </Route>

              {/* Doctor Portal */}
              <Route path="/doctor/login" element={<DoctorLogin />} />

              {/* 🆕 Public Emergency Access Route */}
              <Route
                path="/emergency-access/:medicalId"
                element={<EmergencyAccess />}
              />

              <Route
                path="/doctor/*"
                element={
                  <ProtectedRoute requiredRole="doctor">
                    <DoctorLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<DoctorDashboard />} />
                <Route path="search" element={<DoctorSearch />} />
                <Route
                  path="emergency-override"
                  element={<DoctorEmergencyOverride />}
                />
                <Route path="patients" element={<MyPatients />} />
                <Route path="records" element={<MedicalRecords />} />
                <Route path="appointments" element={<DoctorAppointments />} />
                <Route path="consultations" element={<DoctorConsultations />} />
                <Route
                  path="image-analysis"
                  element={<DoctorImageAnalysis />}
                />
                <Route
                  path="medical-summary"
                  element={<MedicalSummaryReport />}
                />
                <Route path="patient/:id" element={<DoctorPatientDetails />} />
                <Route path="profile" element={<DoctorProfile />} />
                <Route path="alerts" element={<AlertDashboard />} />
                <Route path="early-warning" element={<EarlyWarningScore />} />
              </Route>

              {/* Nurse Portal */}
              <Route path="/nurse/login" element={<NurseLogin />} />
              <Route
                path="/nurse/*"
                element={
                  <ProtectedRoute requiredRole="nurse">
                    <NurseLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<NurseDashboard />} />
                <Route path="patients" element={<NursePatientCare />} />
                <Route path="appointments" element={<NurseAppointments />} />
                <Route path="records" element={<NurseHealthRecords />} />
                <Route path="image-analysis" element={<NurseImageAnalysis />} />
                <Route path="medication" element={<NurseMedication />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              {/* Admin Portal */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="management" element={<AdminManagement />} />
                <Route path="doctors" element={<ManageDoctors />} />
                <Route path="nurses" element={<ManageNurses />} />
                <Route path="patients" element={<ManagePatients />} />
                <Route path="scancenters" element={<ManageScanCenters />} />
                <Route path="add-patient" element={<AddPatient />} />
                <Route path="add-doctor" element={<AddDoctor />} />
                <Route path="add-nurse" element={<AddNurse />} />
                <Route path="add-scancenter" element={<AddScanCenter />} />
                <Route path="settings" element={<HospitalSettings />} />
                <Route
                  path="cross-hospital"
                  element={<CrossHospitalAccess />}
                />
                <Route path="users" element={<UserManagement />} />
                <Route path="audit" element={<SystemAudit />} />
                <Route path="image-analysis" element={<AdminImageAnalysis />} />
                <Route path="analytics" element={<AnalyticsDashboard />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              {/* Scan Center Portal */}
              <Route path="/scancenter/login" element={<ScanCenterLogin />} />
              <Route
                path="/scancenter/*"
                element={
                  <ProtectedRoute requiredRole="scancenter">
                    <ScanCenterLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<ScanCenterDashboard />} />
                <Route path="schedule" element={<ScanCenterSchedule />} />
                <Route path="equipment" element={<ScanCenterEquipment />} />
                <Route path="upload" element={<ScanCenterUpload />} />
                <Route path="reports" element={<ScanCenterReports />} />
                <Route path="analytics" element={<ScanCenterAnalytics />} />
                <Route
                  path="image-analysis"
                  element={<ScanCenterImageAnalysis />}
                />
                <Route path="settings" element={<ScanCenterSettings />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              {/* Fallbacks */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
