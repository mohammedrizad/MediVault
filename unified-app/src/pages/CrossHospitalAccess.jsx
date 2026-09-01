import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Input,
  Textarea,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  useColorModeValue,
  Spinner,
  Divider,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Checkbox,
  CheckboxGroup,
  Stack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tooltip,
  IconButton,
  Flex,
  Tag,
  TagLabel,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import {
  FiGlobe,
  FiSearch,
  FiSend,
  FiCheck,
  FiX,
  FiEye,
  FiDownload,
  FiClock,
  FiShield,
  FiAlertCircle,
  FiRefreshCw,
  FiSlash,
  FiUser,
  FiFileText,
  FiActivity,
  FiArrowRight,
  FiInbox,
  FiExternalLink,
  FiHeart,
} from "react-icons/fi";

const API = "http://localhost:5002/access";

// Connected hospital network data — MediVault side
const medivaultNetworkHospitals = [
  {
    name: "MediVault General Hospital",
    location: "Downtown Medical District, Delhi",
    type: "Primary",
    patients: 1234,
    status: "Connected",
  },
  {
    name: "Apollo Medical Center",
    location: "Saket, Delhi",
    type: "Network Partner",
    patients: 856,
    status: "Connected",
  },
  {
    name: "Fortis Healthcare",
    location: "Gurgaon, Haryana",
    type: "Emergency Partner",
    patients: 542,
    status: "Connected",
  },
  {
    name: "Max Healthcare",
    location: "Patparganj, Delhi",
    type: "Specialist Partner",
    patients: 378,
    status: "Connected",
  },
  {
    name: "AIIMS Delhi",
    location: "Ansari Nagar, Delhi",
    type: "Research Partner",
    patients: 2156,
    status: "Connected",
  },
  {
    name: "Manipal Hospital",
    location: "Dwarka, Delhi",
    type: "Oncology Partner",
    patients: 689,
    status: "Connected",
  },
  {
    name: "Safdarjung Hospital",
    location: "Safdarjung, Delhi",
    type: "Government Partner",
    patients: 0,
    status: "Pending",
  },
  {
    name: "Batra Hospital",
    location: "Tughlakabad, Delhi",
    type: "Network Partner",
    patients: 423,
    status: "Connected",
  },
];

// Connected hospital network data — Ram Hospital side
const ramNetworkHospitals = [
  {
    name: "Ram Hospital (Main)",
    location: "T. Nagar, Chennai",
    type: "Primary Hub",
    patients: 987,
    status: "Connected",
  },
  {
    name: "MediVault Centre Hospital",
    location: "Anna Nagar, Chennai",
    type: "Data Partner",
    patients: 1450,
    status: "Connected",
  },
  {
    name: "Kauvery Hospital",
    location: "Alwarpet, Chennai",
    type: "Cardiac Partner",
    patients: 612,
    status: "Connected",
  },
  {
    name: "MIOT International",
    location: "Manapakkam, Chennai",
    type: "Ortho Partner",
    patients: 445,
    status: "Connected",
  },
  {
    name: "Sri Ramachandra Hospital",
    location: "Porur, Chennai",
    type: "Research Partner",
    patients: 1803,
    status: "Connected",
  },
  {
    name: "Vijaya Hospital",
    location: "Vadapalani, Chennai",
    type: "Emergency Partner",
    patients: 534,
    status: "Connected",
  },
  {
    name: "Stanley Medical College",
    location: "Royapuram, Chennai",
    type: "Government Partner",
    patients: 0,
    status: "Pending",
  },
  {
    name: "Billroth Hospitals",
    location: "Shenoy Nagar, Chennai",
    type: "Network Partner",
    patients: 327,
    status: "Connected",
  },
];

const CrossHospitalAccess = () => {
  const toast = useToast();
  const { currentUser } = useAuth();
  const cardBg = useColorModeValue("white", "gray.800");
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Determine which hospital this admin belongs to
  const myHospital = currentUser?.name || "MediVault Hospital";
  const isMediVault =
    myHospital.toLowerCase().includes("medivault") ||
    myHospital.toLowerCase() === "admin";

  // State
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [viewingData, setViewingData] = useState(null);
  const [viewingRequestId, setViewingRequestId] = useState(null);

  // Request form
  const [requestReason, setRequestReason] = useState("");
  const [requestUrgency, setRequestUrgency] = useState("Normal");
  const [requestCategories, setRequestCategories] = useState([
    "Basic Info",
    "Medical History",
  ]);

  // Modals
  const {
    isOpen: isRequestOpen,
    onOpen: onRequestOpen,
    onClose: onRequestClose,
  } = useDisclosure();
  const {
    isOpen: isDataOpen,
    onOpen: onDataOpen,
    onClose: onDataClose,
  } = useDisclosure();
  const {
    isOpen: isRevokeOpen,
    onOpen: onRevokeOpen,
    onClose: onRevokeClose,
  } = useDisclosure();
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revokeReason, setRevokeReason] = useState("");

  // Verification modal state
  const {
    isOpen: isVerifyOpen,
    onOpen: onVerifyOpen,
    onClose: onVerifyClose,
  } = useDisclosure();
  const [verifyTarget, setVerifyTarget] = useState(null);
  const [verifyData, setVerifyData] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyChecks, setVerifyChecks] = useState({
    identity: false,
    license: false,
    purpose: false,
  });

  // ── Fetch data on mount ──
  useEffect(() => {
    fetchStats();
    fetchRequests();
    const interval = setInterval(() => {
      fetchStats();
      fetchRequests(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [myHospital]);

  const fetchStats = async () => {
    try {
      const res = await fetch(
        `${API}/stats?hospitalName=${encodeURIComponent(myHospital)}`,
      );
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (err) {
      console.error("Stats error:", err);
    }
  };

  const fetchRequests = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetch(
        `${API}/requests?hospitalName=${encodeURIComponent(myHospital)}`,
      );
      const data = await res.json();
      if (data.success) setRequests(data.data);
    } catch (err) {
      console.error("Requests error:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // ── Search patients (Ram Hospital side) ──
  const handleSearch = async () => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      toast({
        title: "Enter at least 2 characters",
        status: "warning",
        duration: 2000,
      });
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `${API}/search-patient?q=${encodeURIComponent(searchQuery.trim())}`,
      );
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.data);
        if (data.data.length === 0) {
          toast({
            title: "No patients found",
            description: "Try a different name or Medical ID",
            status: "info",
            duration: 3000,
          });
        }
      }
    } catch (err) {
      toast({ title: "Search failed", status: "error", duration: 3000 });
    } finally {
      setSearching(false);
    }
  };

  // ── Submit access request (Ram Hospital side) ──
  const handleSubmitRequest = async () => {
    if (!selectedPatient || !requestReason.trim()) {
      toast({
        title: "Missing fields",
        description: "Select a patient and provide a reason",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API}/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestingHospital: myHospital,
          requestingDoctor: currentUser?.username || "Doctor",
          requesterEmail: currentUser?.email,
          patientId: selectedPatient.MedicalId || selectedPatient._id,
          reason: requestReason,
          urgency: requestUrgency,
          dataCategories: requestCategories,
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast({
          title: "Request Submitted!",
          description:
            "Your access request has been sent. You will be notified once approved.",
          status: "success",
          duration: 5000,
        });
        onRequestClose();
        setSelectedPatient(null);
        setRequestReason("");
        setRequestUrgency("Normal");
        setRequestCategories(["Basic Info", "Medical History"]);
        setSearchResults([]);
        setSearchQuery("");
        fetchRequests();
        fetchStats();
      } else {
        toast({
          title: "Request Failed",
          description: data.message,
          status: "error",
          duration: 5000,
        });
      }
    } catch (err) {
      toast({ title: "Error submitting request", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  // ── Open verification modal before approving (MediVault side) ──
  const handleApproveClick = async (req) => {
    setVerifyTarget(req);
    setVerifyChecks({ identity: false, license: false, purpose: false });
    setVerifyData(null);
    setVerifyLoading(true);
    onVerifyOpen();
    try {
      const res = await fetch(
        `${API}/verify-hospital?hospitalName=${encodeURIComponent(req.requestingHospital)}`,
      );
      const data = await res.json();
      if (data.success) {
        setVerifyData(data.data);
      }
    } catch (err) {
      console.error("Verify error:", err);
    } finally {
      setVerifyLoading(false);
    }
  };

  // ── Confirm approval after verification ──
  const handleConfirmApprove = async () => {
    if (!verifyTarget) return;
    try {
      setLoading(true);
      const res = await fetch(`${API}/request/${verifyTarget._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Approved",
          approvedBy: currentUser?.name || "Admin",
          accessDurationHours: 72,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: "Access Approved",
          description:
            "Hospital verified. The requesting hospital can now view patient data for 72 hours.",
          status: "success",
          duration: 4000,
        });
        onVerifyClose();
        setVerifyTarget(null);
        setVerifyData(null);
        fetchRequests();
        fetchStats();
      }
    } catch (err) {
      toast({ title: "Error approving", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  // ── Reject request (MediVault side) ──
  const handleReject = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/request/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Rejected",
          rejectionReason: "Request denied by admin",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: "Request Rejected",
          status: "info",
          duration: 3000,
        });
        fetchRequests();
        fetchStats();
      }
    } catch (err) {
      toast({ title: "Error rejecting", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  // ── Revoke access (MediVault side) ──
  const handleRevoke = async () => {
    if (!revokeTarget) return;
    try {
      setLoading(true);
      const res = await fetch(`${API}/request/${revokeTarget}/revoke`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          revokedBy: currentUser?.name || "Admin",
          revokeReason: revokeReason || "Revoked by admin",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: "Access Revoked",
          description: "Hospital can no longer access this patient's data.",
          status: "warning",
          duration: 4000,
        });
        onRevokeClose();
        setRevokeTarget(null);
        setRevokeReason("");
        fetchRequests();
        fetchStats();
      }
    } catch (err) {
      toast({ title: "Error revoking", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  // ── View patient data (Ram Hospital side - for approved requests) ──
  const handleViewData = async (requestId) => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/patient-data/${requestId}`);
      const data = await res.json();
      if (data.success) {
        setViewingData(data.data);
        setViewingRequestId(requestId);
        onDataOpen();
      } else {
        toast({
          title: "Access Denied",
          description: data.message,
          status: "error",
          duration: 4000,
        });
      }
    } catch (err) {
      toast({ title: "Error loading patient data", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  // ── Download Report as PDF ──
  const handleDownloadReport = () => {
    if (!viewingData) return;

    const patient = viewingData.patient;
    const info = viewingData.accessInfo;

    // Build HTML for PDF
    let html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>Patient Report</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1a202c; background: #fff; }
      .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 24px 30px; border-radius: 12px; margin-bottom: 24px; }
      .header h1 { font-size: 22px; margin-bottom: 4px; }
      .header p { font-size: 12px; opacity: 0.9; }
      .section { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 16px; }
      .section-title { font-size: 14px; font-weight: 700; color: #2d3748; border-bottom: 2px solid #667eea; padding-bottom: 6px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
      .field label { font-size: 10px; color: #718096; text-transform: uppercase; font-weight: 600; display: block; }
      .field value, .field span { font-size: 13px; font-weight: 600; color: #2d3748; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th { background: #edf2f7; text-align: left; padding: 8px 10px; font-size: 11px; color: #4a5568; text-transform: uppercase; border-bottom: 2px solid #cbd5e0; }
      td { padding: 7px 10px; font-size: 12px; border-bottom: 1px solid #e2e8f0; }
      tr:nth-child(even) { background: #f7fafc; }
      .badge { display: inline-block; background: #ebf8ff; color: #2b6cb0; padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }
      .alert-badge { background: #fed7d7; color: #c53030; }
      .meta-bar { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 16px; padding: 12px 16px; background: #ebf8ff; border-radius: 8px; border-left: 4px solid #3182ce; }
      .meta-bar .item { font-size: 11px; color: #2a4365; }
      .meta-bar .item b { color: #1a365d; }
      .footer { margin-top: 30px; padding-top: 16px; border-top: 2px solid #e2e8f0; font-size: 10px; color: #a0aec0; text-align: center; }
      .rx-item { margin-left: 16px; font-size: 12px; color: #4a5568; line-height: 1.6; }
      @media print { body { padding: 20px; } .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    </style></head><body>`;

    html += `<div class="header"><h1>CROSS-HOSPITAL PATIENT DATA REPORT</h1><p>MediVault Healthcare System — Confidential Medical Document</p></div>`;

    html += `<div class="meta-bar">
      <div class="item"><b>Report Generated:</b> ${new Date().toLocaleString()}</div>
      <div class="item"><b>Request ID:</b> ${info.requestId}</div>
      <div class="item"><b>Requesting Hospital:</b> ${info.requestingHospital}</div>
      <div class="item"><b>Approved By:</b> ${info.approvedBy}</div>
      <div class="item"><b>Approval Date:</b> ${new Date(info.approvalDate).toLocaleString()}</div>
      <div class="item"><b>Expires:</b> ${new Date(info.expiresAt).toLocaleString()}</div>
    </div>`;

    if (patient.basicInfo) {
      html += `<div class="section"><div class="section-title">Patient Information</div><div class="grid">`;
      Object.entries(patient.basicInfo).forEach(([k, v]) => {
        html += `<div class="field"><label>${k}</label><span>${v || "N/A"}</span></div>`;
      });
      html += `</div></div>`;
    }

    if (patient.medicalHistory) {
      html += `<div class="section"><div class="section-title">Medical History</div>`;
      html += `<div class="grid" style="grid-template-columns: 1fr 1fr; margin-bottom: 12px;">`;
      html += `<div class="field"><label>Chronic Conditions</label><span>${patient.medicalHistory.ChronicConditions || "None"}</span></div>`;
      html += `<div class="field"><label>Allergies</label><span class="badge ${patient.medicalHistory.Allergies && patient.medicalHistory.Allergies !== "None" ? "alert-badge" : ""}">${patient.medicalHistory.Allergies || "None"}</span></div>`;
      html += `</div>`;

      if (
        patient.medicalHistory.History &&
        patient.medicalHistory.History.length > 0
      ) {
        html += `<table><tr><th>Date</th><th>Diagnosis</th><th>Doctor</th><th>Notes</th></tr>`;
        patient.medicalHistory.History.forEach((h) => {
          html += `<tr><td>${h.Date || "N/A"}</td><td><b>${h.disease || "N/A"}</b></td><td>${h.DoctorDetails || "N/A"}</td><td>${h.notes || "N/A"}</td></tr>`;
        });
        html += `</table>`;
      }
      html += `</div>`;
    }

    if (patient.emergencyInfo) {
      html += `<div class="section"><div class="section-title">Emergency Information</div><div class="grid" style="grid-template-columns: 1fr 1fr;">`;
      Object.entries(patient.emergencyInfo).forEach(([k, v]) => {
        html += `<div class="field"><label>${k}</label><span>${v || "N/A"}</span></div>`;
      });
      html += `</div></div>`;
    }

    if (patient.vitals && patient.vitals.length > 0) {
      html += `<div class="section"><div class="section-title">Vitals History</div><table>`;
      html += `<tr><th>Date</th><th>BP</th><th>Pulse</th><th>Temp</th><th>SpO2</th><th>Weight</th></tr>`;
      patient.vitals.forEach((v) => {
        const vit = v.vitals || {};
        html += `<tr><td>${v.Date || "N/A"}</td><td>${vit.bp || "N/A"}</td><td>${vit.pulse || "N/A"}</td><td>${vit.temp || "N/A"}</td><td>${vit.spo2 || "N/A"}</td><td>${vit.weight || "N/A"}</td></tr>`;
      });
      html += `</table></div>`;
    }

    if (patient.prescriptions && patient.prescriptions.length > 0) {
      html += `<div class="section"><div class="section-title">Prescriptions</div>`;
      patient.prescriptions.forEach((p) => {
        html += `<div style="margin-bottom:10px;"><span class="badge">${p.disease || "N/A"}</span> <span style="font-size:11px;color:#718096;">${p.Date || ""}</span>`;
        if (p.prescriptions && p.prescriptions.length > 0) {
          p.prescriptions.forEach((rx) => {
            html += `<div class="rx-item">&#8226; <b>${rx.medicine || rx}</b> ${rx.dosage || ""} — ${rx.duration || ""}</div>`;
          });
        }
        html += `</div>`;
      });
      html += `</div>`;
    }

    if (patient.bloodTests && patient.bloodTests.length > 0) {
      html += `<div class="section"><div class="section-title">Blood Tests / Lab Reports</div>`;
      patient.bloodTests.forEach((bt) => {
        html += `<div style="margin-bottom:12px;"><span class="badge alert-badge">${bt.disease || "N/A"}</span> <span style="font-size:11px;color:#718096;">${bt.Date || ""}</span> <span style="font-size:10px;color:#a0aec0;">— ${bt.doctor || ""}</span>`;
        if (bt.bloodTests && bt.bloodTests.length > 0) {
          html += `<table style="margin-top:6px;"><tr><th>Test Name</th><th>Result</th><th>Unit</th><th>Normal Range</th><th>Status</th></tr>`;
          bt.bloodTests.forEach((t) => {
            const statusColor =
              t.status === "NORMAL"
                ? "#38a169"
                : t.status === "CRITICAL"
                  ? "#e53e3e"
                  : "#dd6b20";
            html += `<tr><td><b>${t.testName}</b></td><td style="color:${statusColor};font-weight:700;">${t.value}</td><td>${t.unit}</td><td>${t.normalRange}</td><td><span style="background:${t.status === "NORMAL" ? "#c6f6d5" : t.status === "CRITICAL" ? "#fed7d7" : "#feebc8"};color:${statusColor};padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;">${t.status}</span></td></tr>`;
          });
          html += `</table>`;
        }
        html += `</div>`;
      });
      html += `</div>`;
    }

    if (patient.currentMedications && patient.currentMedications.length > 0) {
      html += `<div class="section"><div class="section-title">Current Medications</div>`;
      html += `<table><tr><th>Medicine</th><th>Dosage</th><th>Duration</th><th>Prescribed For</th><th>Date</th></tr>`;
      patient.currentMedications.forEach((med) => {
        html += `<tr><td><b>${med.medicine}</b></td><td>${med.dosage}</td><td>${med.duration}</td><td><span class="badge">${med.prescribedFor}</span></td><td>${med.prescribedDate}</td></tr>`;
      });
      html += `</table></div>`;
    }

    if (patient.surgicalHistory && patient.surgicalHistory.length > 0) {
      html += `<div class="section"><div class="section-title">Surgical History</div>`;
      patient.surgicalHistory.forEach((sh) => {
        html += `<div style="margin-bottom:10px;"><span class="badge alert-badge">${sh.disease || "Surgery"}</span> <span style="font-size:11px;color:#718096;">${sh.Date || ""}</span>`;
        if (sh.surgeries && sh.surgeries.length > 0) {
          html += `<table style="margin-top:6px;"><tr><th>Procedure</th><th>Date</th><th>Hospital</th><th>Surgeon</th><th>Outcome</th></tr>`;
          sh.surgeries.forEach((s) => {
            html += `<tr><td><b>${s.procedure}</b></td><td>${s.date}</td><td>${s.hospital}</td><td>${s.surgeon}</td><td><span style="background:#c6f6d5;color:#38a169;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;">${s.outcome}</span></td></tr>`;
          });
          html += `</table>`;
        }
        html += `</div>`;
      });
      html += `</div>`;
    }

    html += `<div class="footer">
      <p><b>CONFIDENTIAL</b> — This document contains protected health information (PHI).</p>
      <p>Shared under cross-hospital data access protocol. Unauthorized distribution is prohibited.</p>
      <p>MediVault Healthcare System &copy; ${new Date().getFullYear()}</p>
    </div></body></html>`;

    // Open in new window and trigger print (saves as PDF)
    const printWindow = window.open("", "_blank", "width=900,height=700");
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);

    toast({
      title: "PDF Report Opened",
      description: "Use Print > Save as PDF to download",
      status: "success",
      duration: 4000,
    });
  };

  // ── Helpers ──
  const statusColor = (s) => {
    const map = {
      Pending: "yellow",
      Approved: "green",
      Rejected: "red",
      Revoked: "orange",
      Expired: "gray",
    };
    return map[s] || "gray";
  };

  const urgencyColor = (u) => {
    const map = { Emergency: "red", Urgent: "orange", Normal: "blue" };
    return map[u] || "blue";
  };

  // ── Filter requests ──
  const incomingRequests = requests.filter(
    (r) => r.patientHospital === myHospital,
  );
  const outgoingRequests = requests.filter(
    (r) => r.requestingHospital === myHospital,
  );
  const pendingIncoming = incomingRequests.filter(
    (r) => r.status === "Pending",
  );

  // ════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════
  return (
    <Container maxW="7xl" py={6}>
      <VStack spacing={6} align="stretch">
        {/* ── Header ── */}
        <Box>
          <HStack justify="space-between" mb={2}>
            <HStack spacing={3}>
              <Box
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                p={2}
                borderRadius="lg"
              >
                <FiGlobe size={24} color="white" />
              </Box>
              <Box>
                <Heading size="lg">Cross-Hospital Access</Heading>
                <Text color="gray.500" fontSize="sm">
                  {isMediVault
                    ? "Review and manage incoming access requests from other hospitals"
                    : "Request and view patient data from other hospitals"}
                </Text>
              </Box>
            </HStack>
            <HStack>
              <Badge
                colorScheme={isMediVault ? "purple" : "blue"}
                px={3}
                py={1}
                borderRadius="full"
                fontSize="sm"
              >
                {isMediVault ? "Data Owner Portal" : myHospital}
              </Badge>
              <Tooltip label="Refresh">
                <IconButton
                  icon={<FiRefreshCw />}
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    fetchRequests();
                    fetchStats();
                  }}
                  isLoading={loading}
                />
              </Tooltip>
            </HStack>
          </HStack>
        </Box>

        {/* ── Stats ── */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Card bg={cardBg} shadow="sm" borderRadius="xl">
            <CardBody py={4}>
              <Stat>
                <StatLabel color="gray.500" fontSize="xs">
                  Total Requests
                </StatLabel>
                <StatNumber fontSize="2xl" color="blue.500">
                  {stats.totalRequests || 0}
                </StatNumber>
                <StatHelpText fontSize="xs">All time</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={cardBg} shadow="sm" borderRadius="xl">
            <CardBody py={4}>
              <Stat>
                <StatLabel color="gray.500" fontSize="xs">
                  Pending
                </StatLabel>
                <StatNumber fontSize="2xl" color="yellow.500">
                  {stats.pending || 0}
                </StatNumber>
                <StatHelpText fontSize="xs">Awaiting review</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={cardBg} shadow="sm" borderRadius="xl">
            <CardBody py={4}>
              <Stat>
                <StatLabel color="gray.500" fontSize="xs">
                  Approved
                </StatLabel>
                <StatNumber fontSize="2xl" color="green.500">
                  {stats.approved || 0}
                </StatNumber>
                <StatHelpText fontSize="xs">Active access</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={cardBg} shadow="sm" borderRadius="xl">
            <CardBody py={4}>
              <Stat>
                <StatLabel color="gray.500" fontSize="xs">
                  Rejected / Revoked
                </StatLabel>
                <StatNumber fontSize="2xl" color="red.500">
                  {(stats.rejected || 0) + (stats.revoked || 0)}
                </StatNumber>
                <StatHelpText fontSize="xs">Denied</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* CONNECTED HOSPITAL NETWORK */}
        {/* ═══════════════════════════════════════════════════════ */}
        <Box
          bg={useColorModeValue(
            isMediVault ? "gray.50" : "cyan.50",
            "gray.900",
          )}
          borderRadius="2xl"
          p={4}
        >
          <HStack justify="space-between" mb={3}>
            <HStack spacing={2}>
              <FiGlobe size={18} color={isMediVault ? "#38A169" : "#0891B2"} />
              <Box>
                <Heading size="sm">
                  {isMediVault
                    ? "Cross-Hospital Access Network"
                    : `${myHospital} — Partner Network`}
                </Heading>
                <Text color="gray.500" fontSize="xs">
                  {isMediVault
                    ? "Secure patient data sharing across hospital networks"
                    : "Hospitals connected for cross-referral & data exchange"}
                </Text>
              </Box>
            </HStack>
            <Badge
              colorScheme={isMediVault ? "green" : "cyan"}
              px={3}
              py={1}
              borderRadius="full"
              fontSize="xs"
              fontWeight="bold"
              textTransform="uppercase"
              letterSpacing="wide"
            >
              Network Active
            </Badge>
          </HStack>

          <SimpleGrid columns={{ base: 2, sm: 2, md: 4 }} spacing={3}>
            {(isMediVault
              ? medivaultNetworkHospitals
              : ramNetworkHospitals
            ).map((hospital, idx) => (
              <Card
                key={idx}
                bg={cardBg}
                shadow="sm"
                borderRadius="lg"
                _hover={{ shadow: "md", transform: "translateY(-1px)" }}
                transition="all 0.2s"
                borderTop={isMediVault ? "none" : "2px solid"}
                borderTopColor={isMediVault ? "transparent" : "cyan.400"}
              >
                <CardBody py={3} px={3}>
                  <HStack justify="space-between" mb={1.5}>
                    <Box
                      as={FiHeart}
                      size="14px"
                      color={isMediVault ? "teal.400" : "cyan.500"}
                      cursor="pointer"
                      _hover={{
                        color: isMediVault ? "teal.600" : "cyan.700",
                      }}
                    />
                    <Badge
                      colorScheme={
                        hospital.status === "Connected"
                          ? isMediVault
                            ? "green"
                            : "cyan"
                          : "yellow"
                      }
                      fontSize="2xs"
                      px={2}
                      py={0.5}
                      borderRadius="md"
                      fontWeight="bold"
                      textTransform="uppercase"
                    >
                      {hospital.status}
                    </Badge>
                  </HStack>
                  <Text fontWeight="bold" fontSize="sm" mb={0.5} noOfLines={1}>
                    {hospital.name}
                  </Text>
                  <Text color="gray.500" fontSize="2xs" mb={0.5} noOfLines={1}>
                    {hospital.location}
                  </Text>
                  <Text color="gray.400" fontSize="2xs" mb={1.5}>
                    Type: {hospital.type}
                  </Text>
                  <Text fontWeight="bold" fontSize="sm">
                    {hospital.patients.toLocaleString()} patients
                  </Text>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Box>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* MEDIVAULT PORTAL (Data Owner) */}
        {/* ═══════════════════════════════════════════════════════ */}
        {isMediVault ? (
          <Tabs variant="enclosed" colorScheme="purple">
            <TabList>
              <Tab>
                <HStack>
                  <FiInbox />
                  <Text>Incoming Requests</Text>
                  {pendingIncoming.length > 0 && (
                    <Badge colorScheme="red" borderRadius="full">
                      {pendingIncoming.length}
                    </Badge>
                  )}
                </HStack>
              </Tab>
              <Tab>
                <HStack>
                  <FiActivity />
                  <Text>All Request History</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* ── Tab 1: Pending Incoming ── */}
              <TabPanel px={0}>
                {pendingIncoming.length === 0 ? (
                  <Card bg={cardBg} shadow="sm" borderRadius="xl">
                    <CardBody>
                      <VStack py={10} spacing={3}>
                        <FiInbox size={48} color="gray" />
                        <Text color="gray.500" fontSize="lg">
                          No pending requests
                        </Text>
                        <Text color="gray.400" fontSize="sm">
                          When another hospital requests access to your
                          patient's data, it will appear here.
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                ) : (
                  <VStack spacing={4} align="stretch">
                    {pendingIncoming.map((req) => (
                      <Card
                        key={req._id}
                        bg={cardBg}
                        shadow="md"
                        borderRadius="xl"
                        borderLeft="4px solid"
                        borderLeftColor={
                          req.urgency === "Emergency"
                            ? "red.500"
                            : req.urgency === "Urgent"
                              ? "orange.500"
                              : "blue.500"
                        }
                      >
                        <CardBody>
                          <Flex
                            justify="space-between"
                            align="start"
                            wrap="wrap"
                            gap={4}
                          >
                            <Box flex="1" minW="250px">
                              <HStack mb={2}>
                                <Badge
                                  colorScheme={urgencyColor(req.urgency)}
                                  fontSize="xs"
                                >
                                  {req.urgency || "Normal"}
                                </Badge>
                                <Badge colorScheme="yellow" fontSize="xs">
                                  Pending
                                </Badge>
                              </HStack>
                              <Text fontWeight="bold" fontSize="lg">
                                {req.requestingHospital}
                              </Text>
                              <Text color="gray.500" fontSize="sm">
                                Doctor: {req.requestingDoctor}
                              </Text>
                              <Divider my={2} />
                              <HStack spacing={4} mb={2}>
                                <Box>
                                  <Text
                                    fontSize="xs"
                                    color="gray.400"
                                    fontWeight="bold"
                                  >
                                    PATIENT
                                  </Text>
                                  <Text fontWeight="600">
                                    {req.patientName}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500">
                                    ID: {req.patientId}
                                  </Text>
                                </Box>
                              </HStack>
                              <Box bg="gray.50" p={3} borderRadius="md" mt={2}>
                                <Text
                                  fontSize="xs"
                                  color="gray.400"
                                  fontWeight="bold"
                                  mb={1}
                                >
                                  REASON
                                </Text>
                                <Text fontSize="sm">{req.reason}</Text>
                              </Box>
                              {req.dataCategories &&
                                req.dataCategories.length > 0 && (
                                  <HStack mt={2} wrap="wrap" spacing={1}>
                                    <Text fontSize="xs" color="gray.400" mr={1}>
                                      Requesting:
                                    </Text>
                                    {req.dataCategories.map((cat) => (
                                      <Tag
                                        key={cat}
                                        size="sm"
                                        colorScheme="blue"
                                        variant="subtle"
                                      >
                                        <TagLabel>{cat}</TagLabel>
                                      </Tag>
                                    ))}
                                  </HStack>
                                )}
                              <Text fontSize="xs" color="gray.400" mt={2}>
                                Requested:{" "}
                                {new Date(req.requestDate).toLocaleString()}
                              </Text>
                            </Box>

                            <VStack spacing={2} minW="140px">
                              <Button
                                colorScheme="green"
                                size="sm"
                                leftIcon={<FiCheck />}
                                w="full"
                                onClick={() => handleApproveClick(req)}
                                isLoading={loading}
                              >
                                Verify & Approve
                              </Button>
                              <Button
                                colorScheme="red"
                                variant="outline"
                                size="sm"
                                leftIcon={<FiX />}
                                w="full"
                                onClick={() => handleReject(req._id)}
                                isLoading={loading}
                              >
                                Reject
                              </Button>
                            </VStack>
                          </Flex>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                )}
              </TabPanel>

              {/* ── Tab 2: All History ── */}
              <TabPanel px={0}>
                <Card bg={cardBg} shadow="sm" borderRadius="xl">
                  <CardBody overflowX="auto">
                    {incomingRequests.length === 0 ? (
                      <VStack py={8}>
                        <Text color="gray.500">No request history yet</Text>
                      </VStack>
                    ) : (
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th>Hospital</Th>
                            <Th>Patient</Th>
                            <Th>Urgency</Th>
                            <Th>Status</Th>
                            <Th>Date</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {incomingRequests.map((req) => (
                            <Tr key={req._id}>
                              <Td>
                                <Text fontWeight="600" fontSize="sm">
                                  {req.requestingHospital}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {req.requestingDoctor}
                                </Text>
                              </Td>
                              <Td>
                                <Text fontSize="sm">{req.patientName}</Text>
                                <Text fontSize="xs" color="gray.400">
                                  {req.patientId}
                                </Text>
                              </Td>
                              <Td>
                                <Badge
                                  colorScheme={urgencyColor(req.urgency)}
                                  fontSize="xs"
                                >
                                  {req.urgency || "Normal"}
                                </Badge>
                              </Td>
                              <Td>
                                <Badge
                                  colorScheme={statusColor(req.status)}
                                  fontSize="xs"
                                >
                                  {req.status}
                                </Badge>
                              </Td>
                              <Td fontSize="xs" color="gray.500">
                                {new Date(req.requestDate).toLocaleDateString()}
                              </Td>
                              <Td>
                                {req.status === "Approved" && (
                                  <Tooltip label="Revoke Access">
                                    <IconButton
                                      icon={<FiSlash />}
                                      size="xs"
                                      colorScheme="red"
                                      variant="ghost"
                                      onClick={() => {
                                        setRevokeTarget(req._id);
                                        onRevokeOpen();
                                      }}
                                    />
                                  </Tooltip>
                                )}
                                {req.status === "Pending" && (
                                  <HStack spacing={1}>
                                    <Tooltip label="Verify & Approve">
                                      <IconButton
                                        icon={<FiCheck />}
                                        size="xs"
                                        colorScheme="green"
                                        variant="ghost"
                                        onClick={() => handleApproveClick(req)}
                                      />
                                    </Tooltip>
                                    <Tooltip label="Reject">
                                      <IconButton
                                        icon={<FiX />}
                                        size="xs"
                                        colorScheme="red"
                                        variant="ghost"
                                        onClick={() => handleReject(req._id)}
                                      />
                                    </Tooltip>
                                  </HStack>
                                )}
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    )}
                  </CardBody>
                </Card>
              </TabPanel>
            </TabPanels>
          </Tabs>
        ) : (
          /* ═══════════════════════════════════════════════════════ */
          /* REQUESTING HOSPITAL PORTAL (Ram Hospital etc.) */
          /* ═══════════════════════════════════════════════════════ */
          <Tabs variant="enclosed" colorScheme="teal">
            <TabList>
              <Tab>
                <HStack>
                  <FiSearch />
                  <Text>Search & Request Access</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack>
                  <FiSend />
                  <Text>My Access Requests</Text>
                  {outgoingRequests.filter((r) => r.status === "Approved")
                    .length > 0 && (
                    <Badge colorScheme="green" borderRadius="full">
                      {
                        outgoingRequests.filter((r) => r.status === "Approved")
                          .length
                      }
                    </Badge>
                  )}
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* ── Tab 1: Search & Request ── */}
              <TabPanel px={0}>
                <VStack spacing={4} align="stretch">
                  <Alert
                    status="info"
                    borderRadius="lg"
                    variant="left-accent"
                    bg="teal.50"
                    borderLeftColor="teal.400"
                  >
                    <AlertIcon color="teal.500" />
                    <Box>
                      <AlertTitle fontSize="sm" color="teal.700">
                        How Cross-Hospital Access Works
                      </AlertTitle>
                      <AlertDescription fontSize="xs" color="teal.600">
                        Search for a patient by name or UHID. View their visit
                        history and which hospital they were treated at. Submit
                        a request with your reason. Once the host hospital
                        verifies Ram Hospital and approves, you can view and
                        export the patient's data as PDF.
                      </AlertDescription>
                    </Box>
                  </Alert>

                  {/* Search Box */}
                  <Card
                    bg={cardBg}
                    shadow="sm"
                    borderRadius="xl"
                    borderTop="3px solid"
                    borderTopColor="teal.400"
                  >
                    <CardHeader pb={2}>
                      <Heading size="sm" color="teal.700">
                        <HStack>
                          <FiSearch />
                          <Text>Search Patient at MediVault</Text>
                        </HStack>
                      </Heading>
                    </CardHeader>
                    <CardBody pt={0}>
                      <HStack>
                        <InputGroup>
                          <InputLeftElement>
                            <FiSearch color="gray" />
                          </InputLeftElement>
                          <Input
                            placeholder="Enter patient name or UHID (e.g. UHID-1001, Rahul)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleSearch()
                            }
                          />
                        </InputGroup>
                        <Button
                          colorScheme="teal"
                          onClick={handleSearch}
                          isLoading={searching}
                          px={8}
                        >
                          Search
                        </Button>
                      </HStack>

                      {/* Search Results */}
                      {searchResults.length > 0 && (
                        <Box mt={4}>
                          <Text
                            fontSize="sm"
                            fontWeight="bold"
                            color="gray.500"
                            mb={3}
                          >
                            {searchResults.length} patient(s) found
                          </Text>
                          <VStack spacing={3} align="stretch">
                            {searchResults.map((p) => (
                              <Card
                                key={p._id}
                                variant="outline"
                                borderRadius="lg"
                                _hover={{
                                  shadow: "md",
                                  borderColor: "blue.300",
                                }}
                                transition="all 0.2s"
                              >
                                <CardBody py={3}>
                                  <Flex
                                    justify="space-between"
                                    align="start"
                                    wrap="wrap"
                                    gap={3}
                                  >
                                    <Box flex="1">
                                      <HStack mb={1} spacing={3}>
                                        <Text fontWeight="bold" fontSize="lg">
                                          {p.Name}
                                        </Text>
                                        <Badge
                                          colorScheme="purple"
                                          fontSize="sm"
                                          px={3}
                                          py={1}
                                          borderRadius="md"
                                        >
                                          UHID: {p.UHID || p.MedicalId}
                                        </Badge>
                                      </HStack>
                                      <HStack
                                        spacing={4}
                                        mb={2}
                                        flexWrap="wrap"
                                      >
                                        <Text fontSize="sm" color="gray.600">
                                          Age: {p.Age || "N/A"}
                                        </Text>
                                        <Text fontSize="sm" color="gray.600">
                                          Gender: {p.Gender || "N/A"}
                                        </Text>
                                        <Text fontSize="sm" color="gray.600">
                                          Blood: {p.BloodGroup || "N/A"}
                                        </Text>
                                        {p.Allergies &&
                                          p.Allergies !== "None" && (
                                            <Tag
                                              size="sm"
                                              colorScheme="red"
                                              variant="subtle"
                                            >
                                              <TagLabel>
                                                Allergies: {p.Allergies}
                                              </TagLabel>
                                            </Tag>
                                          )}
                                      </HStack>
                                      {p.ChronicConditions &&
                                        p.ChronicConditions !== "None" && (
                                          <Text
                                            fontSize="xs"
                                            color="orange.600"
                                            mb={2}
                                          >
                                            Chronic: {p.ChronicConditions}
                                          </Text>
                                        )}

                                      {/* Hospital & Visit History */}
                                      <Box
                                        bg="blue.50"
                                        p={2}
                                        borderRadius="md"
                                        mb={2}
                                      >
                                        <HStack mb={1}>
                                          <FiShield color="#3182CE" size={14} />
                                          <Text
                                            fontSize="sm"
                                            fontWeight="bold"
                                            color="blue.700"
                                          >
                                            Registered at: {p.hospitalName}
                                          </Text>
                                        </HStack>
                                        <Text fontSize="xs" color="blue.600">
                                          Total Visits: {p.totalVisits || 0}
                                        </Text>
                                      </Box>

                                      {p.visitHistory &&
                                        p.visitHistory.length > 0 && (
                                          <Box>
                                            <Text
                                              fontSize="xs"
                                              fontWeight="bold"
                                              color="gray.500"
                                              mb={1}
                                            >
                                              Recent Visit History:
                                            </Text>
                                            <VStack spacing={1} align="stretch">
                                              {p.visitHistory
                                                .slice(0, 3)
                                                .map((v, idx) => (
                                                  <HStack
                                                    key={idx}
                                                    fontSize="xs"
                                                    color="gray.600"
                                                    spacing={2}
                                                  >
                                                    <FiClock size={10} />
                                                    <Text>
                                                      {v.date} —{" "}
                                                      <b>{v.disease}</b> at{" "}
                                                      {v.hospital}
                                                    </Text>
                                                  </HStack>
                                                ))}
                                              {p.visitHistory.length > 3 && (
                                                <Text
                                                  fontSize="xs"
                                                  color="gray.400"
                                                  ml={4}
                                                >
                                                  +{p.visitHistory.length - 3}{" "}
                                                  more visit(s)
                                                </Text>
                                              )}
                                            </VStack>
                                          </Box>
                                        )}
                                    </Box>

                                    <Button
                                      size="sm"
                                      colorScheme="teal"
                                      leftIcon={<FiSend />}
                                      onClick={() => {
                                        setSelectedPatient(p);
                                        onRequestOpen();
                                      }}
                                      mt={1}
                                    >
                                      Request Access
                                    </Button>
                                  </Flex>
                                </CardBody>
                              </Card>
                            ))}
                          </VStack>
                        </Box>
                      )}
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>

              {/* ── Tab 2: My Requests ── */}
              <TabPanel px={0}>
                <VStack spacing={4} align="stretch">
                  {outgoingRequests.length === 0 ? (
                    <Card bg={cardBg} shadow="sm" borderRadius="xl">
                      <CardBody>
                        <VStack py={10} spacing={3}>
                          <FiSend size={48} color="gray" />
                          <Text color="gray.500" fontSize="lg">
                            No requests yet
                          </Text>
                          <Text color="gray.400" fontSize="sm">
                            Search for a patient and submit an access request to
                            get started.
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>
                  ) : (
                    outgoingRequests.map((req) => (
                      <Card
                        key={req._id}
                        bg={cardBg}
                        shadow="sm"
                        borderRadius="xl"
                        borderLeft="4px solid"
                        borderLeftColor={`${statusColor(req.status)}.400`}
                      >
                        <CardBody>
                          <Flex
                            justify="space-between"
                            align="start"
                            wrap="wrap"
                            gap={4}
                          >
                            <Box flex="1">
                              <HStack mb={2}>
                                <Badge
                                  colorScheme={statusColor(req.status)}
                                  fontSize="xs"
                                >
                                  {req.status}
                                </Badge>
                                <Badge
                                  colorScheme={urgencyColor(req.urgency)}
                                  variant="subtle"
                                  fontSize="xs"
                                >
                                  {req.urgency || "Normal"}
                                </Badge>
                              </HStack>
                              <Text fontWeight="bold">
                                Patient: {req.patientName}
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                Hospital: {req.patientHospital}
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                Patient ID: {req.patientId}
                              </Text>
                              <Text fontSize="xs" color="gray.400" mt={1}>
                                Reason: {req.reason}
                              </Text>
                              <HStack mt={2} spacing={4}>
                                <Text fontSize="xs" color="gray.400">
                                  Submitted:{" "}
                                  {new Date(req.requestDate).toLocaleString()}
                                </Text>
                                {req.expiresAt && (
                                  <Text fontSize="xs" color="orange.500">
                                    Expires:{" "}
                                    {new Date(req.expiresAt).toLocaleString()}
                                  </Text>
                                )}
                              </HStack>
                              {req.status === "Rejected" &&
                                req.rejectionReason && (
                                  <Alert
                                    status="error"
                                    mt={2}
                                    borderRadius="md"
                                  >
                                    <AlertIcon />
                                    <Text fontSize="xs">
                                      {req.rejectionReason}
                                    </Text>
                                  </Alert>
                                )}
                            </Box>

                            {req.status === "Approved" && (
                              <VStack spacing={2}>
                                <Button
                                  colorScheme="green"
                                  size="sm"
                                  leftIcon={<FiEye />}
                                  onClick={() => handleViewData(req._id)}
                                  isLoading={loading}
                                >
                                  View Data
                                </Button>
                              </VStack>
                            )}

                            {req.status === "Pending" && (
                              <VStack>
                                <HStack>
                                  <Spinner size="xs" color="yellow.500" />
                                  <Text
                                    fontSize="xs"
                                    color="yellow.600"
                                    fontWeight="bold"
                                  >
                                    Awaiting Approval
                                  </Text>
                                </HStack>
                              </VStack>
                            )}
                          </Flex>
                        </CardBody>
                      </Card>
                    ))
                  )}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}
      </VStack>

      {/* ═════════════════════════════════════════════════════════ */}
      {/* MODAL: Submit Access Request */}
      {/* ═════════════════════════════════════════════════════════ */}
      <Modal isOpen={isRequestOpen} onClose={onRequestClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <FiSend />
              <Text>Request Patient Access</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {selectedPatient && (
                <Card bg="blue.50" borderRadius="lg">
                  <CardBody py={3}>
                    <HStack>
                      <FiUser />
                      <Box>
                        <HStack spacing={2}>
                          <Text fontWeight="bold">{selectedPatient.Name}</Text>
                          <Badge colorScheme="purple" fontSize="xs">
                            UHID:{" "}
                            {selectedPatient.UHID ||
                              selectedPatient.MedicalId ||
                              "N/A"}
                          </Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          Age: {selectedPatient.Age || "N/A"} | Blood:{" "}
                          {selectedPatient.BloodGroup || "N/A"} | Visits:{" "}
                          {selectedPatient.totalVisits || 0}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          Hospital: {selectedPatient.hospitalName}
                        </Text>
                      </Box>
                    </HStack>
                  </CardBody>
                </Card>
              )}

              <Box>
                <Text fontWeight="bold" fontSize="sm" mb={1}>
                  Reason for Access *
                </Text>
                <Textarea
                  placeholder="Explain why you need access to this patient's data..."
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  rows={3}
                />
              </Box>

              <Box>
                <Text fontWeight="bold" fontSize="sm" mb={1}>
                  Urgency Level
                </Text>
                <Select
                  value={requestUrgency}
                  onChange={(e) => setRequestUrgency(e.target.value)}
                >
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Emergency">Emergency</option>
                </Select>
              </Box>

              <Box>
                <Text fontWeight="bold" fontSize="sm" mb={1}>
                  Data Categories Needed
                </Text>
                <CheckboxGroup
                  value={requestCategories}
                  onChange={setRequestCategories}
                >
                  <Stack spacing={2}>
                    <Checkbox value="Basic Info">Basic Info</Checkbox>
                    <Checkbox value="Medical History">Medical History</Checkbox>
                    <Checkbox value="Emergency Info">Emergency Info</Checkbox>
                    <Checkbox value="Vitals">Vitals</Checkbox>
                    <Checkbox value="Prescriptions">Prescriptions</Checkbox>
                    <Checkbox value="Blood Tests / Lab Reports">
                      Blood Tests / Lab Reports
                    </Checkbox>
                    <Checkbox value="Current Medications">
                      Current Medications
                    </Checkbox>
                    <Checkbox value="Surgical History">
                      Surgical History
                    </Checkbox>
                  </Stack>
                </CheckboxGroup>
              </Box>

              <Alert status="info" borderRadius="md" fontSize="xs">
                <AlertIcon />
                <Text>
                  Your request will be reviewed by{" "}
                  {selectedPatient?.hospitalName || "MediVault Hospital"}. Once
                  approved, you'll have 72 hours to access the data.
                </Text>
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onRequestClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              leftIcon={<FiSend />}
              onClick={handleSubmitRequest}
              isLoading={loading}
            >
              Submit Request
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ═════════════════════════════════════════════════════════ */}
      {/* MODAL: View Patient Data */}
      {/* ═════════════════════════════════════════════════════════ */}
      <Modal isOpen={isDataOpen} onClose={onDataClose} size="xl">
        <ModalOverlay />
        <ModalContent maxW="800px">
          <ModalHeader>
            <HStack justify="space-between">
              <HStack>
                <FiFileText />
                <Text>Patient Data</Text>
              </HStack>
              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<FiDownload />}
                onClick={handleDownloadReport}
                mr={8}
              >
                Export PDF
              </Button>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {viewingData ? (
              <VStack spacing={4} align="stretch">
                {/* Access Info Banner */}
                <Alert status="success" borderRadius="lg" variant="left-accent">
                  <AlertIcon />
                  <Box fontSize="xs">
                    <Text fontWeight="bold">Approved Access</Text>
                    <Text>
                      Approved by: {viewingData.accessInfo.approvedBy} |
                      Expires:{" "}
                      {new Date(
                        viewingData.accessInfo.expiresAt,
                      ).toLocaleString()}{" "}
                      | Views: {viewingData.accessInfo.accessCount}
                    </Text>
                  </Box>
                </Alert>

                {/* Basic Info */}
                {viewingData.patient.basicInfo && (
                  <Card borderRadius="lg" variant="outline">
                    <CardHeader pb={0}>
                      <Heading size="sm" color="blue.600">
                        <HStack>
                          <FiUser />
                          <Text>Basic Information</Text>
                        </HStack>
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <SimpleGrid columns={3} spacing={4}>
                        {Object.entries(viewingData.patient.basicInfo).map(
                          ([key, val]) => (
                            <Box key={key}>
                              <Text
                                fontSize="xs"
                                color="gray.400"
                                fontWeight="bold"
                              >
                                {key}
                              </Text>
                              <Text fontSize="sm" fontWeight="600">
                                {val || "N/A"}
                              </Text>
                            </Box>
                          ),
                        )}
                      </SimpleGrid>
                    </CardBody>
                  </Card>
                )}

                {/* Medical History */}
                {viewingData.patient.medicalHistory && (
                  <Card borderRadius="lg" variant="outline">
                    <CardHeader pb={0}>
                      <Heading size="sm" color="green.600">
                        <HStack>
                          <FiActivity />
                          <Text>Medical History</Text>
                        </HStack>
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <SimpleGrid columns={2} spacing={4} mb={3}>
                        <Box>
                          <Text
                            fontSize="xs"
                            color="gray.400"
                            fontWeight="bold"
                          >
                            Chronic Conditions
                          </Text>
                          <Text fontSize="sm">
                            {viewingData.patient.medicalHistory
                              .ChronicConditions || "None"}
                          </Text>
                        </Box>
                        <Box>
                          <Text
                            fontSize="xs"
                            color="gray.400"
                            fontWeight="bold"
                          >
                            Allergies
                          </Text>
                          <Text fontSize="sm">
                            {viewingData.patient.medicalHistory.Allergies ||
                              "None"}
                          </Text>
                        </Box>
                      </SimpleGrid>

                      {viewingData.patient.medicalHistory.History &&
                        viewingData.patient.medicalHistory.History.length >
                          0 && (
                          <>
                            <Divider my={2} />
                            <Text
                              fontSize="xs"
                              color="gray.400"
                              fontWeight="bold"
                              mb={2}
                            >
                              VISIT HISTORY
                            </Text>
                            <Table variant="simple" size="sm">
                              <Thead>
                                <Tr>
                                  <Th>Date</Th>
                                  <Th>Disease</Th>
                                  <Th>Doctor</Th>
                                  <Th>Notes</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {viewingData.patient.medicalHistory.History.map(
                                  (h, i) => (
                                    <Tr key={i}>
                                      <Td fontSize="xs">{h.Date || "N/A"}</Td>
                                      <Td fontSize="xs">
                                        {h.disease || "N/A"}
                                      </Td>
                                      <Td fontSize="xs">
                                        {h.DoctorDetails || "N/A"}
                                      </Td>
                                      <Td fontSize="xs">{h.notes || "N/A"}</Td>
                                    </Tr>
                                  ),
                                )}
                              </Tbody>
                            </Table>
                          </>
                        )}
                    </CardBody>
                  </Card>
                )}

                {/* Emergency Info */}
                {viewingData.patient.emergencyInfo && (
                  <Card borderRadius="lg" variant="outline">
                    <CardHeader pb={0}>
                      <Heading size="sm" color="red.600">
                        <HStack>
                          <FiAlertCircle />
                          <Text>Emergency Information</Text>
                        </HStack>
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <SimpleGrid columns={2} spacing={4}>
                        {Object.entries(viewingData.patient.emergencyInfo).map(
                          ([key, val]) => (
                            <Box key={key}>
                              <Text
                                fontSize="xs"
                                color="gray.400"
                                fontWeight="bold"
                              >
                                {key}
                              </Text>
                              <Text fontSize="sm" fontWeight="600">
                                {val || "N/A"}
                              </Text>
                            </Box>
                          ),
                        )}
                      </SimpleGrid>
                    </CardBody>
                  </Card>
                )}

                {/* Vitals */}
                {viewingData.patient.vitals &&
                  viewingData.patient.vitals.length > 0 && (
                    <Card borderRadius="lg" variant="outline">
                      <CardHeader pb={0}>
                        <Heading size="sm" color="purple.600">
                          <HStack>
                            <FiActivity />
                            <Text>Vitals History</Text>
                          </HStack>
                        </Heading>
                      </CardHeader>
                      <CardBody>
                        {viewingData.patient.vitals.map((v, i) => (
                          <Box key={i} mb={2}>
                            <Text fontSize="xs" color="gray.400">
                              {v.Date || "N/A"}
                            </Text>
                            <Text fontSize="sm">
                              {JSON.stringify(v.vitals)}
                            </Text>
                          </Box>
                        ))}
                      </CardBody>
                    </Card>
                  )}

                {/* Prescriptions */}
                {viewingData.patient.prescriptions &&
                  viewingData.patient.prescriptions.length > 0 && (
                    <Card borderRadius="lg" variant="outline">
                      <CardHeader pb={0}>
                        <Heading size="sm" color="teal.600">
                          <HStack>
                            <FiFileText />
                            <Text>Prescriptions</Text>
                          </HStack>
                        </Heading>
                      </CardHeader>
                      <CardBody>
                        {viewingData.patient.prescriptions.map((p, i) => (
                          <Box key={i} mb={3}>
                            <HStack>
                              <Badge colorScheme="teal" fontSize="xs">
                                {p.disease || "N/A"}
                              </Badge>
                              <Text fontSize="xs" color="gray.400">
                                {p.Date || "N/A"}
                              </Text>
                            </HStack>
                            {p.prescriptions &&
                              p.prescriptions.map((rx, j) => (
                                <Text key={j} fontSize="sm" ml={4}>
                                  - {rx.medicine || rx}: {rx.dosage || ""}{" "}
                                  {rx.duration || ""}
                                </Text>
                              ))}
                          </Box>
                        ))}
                      </CardBody>
                    </Card>
                  )}

                {/* Blood Tests / Lab Reports */}
                {viewingData.patient.bloodTests &&
                  viewingData.patient.bloodTests.length > 0 && (
                    <Card borderRadius="lg" variant="outline">
                      <CardHeader pb={0}>
                        <Heading size="sm" color="red.600">
                          <HStack>
                            <FiHeart />
                            <Text>Blood Tests / Lab Reports</Text>
                          </HStack>
                        </Heading>
                      </CardHeader>
                      <CardBody>
                        {viewingData.patient.bloodTests.map((bt, i) => (
                          <Box key={i} mb={4}>
                            <HStack mb={2}>
                              <Badge colorScheme="red" fontSize="xs">
                                {bt.disease || "N/A"}
                              </Badge>
                              <Text fontSize="xs" color="gray.400">
                                {bt.Date || "N/A"}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                — {bt.doctor || ""}
                              </Text>
                            </HStack>
                            <Table variant="simple" size="sm">
                              <Thead>
                                <Tr>
                                  <Th>Test Name</Th>
                                  <Th>Result</Th>
                                  <Th>Unit</Th>
                                  <Th>Normal Range</Th>
                                  <Th>Status</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {bt.bloodTests.map((test, j) => (
                                  <Tr key={j}>
                                    <Td fontSize="xs" fontWeight="600">
                                      {test.testName}
                                    </Td>
                                    <Td
                                      fontSize="xs"
                                      fontWeight="bold"
                                      color={
                                        test.status === "NORMAL"
                                          ? "green.600"
                                          : test.status === "CRITICAL"
                                            ? "red.600"
                                            : "orange.600"
                                      }
                                    >
                                      {test.value}
                                    </Td>
                                    <Td fontSize="xs">{test.unit}</Td>
                                    <Td fontSize="xs">{test.normalRange}</Td>
                                    <Td>
                                      <Badge
                                        fontSize="xs"
                                        colorScheme={
                                          test.status === "NORMAL"
                                            ? "green"
                                            : test.status === "CRITICAL"
                                              ? "red"
                                              : test.status === "HIGH"
                                                ? "orange"
                                                : "yellow"
                                        }
                                      >
                                        {test.status}
                                      </Badge>
                                    </Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>
                            {i < viewingData.patient.bloodTests.length - 1 && (
                              <Divider mt={3} />
                            )}
                          </Box>
                        ))}
                      </CardBody>
                    </Card>
                  )}

                {/* Current Medications */}
                {viewingData.patient.currentMedications &&
                  viewingData.patient.currentMedications.length > 0 && (
                    <Card borderRadius="lg" variant="outline">
                      <CardHeader pb={0}>
                        <Heading size="sm" color="orange.600">
                          <HStack>
                            <FiFileText />
                            <Text>Current Medications</Text>
                          </HStack>
                        </Heading>
                      </CardHeader>
                      <CardBody>
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr>
                              <Th>Medicine</Th>
                              <Th>Dosage</Th>
                              <Th>Duration</Th>
                              <Th>Prescribed For</Th>
                              <Th>Date</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {viewingData.patient.currentMedications.map(
                              (med, i) => (
                                <Tr key={i}>
                                  <Td fontSize="xs" fontWeight="600">
                                    {med.medicine}
                                  </Td>
                                  <Td fontSize="xs">{med.dosage}</Td>
                                  <Td fontSize="xs">{med.duration}</Td>
                                  <Td fontSize="xs">
                                    <Badge colorScheme="orange" fontSize="xs">
                                      {med.prescribedFor}
                                    </Badge>
                                  </Td>
                                  <Td fontSize="xs">{med.prescribedDate}</Td>
                                </Tr>
                              ),
                            )}
                          </Tbody>
                        </Table>
                      </CardBody>
                    </Card>
                  )}

                {/* Surgical History */}
                {viewingData.patient.surgicalHistory &&
                  viewingData.patient.surgicalHistory.length > 0 && (
                    <Card borderRadius="lg" variant="outline">
                      <CardHeader pb={0}>
                        <Heading size="sm" color="pink.600">
                          <HStack>
                            <FiAlertCircle />
                            <Text>Surgical History</Text>
                          </HStack>
                        </Heading>
                      </CardHeader>
                      <CardBody>
                        {viewingData.patient.surgicalHistory.map((sh, i) => (
                          <Box key={i} mb={3}>
                            <Badge colorScheme="pink" fontSize="xs" mb={1}>
                              {sh.disease || "Surgery"}
                            </Badge>
                            <Text fontSize="xs" color="gray.400" mb={1}>
                              {sh.Date || "N/A"}
                            </Text>
                            <Table variant="simple" size="sm">
                              <Thead>
                                <Tr>
                                  <Th>Procedure</Th>
                                  <Th>Date</Th>
                                  <Th>Hospital</Th>
                                  <Th>Surgeon</Th>
                                  <Th>Outcome</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {sh.surgeries.map((s, j) => (
                                  <Tr key={j}>
                                    <Td fontSize="xs" fontWeight="600">
                                      {s.procedure}
                                    </Td>
                                    <Td fontSize="xs">{s.date}</Td>
                                    <Td fontSize="xs">{s.hospital}</Td>
                                    <Td fontSize="xs">{s.surgeon}</Td>
                                    <Td fontSize="xs">
                                      <Badge colorScheme="green" fontSize="xs">
                                        {s.outcome}
                                      </Badge>
                                    </Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>
                          </Box>
                        ))}
                      </CardBody>
                    </Card>
                  )}
              </VStack>
            ) : (
              <VStack py={8}>
                <Spinner size="lg" />
                <Text>Loading patient data...</Text>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onDataClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ═════════════════════════════════════════════════════════ */}
      {/* MODAL: Revoke Access */}
      {/* ═════════════════════════════════════════════════════════ */}
      <Modal isOpen={isRevokeOpen} onClose={onRevokeClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="red.500">
            <HStack>
              <FiSlash />
              <Text>Revoke Access</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Text fontSize="sm">
                  This will immediately revoke the requesting hospital's access
                  to this patient's data. This action cannot be undone.
                </Text>
              </Alert>
              <Box w="full">
                <Text fontWeight="bold" fontSize="sm" mb={1}>
                  Reason for Revocation
                </Text>
                <Textarea
                  placeholder="Explain why access is being revoked..."
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                />
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onRevokeClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              leftIcon={<FiSlash />}
              onClick={handleRevoke}
              isLoading={loading}
            >
              Revoke Access
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ═════════════════════════════════════════════════════════ */}
      {/* MODAL: Hospital Verification (Before Approval) */}
      {/* ═════════════════════════════════════════════════════════ */}
      <Modal isOpen={isVerifyOpen} onClose={onVerifyClose} size="xl">
        <ModalOverlay />
        <ModalContent maxW="700px">
          <ModalHeader>
            <HStack>
              <Box bg="green.500" p={1.5} borderRadius="md">
                <FiShield color="white" size={18} />
              </Box>
              <Box>
                <Text fontSize="lg">Hospital Verification</Text>
                <Text fontSize="xs" color="gray.500" fontWeight="normal">
                  Verify the requesting hospital before granting patient data
                  access
                </Text>
              </Box>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {/* Request Summary */}
              {verifyTarget && (
                <Alert status="info" borderRadius="lg" variant="left-accent">
                  <AlertIcon />
                  <Box fontSize="sm">
                    <Text fontWeight="bold">
                      {verifyTarget.requestingHospital} is requesting access to{" "}
                      {verifyTarget.patientName}'s data
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      Doctor: {verifyTarget.requestingDoctor} | Urgency:{" "}
                      <Badge
                        colorScheme={urgencyColor(verifyTarget.urgency)}
                        fontSize="xs"
                      >
                        {verifyTarget.urgency || "Normal"}
                      </Badge>
                    </Text>
                    <Text fontSize="xs" color="gray.600" mt={1}>
                      Reason: {verifyTarget.reason}
                    </Text>
                  </Box>
                </Alert>
              )}

              {/* Hospital Details */}
              {verifyLoading ? (
                <VStack py={6}>
                  <Spinner size="lg" color="green.500" />
                  <Text fontSize="sm" color="gray.500">
                    Fetching hospital verification data...
                  </Text>
                </VStack>
              ) : verifyData ? (
                <Card variant="outline" borderRadius="lg">
                  <CardHeader pb={2} bg="gray.50" borderTopRadius="lg">
                    <HStack justify="space-between">
                      <Heading size="sm">{verifyData.hospitalName}</Heading>
                      <Badge
                        colorScheme={verifyData.isVerified ? "green" : "yellow"}
                        px={3}
                        py={1}
                        borderRadius="full"
                      >
                        {verifyData.isVerified
                          ? "Verified Hospital"
                          : "Unverified"}
                      </Badge>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={2} spacing={4}>
                      <Box>
                        <Text fontSize="xs" color="gray.400" fontWeight="bold">
                          OWNER / DIRECTOR
                        </Text>
                        <Text fontSize="sm" fontWeight="600">
                          {verifyData.ownerName || "N/A"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.400" fontWeight="bold">
                          REGISTRATION ID
                        </Text>
                        <Text fontSize="sm" fontWeight="600" fontFamily="mono">
                          {verifyData.registrationId || "N/A"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.400" fontWeight="bold">
                          EMAIL
                        </Text>
                        <Text fontSize="sm">{verifyData.email || "N/A"}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.400" fontWeight="bold">
                          PHONE
                        </Text>
                        <Text fontSize="sm">{verifyData.phone || "N/A"}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.400" fontWeight="bold">
                          ADDRESS
                        </Text>
                        <Text fontSize="sm">{verifyData.address || "N/A"}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.400" fontWeight="bold">
                          NUMBER OF BEDS
                        </Text>
                        <Text fontSize="sm">
                          {verifyData.numberOfBeds || "N/A"}
                        </Text>
                      </Box>
                      {verifyData.specialties && (
                        <Box gridColumn="span 2">
                          <Text
                            fontSize="xs"
                            color="gray.400"
                            fontWeight="bold"
                            mb={1}
                          >
                            SPECIALTIES
                          </Text>
                          <HStack flexWrap="wrap" spacing={1}>
                            {(Array.isArray(verifyData.specialties)
                              ? verifyData.specialties
                              : [verifyData.specialties]
                            ).map((s, i) => (
                              <Tag
                                key={i}
                                size="sm"
                                colorScheme="blue"
                                variant="subtle"
                              >
                                <TagLabel>{s}</TagLabel>
                              </Tag>
                            ))}
                          </HStack>
                        </Box>
                      )}
                      {verifyData.timings && (
                        <Box gridColumn="span 2">
                          <Text
                            fontSize="xs"
                            color="gray.400"
                            fontWeight="bold"
                          >
                            OPERATING HOURS
                          </Text>
                          <Text fontSize="sm">{verifyData.timings}</Text>
                        </Box>
                      )}
                    </SimpleGrid>
                  </CardBody>
                </Card>
              ) : (
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <Text fontSize="sm">
                    Hospital verification data not found. Proceed with caution.
                  </Text>
                </Alert>
              )}

              {/* Verification Checklist */}
              <Card variant="outline" borderRadius="lg" bg="green.50">
                <CardBody>
                  <Text
                    fontWeight="bold"
                    fontSize="sm"
                    mb={3}
                    color="green.700"
                  >
                    Verification Checklist
                  </Text>
                  <VStack spacing={3} align="stretch">
                    <Checkbox
                      isChecked={verifyChecks.identity}
                      onChange={(e) =>
                        setVerifyChecks((prev) => ({
                          ...prev,
                          identity: e.target.checked,
                        }))
                      }
                      colorScheme="green"
                    >
                      <Text fontSize="sm">
                        I have verified the hospital's identity and registration
                      </Text>
                    </Checkbox>
                    <Checkbox
                      isChecked={verifyChecks.license}
                      onChange={(e) =>
                        setVerifyChecks((prev) => ({
                          ...prev,
                          license: e.target.checked,
                        }))
                      }
                      colorScheme="green"
                    >
                      <Text fontSize="sm">
                        The hospital holds a valid medical license
                      </Text>
                    </Checkbox>
                    <Checkbox
                      isChecked={verifyChecks.purpose}
                      onChange={(e) =>
                        setVerifyChecks((prev) => ({
                          ...prev,
                          purpose: e.target.checked,
                        }))
                      }
                      colorScheme="green"
                    >
                      <Text fontSize="sm">
                        The stated reason for access is legitimate and
                        appropriate
                      </Text>
                    </Checkbox>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onVerifyClose}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              leftIcon={<FiCheck />}
              onClick={handleConfirmApprove}
              isLoading={loading}
              isDisabled={
                !verifyChecks.identity ||
                !verifyChecks.license ||
                !verifyChecks.purpose
              }
            >
              Confirm Approval
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default CrossHospitalAccess;
